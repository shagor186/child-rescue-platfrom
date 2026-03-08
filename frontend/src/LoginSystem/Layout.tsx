import React from 'react';
import { Home, LogOut, Menu, X } from 'lucide-react';
import type { View, CommonProps } from '../types'; 

interface NavbarProps extends CommonProps {
  isLoggedIn: boolean;
  userName: string;
  handleLogout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  currentView?: View; 
}

export const Navbar: React.FC<NavbarProps> = ({ 
  isLoggedIn, userName, navigateTo, handleLogout, isMenuOpen, setIsMenuOpen 
}) => (
  <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center cursor-pointer" onClick={() => navigateTo('welcome')}>
          <h1 className="text-2xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Child Rescue Platform
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          {!isLoggedIn ? (
            <>
              <button onClick={() => navigateTo('welcome')} className="text-gray-600 hover:text-purple-600 font-medium transition">Home</button>
              <button onClick={() => navigateTo('signin')} className="text-gray-600 hover:text-purple-600 font-medium transition">Sign In</button>
              <button onClick={() => navigateTo('signup')} className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow-md">Sign Up</button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('home')} className="text-gray-600 hover:text-purple-600 font-medium flex items-center gap-2"><Home size={18}/>Dashboard</button>
              <div className="h-6 w-px bg-gray-200"></div>
              <span className="text-gray-900 font-medium">Hi, {userName}</span>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600 font-medium flex items-center gap-2"><LogOut size={18}/>Logout</button>
            </>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </div>
    </div>
    {isMenuOpen && (
      <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-xl">
          {!isLoggedIn ? (
              <>
                  <button onClick={() => navigateTo('welcome')} className="block w-full text-left font-medium">Home</button>
                  <button onClick={() => navigateTo('signin')} className="block w-full text-left font-medium">Sign In</button>
                  <button onClick={() => navigateTo('signup')} className="block w-full text-left font-medium text-indigo-600">Sign Up</button>
              </>
          ) : (
              <>
                  <button onClick={() => navigateTo('home')} className="block w-full text-left font-medium">Dashboard</button>
                  <button onClick={handleLogout} className="block w-full text-left font-medium text-red-500">Logout</button>
              </>
          )}
      </div>
    )}
  </nav>
);

export const WelcomePage: React.FC<CommonProps> = ({ navigateTo }) => (
  <div className="min-h-screen bg-slate-50 pt-16">
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Bringing-Kids Home <span className="text-indigo-600">AI Integrated Child Rescue Platform</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        <b>Bringing Kids Home</b> is an AI-integrated web platform designed to assist in locating and rescuing missing or at-risk children.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button onClick={() => navigateTo('signup')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200">Get Started Free</button>
        <button onClick={() => navigateTo('signin')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all">Live Demo</button>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC<{ userName: string }> = ({ userName }) => (
  <div className="min-h-screen bg-gray-50 pt-24 px-6">
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
           {['Projects', 'Messages', 'Settings'].map(item => (
               <div key={item} className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
                   <h4 className="font-bold text-gray-800">{item}</h4>
               </div>
           ))}
        </div>
      </div>
    </div>
  </div>
);

