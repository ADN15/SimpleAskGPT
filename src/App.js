import React, { useState, useCallback } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import "./App.css";

Chart.register(...registerables);

function App() {
  const [apiKey, setApiKey] = useState("");
  const [query, setQuery] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  // Process P-Tuning
  const processPromptTuning = (inputQuery) => {
    return `Please provide a structured response with clear bullet points or tabular data. Format numeric results as 'Label | Value'.\n\nUser Query: ${inputQuery}`;
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError("");
    setResponseText("");
    setChartData(null);

    try {
      const tunedQuery = processPromptTuning(query);
      console.log("tuned Query : " + tunedQuery);

      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: tunedQuery }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const content = res.data.choices[0].message.content;
      setResponseText(content);
      console.log(content);

      // Check if the query contains keywords related to charts
      const chartKeywords = [ "graph", "graphic", "chart", "bar", "diagram"];
      const containsChartKeyword = chartKeywords.some((keyword) => query.toLowerCase().includes(keyword));

      if (containsChartKeyword) {
        // Extract numeric data for chart
        const parsedData = extractChartData(content);
        console.log(parsedData);

        if (parsedData && JSON.stringify(parsedData) !== JSON.stringify(chartData)) {
          setChartData(parsedData);
        }
      }

    } catch (err) {
      setError(err.response?.data?.error?.message || "Error: Unable to get a response.");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, query, chartData]);

  // Extract chart data from GPT response
  const extractChartData = (text) => {
    const lines = text.split("\n");
    const labelsSet = new Set(); // Prevent duplicate labels
    const data = [];

    lines.forEach((line) => {
      const match = line.match(/(?:- \*\*|\|\s*)([^|:\n]+)[|:]\s*(\d+)/);
      if (match) {
        const label = match[1].trim().replace(/^\*\*|\*\*$/g, ""); // Remove extra markdown formatting
        if (!labelsSet.has(label)) {
          labelsSet.add(label);
          data.push(parseInt(match[2], 10));
        }
      }
    });

    const labels = Array.from(labelsSet);

    return labels.length > 0 && data.length > 0
      ? {
          labels,
          datasets: [
            {
              label: "Data Analysis",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        }
      : null;
  };

  return (
    <div className="App">
      <div className="header-container">
        <img src="https://1000logos.net/wp-content/uploads/2023/02/ChatGPT-Logo.jpg" alt="ChatGPT Logo" />
        <h1>Chat with GPT</h1>
      </div>

      {/* API Key Input Section */}
      {!isApiKeySet ? (
        <div className="input-container">
          <input
            type="text"
            placeholder="Insert API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <br />

          <button id="generate-button" onClick={() => apiKey && setIsApiKeySet(true)}>OK</button>
        </div>
      ) : (
        <div className="api-key-confirmed">
          <p>✅ API Key Set</p>
          <button onClick={() => setIsApiKeySet(false)}>Change API Key</button>
        </div>
      )}

      {/* Query Input and Buttons in One Container */}
      <div className="input-container">
        <textarea id="prompt-input" placeholder="Type your question..." value={query} onChange={(e) => setQuery(e.target.value)}></textarea>
        <br />
        <button id="generate-button" onClick={handleSubmit} disabled={loading || !apiKey || !query}>
          {loading ? "Loading..." : "Search"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Text Response */}
      {responseText && (
        <div className="response-container">
          <p>{responseText}</p>
        </div>
      )}

      {/* Chart Display */}
      {chartData && (
        <div className="chart-container">
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}

export default App;
