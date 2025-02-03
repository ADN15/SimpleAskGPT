/**
 * Function to call the OpenAI API using fetch.
 * @param {string} apiKey - The API key to authorize the request.
 * @param {string} query - The question/query to ask the API.
 */
function callAPI(apiKey, query) {
    if (!apiKey || !query) {
      throw new Error("API Key and query must be provided.");
    }
  
    // Making the API call using fetch
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: query }],
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      // Triggering a custom event with the response message
      const responseMessage = data.choices[0].message.content;
      window.dispatchEvent(new CustomEvent('onAPIResponse', { detail: responseMessage }));
    })
    .catch(error => {
      // Triggering a custom event in case of an error
      window.dispatchEvent(new CustomEvent('onError', { detail: error.message }));
    });
  }
  
  // Exposing the function to be called from SAC
  window.callAPI = callAPI;
  