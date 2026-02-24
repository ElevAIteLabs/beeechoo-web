import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthed } from './lib/auth';

export default function ProtectedRoute() {
  const location = useLocation();
  
  if (!isAuthed()) {
    // Redirect to home where the login modal is available
    return <Navigate to="/" state={{ from: location, loginModal: true }} replace />;
  }

  return <Outlet />;
}
