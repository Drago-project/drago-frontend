export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const apiBase = process.env.HF_API_BASE || "https://mohamed4111-dyslexia-v2.hf.space";

  try {
    const hfRes = await fetch(`${apiBase}/get_levels`);
    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      res.status(hfRes.status).send(errorText);
      return;
    }
    const data = await hfRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error /get_levels:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch levels from Hugging Face space" });
  }
}
