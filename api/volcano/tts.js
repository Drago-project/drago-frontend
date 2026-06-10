export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const apiBase = process.env.HF_API_BASE || "https://mohamed4111-dyslexia-v2.hf.space";
  const { word, t } = req.query;

  try {
    const url = new URL(`${apiBase}/tts`);
    if (word) url.searchParams.set("word", word);
    if (t) url.searchParams.set("t", t);

    const hfRes = await fetch(url.toString());
    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      res.status(hfRes.status).send(errorText);
      return;
    }

    // Forward content-type header if available (typically audio/mpeg or audio/wav)
    res.setHeader("Content-Type", hfRes.headers.get("Content-Type") || "audio/mpeg");

    // Read response as arraybuffer and send buffer
    const arrayBuffer = await hfRes.arrayBuffer();
    res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Proxy error /tts:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch TTS audio from Hugging Face space" });
  }
}
