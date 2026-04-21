import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://your-phishing-api.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const scanUrl = async (url) => {
  try {
    const response = await api.post('/predict', { url });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Przekroczono limit czasu połączenia. Spróbuj ponownie.');
    }
    if (error.response) {
      const status = error.response.status;
      if (status === 422) {
        throw new Error('Nieprawidłowy format URL. Sprawdź adres i spróbuj ponownie.');
      }
      if (status === 500) {
        throw new Error('Błąd serwera. Spróbuj ponownie za chwilę.');
      }
      throw new Error(error.response.data?.detail || 'Wystąpił nieoczekiwany błąd.');
    }
    if (error.request) {
      throw new Error('Nie można połączyć z serwerem. Sprawdź swoje połączenie internetowe.');
    }
    throw new Error('Wystąpił błąd podczas analizy URL.');
  }
};

export const getApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch {
    return { status: 'unavailable' };
  }
};

export default { scanUrl, getApiHealth };