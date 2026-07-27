import { TridopApiClient } from '../../libs/frontend-client/src/TridopApiClient';

const getInitialTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
  }
  return null;
};

export const client = new TridopApiClient({
  baseUrl: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:4000',
  initialTokens: getInitialTokens(),
  onTokensChanged: (tokens) => {
    if (typeof window !== 'undefined') {
      if (tokens?.accessToken && tokens?.refreshToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  },
});

