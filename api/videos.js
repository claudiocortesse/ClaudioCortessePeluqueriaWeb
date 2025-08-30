// api/videos.js  - Vercel Serverless Function
export default async function handler(req, res) {
  // CORS: permite solo el origen configurado (o "*" temporalmente)
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowed);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const API_KEY = process.env.YT_API_KEY;
  const CHANNEL_ID = req.query.channelId || process.env.CHANNEL_ID;
  const max = Math.min(parseInt(req.query.maxResults || "3", 10), 10);

  if (!API_KEY || !CHANNEL_ID) {
    res.status(500).json({ error: "Server misconfigured: missing API key or channel id" });
    return;
  }

  // Construimos la URL a YouTube Data API
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("key", API_KEY);
  url.searchParams.set("channelId", CHANNEL_ID);
  url.searchParams.set("part", "snippet,id");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", String(max));
  url.searchParams.set("type", "video");

  try {
    const upstream = await fetch(url.toString());
    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({
        error: "YouTube API error",
        details: data?.error || data
      });
      return;
    }

    // Opcional: devolver solo campos necesarios (optimiza peso)
    const items = (data.items || []).map(i => ({
      videoId: i.id?.videoId,
      title: i.snippet?.title,
      thumb: i.snippet?.thumbnails?.high?.url || i.snippet?.thumbnails?.default?.url,
      publishedAt: i.snippet?.publishedAt,
      channelTitle: i.snippet?.channelTitle
    }));

    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: "Upstream fetch failed", details: String(err) });
  }
}
