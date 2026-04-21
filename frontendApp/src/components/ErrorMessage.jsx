import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <motion.div
      className="w-full max-w-2xl mx-auto px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="glass rounded-2xl p-6 border border-red-500/30">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          </motion.div>

          <h3 className="text-lg font-semibold text-white mb-2">Wystąpił błąd</h3>

          <p className="text-slate-400 mb-6">{error}</p>

          {onRetry && (
            <motion.button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Spróbuj ponownie</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;