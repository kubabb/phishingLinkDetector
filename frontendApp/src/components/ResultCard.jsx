import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
} from 'lucide-react';

const ResultCard = ({ result }) => {
  const {
    url,
    is_scam,
    scam_probability,
    legitimate_probability,
    risk_level,
    reasons = [],
    model_predictions = {},
  } = result;

  const isDanger = is_scam;
  const icon = isDanger ? XCircle : CheckCircle;
  const iconColor = isDanger ? 'text-red-500' : 'text-green-500';
  const verdictBg = isDanger
    ? 'from-red-500/20 to-red-600/10'
    : 'from-green-500/20 to-green-600/10';
  const verdictBorder = isDanger ? 'border-red-500/50' : 'border-green-500/50';
  const verdictText = isDanger ? 'text-red-400' : 'text-green-400';
  const verdict = isDanger ? 'ZAGROŻENIE PHISHINGIEM' : 'BEZPIECZNY';

  const RiskIcon = () => {
    switch (risk_level) {
      case 'BARDZO NISKIE':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'NISKIE':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'SREDNIE':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'WYSOKIE':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case 'BARDZO WYSOKIE':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="glass rounded-3xl overflow-hidden">
        {/* Header with verdict */}
        <motion.div
          className={`bg-gradient-to-r ${verdictBg} p-6 border-b ${verdictBorder}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.4 }}
            >
              {React.createElement(icon, { className: `w-12 h-12 ${iconColor}` })}
            </motion.div>
            <motion.h2
              className={`text-2xl md:text-3xl font-bold ${verdictText}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {verdict}
            </motion.h2>
          </div>
        </motion.div>

        {/* URL */}
        <motion.div
          className="px-6 py-4 border-b border-slate-700/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
            <span>Analizowany URL:</span>
          </div>
          <div className="font-mono text-sm text-slate-200 break-all bg-slate-800/30 p-3 rounded-lg">
            {url}
          </div>
        </motion.div>

        {/* Risk Level and Probability */}
        <motion.div
          className="p-6 grid md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {/* Risk Level Badge */}
          <div className="flex flex-col items-center justify-center p-6 glass-light rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <RiskIcon />
              <span className="text-slate-400 text-sm uppercase tracking-wider">
                Poziom ryzyka
              </span>
            </div>
            <span className="text-xl font-bold text-white">{risk_level}</span>
          </div>

          {/* Probability breakdown */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400">Prawdopodobieństwo scamu</span>
                <span className="font-semibold text-red-400">
                  {scam_probability?.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${scam_probability}%` }}
                  transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-400">Prawdopodobieństwo bezpiecznej</span>
                <span className="font-semibold text-green-400">
                  {legitimate_probability?.toFixed(2)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${legitimate_probability}%` }}
                  transition={{ duration: 1, delay: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Model Predictions */}
        {model_predictions && Object.keys(model_predictions).length > 0 && (
          <motion.div
            className="px-6 pb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="p-4 glass-light rounded-xl">
              <h4 className="text-sm text-slate-400 uppercase tracking-wider mb-3">
                Predykcje modeli ensemble
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(model_predictions).map(([model, value]) => (
                  <div key={model} className="text-center p-3 bg-slate-800/30 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase mb-1">
                      {model === 'rf' ? 'Random Forest' : model === 'xgb' ? 'XGBoost' : 'Gradient Boosting'}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {typeof value === 'number' ? value.toFixed(1) : value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reasons - if available */}
        {reasons && reasons.length > 0 && (
          <motion.div
            className="px-6 pb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="p-4 glass-light rounded-xl">
              <h4 className="text-sm text-slate-400 uppercase tracking-wider mb-3">
                Powody klasyfikacji
              </h4>
              <ul className="space-y-2">
                {reasons.map((reason, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.05 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;