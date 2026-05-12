const StandardBarChart = ({ data, labels, title }: { data: number[], labels: string[], title: string }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="w-full">
      <h4 className="text-sm font-bold text-stone-500 mb-4 uppercase tracking-wider">{title}</h4>
      <div className="flex items-end space-x-4 h-48 border-l border-b border-stone-200 p-2">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex h-24 flex-col justify-end group relative">
            <div className="absolute -top-8 w-full text-center text-xs text-stone-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              {val}
            </div>
            <div 
              className="bg-emerald-600 rounded-t transition-all duration-500 hover:bg-emerald-500" 
              style={{ height: `${(val / max) * 100}%` }}
            ></div>
            <span className="text-[10px] text-stone-400 text-center mt-2 truncate">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StandardBarChart;