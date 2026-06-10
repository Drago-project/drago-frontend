export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const tombUrl = process.env.HF_TOMB_URL || "https://huggingface.co/spaces/T1a2T3a4/tartiiiiib/raw/main/generated_questions.json";

  try {
    const hfRes = await fetch(tombUrl);
    if (!hfRes.ok) {
      const errorText = await hfRes.text();
      res.status(hfRes.status).send(errorText);
      return;
    }
    const data = await hfRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error /tomb/questions:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch questions from Hugging Face space" });
  }
}
