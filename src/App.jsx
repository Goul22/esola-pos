import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import RegisterAdminScreen from './components/RegisterAdminScreen';
import AdminPanel from './components/AdminPanel';
import PosDashboard from './components/PosDashboard';
import TeamView from './components/TeamView';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [shopName, setShopName] = useState(() => {
    return localStorage.getItem('current_shop_name') || 'Espace de vente ESOLA';
  });

  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    if (!savedUser) return 'login';
    const parsed = JSON.parse(savedUser);
    
    // Redirection initiale selon le rôle et l'email
    if (parsed.email === 'geliherve@gmail.com' && parsed.role === 'admin') {
      return 'admin';
    }
    return 'pos';
  });

  const [activeLicenseKey, setActiveLicenseKey] = useState('');

  const handleLoginSuccess = (userData) => {
    // Si une boutique est liée à l'utilisateur (cas des vendeurs ou proprios)
    if (userData.shop_name) {
      setShopName(userData.shop_name);
      localStorage.setItem('current_shop_name', userData.shop_name);
    }
    
    setUser(userData);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_email', userData.email);
    localStorage.setItem('user_role', userData.role || 'Vendeur');

    // Aiguillage après connexion réussie
    if (userData.email === 'geliherve@gmail.com' && userData.role === 'admin') {
      setCurrentView('admin');
    } else {
      // Les vendeurs et autres utilisateurs vont sur le dashboard de caisse/rapports restreint
      setCurrentView('pos');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('current_shop_id');
    localStorage.removeItem('current_shop_name');
    setCurrentView('login');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
      {currentView === 'login' && (
        <LoginScreen 
          shopName={shopName}
          onLoginSuccess={handleLoginSuccess}
          onOpenLicense={(key) => {
            setActiveLicenseKey(key || '');
            setCurrentView('register');
          }}
          onOpenHelp={() => alert("Contactez le support technique ESOLA.")}
        />
      )}

      {currentView === 'register' && (
        <RegisterAdminScreen 
          licenseKey={activeLicenseKey}
          onRegisterSuccess={(data) => {
            const newUser = { email: data.username, role: 'shop_owner', shop_name: data.shopName };
            setShopName(data.shopName);
            setUser(newUser);
            localStorage.setItem('user_data', JSON.stringify(newUser));
            localStorage.setItem('user_email', data.username);
            localStorage.setItem('user_role', 'shop_owner');
            localStorage.setItem('current_shop_name', data.shopName);
            setCurrentView('pos');
          }}
          onBackToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'admin' && (
        <AdminPanel 
          shopName={shopName}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'pos' && (
        <PosDashboard 
          shopName={shopName}
          user={user}
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'equipe' && (
        <TeamView 
          onBack={() => setCurrentView('pos')} 
        />
      )}
    </div>
  );
}