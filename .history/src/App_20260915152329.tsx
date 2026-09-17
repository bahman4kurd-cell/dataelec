import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  CheckSquare, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export default function App() {
  // باری چوونەژوورەوە و بەکارهێنەر
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'dashboard'>('login');
  
  // داتای فۆڕمی لۆگین
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // باری وەرگرتنەوەی پاسۆرد
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // پشکنینی داتای پاشەکەوتکراو (Remember Me) لە کاتی کردنەوەی پەرڕەکەدا
  useEffect(() => {
    const savedUser = localStorage.getItem('saved_username');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
      setIsLoggedIn(true);
      setView('dashboard');
    }
  }, []);

  // کۆدی لۆگین و بەستنەوە بە داتابەیس (لێرەدا نموونەی ڕاستەقینە بۆ پشکنین بەکارهاتووە)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // دەتوانیت لێرەدا پشکنینی داتابەیس (API Call) بکەیت
    if (username === 'admin' && password === '123456') {
      if (rememberMe) {
        localStorage.setItem('saved_username', username);
      } else {
        localStorage.removeItem('saved_username');
      }
      setIsLoggedIn(true);
      setView('dashboard');
    } else {
      setError('ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە!');
    }
  };

  // سیستەمی ناردنی پاسۆرد بۆ ئیمەیڵی دیاریکراو
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = "behman4kurd@gmail.com";

    if (recoveryEmail.trim() === targetEmail) {
      setRecoveryMessage('پاسۆردی نوێ بە سەرکەوتوویی نێردرا بۆ ئیمەیڵەکەت: ' + targetEmail);
      setError('');
    } else {
      setError('ئەم ئیمەیڵە لە سیستەمدا بوونی نییە یان هەڵەیە!');
      setRecoveryMessage('');
    }
  };

  // دەرچوون لە سیستەم (Logout)
  const handleLogout = () => {
    localStorage.removeItem('saved_username');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setView('login');
  };

  // ئەگەر بەکارهێنەر نەچووبێتە ژوورەوە، پەڕەی لۆگین یان گەڕاندنەوەی پاسۆرد پیشان بدە
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4" dir="rtl">
        <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-8 w-full max-w-md">
          
          {/* بەشی لۆگین */}
          {view === 'login' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-blue-600/20 text-blue-400 rounded-full mb-3">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">چوونەژوورەوە بۆ سیستەم</h2>
                <p className="text-slate-400 text-sm mt-1">تکایە زانیارییەکانت بنووسە</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">ناوی بەکارهێنەر</label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="ناوی بەکارهێنەر..."
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">وشەی نهێنی</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                    <span>بیرم بکەرەوە (Remember Me)</span>
                  </label>

                  <button 
                    type="button" 
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-blue-400 hover:underline text-xs"
                  >
                    پاسوۆردت بیرچووە؟
                  </button>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition duration-200 shadow-lg shadow-blue-600/20"
                >
                  چوونەژوورەوە
                </button>
              </form>
            </>
          )}

          {/* بەشی گەڕاندنەوەی پاسۆرد بە ئیمەیڵ */}
          {view === 'forgot' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-amber-600/20 text-amber-400 rounded-full mb-3">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">گەڕاندنەوەی پاسۆرد</h2>
                <p className="text-slate-400 text-sm mt-1">ئیمەیڵی خۆت بنووسە بۆ ناردنەوەی پاسۆرد</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {recoveryMessage && (
                <div className="mb-4 p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-xl text-sm">
                  {recoveryMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  ناونیشانی ئیمەیڵ (بۆ نموونە: behman4kurd@gmail.com)
                  <div className="relative mt-1">
                    <Mail className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="email" 
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="behman4kurd@gmail.com"
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl text-sm transition duration-200"
                >
                  ناردنی پاسۆرد بۆ ئیمەیڵ
                </button>

                <button 
                  type="button" 
                  onClick={() => { setView('login'); setError(''); setRecoveryMessage(''); }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2.5 rounded-xl text-sm transition duration-200"
                >
                  گەڕانەوە بۆ پەڕەی لۆگین
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    );
  }

  // داشبۆردی سەرەکی پاش چوونەژوورەوە
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-6 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold">بەخێر هاتیت بۆ سیستەم</h1>
            <p className="text-slate-400 text-sm mt-1">بە سەرکەوتوویی چوویەتە ژوورەوە</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm transition duration-200 border border-red-800/50"
          >
            <LogOut className="w-4 h-4" />
            <span>دەرچوون</span>
          </button>
        </div>

        <div className="py-12 text-center">
          <div className="inline-flex p-4 bg-emerald-600/20 text-emerald-400 rounded-full mb-4">
            <CheckSquare className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200">سیستەمەکە بە تەواوی ئامادەیە</h3>
          <p className="text-slate-400 max-w-md mx-auto mt-2 text-sm">
            ئێستا دەتوانیت بەشەکانی تری سیستەم، داتابەیس و فلتەرکردنەکان لەم پەڕەیەدا بەکاربهێنیت.
          </p>
        </div>
      </div>
    </div>
  );
}