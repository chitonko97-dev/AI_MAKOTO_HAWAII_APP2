const DEFAULT_MODEL = "gemini-2.5-flash";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
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
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 420,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const details = await geminiResponse.text();
      console.error("Gemini API error", geminiResponse.status, details);
      return response.status(502).json({ error: "Gemini API request failed" });
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
- 350文字以内
- 短い案内文だけを書く
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
  return withoutUrls.length > 350 ? `${withoutUrls.slice(0, 347)}...` : withoutUrls;
}
