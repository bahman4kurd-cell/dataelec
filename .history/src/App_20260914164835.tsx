import React, { useState, useEffect } from 'react';

type ThemeType = 'government' | 'dark' | 'light';
type ChartType = 'progress' | 'bars' | 'pie' | 'donut' | 'network_dots';

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
  hexColor: string; // بۆ چارتە ڕەنگییەکان
}

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeType>('government');

  const [rounds, setRounds] = useState<ElectionRound[]>([]);
  const [partyResults, setPartyResults] = useState<PartyResult[]>([]);
  
  const [roundChartTypes, setRoundChartTypes] = useState<{ [key: number]: ChartType }>({});

  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundYear, setNewRoundYear] = useState('');
  const [newRoundVoters, setNewRoundVoters] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    fetchRounds();
    fetchPartyResults();
  }, [theme]);

  const fetchRounds = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rounds');
      if (response.ok) {
        const data = await response.json();
        setRounds(data);
        const initialCharts: { [key: number]: ChartType } = {};
        data.forEach((r: ElectionRound) => {
          initialCharts[r.id] = 'pie';
        });
        setRoundChartTypes(initialCharts);
      }
    } catch (error) {
      const fallbackRounds = [
        { id: 1, name: 'هەڵبژاردنی پەرلەمانی کوردستان 2024', year: '2024', totalVoters: 2899578, status: 'چالاک' as const },
        { id: 2, name: 'هەڵبژاردنی ئەنجومەنی پارێزگاکان', year: '2023', totalVoters: 2500000, status: 'تەواوبوو' as const }
      ];
      setRounds(fallbackRounds);
      setRoundChartTypes({ 1: 'pie', 2: 'donut' });
    }
  };

  const fetchPartyResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parties');
      if (response.ok) {
        const data = await response.json();
        setPartyResults(data);
      }
    } catch (error) {
      setPartyResults([
        { id: 1, name: 'لیستی یەکەم (پارتی)', votes: 850000, color: 'bg-yellow-500', hexColor: '#eab308' },
        { id: 2, name: 'لیستی دووەم (یەکێتی)', votes: 720000, color: 'bg-green-600', hexColor: '#16a34a' },
        { id: 3, name: 'لیستی سێیەم (نەوەی نوێ)', votes: 450000, color: 'bg-blue-600', hexColor: '#2563eb' },
      ]);
    }
  };

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundName || !newRoundYear) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoundName,
          year: newRoundYear,
          totalVoters: Number(newRoundVoters) || 0,
          status: 'چالاک'
        })
      });

      if (response.ok) {
        setNewRoundName('');
        setNewRoundYear('');
        setNewRoundVoters('');
        fetchRounds();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalVotesCast = partyResults.reduce((acc, curr) => acc + curr.votes, 0);

  const handleChartTypeChange = (roundId: number, type: ChartType) => {
    setRoundChartTypes(prev => ({ ...prev, [roundId]: type }));
  };

  // دروستکردنی SVG بۆ پای چارت (Pie Chart)
  const renderPieChart = () => {
    let cumulativeAngle = 0;
    const radius = 80;
    const center = 100;

    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
        <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90 drop-shadow-md">
          {partyResults.map((party) => {
            const percentage = totalVotesCast > 0 ? party.votes / totalVotesCast : 0;
            const angle = percentage * 360;
            const x1 = center + radius * Math.cos((Math.PI * cumulativeAngle) / 180);
            const y1 = center + radius * Math.sin((Math.PI * cumulativeAngle) / 180);
            
            cumulativeAngle += angle;
            
            const x2 = center + radius * Math.cos((Math.PI * cumulativeAngle) / 180);
            const y2 = center + radius * Math.sin((Math.PI * cumulativeAngle) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={party.id}
                d={pathData}
                fill={party.hexColor || '#3b82f6'}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>
        <div className="space-y-2">
          {partyResults.map((party) => {
            const percentage = totalVotesCast > 0 ? ((party.votes / totalVotesCast) * 100).toFixed(1) : '0';
            return (
              <div key={party.id} className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: party.hexColor }}></span>
                <span>{party.name}:</span>
                <span className="text-[var(--text-secondary)]">{party.votes.toLocaleString()} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // دروستکردنی SVG بۆ دۆنەت چارت (Donut Chart)
  const renderDonutChart = () => {
    let cumulativePercent = 0;
    const radius = 70;
    const center = 100;
    const circumference = 2 * Math.PI * radius;

    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            {partyResults.map((party) => {
              const percentage = totalVotesCast > 0 ? party.votes / totalVotesCast : 0;
              const strokeDasharray = `${percentage * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercent * circumference;
              cumulativePercent += percentage;

              return (
                <circle
                  key={party.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={party.hexColor || '#3b82f6'}
                  strokeWidth="35"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-90"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-[var(--text-secondary)]">کۆی گشتی</span>
            <span className="text-sm font-bold">{totalVotesCast.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          {partyResults.map((party) => {
            const percentage = totalVotesCast > 0 ? ((party.votes / totalVotesCast) * 100).toFixed(1) : '0';
            return (
              <div key={party.id} className="flex items-center gap-3 text-sm font-semibold">
                <span className="w-4 h-4 rounded-md" style={{ backgroundColor: party.hexColor }}></span>
                <span>{party.name}:</span>
                <span className="text-[var(--text-secondary)]">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // هێڵکاری تۆڕی خاڵەکان (Network Dots چۆن لە وێنەکەیە)
  const renderNetworkDots = () => {
    return (
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-6 relative overflow-hidden h-64 flex flex-col justify-between">
        <div className="flex justify-between items-center z-10">
          <h4 className="font-bold text-sm">شیکاری تۆڕی پەیوەندی و چڕی دەنگدەران (Network Graph)</h4>
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md">Live Nodes</span>
        </div>

        {/* هێڵی خاڵبەندی و گرێکان وەک وێنەکە */}
        <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none" viewBox="0 0 500 250">
          <path d="M50,180 Q150,80 250,130 T450,70" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M80,220 Q200,120 350,180 T480,100" fill="none" stroke="#10b981" strokeWidth="1.5" />
          
          {/* گرێکانی خاڵەکان بە قەبارەی جیاواز */}
          <circle cx="120" cy="150" r="14" fill="#8b5cf6" opacity="0.8" />
          <circle cx="210" cy="90" r="22" fill="#8b5cf6" opacity="0.9" />
          <circle cx="330" cy="140" r="10" fill="#f59e0b" opacity="0.8" />
          <circle cx="410" cy="80" r="18" fill="#ef4444" opacity="0.85" />
          
          <circle cx="90" cy="200" r="8" fill="#10b981" />
          <circle cx="270" cy="190" r="12" fill="#3b82f6" />
          <circle cx="380" cy="110" r="7" fill="#8b5cf6" />
        </svg>

        <div className="z-10 bg-[var(--bg-card)]/90 backdrop-blur border border-[var(--border-color)] p-3 rounded-lg shadow-sm w-max">
          <span className="text-xs font-bold block text-purple-600">گروپی سەرەکی: ناوچەی پاریزگاری سلێمانی</span>
          <span className="text-[10px] text-[var(--text-secondary)]">کۆی تۆمارکراوەکان: ٢,٧٣٢ سەکۆ</span>
        </div>
      </div>
    );
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

        <div className="flex items-center gap-2">
          <label htmlFor="theme-select" className="text-sm text-[var(--text-secondary)] font-medium">
            تیمی ڕووکار:
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeType)}
            className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="government">🏛️ تیمی حکومی</option>
            <option value="dark">🌙 تیمی تۆخ</option>
            <option value="light">☀️ تیمی ڕۆشن</option>
          </select>
        </div>
      </header>

      {/* ناوەڕۆک و پانێڵی لای ڕاست */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[var(--bg-card)] border-l border-[var(--border-color)] p-4 flex flex-col gap-2 shadow-sm">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider px-2 mb-1">
            بەشە سەرەکییەکان
          </span>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>داشبۆرد و هێڵکاری خولەکان</span>
            <span>🏠</span>
          </button>

          <button
            onClick={() => setActiveTab('rounds')}
            className={`w-full text-right px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
              activeTab === 'rounds' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <span>خولەکانی هەڵبژاردن</span>
            <span>🗳️</span>
          </button>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                  <span className="text-sm text-[var(--text-secondary)] font-medium">کۆی گشتی دەنگە دراوەکان (API)</span>
                  <h3 className="text-2xl font-bold mt-1">{totalVotesCast.toLocaleString()}</h3>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold">هێڵکاری و شیکاری ئەنجامەکان بۆ هەر خولێک</h2>
                
                {rounds.map((round) => {
                  const currentChart = roundChartTypes[round.id] || 'pie';

                  return (
                    <div key={round.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                        <div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            ساڵی {round.year}
                          </span>
                          <h3 className="text-lg font-bold mt-2">{round.name}</h3>
                          <span className="text-xs text-[var(--text-secondary)]">کۆی دەنگدەرانی تۆمارکراو: {round.totalVoters.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-[var(--text-secondary)]">جۆری چارت:</label>
                          <select
                            value={currentChart}
                            onChange={(e) => handleChartTypeChange(round.id, e.target.value as ChartType)}
                            className="bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pie">🥧 پای چارت (Pie Chart)</option>
                            <option value="donut">🍩 دۆنەت چارت (Donut Chart)</option>
                            <option value="progress">📊 هێڵکاری ڕێژەیی (Progress)</option>
                            <option value="bars">📈 هێڵکاری ستوونی (Vertical Bars)</option>
                            <option value="network_dots">🌐 تۆڕی گرێ و خاڵەکان (Network Graph)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        {currentChart === 'pie' && renderPieChart()}
                        {currentChart === 'donut' && renderDonutChart()}
                        {currentChart === 'network_dots' && renderNetworkDots()}
                        
                        {currentChart === 'progress' && (
                          <div className="space-y-4 py-2">
                            {partyResults.map((party) => {
                              const percentage = totalVotesCast > 0 ? ((party.votes / totalVotesCast) * 100).toFixed(1) : '0';
                              return (
                                <div key={party.id} className="space-y-1.5">
                                  <div className="flex justify-between text-sm font-semibold">
                                    <span>{party.name}</span>
                                    <span>{party.votes.toLocaleString()} دەنگ ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-[var(--bg-main)] h-4 rounded-full overflow-hidden border border-[var(--border-color)]">
                                    <div className={`h-full ${party.color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {currentChart === 'bars' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            {partyResults.map((party) => {
                              const percentage = totalVotesCast > 0 ? ((party.votes / totalVotesCast) * 100).toFixed(1) : '0';
                              return (
                                <div key={party.id} className="bg-[var(--bg-main)] border border-[var(--border-color)] p-4 rounded-lg flex flex-col items-center justify-between text-center gap-3">
                                  <span className="font-bold text-sm">{party.name}</span>
                                  <div className="w-12 bg-gray-200 h-32 rounded-t-lg flex items-end overflow-hidden">
                                    <div className={`w-full ${party.color} transition-all duration-500`} style={{ height: `${percentage}%` }}></div>
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold block">{party.votes.toLocaleString()} دەنگ</span>
                                    <span className="text-xs text-[var(--text-secondary)]">{percentage}%</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'rounds' && (
            <div className="space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">تۆمارکردنی خولی نوێ بۆ هەڵبژاردن</h2>
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
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow transition-all"
                    >
                      {loading ? '...' : '+ زیادکردنی خول'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">لیستی خولەکان</h2>
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
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
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
        </main>
      </div>
    </div>
  );
}

export default App;