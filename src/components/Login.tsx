import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  
  // لێرە دەتوانیت ناوی بەکارهێنەر و وشەی نهێنی بپشکنیت
  if (username === 'admin' && password === '123456') {
    setError('');
    onLoginSuccess(); // دەچێتە ژوورەوە بۆ سیستەمەکە
  } else {
    setError('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir="rtl">
      <div className="card shadow-lg p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-[400px]">
        <h3 className="text-xl font-bold text-center mb-6">چوونەژوورەوە بۆ سیستەم</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/50 border border-red-300 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ناوی بەکارهێنەر</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="ناوی بەکارهێنەر..."
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">وشەی نهێنی</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition duration-200 shadow"
          >
            چوونەژوورەوە
          </button>
        </form>
      </div>
    </div>
  );
}