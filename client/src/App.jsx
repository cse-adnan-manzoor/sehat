import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';

// Pages
import LandingPage from './pages/shared/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import DoctorDetail from './pages/patient/DoctorDetail';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import VideoConsultation from './pages/patient/VideoConsultation';
import Chat from './pages/patient/Chat';
import SymptomChecker from './pages/patient/SymptomChecker';
import Pharmacy from './pages/patient/Pharmacy';
import CartPage from './pages/patient/CartPage';
import PaymentSuccess from './pages/patient/PaymentSuccess';
import Orders from './pages/patient/Orders';
import HealthRecords from './pages/patient/HealthRecords';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorEarnings from './pages/doctor/DoctorEarnings';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={user.role === 'DOCTOR' ? '/doctor/dashboard' : user.role === 'ADMIN' ? '/admin/dashboard' : '/patient/dashboard'} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Patient Routes */}
      <Route path="/patient" element={<ProtectedRoute roles={['PATIENT']}><PatientLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="doctors" element={<FindDoctors />} />
        <Route path="doctors/:id" element={<DoctorDetail />} />
        <Route path="book-appointment" element={<BookAppointment />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="video/:id" element={<VideoConsultation />} />
        <Route path="chat" element={<Chat />} />
        <Route path="symptom-checker" element={<SymptomChecker />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="orders" element={<Orders />} />
        <Route path="health-records" element={<HealthRecords />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>

      {/* Doctor Routes */}
      <Route path="/doctor" element={<ProtectedRoute roles={['DOCTOR']}><DoctorLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="earnings" element={<DoctorEarnings />} />
        <Route path="profile" element={<DoctorProfile />} />
        <Route path="video/:id" element={<VideoConsultation />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
