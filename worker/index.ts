// worker/index.ts
export interface Env {
  WORKER_SECRET: string;
  CF_ACCOUNT_ID: string;
  CF_GATEWAY_ID: string;
  CF_API_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      // Only POST requests
      if (request.method !== "POST") {
        return new Response(
          JSON.stringify({ error: "Method Not Allowed" }),
          { status: 405, headers: { "Content-Type": "application/json" } }
        );
      }

      // Authorization check
      const authHeader = request.headers.get("Authorization") || "";
      if (!authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== env.WORKER_SECRET) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }

      // Parse client request
      const { prompt, model = "gpt-4", temperature = 0.7 } = await request.json();
      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "No prompt provided" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Forward request to Cloudflare AI Gateway
      const gatewayUrl = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/gateway/${env.CF_GATEWAY_ID}/completions`;
      
      const aiResponse = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          input: prompt,
          temperature
        })
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        return new Response(
          JSON.stringify({ error: "AI Gateway error", details: errText }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }

      const aiData = await aiResponse.json();

      return new Response(
        JSON.stringify({ output: aiData.output || aiData }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Internal Server Error", details: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
