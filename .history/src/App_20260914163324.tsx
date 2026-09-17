import React, { useState, useEffect } from 'react';

type ThemeType = 'government' | 'dark' | 'light';

interface ElectionRound {
  id: number;
  name: string;
  year: string;
  totalVoters: number;
  status: 'چالاک' | 'تەواوبوو';
}

interface PartyResult {
  id: number;
  name: string;
  votes: number;
  color: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeType>('government');

  // داتای خولەکان
  const [rounds, setRounds] = useState<ElectionRound[]>([
    { id: 1, name: 'هەڵبژاردنی پەرلەمانی کوردستان', year: '2024', totalVoters: 2899578, status: 'چالاک' },
    { id: 2, name: 'هەڵبژاردنی ئەنجومەنی پارێزگاکان', year: '2023', totalVoters: 2750000, status: 'تەواوبوو' },
  ]);

  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundYear, setNewRoundYear] = useState('');
  const [newRoundVoters, setNewRoundVoters] = useState('');

  // داتای ئەنجامی لایەنەکان بۆ هێڵکارییەکان
  const partyResults: PartyResult[] = [
    { id: 1, name: 'لیستی یەکەم (پارتی)', votes: 850000, color: 'bg-yellow-500' },
    { id: 2, name: 'لیستی دووەم (یەکێتی)', votes: 720000, color: 'bg-green-600' },
    { id: 3, name: 'لیستی سێیەم (نەوەی نوێ)', votes: 450000, color: 'bg-blue-600' },
    { id: 4, name: 'لیستی چوارەم (ڕەوت و لایەنەکانی تر)', votes: 380000, color: 'bg-purple-600' },
  ];

  const totalVotesCast = partyResults.reduce((acc, curr) => acc + curr.votes, 0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundName || !newRoundYear) return;

    const newRound: ElectionRound = {
      id: rounds.length + 1,
      name: newRoundName,
      year: newRoundYear,
      totalVoters: Number(newRoundVoters) || 0,
      status: 'چالاک',
    };

    setRounds([...rounds, newRound]);
    setNewRoundName('');
    setNewRoundYear('');
    setNewRoundVoters('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir="rtl">
      {/* سەر دێڕی سەرەکی */}
      <header className="h-16 bg-[var(--bg-card)] border-b border-[var(--border-color)] px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
            📊
          </div>
          <h1 className="text-lg font-bold">سیستەمی شیکاری ئەنجامەکانی هەڵبژاردن</h1>
        </div>

        {/* هەڵبژاردنی تیمی ڕووکار */}
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
            <option value="government">🏛️ حکومی</option>
            <option value="dark">🌙 تۆخ</option>
            <option value="light">☀️ ڕۆشن</option>
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
            <span>داشبۆردی گشتی و هێڵکارییەکان</span>
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
        </aside>

        {/* بەشی نیشاندانی ناوەڕۆک */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* کاردی پوختەی گشتی */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                  <span className="text-sm text-[var(--text-secondary)] font-medium">کۆی گشتی دەنگدەران</span>
                  <h3 className="text-2xl font-bold mt-1">2,899,578</h3>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                  <span className="text-sm text-[var(--text-secondary)] font-medium">دەنگە دراوە بەشداربووەکان</span>
                  <h3 className="text-2xl font-bold mt-1">{totalVotesCast.toLocaleString()}</h3>
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                  <span className="text-sm text-[var(--text-secondary)] font-medium">ڕێژەی بەشداری گشتی</span>
                  <h3 className="text-2xl font-bold mt-1 text-green-600">83.4%</h3>
                </div>
              </div>

              {/* هێڵکارییەکان (Charts Simulation باوەڕپێکراو بە Tailwind) */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">شیکاری دەنگی لایەنەکان (هێڵکاری ڕێژەیی)</h2>
                <div className="space-y-5">
                  {partyResults.map((party) => {
                    const percentage = ((party.votes / totalVotesCast) * 100).toFixed(1);
                    return (
                      <div key={party.id} className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>{party.name}</span>
                          <span>{party.votes.toLocaleString()} دەنگ ({percentage}%)</span>
                        </div>
                        {/* هێڵی پڕبوونی پێشکەوتوو */}
                        <div className="w-full bg-[var(--bg-main)] h-4 rounded-full overflow-hidden border border-[var(--border-color)]">
                          <div
                            className={`h-full ${party.color} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rounds' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">تۆمارکردنی خولی نوێی هەڵبژاردن</h2>
                <form onSubmit={handleAddRound} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ناوی خول</label>
                    <input
                      type="text"
                      value={newRoundName}
                      onChange={(e) => setNewRoundName(e.target.value)}
                      placeholder="بۆ نموونە: هەڵبژاردنی پەرلەمان"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ساڵ</label>
                    <input
                      type="text"
                      value={newRoundYear}
                      onChange={(e) => setNewRoundYear(e.target.value)}
                      placeholder="2026"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">کۆی دەنگدەران</label>
                    <input
                      type="number"
                      value={newRoundVoters}
                      onChange={(e) => setNewRoundVoters(e.target.value)}
                      placeholder="3000000"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow transition-all"
                    >
                      + زیادکردنی خول
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">لیستی خولەکانی تۆمارکراو</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                        <th className="py-3 px-4">کۆد</th>
                        <th className="py-3 px-4">ناوی خول</th>
                        <th className="py-3 px-4">ساڵ</th>
                        <th className="py-3 px-4">کۆی دەنگدەران</th>
                        <th className="py-3 px-4">بارودۆخ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-sm">
                      {rounds.map((round) => (
                        <tr key={round.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                          <td className="py-3 px-4 font-mono">{round.id}</td>
                          <td className="py-3 px-4 font-semibold">{round.name}</td>
                          <td className="py-3 px-4">{round.year}</td>
                          <td className="py-3 px-4">{round.totalVoters.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${round.status === 'چالاک' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {round.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parties' && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">لایەنە سیاسییەکان</h2>
              <p className="text-[var(--text-secondary)] text-sm">بەڕێوەبردنی لیستی لایەنەکان و ڕەنگەکانیان لێرە ئەنجام دەدرێت.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;