import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

type GoogleUser = {
  email: string;
  name?: string;
  picture?: string;
};

const GIS_SRC = 'https://accounts.google.com/gsi/client';

async function loadGis(): Promise<void> {
  if (window.google?.accounts) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = GIS_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const raw = localStorage.getItem('google_user');
      return raw ? (JSON.parse(raw) as GoogleUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGis().catch(() => {});
  }, []);

  const signIn = useCallback(async () => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is missing');
      return;
    }
    await loadGis();
    setLoading(true);
    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (resp: any) => {
          if (!resp?.access_token) {
            setLoading(false);
            return;
          }
          try {
            const me = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` },
            }).then(r => r.json());
            const u: GoogleUser = { email: me.email, name: me.name, picture: me.picture };
            localStorage.setItem('google_user', JSON.stringify(u));
            setUser(u);
          } catch (e) {
            console.error('Failed to fetch userinfo', e);
          } finally {
            setLoading(false);
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('google_user');
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isSignedIn: !!user,
    signIn,
    signOut,
  };
}
