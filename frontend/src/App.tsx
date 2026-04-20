import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import { AuthView } from './components/custom/AuthView';
import { ProfileView } from './components/custom/ProfileView';
import { apiService } from './lib/api';
import type { User, ViewType } from './types';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiService.getCurrentUser()
        .then(result => {
          if (result && result.data) {
            setCurrentUser(result.data);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user: User, token: string) => {
    setCurrentUser(user);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('token');
    setCurrentView('home');
  };

  const handleViewChange = (view: ViewType) => {
    if (['login', 'register'].includes(view) || currentUser) {
      setCurrentView(view);
    } else {
      setCurrentView('login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser && currentView !== 'login' && currentView !== 'register') {
    return (
      <HashRouter>
        <Routes>
          <Route path="/*" element={<AuthView onViewChange={handleViewChange} onLogin={handleLogin} />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </HashRouter>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={
          <Index 
            currentUser={currentUser} 
            currentView={currentView} 
            onViewChange={handleViewChange}
            onLogout={handleLogout}
          />
        } />
      </Routes>
      <Toaster position="top-right" richColors />
    </HashRouter>
  );
};

export default App;
