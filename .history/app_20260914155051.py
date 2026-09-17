import React, { useState, useEffect } from 'react';

type ThemeType = 'government' | 'dark' | 'light';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeType>('government');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir="rtl">
      {/* سەر دێڕی سەرەکی */}
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
          icon = "📊";
          </div>
          <h1 className="text-lg font-bold">سیستەمی شیکاری ئەنجامەکانی هەڵبژاردن</h1>
        </div>

        {/* هەڵبژاردنی تیم */}
        <div className="flex items-center gap-2">
          <label htmlFor="theme-select" className="text-sm text-[var(--text-secondary)] font-medium">
            ڕووکار:
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="government">🏛️تیمی حکومی</option>
            <option value="dark">🌙 تۆخ</option>
            <option value="light">☀️  ڕۆشن</option>
          </select>
        </div>
      </header>

      {/* ناوەڕۆک و پانێڵی لای ڕاست */}
      <div className="flex flex-1 overflow-hidden">
        {/* پانێڵی تابەکان لە لای ڕاست */}
        <aside className="w-64 bg-[var(--bg-card)] border-l border-[var(--border-color)] p-4 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-1">
            بەشە سەرەکییەکان
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>داشبۆردی گشتی</span>
            <span>🏠</span>
          </button>

          <button
            onClick={() => setActiveTab('rounds')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'rounds'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>خولەکانی هەڵبژاردن</span>
            <span>🗳️</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'parties'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>لایەنە سیاسییەکان</span>
            <span>👥</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>ڕێکخستنەکان</span>
            <span>⚙️</span>
          </button>
        </aside>

        {/* بەشی نیشاندانی ناوەڕۆک */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">داشبۆردی شیکاری گشتی</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                پوختەی ئەنجامەکان و هێڵکارییەکان لێرەدا نیشان دەدرێن.
              </p>
            </div>
          )}

          {activeTab === 'rounds' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">تۆماری خولەکانی هەڵبژاردن</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                لیستی خولەکان و لق و ژێرتاپەکان لێرە بەڕێوەدەبرێن.
              </p>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">لایەنە سیاسییەکان</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                لیستی لایەنەکان و ڕەنگە تایبەتەکانیان لێرە دەستکاری دەکرێن.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">ڕێکخستنەکانی سیستەم</h2>
              <p className="text-[var(--text-secondary)] text-sm">
                دەستکاری ڕێکخستنی بنکەدراوە، زمان، و ژمارەکان لێرەوە دەبێت.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;