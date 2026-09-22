import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  api,
  setAuthToken,
  setUnauthorizedHandler
} from './api.js';

import { renderGoogleButton } from './google.js';

import Modal from '../components/Modal.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showGoogle, setShowGoogle] =
    useState(false);

  const [authMessage, setAuthMessage] =
    useState('');

  const googleRef = useRef(null);

  /**
   * Restore the user's application session
   * when the page loads.
   *
   * This uses OUR JWT stored in localStorage.
   */
  const refreshUser = useCallback(async () => {
    try {
      const me = await api.getMe();

      setUser(
        me.authenticated
          ? me.user
          : null
      );

      setIsAdmin(
        Boolean(me.isAdmin)
      );

      /*
       * If the stored JWT is no longer valid,
       * remove it.
       */
      if (!me.authenticated) {
        setAuthToken('');
      }

      return me;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  /**
   * Setup Google Sign-In button.
   */
  const setupGoogle = useCallback(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (
      !clientId ||
      !googleRef.current
    ) {
      return;
    }

    renderGoogleButton(
      googleRef.current,
      {
        clientId,

        /*
         * `token` here is Google's ID token.
         *
         * We send it to our backend ONCE.
         * The backend verifies it and gives us
         * our own long-lived application JWT.
         */
        onCredential: async (token) => {
          try {
            const auth =
              await api.googleLogin(token);

            /*
             * Store OUR JWT.
             */
            setAuthToken(
              auth.token
            );

            /*
             * The backend already returned
             * the authenticated user.
             */
            setUser(
              auth.user
            );

            setIsAdmin(
              Boolean(auth.isAdmin)
            );

            setAuthMessage('');
            setShowGoogle(false);
          } catch (error) {
            setAuthMessage(
              error.message ||
                'Google sign-in failed.'
            );
          }
        }
      }
    );
  }, []);

  /**
   * Wait until Google's script becomes available.
   */
  useEffect(() => {
    if (!showGoogle) return;

    const timer =
      setInterval(() => {
        if (
          window.google?.accounts?.id
        ) {
          clearInterval(timer);
          setupGoogle();
        }
      }, 200);

    return () =>
      clearInterval(timer);
  }, [
    setupGoogle,
    showGoogle
  ]);

  /**
   * Open sign-in modal.
   */
  const requestSignIn =
    useCallback((message = '') => {
      setAuthMessage(message);
      setShowGoogle(true);
    }, []);

  /**
   * Logout simply removes OUR JWT.
   *
   * Since the application uses stateless JWT
   * authentication, there is no Google token
   * that needs to be removed here.
   */
  const signOut = useCallback(() => {
    setAuthToken('');

    setUser(null);
    setIsAdmin(false);
  }, []);

  /**
   * Global 401 handler.
   *
   * This normally means:
   * - JWT expired
   * - JWT invalid
   * - JWT was removed/changed
   */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthToken('');

      setUser(null);
      setIsAdmin(false);

      requestSignIn(
        'Your application session has expired. Sign in again to continue editing.'
      );
    });

    return () =>
      setUnauthorizedHandler(null);
  }, [requestSignIn]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        canEdit: isAdmin,
        requestSignIn,
        signOut,
        refreshUser
      }}
    >
      {children}

      <Modal
        open={showGoogle}
        title="Sign in to edit"
        onClose={() =>
          setShowGoogle(false)
        }
      >
        <div className="google-signin-modal">
          <p>
            {authMessage ||
              'Sign in with the Google account configured as the DSA Sheet admin.'}
          </p>

          <div
            className="google-host-visible"
            ref={googleRef}
          />

          {!import.meta.env
            .VITE_GOOGLE_CLIENT_ID && (
            <div className="setup-hint">
              Set{' '}
              <code>
                VITE_GOOGLE_CLIENT_ID
              </code>{' '}
              in{' '}
              <code>
                frontend/.env
              </code>{' '}
              first.
            </div>
          )}
        </div>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx =
    useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}