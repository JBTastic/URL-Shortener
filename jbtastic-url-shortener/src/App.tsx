import { useState } from "react";
import "./App.css";

function App() {
  const [inputUrl, setInputUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmedUrl = inputUrl.trim();

    // If input empty
    if (!trimmedUrl) {
      setError("Must not have empty URL!");
      return;
    }

    // If URL doesn't start with https://
    if (!trimmedUrl.startsWith("https://")) {
      setError("URL must start with https://");
      return;
    }

    // Wenn URL schon gekürzt wurde
    if (shortUrl && trimmedUrl === inputUrl) {
      setError("You already shortened this URL. Change the URL to shorten again.");
      return;
    }

    setError("");

    // TODO: Temporary URL generation, later to be replaced by Supabase
    const slug = Math.random().toString(36).substring(2, 8);
    setShortUrl(`https://s.jbtastic.com/${slug}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    // Reset shortURL when input changes
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
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
        </div>
      )}
    </div>
  );
}

export default App;
