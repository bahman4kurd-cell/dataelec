import React, { useState, useEffect } from 'react';

type ThemeType = 'government' | 'dark' | 'light';
type ChartType = 'bars' | 'pie' | 'donut' | 'progress' | 'line' | 'network' | 'radial';

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

  // خوێندنەوە و پاشەکەوتکردنی داتا لە localStorage بۆ ئەوەی نەسڕێنەوە
  const [rounds, setRounds] = useState<ElectionRound[]>(() => {
    const saved = localStorage.getItem('election_rounds');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(() => {
    const saved = localStorage.getItem('election_selected_round');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [roundName, setRoundName] = useState('');
  const [roundDate, setRoundDate] = useState('');
  const [roundType, setRoundType] = useState('پەرلەمانی');
  const [roundVoters, setRoundVoters] = useState('');
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem('election_branches');
    return saved ? JSON.parse(saved) : [];
  });
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(() => {
    const saved = localStorage.getItem('election_selected_branch');
    return saved ? JSON.parse(saved) : null;
  });
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);

  const [regions, setRegions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('election_regions');
    return saved ? JSON.parse(saved) : [];
  });
  const [newRegionName, setNewRegionName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(() => {
    const saved = localStorage.getItem('election_selected_region');
    return saved ? JSON.parse(saved) : null;
  });
  const [editingRegionId, setEditingRegionId] = useState<number | null>(null);

  const [regionVotes, setRegionVotes] = useState<{ [regionId: number]: PartyVote[] }>(() => {
    const saved = localStorage.getItem('election_region_votes');
    return saved ? JSON.parse(saved) : {};
  });

  const [dashboardChartType, setDashboardChartType] = useState<ChartType>('bars');
  const [dashSelectedBranch, setDashSelectedBranch] = useState<string>('all');
  const [dashSelectedRegion, setDashSelectedRegion] = useState<string>('all');
  const [dashSelectedRoundId, setDashSelectedRoundId] = useState<number | null>(() => {
    const saved = localStorage.getItem('election_dash_round');
    return saved ? JSON.parse(saved) : null;
  });

  // لایەنەکان بە ناوی فەرمی و ڕەنگە دیاریکراوەکانیان (بە شێوازی inline style بۆ پشتڕاستکردنەوەی ڕەنگەکە لە چارتەکاندا)
  const defaultParties = [
    { partyId: 1, partyName: 'پارتی دیموکراتی کوردستان', color: 'bg-yellow-400', hexColor: '#facc15' },
    { partyId: 2, partyName: 'یەکێتی نیشتمانی کوردستان', color: 'bg-green-600', hexColor: '#16a34a' },
    { partyId: 3, partyName: 'نەوەی نوێ', color: 'bg-amber-400', hexColor: '#fbbf24' },
    { partyId: 4, partyName: 'یەکگرتووی ئیسلامی کوردستان', color: 'bg-amber-900', hexColor: '#78350f' },
    { partyId: 5, partyName: 'کۆمەڵی دادگەری', color: 'bg-orange-800', hexColor: '#9a3412' },
    { partyId: 6, partyName: 'هەڵوێست', color: 'bg-purple-600', hexColor: '#9333ea' },
    { partyId: 7, partyName: 'بزووتنەوەی گۆڕان', color: 'bg-blue-900', hexColor: '#1e3a8a' },
    { partyId: 8, partyName: 'بزووتنەوەی ئیسلامی', color: 'bg-slate-100 text-black', hexColor: '#f8fafc' },
    { partyId: 9, partyName: 'سۆسیالیست', color: 'bg-sky-300', hexColor: '#7dd3fc' },
    { partyId: 10, partyName: 'هاوپەیمانی نیشتمانی', color: 'bg-emerald-300', hexColor: '#6ee7b7' },
    { partyId: 11, partyName: 'سەربەخۆ', color: 'bg-teal-400', hexColor: '#2dd4bf' },
    { partyId: 12, partyName: 'لایەنی تر', color: 'bg-rose-500', hexColor: '#f43f5e' },
  ];

  // پاشەکەوتکردنی داتا لە localStorage لە کاتی گۆڕانکارییەکاندا
  useEffect(() => {
    localStorage.setItem('election_rounds', JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    localStorage.setItem('election_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('election_regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('election_region_votes', JSON.stringify(regionVotes));
  }, [regionVotes]);

  useEffect(() => {
    if (selectedRoundId !== null) {
      localStorage.setItem('election_selected_round', JSON.stringify(selectedRoundId));
    }
  }, [selectedRoundId]);

  useEffect(() => {
    if (dashSelectedRoundId !== null) {
      localStorage.setItem('election_dash_round', JSON.stringify(dashSelectedRoundId));
    }
  }, [dashSelectedRoundId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (rounds.length > 0 && (!dashSelectedRoundId || !rounds.some(r => r.id === dashSelectedRoundId))) {
      setDashSelectedRoundId(rounds[0].id);
    }
    if (rounds.length > 0 && (!selectedRoundId || !rounds.some(r => r.id === selectedRoundId))) {
      setSelectedRoundId(rounds[0].id);
    }
  }, [rounds]);

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
      setDashSelectedRoundId(newRound.id);
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
    if (dashSelectedRoundId === id) setDashSelectedRoundId(null);
  };

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

  const handleVoteChange = (regionId: number, partyId: number, votes: number) => {
    const currentList = regionVotes[regionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }));
    
    // نوێکردنەوەی کۆی دەنگەکان لە ناوچەکەدا بە شێوازێکی دروست
    const updated = currentList.map(item => {
      const v = item.partyId === partyId ? votes : item.votes;
      return { ...item, votes: v };
    });

    const totalVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);

    const recalculated = updated.map(item => ({
      ...item,
      percentage: totalVotes > 0 ? Number(((item.votes / totalVotes) * 100).toFixed(1)) : 0
    }));

    setRegionVotes({
      ...regionVotes,
      [regionId]: recalculated
    });
  };

  const getFilteredDashboardVotes = () => {
    if (!dashSelectedRoundId) return [];

    const roundBranches = branches.filter(b => b.roundId === dashSelectedRoundId);
    let targetRegionIds: number[] = [];

    if (dashSelectedBranch === 'all') {
      const branchIds = roundBranches.map(b => b.id);
      targetRegionIds = regions.filter(reg => branchIds.includes(reg.branchId)).map(r => r.id);
    } else {
      const bId = Number(dashSelectedBranch);
      if (dashSelectedRegion === 'all') {
        targetRegionIds = regions.filter(reg => reg.branchId === bId).map(r => r.id);
      } else {
        targetRegionIds = [Number(dashSelectedRegion)];
      }
    }

    const aggregated: { [partyId: number]: { partyName: string; votes: number; hexColor: string; color: string } } = {};
    
    defaultParties.forEach(p => {
      aggregated[p.partyId] = { partyName: p.partyName, votes: 0, hexColor: p.hexColor, color: p.color };
    });

    targetRegionIds.forEach(regId => {
      const vList = regionVotes[regId] || [];
      vList.forEach(item => {
        if (aggregated[item.partyId]) {
          aggregated[item.partyId].votes += item.votes;
        }
      });
    });

    const totalAllVotes = Object.values(aggregated).reduce((sum, item) => sum + item.votes, 0);

    return Object.values(aggregated).map(item => ({
      ...item,
      percentage: totalAllVotes > 0 ? Number(((item.votes / totalAllVotes) * 100).toFixed(1)) : 0
    }));
  };

  const currentRound = rounds.find(r => r.id === selectedRoundId);
  const currentBranches = branches.filter(b => b.roundId === selectedRoundId);
  const currentRegions = regions.filter(reg => reg.branchId === selectedBranchId);
  const currentRegionVotes = selectedRegionId ? (regionVotes[selectedRegionId] || defaultParties.map(p => ({ ...p, votes: 0, percentage: 0 }))) : [];

  const dashFilteredBranches = dashSelectedRoundId ? branches.filter(b => b.roundId === dashSelectedRoundId) : [];
  const dashFilteredRegions = dashSelectedBranch !== 'all' ? regions.filter(reg => reg.branchId === Number(dashSelectedBranch)) : [];
  const dashboardData = getFilteredDashboardVotes();
  const totalDashboardVotes = dashboardData.reduce((acc, curr) => acc + curr.votes, 0);
  const dashSelectedRoundObj = rounds.find(r => r.id === dashSelectedRoundId);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200" dir="rtl">
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

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeMainTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-color)] pb-4">
                  <div>
                    <h2 className="text-xl font-bold">داشبۆرد و شیکاری ئەنجامەکان</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      خولە هەڵبژاردراوەکە: <span className="font-bold text-blue-600">{dashSelectedRoundObj ? dashSelectedRoundObj.name : 'هیچ خولێک دیاری نەکراوە'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-[var(--text-secondary)]">جۆری شێوازی چارت:</label>
                    <select
                      value={dashboardChartType}
                      onChange={(e) => setDashboardChartType(e.target.value as ChartType)}
                      className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bars">📊 هێڵکاری ستوونی (Bar Chart)</option>
                      <option value="pie">🥧 هێڵکاری بازنەیی (Pie Chart)</option>
                      <option value="donut">🍩 هێڵکاری دۆنات (Donut Chart)</option>
                      <option value="progress">📈 پیشاندەری ڕێژەیی (Progress Bars)</option>
                      <option value="line">📉 هێڵکاری گەشەسەندن (Line Chart)</option>
                      <option value="network">🕸️ هێڵکاری تۆڕی پێشکەوتوو (Network Nodes)</option>
                      <option value="radial">🎯 هێڵکاری پەیڤەری و تیشکی (Radial Gauge)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-[var(--text-secondary)]">دیاریکردنی خولی هەڵبژاردن بۆ بینینی چارتەکان:</span>
                  <div className="flex flex-wrap gap-2">
                    {rounds.length === 0 ? (
                      <span className="text-sm text-red-500 font-medium">تکایە سەرەتا لە بەشی "خولەکانی هەڵبژاردن" خولێک زیاد بکە.</span>
                    ) : (
                      rounds.map(r => (
                        <button
                          key={r.id}
                          onClick={() => {
                            setDashSelectedRoundId(r.id);
                            setDashSelectedBranch('all');
                            setDashSelectedRegion('all');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                            dashSelectedRoundId === r.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow'
                              : 'bg-[var(--bg-main)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">فلتەر بەپێی لقی هەڵبژاردن</label>
                    <select
                      value={dashSelectedBranch}
                      onChange={(e) => {
                        setDashSelectedBranch(e.target.value);
                        setDashSelectedRegion('all');
                      }}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">هەموو لقەکان گشتی</option>
                      {dashFilteredBranches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">فلتەر بەپێی ناوچە / بنکە</label>
                    <select
                      value={dashSelectedRegion}
                      onChange={(e) => setDashSelectedRegion(e.target.value)}
                      className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm"
                      disabled={dashSelectedBranch === 'all'}
                    >
                      <option value="all">هەموو ناوچەکانی ئەم لقە</option>
                      {dashFilteredRegions.map(reg => (
                        <option key={reg.id} value={reg.id}>{reg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
                  <h3 className="text-lg font-bold">
                    ئەنجامی چارتەکان بۆ خولی: <span className="text-blue-600">{dashSelectedRoundObj?.name || 'هیچ'}</span>
                  </h3>
                  <span className="text-sm font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 px-3 py-1 rounded-full">
                    کۆی دەنگەکان: {totalDashboardVotes.toLocaleString()}
                  </span>
                </div>

                {dashboardChartType === 'bars' && (
                  <div className="space-y-4 pt-2">
                    {dashboardData.map(item => (
                      <div key={item.partyName} className="space-y-1">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>{item.partyName}</span>
                          <span>{item.votes.toLocaleString()} دەنگ ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-[var(--bg-main)] h-4 rounded-full overflow-hidden border border-[var(--border-color)] shadow-inner">
                          <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {dashboardChartType === 'progress' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                    {dashboardData.map(item => (
                      <div key={item.partyName} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                        <span className="w-4 h-4 rounded-full border border-gray-300 shadow" style={{ backgroundColor: item.hexColor }}></span>
                        <h4 className="font-bold text-sm">{item.partyName}</h4>
                        <div className="text-3xl font-extrabold text-blue-600">{item.percentage}%</div>
                        <p className="text-xs text-[var(--text-secondary)]">{item.votes.toLocaleString()} دەنگ</p>
                      </div>
                    ))}
                  </div>
                )}

                {(dashboardChartType === 'pie' || dashboardChartType === 'donut') && (
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
                    <div className={`relative w-48 h-48 rounded-full flex items-center justify-center shadow-lg border-4 border-[var(--border-color)] ${dashboardChartType === 'donut' ? 'bg-[var(--bg-main)]' : ''}`}>
                      {dashboardChartType === 'donut' && (
                        <div className="absolute w-28 h-28 bg-[var(--bg-card)] rounded-full flex flex-col items-center justify-center text-center shadow">
                          <span className="text-xs text-[var(--text-secondary)]">کۆی گشتی</span>
                          <span className="font-bold text-sm">{totalDashboardVotes.toLocaleString()}</span>
                        </div>
                      )}
                      {dashboardChartType === 'pie' && (
                        <div className="text-center font-bold text-sm z-10 p-4">
                          <div>هێڵکاری بازنەیی</div>
                          <div className="text-xs opacity-90">{totalDashboardVotes.toLocaleString()} دەنگ</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 w-full md:w-auto max-h-80 overflow-y-auto px-2">
                      {dashboardData.map(item => (
                        <div key={item.partyName} className="flex items-center gap-3 bg-[var(--bg-main)] border border-[var(--border-color)] px-4 py-2 rounded-lg shadow-sm">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: item.hexColor }}></span>
                          <span className="text-sm font-semibold">{item.partyName}:</span>
                          <span className="text-sm font-bold text-blue-600">{item.percentage}%</span>
                          <span className="text-xs text-[var(--text-secondary)]">({item.votes.toLocaleString()} دەنگ)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'line' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <h4 className="font-bold text-sm text-[var(--text-secondary)]">ڕەوتی هێڵی ڕێژەی دەنگەکان</h4>
                    <div className="flex items-end justify-around h-48 pt-6 border-b border-x border-[var(--border-color)] px-2 overflow-x-auto relative gap-2">
                      {dashboardData.map((item) => (
                        <div key={item.partyName} className="flex flex-col items-center gap-2 h-full justify-end group min-w-[60px]">
                          <span className="text-xs font-bold text-blue-600">{item.percentage}%</span>
                          <div
                            className="w-10 rounded-t-lg border border-gray-300 transition-all duration-500 shadow-md group-hover:opacity-90"
                            style={{ height: `${Math.max(item.percentage, 10)}%`, backgroundColor: item.hexColor }}
                          ></div>
                          <span className="text-[10px] font-semibold text-center mt-2 truncate w-full" title={item.partyName}>{item.partyName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'network' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[var(--text-secondary)]">🕸️ پەیوەندی و تۆرکاری دەنگی لایەنەکان (Network Nodes)</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-md font-bold">چالاک و ڕاستەقینە</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {dashboardData.map((item, idx) => (
                        <div key={item.partyName} className="relative bg-[var(--bg-card)] border-2 border-dashed border-[var(--border-color)] p-5 rounded-2xl flex flex-col items-center text-center gap-3 shadow-sm">
                          <div className="absolute -top-3 right-4 px-3 py-0.5 text-xs font-bold text-white rounded-full shadow" style={{ backgroundColor: item.hexColor }}>
                            گرێی #{idx + 1}
                          </div>
                          <span className="w-6 h-6 rounded-full border border-gray-300 animate-pulse mt-2" style={{ backgroundColor: item.hexColor }}></span>
                          <h5 className="font-bold text-sm">{item.partyName}</h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-extrabold text-blue-600">{item.votes.toLocaleString()}</span>
                            <span className="text-xs text-[var(--text-secondary)]">دەنگ</span>
                          </div>
                          <div className="w-full bg-[var(--bg-main)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                            <div className="h-full" style={{ width: `${item.percentage}%`, backgroundColor: item.hexColor }}></div>
                          </div>
                          <span className="text-xs font-bold text-[var(--text-secondary)]">پشکی تۆڕ: {item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dashboardChartType === 'radial' && (
                  <div className="bg-[var(--bg-main)] border border-[var(--border-color)] p-6 rounded-xl space-y-6">
                    <h4 className="font-bold text-sm text-[var(--text-secondary)]">🎯 پەیڤەری پێوانەیی تیشکی و بازنەیی (Radial Gauge)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      {dashboardData.map(item => (
                        <div key={item.partyName} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-4 shadow-sm">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: item.hexColor }}></span>
                          <h5 className="font-bold text-sm">{item.partyName}</h5>
                          <div className="relative w-32 h-32 rounded-full border-8 border-[var(--border-color)] flex items-center justify-center shadow-inner">
                            <div className="absolute inset-0 rounded-full border-8 opacity-30" style={{ borderColor: item.hexColor }}></div>
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-extrabold">{item.percentage}%</span>
                              <span className="text-[10px] text-[var(--text-secondary)]">ڕێژەی کێبڕکێ</span>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-[var(--text-secondary)]">{item.votes.toLocaleString()} دەنگی بەدەستهاتوو</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMainTab === 'rounds' && (
            <div className="space-y-6">
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
                      placeholder="بۆ نموونە: هەڵبژاردنی پەرلەمانی کوردستان"
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
                      {rounds.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[var(--text-secondary)]">هیچ خولێک تۆمار نەکراوە.</td>
                        </tr>
                      ) : (
                        rounds.map((r) => (
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

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

                  <div className="flex flex-wrap gap-2">
                    {currentBranches.length === 0 ? (
                      <p className="text-sm text-[var(--text-secondary)]">هیچ لقی بۆ ئەم خولە زیاد نەکراوە.</p>
                    ) : (
                      currentBranches.map(branch => (
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
                      ))
                    )}
                  </div>

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

                      <div className="flex flex-wrap gap-2">
                        {currentRegions.length === 0 ? (
                          <p className="text-sm text-[var(--text-secondary)]">هیچ ناوچەیەک بۆ ئەم لقە زیاد نەکراوە.</p>
                        ) : (
                          currentRegions.map(reg => (
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
                          ))
                        )}
                      </div>

                      {selectedRegionId && (
                        <div className="mt-6 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 space-y-4">
                          <h4 className="font-bold text-base text-[var(--text-primary)]">
                            داتا ئینتری دەنگەکان بۆ ناوچەی دیاریکراو
                          </h4>
                          <div className="space-y-3">
                            {currentRegionVotes.map(party => (
                              <div key={party.partyId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-lg gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: party.hexColor }}></span>
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
