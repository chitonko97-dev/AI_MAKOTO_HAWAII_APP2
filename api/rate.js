const FALLBACK_RATE = 155;

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Fetching USD/JPY rate from Frankfurter API");
    const rateResponse = await fetch("https://api.frankfurter.app/latest?from=USD&to=JPY");

    if (!rateResponse.ok) {
      const details = await rateResponse.text();
      console.error("Frankfurter API error", rateResponse.status, details);
      return response.status(200).json({
        rate: FALLBACK_RATE,
        source: "fallback",
        message: "Frankfurter API request failed",
      });
    }

    const data = await rateResponse.json();
    const rate = Number(data?.rates?.JPY);

    if (!rate) {
      console.error("Frankfurter API response did not include JPY rate", data);
      return response.status(200).json({
        rate: FALLBACK_RATE,
        source: "fallback",
        message: "JPY rate missing",
      });
    }

    console.log("Frankfurter USD/JPY rate fetched", rate);
    return response.status(200).json({
      rate,
      source: "frankfurter",
      date: data.date,
    });
  } catch (error) {
    console.error("rate handler error", error);
    return response.status(200).json({
      rate: FALLBACK_RATE,
      source: "fallback",
      message: "Unexpected rate fetch error",
    });
  }
}
