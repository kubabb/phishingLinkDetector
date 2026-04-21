import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, Link2, X, Loader } from 'lucide-react';

const URLInput = ({ onScan, isLoading, disabled }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onScan(url);
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="relative group">
        {/* Glow effect on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />

        <div className="relative glass rounded-2xl p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* URL Input */}
            <div className="flex-1 relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Wklej adres URL do analizy..."
                disabled={disabled || isLoading}
                className="w-full pl-12 pr-10 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800/70 transition-all duration-300 disabled:opacity-50"
              />
              {url && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Scan Button */}
            <motion.button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-600 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
              whileHover={!disabled && !isLoading && url.trim() ? { scale: 1.02 } : {}}
              whileTap={!disabled && !isLoading && url.trim() ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader className="w-5 h-5" />
                  </motion.div>
                  <span>Analizowanie...</span>
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  <span>Skanuj</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.form>
  );
};

export default URLInput;