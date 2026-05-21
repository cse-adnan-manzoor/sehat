import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { initSocket, getSocket } from '../../socket/socket';
import { addMessage, setMessages } from '../../features/chat/chatSlice';
import { useTranslation } from 'react-i18next';
import { FiSend, FiSearch } from 'react-icons/fi';
import './Chat.css';

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useSelector(s => s.auth);
  const { messages } = useSelector(s => s.chat);
  const dispatch = useDispatch();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api.get('/messages/rooms').then(r => setRooms(r.data.rooms || []));
    const socket = initSocket(user?.id);
    socket.on('receive_message', msg => dispatch(addMessage(msg)));
    socket.on('user_typing', () => setIsTyping(true));
    socket.on('user_stop_typing', () => setIsTyping(false));
    return () => { socket.off('receive_message'); socket.off('user_typing'); socket.off('user_stop_typing'); };
  }, [user, dispatch]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const openRoom = async (room) => {
    setActiveRoom(room);
    const socket = getSocket();
    socket?.emit('join_room', room.roomId);
    const res = await api.get(`/messages/${room.roomId}`);
    dispatch(setMessages(res.data.messages || []));
  };

  const sendMessage = () => {
    if (!text.trim() || !activeRoom) return;
    const socket = getSocket();
    const otherId = activeRoom.otherUser?.id;
    socket?.emit('send_message', { senderId: user.id, receiverId: otherId, content: text.trim(), roomId: activeRoom.roomId });
    setText('');
    socket?.emit('stop_typing', { roomId: activeRoom.roomId, userId: user.id });
  };

  const handleTyping = (val) => {
    setText(val);
    const socket = getSocket();
    if (!typing) { setTyping(true); socket?.emit('typing', { roomId: activeRoom?.roomId, userId: user.id, userName: user.name }); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { setTyping(false); socket?.emit('stop_typing', { roomId: activeRoom?.roomId, userId: user.id }); }, 2000);
  };

  const getRoomId = (uid1, uid2) => [uid1, uid2].sort().join('_');

  const startNewChat = (targetUser) => {
    const rId = getRoomId(user.id, targetUser.id);
    const room = { roomId: rId, otherUser: targetUser, lastMessage: '', lastMessageAt: new Date() };
    setRooms(prev => prev.find(r => r.roomId === rId) ? prev : [room, ...prev]);
    openRoom(room);
  };

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header"><h2>{t('patient.chat.title')}</h2></div>
        <div className="chat-search"><FiSearch size={14}/><input placeholder={t('patient.chat.searchPlaceholder')} /></div>
        <div className="chat-rooms">
          {rooms.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('patient.chat.emptyConversations')}</div>
          ) : rooms.map(room => (
            <div key={room.roomId} className={`chat-room-item ${activeRoom?.roomId === room.roomId ? 'active' : ''}`} onClick={() => openRoom(room)}>
              <img src={room.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(room.otherUser?.name||'U')}&background=0D7377&color=fff`} alt="" className="avatar" />
              <div className="chat-room-info">
                <div className="chat-room-name">{room.otherUser?.name}</div>
                <div className="chat-room-last">{room.lastMessage || t('patient.chat.noMessages')}</div>
              </div>
              <div className="chat-room-time">{room.lastMessageAt ? new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {!activeRoom ? (
          <div className="chat-empty"><div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div><h3>{t('patient.chat.emptyChatTitle')}</h3><p>{t('patient.chat.emptyChatDesc')}</p></div>
        ) : (
          <>
            <div className="chat-header">
              <img src={activeRoom.otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeRoom.otherUser?.name||'U')}&background=0D7377&color=fff`} alt="" className="avatar" />
              <div><div className="chat-header-name">{activeRoom.otherUser?.name}</div><div className="chat-header-role">{activeRoom.otherUser?.role || t('patient.chat.doctorRole')} {isTyping && `· ${t('patient.chat.typing')}`}</div></div>
            </div>
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <motion.div key={msg.id || i} className={`chat-bubble ${msg.senderId === user.id ? 'sent' : 'received'}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bubble-text">{msg.content}</div>
                  <div className="bubble-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </motion.div>
              ))}
              {isTyping && <div className="typing-indicator"><span /><span /><span /></div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-row">
              <input className="chat-input" value={text} onChange={e => handleTyping(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder={t('patient.chat.typeMessage')} />
              <button className="btn btn-primary chat-send-btn" onClick={sendMessage} disabled={!text.trim()}><FiSend size={18}/></button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
