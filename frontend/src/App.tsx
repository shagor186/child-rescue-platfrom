import { useState } from 'react';
import AuthSystem from './pages/AuthSystem';
import SideBar from './SideBar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = localStorage.getItem('token');
    return !!token; 
  });

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <AuthSystem onLoginSuccess={handleLoginSuccess} />;
  }

  return <SideBar />;
}

export default App;