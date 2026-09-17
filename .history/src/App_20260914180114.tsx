import React, { useState } from 'react';

interface ElectionRecord {
  id: number;
  cycle: string;
  branch: string;
  region: string;
  partyName: string;
  votes: number;
}

export default function App() {
  const [records, setRecords] = useState<ElectionRecord[]>([
    { id: 1, cycle: 'خولی یەکەم', branch: 'لقی سلێمانی', region: 'ناوچەی ڕزگاری', partyName: 'لایەنی یەکەم', votes: 1250 },
    { id: 2, cycle: 'خولی یەکەم', branch: 'لقی هەولێر', region: 'ناوچەی باکوور', partyName: 'لایەنی دووەم', votes: 980 },
  ]);

  const [cycle, setCycle] = useState('خولی یەکەم');
  const [branch, setBranch] = useState('');
  const [region, setRegion] = useState('');
  const [partyName, setPartyName] = useState('');
  const [votes, setVotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branch || !region || !partyName || !votes) return;

    const newRecord: ElectionRecord = {
      id: Date.now(),
      cycle,
      branch,
      region,
      partyName,
      votes: parseInt(votes) || 0,
    };

    setRecords([newRecord, ...records]);
    setBranch('');
    setRegion('');
    setPartyName('');
    setVotes('');
  };

  const filteredRecords = records.filter(
    (r) =>
      r.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans" dir="rtl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-teal-400">سیستەمی شیکاری ئەنجامی هەڵبژاردن</h1>
        <p className="text-slate-400 mt-2">بەڕێوەبردن و بەدواداچوونی دەنگی لایەنەکان بەپێی خول, لق و ناوچەکان</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* فۆرمی داخلکردن */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-teal-300">تۆمارکردنی ئەنجامی نوێ</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-300">خولی هەڵبژاردن:</label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-teal-400"
              >
                <option value="خولی یەکەم">خولی یەکەم</option>
                <option value="خولی دووەم">خولی دووەم</option>
                <option value="خولی سێیەم">خولی سێیەم</option>
                <option value="خولی چوارەم">خولی چوارەم</option>
                <option value="خولی پێنجەم">خولی پێنجەم</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">لق / بازنە:</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="بۆ نموونە: لقی سلێمانی"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">ناوچە / وێستگە:</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="بۆ نموونە: ناوچەی ڕزگاری"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">ناوی لایەن / قەوارە:</label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="ناوی لایەنی سیاسی"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-slate-300">ژمارەی دەنگەکان:</label>
              <input
                type="number"
                value={votes}
                onChange={(e) => setVotes(e.target.value)}
                placeholder="٠"
                className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded transition duration-200"
            >
              تۆمارکردنی زانیاری
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-500 italic">
            دروستکردنی:بەهمەن دەروێش علی
          </div>
        </div>

        {/* خشتە و گەڕان */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-teal-300">ئەنجامە تۆمارکراوەکان</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="گەڕان بەدوای لایەن, ناوچە یان لق..."
              className="bg-slate-700 border border-slate-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-teal-400 w-64"
            />
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="p-3">خول</th>
                  <th className="p-3">لق / بازنە</th>
                  <th className="p-3">ناوچە</th>
                  <th className="p-3">لایەنی سیاسی</th>
                  <th className="p-3">ژمارەی دەنگەکان</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 text-sm">
                      <td className="p-3">{r.cycle}</td>
                      <td className="p-3">{r.branch}</td>
                      <td className="p-3">{r.region}</td>
                      <td className="p-3 font-medium text-teal-200">{r.partyName}</td>
                      <td className="p-3">{r.votes.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-slate-400">
                      هیچ زانیارییەک نەدۆزرایەوە
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}