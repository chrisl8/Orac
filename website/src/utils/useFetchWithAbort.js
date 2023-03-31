import { useState, useEffect } from 'react';
import redirectToGlobalLogin from './redirectToGlobalLogin';

/* H/T:
  Avoiding Race Conditions and Memory Leaks in React useEffect
  https://javascript.plainenglish.io/avoiding-race-conditions-and-memory-leaks-in-react-useeffect-2034b8a0a3c7
*/

const useFetchWithAbort = ({ url, body, method }) => {
  const [fetchedData, setFetchedData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // NOTE: In DEV these effects get called TWICE on every run instead of once. React is doing this to find issues in the flow and warn you about them. In production you shouldn't see these constant dual fires though.
    // https://stackoverflow.com/a/61897567/4982408
    const abortController = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setFetchedData(null);
      const options = {};
      if (body) {
        options.method = method || 'POST';
        options.credentials = 'include'; // Otherwise, no cookies!
        options.headers = {
          'content-type': 'application/json',
        };
        options.body = JSON.stringify(body);
      }
      try {
        const response = await fetch(url, {
          ...options,
          signal: abortController.signal,
        });
        const text = await response.text(); // Parse it as text
        let newData;
        try {
          const data = JSON.parse(text); // Try to parse it as JSON
          newData = data;
        } catch (e) {
          // The response wasn't a JSON object
          newData = text;
        }
        if (response.status === 200) {
          setError(null);
          setFetchedData(newData);
        } else if (response.status === 401) {
          redirectToGlobalLogin();
        } else if (response.status === 403) {
          if (text && text.length < 255) {
            setError(text);
          } else {
            setError('Unauthorized');
          }
        } else if (response.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 404) {
          setError('API backend NOT FOUND.');
        } else if (response.status === 413) {
          setError(
            'Your request was too large. Please try again with a smaller dataset.',
          );
        } else {
          let responseText = text;
          // console.error(responseText);
          if (responseText.length > 255) {
            // Catch when Laravel dumps everything before React barfs on it.
            responseText = 'Server Error';
          }
          setError(responseText);
        }
      } catch (e) {
        // console.error(e);
        if (e.name === 'AbortError') {
          setError(error);
        }
      }
      setIsLoading(false); // In any case, we are no longer loading data.
    };
    if (url) {
      fetchData();
    }
    return () => {
      abortController.abort();
    };
  }, [url, body]);

  return { fetchedData, isLoading, error };
};

export default useFetchWithAbort;
