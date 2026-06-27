const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST, OPTIONS");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return response.status(500).json({ error: "Gemini API key is not configured" });
  }

  try {
    const { message, spots = [] } = request.body || {};

    if (!message || typeof message !== "string") {
      return response.status(400).json({ error: "message is required" });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildPrompt(message, spots) }],
            },
          ],
          generationConfig: {
            temperature: 0.55,
            topP: 0.9,
            maxOutputTokens: 180,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      console.error("Gemini API error", geminiResponse.status, details);
      const status = [400, 429, 503].includes(geminiResponse.status)
        ? geminiResponse.status
        : 502;
      return response.status(status).json({ error: "Gemini API request failed" });
    }

    const data = await geminiResponse.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "";

    return response.status(200).json({
      reply: sanitizeReply(rawText),
    });
  } catch (error) {
    console.error("chat handler error", error);
    return response.status(500).json({ error: "Unexpected server error" });
  }
}

function buildPrompt(message, spots) {
  const spotSummary = spots.length
    ? spots
        .map(
          (spot, index) =>
            `${index + 1}. ${spot.name}（${spot.area} / ${spot.genre} / ${spot.transport} / ${spot.duration}）: ${spot.makotoComment} 注意: ${spot.caution}`
        )
        .join("\n")
    : "候補スポットなし。一般的なワイキキ滞在向けの短い案内にしてください。";

  return `あなたはYouTubeチャンネル「ハワイイ!?」の旅行相談AI「AIまこと」です。
ワイキキ滞在の旅行者に、明るく親しみやすい日本語で返答します。

厳守:
- 180文字以内
- 2〜3文の短い案内文だけを書く
- 文章は必ず句点「。」か絵文字で自然に終える
- URLを書かない
- スポット一覧や箇条書きを書かない
- スポット名を大量に並べない
- 詳細な注意点や営業時間は書かない
- 最後は自然に「下に候補を出しておきますね」程度で締める

ユーザーの相談:
${message}

アプリ側で表示する候補スポット:
${spotSummary}`;
}

function sanitizeReply(text) {
  const fallback =
    "いいですね〜！😆\nワイキキ滞在なら、移動に無理が出ない場所から選ぶのがおすすめです。\n下に候補スポットを出しておきますねーーーっ🌴";

  const withoutUrls = (text || fallback).replace(/https?:\/\/\S+/g, "").trim();
  const shortened = withoutUrls.length > 180 ? withoutUrls.slice(0, 180).trim() : withoutUrls;
  const complete = trimToCompleteSentence(shortened);

  if (complete.length < 25) return fallback;
  return complete;
}

function trimToCompleteSentence(text) {
  if (/[。！？!?🌴😆]$/.test(text)) return text;

  const lastBreak = Math.max(
    text.lastIndexOf("。"),
    text.lastIndexOf("！"),
    text.lastIndexOf("？"),
    text.lastIndexOf("!"),
    text.lastIndexOf("?"),
    text.lastIndexOf("🌴"),
    text.lastIndexOf("😆")
  );

  if (lastBreak < 24) return "";
  return text.slice(0, lastBreak + 1).trim();
}
