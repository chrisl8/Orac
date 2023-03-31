function getCurrentURL() {
  const url = new URL(window.location.href);

  // Remove state and code from URL if they exist,
  // as we don't want to send people in loops.
  url.searchParams.delete('state');
  url.searchParams.delete('code');
  // Sometimes Global Login sends back errors that the user does not need to see.
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');

  return url.toString();
}

export default getCurrentURL;
