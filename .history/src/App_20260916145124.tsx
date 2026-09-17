import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function ElectionDashboard() {
  // دۆخی فلتەرەکان (State)
  const [selectedParties, setSelectedParties] = useState(['party1', 'party2', 'party3']);
  const [selectedBranches, setSelectedBranches] = useState(['branch1', 'branch2']);
  const [selectedRegions, setSelectedRegions] = useState(['region1', 'region2']);

  // دۆخی کردنەوە و داخستنی کۆمبۆ بۆکسەکان
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  // نموونەی داتا
  const partiesList = [
    { id: 'party1', name: 'لایەنی ئاڵا' },
    { id: 'party2', name: 'لایەنی سەوز' },
    { id: 'party3', name: 'لایەنی ڕووناکی' }
  ];

  const branchesList = [
    { id: 'branch1', name: 'لقی یەک' },
    { id: 'branch2', name: 'لقی دوو' },
    { id: 'branch3', name: 'لقی سێ' },
    { id: 'branch4', name: 'لقی چوار' }
  ];

  const regionsList = [
    { id: 'region1', name: 'ناوچەی یەک' },
    { id: 'region2', name: 'ناوچەی دوو' },
    { id: 'region3', name: 'بنکەی سەرەکی' }
  ];

  // فەنکشنی گۆڕینی هەڵبژاردنی لایەنەکان و داخستنی خۆکاری
  const handlePartyToggle = (id) => {
    let updated;
    if (selectedParties.includes(id)) {
      updated = selectedParties.filter(item => item !== id);
    } else {
      updated = [...selectedParties, id];
    }
    setSelectedParties(updated);
    setIsPartyOpen(false); // داخستنی خۆکارانە دوای هەڵبژاردن
  };

  // فەنکشنی گۆڕینی هەڵبژاردنی لقەکان و داخستنی خۆکاری
  const handleBranchToggle = (id) => {
    let updated;
    if (selectedBranches.includes(id)) {
      updated = selectedBranches.filter(item => item !== id);
    } else {
      updated = [...selectedBranches, id];
    }
    setSelectedBranches(updated);
    setIsBranchOpen(false); // داخستنی خۆکارانە دوای هەڵبژاردن
  };

  // فەنکشنی گۆڕینی هەڵبژاردنی ناوچەکان و داخستنی خۆکاری
  const handleRegionToggle = (id) => {
    let updated;
    if (selectedRegions.includes(id)) {
      updated = selectedRegions.filter(item => item !== id);
    } else {
      updated = [...selectedRegions, id];
    }
    setSelectedRegions(updated);
    setIsRegionOpen(false); // داخستنی خۆکارانە دوای هەڵبژاردن
  };

  // نموونەی داتای چارت
  const chartData = [
    { name: 'لقی یەک', دەنگ: 4000 },
    { name: 'لقی دوو', دەنگ: 3000 },
    { name: 'لقی سێ', دەنگ: 2000 },
    { name: 'لقی چوار', دەنگ: 2780 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen dir-rtl text-right">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">داشبۆردی بەڕێوەبردنی هەڵبژاردن</h1>

      {/* بەشی فلتەرەکان */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        
        {/* 1. فلتەری لقی هەڵبژاردن */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">فلتەر بەپێی لقی هەڵبژاردن</label>
          <div 
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center text-sm"
          >
            <span>{selectedBranches.length > 0 ? `${selectedBranches.length} لق هەڵبژێردراوە` : 'هیچ لقێک نییە'}</span>
            <span>▼</span>
          </div>
          {isBranchOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {branchesList.map(branch => (
                <div 
                  key={branch.id}
                  onClick={() => handleBranchToggle(branch.id)}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input 
                    type="checkbox" 
                    checked={selectedBranches.includes(branch.id)} 
                    onChange={() => {}} // بە ڕێگەی سەرەوە کۆنتڕۆڵ دەکرێت
                    className="ml-2"
                  />
                  <span>{branch.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. فلتەری ناوچە / بنکە */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">فلتەر بەپێی ناوچە / بنکە</label>
          <div 
            onClick={() => setIsRegionOpen(!isRegionOpen)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center text-sm"
          >
            <span>{selectedRegions.length > 0 ? `${selectedRegions.length} ناوچە هەڵبژێردراوە` : 'هیچ ناوچەیەک نییە'}</span>
            <span>▼</span>
          </div>
          {isRegionOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {regionsList.map(region => (
                <div 
                  key={region.id}
                  onClick={() => handleRegionToggle(region.id)}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input 
                    type="checkbox" 
                    checked={selectedRegions.includes(region.id)} 
                    onChange={() => {}} 
                    className="ml-2"
                  />
                  <span>{region.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. فلتەری لایەنە سیاسییەکان */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">فلتەر بەپێی لایەنەکان</label>
          <div 
            onClick={() => setIsPartyOpen(!isPartyOpen)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center text-sm"
          >
            <span>{selectedParties.length > 0 ? `${selectedParties.length} لایەن هەڵبژێردراوە` : 'هیچ لایەنێک نییە'}</span>
            <span>▼</span>
          </div>
          {isPartyOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {partiesList.map(party => (
                <div 
                  key={party.id}
                  onClick={() => handlePartyToggle(party.id)}
                  className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <input 
                    type="checkbox" 
                    checked={selectedParties.includes(party.id)} 
                    onChange={() => {}} 
                    className="ml-2"
                  />
                  <span>{party.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* بەشی چارتەکان */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">ئاماری دەنگەکان بەپێی فلتەرەکان</h2>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="دەنگ" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}