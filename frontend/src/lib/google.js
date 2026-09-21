export function renderGoogleButton(container, { clientId, onCredential }) {
  if (!window.google?.accounts?.id || !clientId) return false;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential)
  });
  window.google.accounts.id.renderButton(container, {
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    text: 'signin_with',
    width: 250
  });
  return true;
}
