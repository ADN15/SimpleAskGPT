import React, { useState } from "react";
import axios from "axios";

import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: query }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      setResponse(res.data.choices[0].message.content);
    } catch (err) {
      setError(
        err.response?.data?.error?.message || "Error: Unable to get a response."
      );
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header-container">
        <img src="https://1000logos.net/wp-content/uploads/2023/02/ChatGPT-Logo.jpg" alt="ChatGPT Logo" />
        <h1>Chat with GPT</h1>
      </div>
      <div class="input-container">
        <textarea
          placeholder="Insert API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <textarea 
          placeholder="Type your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        ></textarea>
        <button id="generate-button" onClick={handleSubmit} disabled={loading || !apiKey || !query}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>
    {error && <div className="error">{error}</div>}
        {response && ( 
          <div className="response-container">
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
