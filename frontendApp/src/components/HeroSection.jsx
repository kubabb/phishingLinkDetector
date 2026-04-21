import { motion } from 'framer-motion';
import { Shield, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const features = [
  { icon: Shield, text: 'Ensemble ML (RF + XGBoost + GB)', color: 'text-indigo-400' },
  { icon: Zap, text: '111 cech analizowanych w czasie rzeczywistym', color: 'text-yellow-400' },
  { icon: AlertTriangle, text: 'Wykrywanie phishing, scam i malware', color: 'text-red-400' },
  { icon: CheckCircle, text: 'Dokładność > 95% na zbiorze testowym', color: 'text-green-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const HeroSection = () => {
  return (
    <motion.section
      className="relative py-16 px-4 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div variants={itemVariants} className="relative z-10">
        {/* Shield Icon */}
        <motion.div
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 pulse-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <Shield className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent"
        >
          Phishing Detector
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-8"
        >
          Zaawansowane narzędzie do wykrywania phishingowych i scamowych URL.
          Wykorzystuje ensemble modeli uczenia maszynowego dla maksymalnej skuteczności.
        </motion.p>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
        >
          {features.map(({ icon: Icon, text, color }, index) => (
            <motion.div
              key={text}
              variants={itemVariants}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-light text-sm"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-slate-300">{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;