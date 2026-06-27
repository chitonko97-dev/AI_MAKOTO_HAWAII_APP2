const NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=%E3%83%8F%E3%83%AF%E3%82%A4&hl=ja&gl=JP&ceid=JP:ja";

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET") {
    response.setHeader("Allow", "GET, OPTIONS");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Fetching Hawaii news from Google News RSS");
    const newsResponse = await fetch(NEWS_RSS_URL, {
      headers: {
        "User-Agent": "AI-Makoto-Hawaii-App/1.0",
      },
    });

    if (!newsResponse.ok) {
      const details = await newsResponse.text();
      console.error("Google News RSS error", newsResponse.status, details.slice(0, 300));
      return response.status(502).json({ error: "News request failed" });
    }

    const xml = await newsResponse.text();
    const items = parseNewsItems(xml).slice(0, 12);
    console.log("Hawaii news fetched", items.length);

    return response.status(200).json({
      source: "Google News RSS",
      fetchedAt: new Date().toISOString(),
      items,
    });
  } catch (error) {
    console.error("news handler error", error);
    return response.status(500).json({ error: "Unexpected news error" });
  }
}

function parseNewsItems(xml) {
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return itemMatches
    .map((itemXml) => ({
      title: decodeXml(readTag(itemXml, "title")),
      link: decodeXml(readTag(itemXml, "link")),
      source: decodeXml(readTag(itemXml, "source")),
      pubDate: decodeXml(readTag(itemXml, "pubDate")),
    }))
    .filter((item) => item.title && item.link);
}

function readTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`));
  return match?.[1]?.trim() || "";
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
