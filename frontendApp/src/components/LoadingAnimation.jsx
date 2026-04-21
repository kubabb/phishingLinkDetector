import { motion } from 'framer-motion';
import { Shield, Activity, Eye, Brain } from 'lucide-react';

const scanningSteps = [
  { icon: Shield, text: 'Ekstrakcja cech URL...', duration: 800 },
  { icon: Activity, text: 'Analiza struktury domeny...', duration: 600 },
  { icon: Eye, text: 'Weryfikacja certyfikatu HTTPS...', duration: 700 },
  { icon: Brain, text: 'Ensemble predykcja (RF + XGB + GB)...', duration: 1000 },
];

const LoadingAnimation = () => {
  return (
    <motion.div
      className="w-full max-w-xl mx-auto px-4 py-12"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4"
            animate={{
              boxShadow: [
                '0 0 20px rgba(99, 102, 241, 0.3)',
                '0 0 40px rgba(99, 102, 241, 0.6)',
                '0 0 20px rgba(99, 102, 241, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">Trwa analiza URL</h3>
          <p className="text-slate-400 text-sm">System ML analizuje 111 cech...</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Scanning steps */}
        <div className="space-y-3">
          {scanningSteps.map(({ icon: Icon, text, duration }, index) => (
            <motion.div
              key={text}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.5, duration: 0.3 }}
            >
              <motion.div
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: index * 0.2 }}
              >
                <Icon className="w-4 h-4 text-indigo-400" />
              </motion.div>
              <span className="text-slate-300 text-sm">{text}</span>
            </motion.div>
          ))}
        </div>

        {/* Random dots animation */}
        <div className="absolute bottom-4 right-4 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingAnimation;