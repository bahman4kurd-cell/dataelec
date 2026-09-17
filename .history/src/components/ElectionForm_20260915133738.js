import React from 'react';
import ElectionForm from './components/ElectionForm'; // لێرە بانگ دەکرێت

export default function App() {
  const handleAddParty = (data) => {
    console.log("داتای نوێ:", data);
    // لێرە دەتوانیت داتاکە خەزن بکەیت یان بخەیتە سەر stateـی سەرەکی خۆت
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-6 text-center">سیستەمی بەڕێوەبردنی هەڵبژاردن</h1>
      
      {/* لێرە فۆرمەکە دەردەکەوێت */}
      <ElectionForm onAddParty={handleAddParty} />
    </div>
  );
}