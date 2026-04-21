import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const modelLabels = { rf: 'Random Forest', xgb: 'XGBoost', gb: 'Gradient Boosting' };

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

  const totalSegments = 20;
  const filledSegments = Math.round((scam_probability / 100) * totalSegments);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 32, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
    >
      <div className="border border-zinc-800 rounded-2xl bg-zinc-900/60 overflow-hidden">
        <div className={`px-8 py-6 border-b border-zinc-800 flex items-center justify-between ${is_scam ? 'bg-red-950/20' : 'bg-emerald-950/20'}`}>
          <div className="flex items-center gap-4">
            {is_scam
              ? <XCircle className="w-8 h-8 text-red-500" strokeWidth={1.5} />
              : <CheckCircle className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
            }
            <span className={`text-2xl font-bold ${is_scam ? 'text-red-400' : 'text-emerald-400'}`}>
              {is_scam ? 'Threat Detected' : 'Safe'}
            </span>
          </div>
          <span className="text-lg text-zinc-500 font-mono">{risk_level}</span>
        </div>

        <div className="px-8 py-6 border-b border-zinc-800">
          <p className="text-sm text-zinc-600 mb-3 uppercase tracking-wider">Analyzed URL</p>
          <p className="text-xl text-zinc-200 font-mono break-all">{url}</p>
        </div>

        <div className="px-8 py-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-5">
            <p className="text-base text-zinc-500 uppercase tracking-wider">Risk Score</p>
            <p className={`text-2xl font-bold font-mono ${is_scam ? 'text-red-500' : 'text-emerald-500'}`}>
              {scam_probability?.toFixed(1)}%
            </p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSegments }).map((_, i) => (
              <div
                key={i}
                className={`h-4 flex-1 rounded transition-colors ${
                  i < filledSegments
                    ? is_scam ? 'bg-red-500' : 'bg-emerald-500'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-5 text-base">
            <span className="text-zinc-400">Scam: {scam_probability?.toFixed(2)}%</span>
            <span className="text-zinc-400">Legitimate: {legitimate_probability?.toFixed(2)}%</span>
          </div>
        </div>

        {model_predictions && Object.keys(model_predictions).length > 0 && (
          <div className="px-8 py-6 border-b border-zinc-800">
            <p className="text-base text-zinc-500 uppercase tracking-wider mb-5">Ensemble Predictions</p>
            <div className="space-y-4">
              {Object.entries(model_predictions).map(([model, value]) => {
                const predValue = typeof value === 'number' ? value : parseFloat(value);
                const predFilled = Math.round((predValue / 100) * 10);
                return (
                  <div key={model} className="flex items-center gap-4">
                    <span className="text-base text-zinc-500 w-40 font-mono">{modelLabels[model] || model}</span>
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 flex-1 rounded-sm ${
                            i < predFilled ? 'bg-indigo-500/70' : 'bg-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg text-zinc-300 font-mono w-16 text-right">{predValue.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {reasons?.length > 0 && (
          <div className="px-8 py-6">
            <p className="text-base text-zinc-500 uppercase tracking-wider mb-4">Detection Flags</p>
            <ul className="space-y-3">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-lg text-zinc-400">
                  <ChevronRight className="w-5 h-5 text-zinc-600 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;