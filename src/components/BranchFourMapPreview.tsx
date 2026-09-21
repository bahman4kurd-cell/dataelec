import React from 'react';

class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="bg-[var(--bg-card)] border border-red-200 rounded-lg p-5 text-red-800" dir="rtl">
          نەخشەکە نەتوانرا پیشان بدرێت. تکایە پەڕەکە نوێبکەرەوە.
        </section>
      );
    }

    return this.props.children;
  }
}

const boundaryCoordinates: [number, number][] = [
  [45.3557998, 35.9748069], [45.2702812, 35.8463899], [45.345188, 35.799319],
  [45.4026165, 35.7253663], [45.3969985, 35.6670676], [45.3426911, 35.6031436],
  [45.3389457, 35.5747165], [45.3420668, 35.5519168], [45.3470606, 35.5315998],
  [45.3851383, 35.5196103], [45.4357003, 35.4916618], [45.5093586, 35.4967441],
  [45.5274611, 35.5637999], [45.5262127, 35.5998445], [45.594253, 35.6074575],
  [45.6597964, 35.5927384], [45.759048, 35.5871546], [45.7534299, 35.6475407],
  [45.7609206, 35.6744207], [45.80961, 35.7246062], [45.8289609, 35.7656436],
  [45.8389485, 35.7838756], [45.8283367, 35.8142531], [45.7921317, 35.8117221],
  [45.7615448, 35.7980532], [45.7053647, 35.880031], [45.6373244, 35.9411555],
  [45.5923804, 35.9658144], [45.5393214, 35.994607], [45.4812686, 35.9971322],
  [45.4126041, 35.9738976]
];

const places = [
  { name: 'ناوەندی شاری سلێمانی', coordinate: [45.56, 35.76] as [number, number] },
  { name: 'ناحیەی بەکرەجۆ', coordinate: [45.428, 35.65] as [number, number] },
  { name: 'قەزای شارباژێر', coordinate: [45.37, 35.85] as [number, number] },
  { name: 'قەزای ماوەت', coordinate: [45.7, 35.9] as [number, number] }
];

const fontFamily = 'Rudaw, "Noto Sans Arabic", Tahoma, "Segoe UI", sans-serif';

function BranchFourMapContent() {
  const width = 1000;
  const height = 650;
  const padding = 70;
  const longitudes = boundaryCoordinates.map(([longitude]) => longitude);
  const latitudes = boundaryCoordinates.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const scale = Math.min(
    (width - padding * 2) / (maxLongitude - minLongitude),
    (height - padding * 2) / (maxLatitude - minLatitude)
  );
  const offsetX = (width - (maxLongitude - minLongitude) * scale) / 2;
  const offsetY = (height - (maxLatitude - minLatitude) * scale) / 2;
  const project = ([longitude, latitude]: [number, number]) => [
    offsetX + (longitude - minLongitude) * scale,
    height - offsetY - (latitude - minLatitude) * scale
  ] as const;
  const polygonPoints = boundaryCoordinates.map(coordinate => project(coordinate).join(',')).join(' ');

  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-sm overflow-hidden">
      <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily }}>نەخشەی پێشبینینی سنووری لقی چوار</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1" style={{ fontFamily }}>بە هەمان خاڵەکانی KML ـی نێردراو دروستکراوە و هێشتا پاشەکەوت نەکراوە.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200" style={{ fontFamily }}>پێشبینین</span>
      </div>
      <div className="p-3 sm:p-5 bg-slate-100" style={{ backgroundImage: 'linear-gradient(#d8e3eb 1px, transparent 1px), linear-gradient(90deg, #d8e3eb 1px, transparent 1px)', backgroundSize: '42px 42px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-h-[420px]" role="img" aria-label="نەخشەی سنووری لقی چوار">
          <polygon points={polygonPoints} fill="rgb(245 158 11 / 21%)" stroke="#b45309" strokeWidth="4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          {boundaryCoordinates.map((coordinate, index) => {
            const [x, y] = project(coordinate);
            return <circle key={index} cx={x} cy={y} r="4" fill="#fff" stroke="#0f766e" strokeWidth="2" vectorEffect="non-scaling-stroke" />;
          })}
          {places.map(({ name, coordinate }) => {
            const [x, y] = project(coordinate);
            const labelWidth = Math.max(132, name.length * 13);
            return (
              <g key={name} transform={`translate(${x} ${y})`}>
                <circle r="7" fill="#0f766e" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <rect x={-labelWidth / 2} y="-41" width={labelWidth} height="27" rx="4" fill="#fff" fillOpacity=".94" stroke="#94a3b8" />
                <text x="0" y="-22" textAnchor="middle" fill="#16324f" fontSize="16" fontWeight="700" style={{ fontFamily }}>{name}</text>
              </g>
            );
          })}
          <g transform="translate(930 82)">
            <polygon points="0,-34 -12,14 0,7 12,14" fill="#16324f" />
            <text x="0" y="38" textAnchor="middle" fill="#16324f" fontSize="18" fontWeight="700" style={{ fontFamily }}>باکوور</text>
          </g>
        </svg>
      </div>
      <div className="px-5 py-3 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]" style={{ fontFamily }}>
        لیبڵەکان تەنها بۆ پیشاندانن؛ سنووری فەرمی پێویستی بە پشتڕاستکردنەوەی سەرچاوەی فەرمی هەیە.
      </div>
    </section>
  );
}

export function BranchFourMapPreview() {
  return (
    <MapErrorBoundary>
      <BranchFourMapContent />
    </MapErrorBoundary>
  );
}
