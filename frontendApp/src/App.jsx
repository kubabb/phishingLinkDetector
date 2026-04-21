import { motion, AnimatePresence } from 'framer-motion';
import HeroSection from './components/HeroSection';
import URLInput from './components/URLInput';
import LoadingAnimation from './components/LoadingAnimation';
import ResultCard from './components/ResultCard';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import { usePhishingScan } from './hooks/usePhishingScan';

const springTransition = { type: 'spring', stiffness: 300, damping: 25 };

function App() {
  const { result, isLoading, error, analyzeUrl, reset } = usePhishingScan();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <div className="fixed inset-0 z-0 grid-texture" />
      <div className="grain-overlay" />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-8 py-32">
        <div className="w-full max-w-7xl flex flex-col items-center gap-32 md:gap-48">
          <HeroSection />

          <AnimatePresence mode="wait">
            {!result && !error && (
              <motion.div
                key="input"
                className="w-full"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              >
                <URLInput onScan={analyzeUrl} isLoading={isLoading} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                className="w-full"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={springTransition}
              >
                <LoadingAnimation />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {result && !isLoading && (
              <motion.div
                key="result"
                className="w-full max-w-5xl"
                initial={{ opacity: 0, y: 32, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={springTransition}
              >
                <ResultCard result={result} />
                <motion.button
                  onClick={reset}
                  className="w-full mt-10 py-6 text-xl text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-[0.2em]"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Scan another URL
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {error && !isLoading && (
              <motion.div
                key="error"
                className="w-full max-w-3xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={springTransition}
              >
                <ErrorMessage error={error} onRetry={reset} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;