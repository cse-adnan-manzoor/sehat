import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: { rooms: [], activeRoom: null, messages: [], typingUsers: [], onlineUsers: [] },
  reducers: {
    setRooms: (state, action) => { state.rooms = action.payload; },
    setActiveRoom: (state, action) => { state.activeRoom = action.payload; },
    setMessages: (state, action) => { state.messages = action.payload; },
    addMessage: (state, action) => { state.messages.push(action.payload); },
    setTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) state.typingUsers.push(action.payload);
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(u => u !== action.payload);
    },
    setOnlineUsers: (state, action) => { state.onlineUsers = action.payload; },
  },
});

export const { setRooms, setActiveRoom, setMessages, addMessage, setTypingUser, removeTypingUser, setOnlineUsers } = chatSlice.actions;
export default chatSlice.reducer;
