// src/App.tsx
import { Routes, Route, Outlet } from 'react-router-dom';
import Topbar from './components/Topbar';
import LoginModal from './components/LoginModal';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './ProtectedRoute';
import React from 'react';
import { Footer } from './components/Footer';

import Dashboard from './pages/Home';
import BecomeHost from './pages/BecomeHost';
import EventNew from './pages/NewEvent';
import Profile from './pages/Profile';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Creators from './pages/Creators';

// Global context for login modal
export const LoginModalContext = React.createContext<{
  openLoginModal: () => void;
} | null>(null);

export function useLoginModal() {
  const ctx = React.useContext(LoginModalContext);
  if (!ctx) throw new Error('useLoginModal must be used within LoginModalContext.Provider');
  return ctx;
}

import { useLocation } from 'react-router-dom';
import BecomeCreator from './pages/BecomeCreator';
import CreatorProfile from './pages/CreatorProfile';
import Studios from './pages/Studios';
import Media from './pages/Media';
import NewStudio from './pages/NewStudio';
import StudioDetails from './pages/StudioDetails';
import Campaigns from './pages/Campaigns';
import HostCreateCampaign from './pages/HostCreateCampaign';
import MediaDetails from './pages/MediaDetails';

function Layout({
  openLoginModal,
  loginModalOpen,
  closeLoginModal,
}: {
  openLoginModal: () => void;
  loginModalOpen: boolean;
  closeLoginModal: () => void;
}) {
  const location = useLocation();

  React.useEffect(() => {
    // if a route redirected here with { state: { loginModal: true } }, open modal
    if ((location.state as any)?.loginModal) {
      openLoginModal();
    }
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Topbar onOpenLogin={openLoginModal} />
      <Outlet />
      <Footer />
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
    </>
  );
}

export default function App() {
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <LoginModalContext.Provider value={{ openLoginModal }}>
      <Routes>
        <Route
          element={<Layout openLoginModal={openLoginModal} loginModalOpen={loginModalOpen} closeLoginModal={closeLoginModal} />}
        >
          {/* Public routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<Events />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/events/new" element={<EventNew />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/media" element={<Media />} />
            <Route path="/studios" element={<Studios />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/host/campaigns/new" element={<HostCreateCampaign />} />


              <Route path="/studios/new" element={<NewStudio />} />
              <Route path="/studios/:id" element={<StudioDetails />} />
            // somewhere in your router
<Route path="/become-creator" element={<BecomeCreator />} />
<Route path="/creators/:id" element={<CreatorProfile />} />
<Route path="/media/:id" element={<MediaDetails />} />
          </Route>
        </Route>
      </Routes>
    </LoginModalContext.Provider>
  );
}
