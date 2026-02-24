import { createContext, useContext } from 'react';

interface LoginContextType {
  openLoginModal: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export function LoginProvider({ children, openLoginModal }: { children: React.ReactNode; openLoginModal: () => void }) {
  return (
    <LoginContext.Provider value={{ openLoginModal }}>
      {children}
    </LoginContext.Provider>
  );
}

export function useLogin() {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within LoginProvider');
  }
  return context;
}
