const functions = require("firebase-functions");
const fetch = require("node-fetch");

// Anthropic API 프록시
// CORS 문제 없이 브라우저에서 Claude API를 호출할 수 있게 해줍니다.
exports.anthropicProxy = functions
  .region("asia-northeast3") // 서울 리전 (가장 가까움)
  .https.onRequest(async (req, res) => {
    // CORS 헤더 설정
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    // preflight 요청 처리
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const apiKey = functions.config().anthropic.key;
      if (!apiKey) {
        res.status(500).json({ error: "API key not configured" });
        return;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: err.message });
    }
  });
