import { TridopApiClient } from '../../libs/frontend-client/src/TridopApiClient';

export const client = new TridopApiClient({
  baseUrl: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:4000',
  onTokensChanged: (tokens) => {
    // Tokens saved automatically via onTokensChanged callback in client
  },
});
