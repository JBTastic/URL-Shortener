import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedUrl = inputUrl.trim();

    if (!trimmedUrl) {
      setError("Must not have empty URL!");
      return;
    }

    if (!trimmedUrl.startsWith("https://")) {
      setError("URL must start with https://");
      return;
    }

    if (shortUrl && trimmedUrl === inputUrl) {
      setError("You already shortened this URL. Change the URL to shorten again.");
      return;
    }

    setError("");

    try {
      const response = await supabase.functions.invoke("shorten", {
        body: { url: trimmedUrl },
      });

      if (!response || !response.data) {
        setError("Failed to shorten URL: No data returned");
        return;
      }

      // Convert JSON string to object
      const parsed = JSON.parse(response.data);
      const { slug } = parsed;

      if (!slug) {
        setError("Failed to shorten URL: No slug returned");
        console.error("Full response:", response);
        return;
      }

      setShortUrl(`https://s.jbtastic.com/s/?slug=${slug}`);
    } catch (err) {
      console.error(err);
      setError("Unexpected error while shortening URL");
    }

  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    if (shortUrl) setShortUrl("");
    if (error) setError("");
  };

  return (
    <div className="container">
      <h1>JBTastic URL Shortener</h1>
      <input
        type="url"
        placeholder="Enter your URL here"
        value={inputUrl}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        className={error ? "shake" : ""}
      />
      {error && <p className="error-text">{error}</p>}
      <button onClick={handleSubmit}>Shorten URL</button>

      {shortUrl && (
        <div className="result">
          <p>Your short URL:</p>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
