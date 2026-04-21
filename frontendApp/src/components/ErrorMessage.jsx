import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="border border-red-500/30 rounded-2xl bg-red-950/10 overflow-hidden">
        <div className="px-8 py-6 flex items-center gap-4 border-b border-zinc-800">
          <AlertCircle className="w-7 h-7 text-red-500" strokeWidth={1.5} />
          <span className="text-xl font-semibold text-red-400">Analysis Failed</span>
        </div>
        <div className="px-8 py-6">
          <p className="text-lg text-zinc-400 mb-6">{error}</p>
          {onRetry && (
            <motion.button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-zinc-300 border border-zinc-700 rounded-xl hover:border-zinc-600 hover:text-zinc-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;