import React from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { View, FormData, MessageState, CommonProps } from '../types';

interface AuthFormProps extends CommonProps {
  view: View;
  message: MessageState;
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}


export const AuthFormPage: React.FC<AuthFormProps> = ({ 
  view, message, formData, handleChange, handleSubmit, loading, navigateTo 
}) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 pt-20">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Reset Password'}
        </h2>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {view === 'signup' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Shagor Ali" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="name@university.com" />
          </div>
        </div>

        {view !== 'forgot' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
        )}

        {view === 'signup' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
            </div>
          </div>
        )}

        {view === 'signin' && (
          <div className="text-right">
            <button type="button" onClick={() => navigateTo('forgot')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</button>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-100">
          {loading ? 'Working...' : view === 'signin' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-gray-600">
          {view === 'signin' ? "New here?" : "Already have an account?"} {' '}
          <button onClick={() => navigateTo(view === 'signin' ? 'signup' : 'signin')} className="text-indigo-600 font-bold hover:underline">
            {view === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  </div>
);