import { AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection';
import URLInput from './components/URLInput';
import LoadingAnimation from './components/LoadingAnimation';
import ResultCard from './components/ResultCard';
import ErrorMessage from './components/ErrorMessage';
import { usePhishingScan } from './hooks/usePhishingScan';

function App() {
  const { result, isLoading, error, analyzeUrl, reset } = usePhishingScan();

  const handleScan = async (url) => {
    await analyzeUrl(url);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-screen animated-bg">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 py-12 px-4">
        {/* Hero Section */}
        <HeroSection />

        {/* URL Input or Reset Button */}
        {!result && !error && (
          <URLInput onScan={handleScan} isLoading={isLoading} />
        )}

        {/* Loading Animation */}
        <AnimatePresence mode="wait">
          {isLoading && <LoadingAnimation key="loading" />}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          {result && !isLoading && (
            <div key="result">
              <ResultCard result={result} />
              {/* Scan Another Button */}
              <motion.div
                className="w-full max-w-3xl mx-auto px-4 mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.button
                  onClick={handleReset}
                  className="w-full py-4 glass hover:glass-light rounded-xl text-slate-300 font-medium transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Skanuj kolejny URL
                </motion.button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && !isLoading && (
            <ErrorMessage key="error" error={error} onRetry={handleReset} />
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          className="mt-16 text-center text-slate-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p>Phishing Detector v1.0 - Ensemble ML (Random Forest + XGBoost + Gradient Boosting)</p>
          <p className="mt-1">Dokładność modelu &gt; 95%</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;