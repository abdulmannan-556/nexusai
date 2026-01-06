import { useState } from "react";

export default function ChatUI() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("https://https://nexusai-hello.abdulmmm556.workers.dev/.workers.dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer s3cr3t123!@#"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      setResponse(data.output || "No response");
    } catch (err) {
      setResponse("Error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        cols={50}
        placeholder="Ask NexusAI anything..."
      />
      <br />
      <button onClick={handleSend} disabled={loading}>
        {loading ? "Loading..." : "Send"}
      </button>
      <pre style={{ marginTop: "1rem", background: "#f5f5f5", padding: "1rem" }}>
        {response}
      </pre>
    </div>
  );
}
