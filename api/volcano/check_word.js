export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const apiBase = process.env.HF_API_BASE || "https://mohamed4111-dyslexia-v2.hf.space";
  const apiKey = process.env.HF_API_KEY;

  try {
    // Read the raw body as a buffer since parser is disabled
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    const headers = {
      "content-type": req.headers["content-type"],
    };

    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const hfRes = await fetch(`${apiBase}/check_word`, {
      method: "POST",
      headers,
      body: bodyBuffer,
    });

    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      res.status(hfRes.status).send(errorText);
      return;
    }

    const data = await hfRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error /check_word:", error);
    res.status(500).json({ status: "error", message: "Failed to verify word via Hugging Face space" });
  }
}
