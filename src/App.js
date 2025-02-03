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
          model: "gpt-3.5-turbo",
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
      <h1 align="center">Chat with GPT</h1>
      <div className="container">
        <textarea
          placeholder="Insert API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <textarea
          placeholder="Type your question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSubmit} disabled={loading || !apiKey || !query}>
          {loading ? "Loading..." : "Ask GPT"}
        </button>
        {error && <div className="error">{error}</div>}
        {response && (
          <div className="output">
            <strong>Response:</strong>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
