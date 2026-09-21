import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api, setIdToken, setUnauthorizedHandler } from './api.js';
import { renderGoogleButton } from './google.js';
import Modal from '../components/Modal.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const googleRef = useRef(null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser(me.authenticated ? me.user : null);
      setIsAdmin(Boolean(me.isAdmin));
      return me;
    } catch { return null; }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const setupGoogle = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleRef.current) return;
    renderGoogleButton(googleRef.current, {
      clientId,
      onCredential: async (token) => {
        setIdToken(token);
        await refreshUser();
        setAuthMessage('');
        setShowGoogle(false);
      }
    });
  }, [refreshUser]);

  useEffect(() => {
    if (!showGoogle) return;
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) { clearInterval(timer); setupGoogle(); }
    }, 200);
    return () => clearInterval(timer);
  }, [setupGoogle, showGoogle]);

  const requestSignIn = useCallback((message = '') => {
    setAuthMessage(message);
    setShowGoogle(true);
  }, []);

  const signOut = useCallback(() => {
    setIdToken('');
    setUser(null);
    setIsAdmin(false);
  }, []);

  // Registered once: any API call anywhere in the app that comes back 401
  // (stale/expired token) clears the stale session and reopens sign-in with
  // an explanation, instead of failing silently or via a raw browser alert.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setIdToken('');
      setUser(null);
      setIsAdmin(false);
      requestSignIn('Your session expired. Sign in again to keep editing — your Google session is likely still active, so this should just take one click.');
    });
    return () => setUnauthorizedHandler(null);
  }, [requestSignIn]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, canEdit: isAdmin, requestSignIn, signOut, refreshUser }}>
      {children}
      <Modal open={showGoogle} title="Sign in to edit" onClose={() => setShowGoogle(false)}>
        <div className="google-signin-modal">
          <p>{authMessage || 'Sign in with the Google account configured as the DSA Sheet admin.'}</p>
          <div className="google-host-visible" ref={googleRef} />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && <div className="setup-hint">Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>frontend/.env</code> first.</div>}
        </div>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
