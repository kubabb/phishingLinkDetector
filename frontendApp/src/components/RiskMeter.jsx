import { motion } from 'framer-motion';

const RiskMeter = ({ percentage, riskLevel }) => {
  const getColor = () => {
    if (percentage <= 20) return { stroke: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' };
    if (percentage <= 40) return { stroke: '#84cc16', glow: 'rgba(132, 204, 22, 0.3)' };
    if (percentage <= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' };
    if (percentage <= 80) return { stroke: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)' };
  };

  const { stroke, glow } = getColor();
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <div
        className="absolute w-48 h-48 rounded-full blur-xl"
        style={{ backgroundColor: glow }}
      />

      {/* SVG Circle */}
      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke="rgba(51, 65, 85, 0.5)"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={stroke}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="text-4xl font-bold" style={{ color: stroke }}>
            {Math.round(percentage)}
          </span>
          <span className="text-xl font-bold" style={{ color: stroke }}>%</span>
        </motion.div>
        <motion.span
          className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {riskLevel}
        </motion.span>
      </div>
    </div>
  );
};

export default RiskMeter;