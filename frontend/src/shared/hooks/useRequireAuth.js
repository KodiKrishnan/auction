import { useAuth } from '../../context/AuthContext';

export default function useRequireAuth() {
  const { user, openLoginModal } = useAuth();

  // Accepts optional role parameter (defaults to "TRAVELLER")
  const requireAuth = (actionCallback, role = "TRAVELLER") => {
    if (user) {
      actionCallback();
    } else {
      openLoginModal(actionCallback, role);
    }
  };

  return requireAuth;
}