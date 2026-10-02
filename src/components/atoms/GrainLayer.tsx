export const GrainLayer = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-40"
      style={{
        backgroundImage: `
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")
    `,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export default GrainLayer;
