import localStorage from 'local-storage';
import getCurrentURL from './getCurrentURL';
import perSiteSettings from './perSiteSettings';
import getUUID from './getUUID';

function redirectToGlobalLogin() {
  const state = getUUID();
  localStorage.set(`state-${state}`, getCurrentURL());
  const url = new URL(perSiteSettings.gloURL);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', perSiteSettings.clientId);
  // NOTE: The state is a required field even if you don't need it.
  // You could just set it to a 0 every time if you are not using it.
  url.searchParams.set('state', state);
  url.searchParams.set('redirect_uri', window.location.origin);
  url.searchParams.set('scope', 'openid');
  window.location.href = url.toString();
}

export default redirectToGlobalLogin;
