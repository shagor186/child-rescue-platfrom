// pages/AuthSystem.tsx
import React, { useState, type JSX } from 'react';
import type { View, FormData, MessageState } from '../types';
import { API_BASE_URL } from '../api';
import { Navbar, WelcomePage } from '../LoginSystem/Layout';
import { AuthFormPage } from '../LoginSystem/AuthForm';

interface Props {
  onLoginSuccess: () => void;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

const initialMessage: MessageState = {
  type: '',
  text: ''
};

export default function AuthSystem({ onLoginSuccess }: Props): JSX.Element {
  const [view, setView] = useState<View>('welcome');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [message, setMessage] = useState<MessageState>(initialMessage);

  const navigateTo = (v: View): void => {
    setView(v);
    setMessage(initialMessage);
    setIsMenuOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage(initialMessage);

    try {
      let endpoint = '';
      let payload: Partial<FormData> = {};

      if (view === 'signin') {
        endpoint = '/signin';
        payload = {
          email: formData.email,
          password: formData.password
        };
      } 
      else if (view === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setMessage({
            type: 'error',
            text: 'Passwords do not match'
          });
          setLoading(false);
          return;
        }

        endpoint = '/signup';
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password
        };
      } 
      else {
        endpoint = '/forgot-password';
        payload = { email: formData.email };
      }

      const res = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          type: 'error',
          text: data?.error || 'Request failed'
        });
        return;
      }

      setMessage({
        type: 'success',
        text: data?.message || 'Success'
      });

      // LOGIN SUCCESS → SWITCH APP TO DASHBOARD
      if (view === 'signin') {
        localStorage.setItem('token', data.token);
        onLoginSuccess();
      }

      if (view === 'signup') {
        setTimeout(() => navigateTo('signin'), 1000);
      }

    } catch {
      setMessage({
        type: 'error',
        text: 'Server error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-slate-900 min-h-screen bg-slate-50">
      <Navbar
        isLoggedIn={false}
        userName=""
        navigateTo={navigateTo}
        handleLogout={() => {}}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      {view === 'welcome' && (
        <WelcomePage navigateTo={navigateTo} />
      )}

      {(view === 'signin' ||
        view === 'signup' ||
        view === 'forgot') && (
        <AuthFormPage
          view={view}
          message={message}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          navigateTo={navigateTo}
        />
      )}
    </div>
  );
}
