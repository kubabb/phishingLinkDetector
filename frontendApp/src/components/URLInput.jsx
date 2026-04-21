import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, X, Loader } from 'lucide-react';

const URLInput = ({ onScan, isLoading, disabled }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onScan(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-5xl">
      <div className="relative flex items-center">
        <div className="relative flex-1 flex items-center rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 hover:border-zinc-700/50 focus-within:border-indigo-500/50 transition-all duration-200">
          <div className="pl-12 text-zinc-500">
            <Link2 className="w-10 h-10" strokeWidth={1.5} />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to analyze..."
            disabled={disabled || isLoading}
            className="flex-1 px-12 py-14 bg-transparent text-3xl md:text-4xl text-zinc-100 placeholder-zinc-600 font-mono focus:outline-none disabled:opacity-50"
            autoComplete="off"
            spellCheck="false"
          />

          {url && !isLoading && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="pr-10 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X className="w-8 h-8" strokeWidth={2} />
            </button>
          )}

          {isLoading && (
            <div className="pr-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader className="w-7 h-7 text-indigo-500" strokeWidth={2} />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default URLInput;