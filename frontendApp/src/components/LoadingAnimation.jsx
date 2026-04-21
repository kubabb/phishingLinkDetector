import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900/60 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-800 flex items-center gap-5">
          <motion.div
            className="w-14 h-14 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-center justify-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Shield className="w-7 h-7 text-indigo-400" strokeWidth={1.5} />
          </motion.div>
          <div>
            <p className="text-2xl font-semibold text-zinc-100">Analyzing URL</p>
            <p className="text-lg text-zinc-500 font-mono">Extracting 111 features...</p>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: '0%', opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 2.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <p className="text-base text-zinc-600 font-mono">feature_extraction</p>
            <p className="text-base text-zinc-600 font-mono">domain_analysis</p>
            <p className="text-base text-zinc-600 font-mono">ensemble</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingAnimation;