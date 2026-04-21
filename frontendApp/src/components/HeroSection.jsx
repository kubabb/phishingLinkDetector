import { Search } from 'lucide-react';

const stats = [
  { value: '111', label: 'features' },
  { value: '>95%', label: 'accuracy' },
  { value: '3', label: 'models' },
];

const HeroSection = () => {
  return (
    <section className="w-full text-center">
      <div className="mb-12 flex justify-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-2xl shadow-indigo-500/10">
          <Search className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-24">
        Phishing Detector
      </h1>

      <div className="flex flex-col items-center text-center space-y-8 text-lg md:text-xl text-zinc-400 leading-relaxed mb-32">
        <p className="max-w-2xl">Real-time threat analysis powered by ensemble machine learning.</p>
        <p className="max-w-2xl">111 features extracted and analyzed in milliseconds.</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-20 md:gap-32">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center px-20 py-14">
            <p className="text-6xl md:text-7xl font-bold text-white mb-10 tracking-tighter">{stat.value}</p>
            <p className="text-base font-medium text-zinc-500 uppercase tracking-[0.35em]">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;