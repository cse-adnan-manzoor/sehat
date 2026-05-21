import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import doctorsReducer from '../features/doctors/doctorsSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import pharmacyReducer from '../features/pharmacy/pharmacySlice';
import chatReducer from '../features/chat/chatSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctors: doctorsReducer,
    appointments: appointmentsReducer,
    pharmacy: pharmacyReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
  },
});

export default store;
