const SimplePieChart = ({ data, labels, colors }: { data: number[], labels: string[], colors: string[] }) => {
  const total = data.reduce((a, b) => a + b, 0) || 1;
  let accumulated = 0;
  
  const gradient = data.map((val, i) => {
    const start = (accumulated / total) * 100;
    accumulated += val;
    const end = (accumulated / total) * 100;
    return `${colors[i]} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="flex items-center space-x-8">
      <div 
        className="w-32 h-32 rounded-full border-4 border-white shadow-lg flex-shrink-0"
        style={{ background: `conic-gradient(${gradient})` }}
      ></div>
      <div className="space-y-2">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center text-xs">
            <span className="w-3 h-3 rounded-full mr-2" style={{ background: colors[i] }}></span>
            <span className="font-bold text-stone-600">{label}</span>
            <span className="ml-2 text-stone-400">({Math.round(data[i]/total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePieChart;