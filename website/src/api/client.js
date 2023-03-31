import redirectToGlobalLogin from '../utils/redirectToGlobalLogin';

async function client(endpoint, { body, ...customConfig } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  let data;
  try {
    const response = await window.fetch(endpoint, config);
    const text = await response.text(); // Parse it as text
    try {
      // Try to parse it as JSON
      data = JSON.parse(text);
    } catch (e) {
      // The response wasn't a JSON object
      data = text;
    }
    let errorText = response.statusText;
    if (response.ok) {
      // Return a result object similar to Axios
      return {
        status: response.status,
        data,
        headers: response.headers,
        url: response.url,
      };
    }
    if (response.status === 401) {
      redirectToGlobalLogin();
    } else if (response.status === 403) {
      if (text && text.length < 255) {
        errorText = text;
      } else {
        errorText = 'Unauthorized';
      }
    } else if (response.status === 429) {
      errorText = 'Too many requests. Please wait a moment and try again.';
    } else if (response.status === 404) {
      errorText = 'API backend NOT FOUND.';
    } else if (response.status === 413) {
      errorText =
        'Your request was too large. Please try again with a smaller dataset.';
    } else {
      let responseText = text;
      // console.error(responseText);
      if (responseText.length > 255) {
        // Catch when Laravel dumps everything before React barfs on it.
        responseText = 'Server Error';
      }
      errorText = responseText;
    }
    throw new Error(errorText);
  } catch (err) {
    return Promise.reject(err.message ? err.message : data);
  }
}

client.get = (endpoint, customConfig = {}) =>
  client(endpoint, { ...customConfig, method: 'GET' });

client.post = (endpoint, body, customConfig = {}) =>
  client(endpoint, { ...customConfig, body });

export default client;
