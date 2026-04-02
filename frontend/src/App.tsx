import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { I18nProvider } from './services/i18n';
import Home from './pages/Home';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import BookingPage from './pages/Booking';
import Explore from './pages/Explore';
import ItineraryPlanner from './components/ItineraryPlanner';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddPlace from './pages/AdminAddPlace';
import AdminEditPlace from './pages/AdminEditPlace';
import AdminEditUser from './pages/AdminEditUser';
import ChatSupport from './components/ChatSupport';
import AIChatWidget from './components/AIChatWidget';
import Emergency from './components/Emergency';
import Shopping from './components/Shopping';
import Transport from './components/Transport';
import Health from './components/Health';
import Luggage from './components/Luggage';
import Analytics from './components/Analytics';
import TimeMirror from './components/TimeMirror';

function App() {
  return (
    <I18nProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/book/:placeId" element={<BookingPage />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/itineraries" element={<ItineraryPlanner />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/places/add" element={<AdminAddPlace />} />
          <Route path="/admin/places/edit/:id" element={<AdminEditPlace />} />
          <Route path="/admin/users/edit/:id" element={<AdminEditUser />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/transport" element={<Transport />} />
          <Route path="/health" element={<Health />} />
          <Route path="/luggage" element={<Luggage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/time-mirror" element={<TimeMirror />} />
        </Routes>
        <ChatSupport />
        <AIChatWidget />
      </Router>
    </I18nProvider>
  );
}

export default App;
