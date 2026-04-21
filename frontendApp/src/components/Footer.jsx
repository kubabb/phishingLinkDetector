const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-zinc-950/80">
      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-sm text-zinc-500 font-mono tracking-wide">
            Phishing Detector v1.0 — Early Warning System
          </p>
          <p className="text-sm text-zinc-600 font-mono tracking-wide">
            © 2024 Powered by Ensemble Machine Learning
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-400 font-mono tracking-wide transition-colors">Documentation</a>
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-400 font-mono tracking-wide transition-colors">GitHub</a>
            <a href="#" className="text-sm text-zinc-600 hover:text-zinc-400 font-mono tracking-wide transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;