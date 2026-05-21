const prisma = require('../config/db');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // User joins
    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Join chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`[Socket] ${socket.id} joined room ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      const { senderId, receiverId, content, roomId, type } = data;
      try {
        const message = await prisma.message.create({
          data: { senderId, receiverId, content, roomId, type: type || 'text' },
          include: { sender: { select: { id: true, name: true, avatar: true } } },
        });
        io.to(roomId).emit('receive_message', message);

        // Send notification to receiver
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('new_notification', {
            type: 'message',
            title: 'New Message',
            message: `New message from ${message.sender.name}`,
          });
        }
      } catch (error) {
        console.error('[Socket] Message error:', error);
      }
    });

    // Typing indicators
    socket.on('typing', ({ roomId, userId, userName }) => {
      socket.to(roomId).emit('user_typing', { userId, userName });
    });

    socket.on('stop_typing', ({ roomId, userId }) => {
      socket.to(roomId).emit('user_stop_typing', { userId });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ roomId, userId }) => {
      await prisma.message.updateMany({
        where: { roomId, receiverId: userId, isRead: false },
        data: { isRead: true },
      });
      socket.to(roomId).emit('messages_read', { roomId, userId });
    });

    // Doctor online/offline
    socket.on('doctor_online', (doctorId) => {
      io.emit('doctor_status', { doctorId, isOnline: true });
    });

    socket.on('doctor_offline', (doctorId) => {
      io.emit('doctor_status', { doctorId, isOnline: false });
    });

    // Video call signaling
    socket.on('join_video_room', ({ roomId, userId }) => {
      socket.join(`video_${roomId}`);
      socket.to(`video_${roomId}`).emit('user_joined_video', { userId });
    });

    socket.on('video_offer', ({ roomId, offer }) => {
      socket.to(`video_${roomId}`).emit('video_offer', { offer });
    });

    socket.on('video_answer', ({ roomId, answer }) => {
      socket.to(`video_${roomId}`).emit('video_answer', { answer });
    });

    socket.on('ice_candidate', ({ roomId, candidate }) => {
      socket.to(`video_${roomId}`).emit('ice_candidate', { candidate });
    });

    socket.on('leave_video_room', ({ roomId }) => {
      socket.to(`video_${roomId}`).emit('user_left_video');
      socket.leave(`video_${roomId}`);
    });

    // Appointment status update
    socket.on('appointment_status_update', (data) => {
      const { userId, appointmentId, status } = data;
      const userSocket = onlineUsers.get(userId);
      if (userSocket) {
        io.to(userSocket).emit('appointment_updated', { appointmentId, status });
        io.to(userSocket).emit('new_notification', {
          type: 'appointment',
          title: 'Appointment Update',
          message: `Your appointment status has been updated to ${status}`,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
      }
      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};
