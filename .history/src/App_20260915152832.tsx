import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  AlertCircle,
  BarChart3,
  Database,
  Search,
  Filter,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'login' | 'forgot' | 'dashboard'>('login');
  
  // داتای لۆگین
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  
  // گەڕاندنەوەی پاسۆرد
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // پشکنینی پاشەکەوتی پێشوو
  useEffect(() => {
    const savedUser = localStorage.getItem('saved_username');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
      setIsLoggedIn(true);
      setView('dashboard');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = "behman4kurd@gmail.com";

    // پاککردنەوەی بۆشاییەکان و پشکنینی ورد بین
    if (recoveryEmail.trim().toLowerCase() === targetEmail) {
      setRecoveryMessage('پاسۆردی نوێ بە سەرکەوتوویی نێردرا بۆ ئیمەیڵەکەت: ' + targetEmail);
      setError('');
    } else {
      setError('ئەم ئیمەیڵە لە سیستەمدا بوونی نییە یان هەڵەیە! تکایە (behman4kurd@gmail.com) بنووسە.');
      setRecoveryMessage('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saved_username');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setView('login');
  };

  // ئەگەر لۆگین نەکرابوو
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4" dir="rtl">
        <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-2xl p-8 w-full max-w-md">
          
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

          {view === 'forgot' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-amber-600/20 text-amber-400 rounded-full mb-3">
                  <Mail className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold">گەڕاندنەوەی پاسۆرد</h2>
                <p className="text-slate-400 text-sm mt-1">ئیمەیڵی خۆت بنووسە (behman4kurd@gmail.com)</p>
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
                  <label className="block text-sm font-medium text-slate-300 mb-1">ناونیشانی ئیمەیڵ</label>
                  <div className="relative">
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

  // داشبۆردی سەرەکی پڕ لە زانیاری و داتا کاتێک لۆگین دەبێت
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* سەرپەڕەی کۆنتڕۆڵ */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">سیستەمی شیکاری ئەنجامی هەڵبژاردن</h1>
            <p className="text-slate-400 text-sm mt-1">بەخێر هاتیت، بەڕێوەبەر (Admin)</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition duration-200 border border-red-800/50"
          >
            <LogOut className="w-4 h-4" />
            <span>دەرچوون</span>
          </button>
        </div>

        {/* کارتی ئامارەکان */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">کۆی دەنگدەران</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mt-2">٢٥٠,٠٠٠</h3>
            <span className="text-emerald-400 text-xs mt-1 block">↑ ١٢٪ بەراورد بە هەڵبژاردنی پێشوو</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">ڕێژەی بەشداری</span>
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mt-2">٦٨.٥٪</h3>
            <span className="text-emerald-400 text-xs mt-1 block">رێژەی پەسەندکراو</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">وێستگەکانی دەنگدان</span>
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold mt-2">١,٢٤٠</h3>
            <span className="text-slate-400 text-xs mt-1 block">تەواوی ناوەندەکان</span>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">دۆخی داتابەیس</span>
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mt-2">کارا (Active)</h3>
            <span className="text-indigo-400 text-xs mt-1 block">پەیوەستکراوە</span>
          </div>
        </div>

        {/* خشتەی داتاکان */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold">دوایین ڕاپۆرت و ئەنجامەکان</h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="گەڕان..." 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-sm transition">
                <Filter className="w-4 h-4" />
                <span>فلتەر</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">ناوی بازنە / ناوەند</th>
                  <th className="p-3">کۆدی وێستگە</th>
                  <th className="p-3">رێژەی بەشداری</th>
                  <th className="p-3">دۆخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                <tr>
                  <td className="p-3 font-medium">سلێمانی - ناوەندی سەنتەر</td>
                  <td className="p-3 text-slate-400">W-1024</td>
                  <td className="p-3">٧٢٪</td>
                  <td className="p-3"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">پەسەندکراو</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">سلێمانی - بەکرەجۆ</td>
                  <td className="p-3 text-slate-400">W-1025</td>
                  <td className="p-3">٦٥٪</td>
                  <td className="p-3"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">پەسەندکراو</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">سلێمانی - تاسڵوجە</td>
                  <td className="p-3 text-slate-400">W-1026</td>
                  <td className="p-3">٦٩٪</td>
                  <td className="p-3"><span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs">پەسەندکراو</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}