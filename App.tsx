
import React, { useState, useEffect } from 'react';
import type { Professional, LoggedInUser } from './types';
import { UserRole } from './types';
import { getProfessionals } from './services/dataService';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import ProfessionalDashboard from './components/ProfessionalDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }: { outcome: 'accepted' | 'dismissed' }) => {
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };
  
  const professionals = getProfessionals();

  const handleLogin = (role: UserRole, professional?: Professional) => {
    if (role === UserRole.ADMIN) {
      setUser({ role: UserRole.ADMIN });
    } else if (role === UserRole.PROFESSIONAL && professional) {
      setUser({ role: UserRole.PROFESSIONAL, professional });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  const installProps = {
      showInstallButton: !!deferredPrompt && !isStandalone,
      onInstall: handleInstallClick,
  };

  if (!user) {
    return <LoginScreen professionals={professionals} onLogin={handleLogin} {...installProps} />;
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminDashboard onLogout={handleLogout} {...installProps} />;
  }

  if (user.role === UserRole.PROFESSIONAL && user.professional) {
    return <ProfessionalDashboard professional={user.professional} onLogout={handleLogout} {...installProps} />;
  }

  return <div>Error: Invalid user state.</div>;
};

export default App;