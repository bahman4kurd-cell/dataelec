import React, { useState, useEffect } from 'react';

type ThemeType = 'government' | 'dark' | 'light';
type ChartType = 'pie' | 'donut' | 'progress' | 'bars' | 'network_dots';

interface ElectionRound {
  id: number;
  name: string;
  date: string;
  type: string;
  totalVoters: number;
  status: 'چالاک' | 'تەواوبوو';
}

interface Branch {
  id: number;
  roundId: number;
  name: string;
}

interface Region {
  id: number;
  branchId: number;
  name: string;
}

interface PartyVote {
  partyId: number;
  partyName: string;
  votes: number;
  percentage: number;
  color: string;
  hexColor: string;
}

export function App() {
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'rounds'>('dashboard');
  const [theme, setTheme] = useState<ThemeType>('government');

  // داتاکانی خولەکان
  const [rounds, setRounds] = useState<ElectionRound[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);
  
  // فۆڕمی خول
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundType, setRoundType] = useState('پەرلەمانی');
  const [roundVoters, setRoundVoters] = useState('');
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);

  // لقەکان (Branches)
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);

  // ناوچەکان (Regions)
  const [regions, setRegions] = useState<Region[]>([]);
  const [newRegionName, setNewRegionName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [editingRegionId, setEditingRegionId] = useState<number | null>(null);

  // داتا ئینتری دەنگەکان بۆ هەر ناوچەیەک
  const [regionVotes, setRegionVotes] = useState<{ [regionId: number]: PartyVote[] }>({});

  // پارتە بنەڕەتییەکان
  const defaultParties = [
    { partyId: 1, partyName: 'لیستی یەکەم (پارتی)', color: 'bg-yellow-500', hexColor: '#eab308' },
    { partyId: 2, partyName: 'لیستی دووەم (یەکێتی)', color: 'bg-green-600', hexColor: '#16a34a' },
    { partyId: 3, partyName: 'لیستی سێیەم (نەوەی نوێ)', color: 'bg-blue-600', hexColor: '#2563eb' },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // نموونەی سەرەتایی
    setRounds([
      { id: 1, name: 'هەڵبژاردنی پەرلەمانی کوردستان', date: '2024-10-20', type: 'پەرلەمانی', totalVoters: 2899578, status: 'چالاک' },
    ]);
    setSelectedRoundId(1);
    setBranches([
      { id: 1, roundId: 1, name: 'لقی هەولێر' },
      { id: 2, roundId: 1, name: 'لقی سلێمانی' }
    ]);
    setSelectedBranchId(1);
    setRegions([
      { id: 1, branchId: 1, name: 'بنکەی ناوەند ١' },
      { id: 2, branchId: 1, name: 'بنکەی دەشتی هەولێر' }
    ]);
    setSelectedRegionId(1);
    
    setRegionVotes({
      1: defaultParties.map(p => ({ ...p, votes: 15000, percentage: 50 })),
      2: defaultParties.map(p => ({ ...p, votes: 10000, percentage: 50 }))
    });
  }, [theme]);

  // زیادکردن یاخود نوێکردنەوەی خول
  const handleSaveRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundName || !roundDate) return;

    if (editingRoundId !== null) {
      setRounds(rounds.map(r => r.id === editingRoundId ? {
        ...r,
        name: roundName,
        date: roundDate,
        type: roundType,
        totalVoters: Number(roundVoters) || r.totalVoters
      } : r));
      setEditingRoundId(null);
    } else {
      const newRound: ElectionRound = {
        id: Date.now(),
        name: roundName,
        date: roundDate,
        type: roundType,
        totalVoters: Number(roundVoters) || 100000,
        status: 'چالاک'
      };
      setRounds([...rounds, newRound]);
      setSelectedRoundId(newRound.id);
    }
    setRoundName('');
    setRoundDate('');
    setRoundVoters('');
  };

  const handleEditRound = (r: ElectionRound) => {
    setEditingRoundId(r.id);
    setRoundName(r.name);
    setRoundDate(r.date);
    setRoundType(r.type);
    setRoundVoters(r.totalVoters.toString());
  };

  const handleDeleteRound = (id: number) => {
    setRounds(rounds.filter(r => r.id !== id));
    if (selectedRoundId === id) setSelectedRoundId(null);
  };

  // زیادکردن یاخود نوێکردنەوەی لق
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !selectedRoundId) return;

    if (editingBranchId !== null) {
      setBranches(branches.map(b => b.id === editingBranchId ? { ...b, name: newBranchName } : b));
      setEditingBranchId(null);
    } else {
      const newB: Branch = { id: Date.now(), roundId: selectedRoundId, name: newBranchName };
      setBranches([...branches, newB]);
      setSelectedBranchId(newB.id);
    }
    setNewBranchName('');
  };

  const handleDeleteBranch = (id: number) => {
    setBranches(branches.filter(b => b.id !== id));
    if (selectedBranchId === id) setSelectedBranchId(null);
  };

  // زیادکردن یاخود نوێکردنەوەی ناوچە
  const handleSaveRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName || !selectedBranchId) return;

    if (editingRegionId !== null) {
      setRegions(regions.map(reg => reg.id === editingRegionId ? { ...reg, name: newRegionName } : reg));
      setEditingRegionId(null);
    } else {
      const newReg: Region = { id: Date.now(), branchId: selectedBranchId, name: newRegionName };
      setRegions([...regions, newReg]);
      setSelectedRegionId(newReg.id);

      // دانانی داتای سەرەتایی پارتەکان بۆ ناوچە نوێیەکە
      setRegionVotes(prev => ({
        ...prev,
        [newReg.id]: defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))
      }));
    }
    setNewRegionName('');
  };

  const handleDeleteRegion = (id: number) => {
    setRegions(regions.filter(reg => reg.id !== id));
    if (selectedRegionId === id) setSelectedRegionId(null);
  };

  // گۆڕینی دەنگ و حسابکردنی ڕێژەی سەدی بۆ پارتەکان لە ناوچەی دیاریکراودا
  const handleVoteChange = (regionId: number, partyId: number, votes: number) => {
    const currentList = regionVotes[regionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }));
    const totalVotes = currentList.reduce((acc, curr) => curr.partyId === partyId ? acc + votes : acc + curr.votes, 0);

    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      const pct = totalVotes > 0 ? Number(((v / totalVotes) * 100).toFixed(1)) : 0;
      return { ...item, votes: v, percentage: pct };
    });

    setRegionVotes({
      ...regionVotes,
      [regionId]: updated
    });
  };

  const currentRound = rounds.find(r => r.id === selectedRoundId);
  const currentBranches = branches.filter(b => b.roundId === selectedRoundId);
  const currentRegions = regions.filter(reg => reg.branchId === selectedBranchId);
  const currentRegionVotes = selectedRegionId ? (regionVotes[selectedRegionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))) : [];

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

        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--text-secondary)] font-medium">تیمی ڕووکار:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none"
          >
            <option value="government">🏛️ تیمی حکومی</option>
            <option value="dark">🌙 تیمی تۆخ</option>
            <option value="light">☀️ تیمی ڕۆشن</option>
          </select>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* پانێڵی لای ڕاست */}
        <aside className="w-64 bg-[var(--bg-card)] border-l border-[var(--border-color)] p-4 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-1">
            بەشە سەرەکییەکان
          </span>

          <button
            onClick={() => setActiveMainTab('dashboard')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
              activeMainTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>داشبۆرد و هێڵکارییەکان</span>
            <span>🏠</span>
          </button>

          <button
            onClick={() => setActiveMainTab('rounds')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-between ${
              activeMainTab === 'rounds' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>خولەکانی هەڵبژاردن</span>
            <span>🗳️</span>
          </button>
        </aside>

        {/* ناوەڕۆکی سەرەکی */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeMainTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">داشبۆرد و شیکاری گشتی</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  هەڵبژاردنی ئێستا: <span className="font-bold text-[var(--text-primary)]">{currentRound ? currentRound.name : 'هیچ هەڵبژاردنێک دیاری نەکراوە'}</span>
                </p>
              </div>
            </div>
          )}

          {activeMainTab === 'rounds' && (
            <div className="space-y-6">
              {/* فۆڕمی تۆمارکردنی خولی هەڵبژاردن */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">
                  {editingRoundId !== null ? 'دەستکاری خولی هەڵبژاردن' : 'تۆمارکردنی خولی نوێ بۆ هەڵبژاردن'}
                </h2>
                <form onSubmit={handleSaveRound} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ناوی خولی هەڵبژاردن</label>
                    <input
                      type="text"
                      value={roundName}
                      onChange={(e) => setRoundName(e.target.value)}
                      placeholder="بۆ نموونە: پەرلەمانی کوردستان"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">ڕۆژ و مانگ و ساڵی هەڵبژاردن</label>
                    <input
                      type="date"
                      value={roundDate}
                      onChange={(e) => setRoundDate(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">جۆری هەڵبژاردنەکان</label>
                    <select
                      value={roundType}
                      onChange={(e) => setRoundType(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="پەرلەمانی">پەرلەمانی</option>
                      <option value="ئەنجومەنی پارێزگاکان">ئەنجومەنی پارێزگاکان</option>
                      <option value="سەرۆکایەتی">سەرۆکایەتی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">کۆی دەنگدەران</label>
                    <input
                      type="number"
                      value={roundVoters}
                      onChange={(e) => setRoundVoters(e.target.value)}
                      placeholder="3000000"
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-4 flex justify-end gap-2">
                    {editingRoundId !== null && (
                      <button
                        type="button"
                        onClick={() => { setEditingRoundId(null); setRoundName(''); setRoundDate(''); }}
                        className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                      >
                        پاشگەزبوونەوە
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow transition-all"
                    >
                      {editingRoundId !== null ? 'نوێکردنەوەی خول' : '+ زیادکردنی خول'}
                    </button>
                  </div>
                </form>
              </div>

              {/* لیستی خولەکان و هەڵبژاردنیان */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">لیستی خولەکانی هەڵبژاردن</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                        <th className="py-3 px-4">ناوی خول</th>
                        <th className="py-3 px-4">بەڕێوەچوون</th>
                        <th className="py-3 px-4">جۆر</th>
                        <th className="py-3 px-4">کۆی دەنگدەران</th>
                        <th className="py-3 px-4">کردارەکان</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-sm">
                      {rounds.map((r) => (
                        <tr key={r.id} className={`hover:bg-[var(--bg-hover)] cursor-pointer ${selectedRoundId === r.id ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`} onClick={() => setSelectedRoundId(r.id)}>
                          <td className="py-3 px-4 font-semibold">{r.name}</td>
                          <td className="py-3 px-4">{r.date}</td>
                          <td className="py-3 px-4">{r.type}</td>
                          <td className="py-3 px-4">{r.totalVoters.toLocaleString()}</td>
                          <td className="py-3 px-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleEditRound(r)} className="text-blue-600 hover:underline text-xs font-bold">دەستکاری</button>
                            <button onClick={() => handleDeleteRound(r.id)} className="text-red-600 hover:underline text-xs font-bold">سڕینەوە</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* تابی لقەکان (Branches) کاتێک خولێک دیاری دەکرێت */}
              {selectedRoundId && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-[var(--border-color)] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <span className="text-xs text-blue-600 font-bold px-2.5 py-1 bg-blue-100 rounded-full">تابی لقەکان</span>
                      <h2 className="text-xl font-bold mt-2">بەڕێوەبردنی لقەکانی: {currentRound?.name}</h2>
                    </div>
                    <form onSubmit={handleSaveBranch} className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="ناوی لقی نوێ..."
                        className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm"
                        required
                      />
                      <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                        {editingBranchId !== null ? 'نوێکردنەوە' : '+ زیادکردنی لقی نوێ'}
                      </button>
                    </form>
                  </div>

                  {/* تابس بار بۆ لقەکان */}
                  <div className="flex flex-wrap gap-2">
                    {currentBranches.map(branch => (
                      <div
                        key={branch.id}
                        onClick={() => setSelectedBranchId(branch.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border flex items-center gap-3 transition-all ${
                          selectedBranchId === branch.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                        }`}
                      >
                        <span>{branch.name}</span>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setEditingBranchId(branch.id); setNewBranchName(branch.name); }} className="text-xs opacity-80 hover:opacity-100">✏️</button>
                          <button onClick={() => handleDeleteBranch(branch.id)} className="text-xs opacity-80 hover:opacity-100">❌</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* تابی ناوچەکان (Regions) کاتێک لقی هەڵبژاردراو هەیە */}
                  {selectedBranchId && (
                    <div className="mt-6 pt-6 border-t border-[var(--border-color)] space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="text-xs text-green-600 font-bold px-2.5 py-1 bg-green-100 rounded-full">سەب-تابی ناوچەکان</span>
                          <h3 className="text-lg font-bold mt-2">ناوچەکانی سەر بە لقی دیاریکراو</h3>
                        </div>
                        <form onSubmit={handleSaveRegion} className="flex gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={newRegionName}
                            onChange={(e) => setNewRegionName(e.target.value)}
                            placeholder="ناوی ناوچە/بنکە..."
                            className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm"
                            required
                          />
                          <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                            {editingRegionId !== null ? 'نوێکردنەوە' : '+ زیادکردنی ناوچە'}
                          </button>
                        </form>
                      </div>

                      {/* سەب-تابی ناوچەکان */}
                      <div className="flex flex-wrap gap-2">
                        {currentRegions.map(reg => (
                          <div
                            key={reg.id}
                            onClick={() => setSelectedRegionId(reg.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border flex items-center gap-2 ${
                              selectedRegionId === reg.id
                                ? 'bg-green-600 text-white border-green-600 shadow'
                                : 'bg-[var(--bg-main)] border-[var(--border-color)]'
                            }`}
                          >
                            <span>{reg.name}</span>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => { setEditingRegionId(reg.id); setNewRegionName(reg.name); }} className="opacity-80 hover:opacity-100">✏️</button>
                              <button onClick={() => handleDeleteRegion(reg.id)} className="opacity-80 hover:opacity-100">❌</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* فۆڕمی داتا ئینتری دەنگەکان بۆ هەر پارتێک لەناو ئەو ناوچەیەدا */}
                      {selectedRegionId && (
                        <div className="mt-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
                          <h4 className="font-bold text-base text-[var(--text-primary)]">
                            داتا ئینتری دەنگەکان بۆ ناوچەی دیاریکراو
                          </h4>
                          <div className="space-y-3">
                            {currentRegionVotes.map(party => (
                              <div key={party.partyId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg gap-4">
                                <div className="flex items-center gap-3">
                                  <span className={`w-4 h-4 rounded-full ${party.color}`}></span>
                                  <span className="font-semibold text-sm">{party.partyName}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">ژمارەی دەنگ:</label>
                                    <input
                                      type="number"
                                      value={party.votes}
                                      onChange={(e) => handleVoteChange(selectedRegionId, party.partyId, Number(e.target.value) || 0)}
                                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-md px-3 py-1 text-sm w-28 focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-[var(--text-secondary)]">ڕێژەی سەدی:</label>
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-bold w-20 text-center">
                                      {party.percentage}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;