import { useState, useCallback } from 'react';
import { scanUrl } from '../api/phishingService';

export const usePhishingScan = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeUrl = useCallback(async (url) => {
    if (!url || !url.trim()) {
      setError('Proszę podać adres URL do analizy.');
      return null;
    }

    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await scanUrl(normalizedUrl);
      setResult(scanResult);
      return scanResult;
    } catch (err) {
      setError(err.message || 'Wystąpił błąd podczas analizy.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    result,
    isLoading,
    error,
    analyzeUrl,
    reset,
  };
};

export default usePhishingScan;