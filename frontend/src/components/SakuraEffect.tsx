const SakuraEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="petal"
          style={{
            width: `${Math.random() * 10 + 10}px`,
            height: `${Math.random() * 10 + 10}px`,
            left: `${Math.random() * 100}%`,
            animationName: 'petal-fall',
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            animationIterationCount: 'infinite'
          }}
        />
      ))}
    </div>
  );
};

export default SakuraEffect;