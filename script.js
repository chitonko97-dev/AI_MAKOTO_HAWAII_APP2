const openingScreen = document.querySelector("#openingScreen");
const chatScreen = document.querySelector("#chatScreen");
const openingTabButtons = document.querySelectorAll("[data-open-tab]");
const backToOpening = document.querySelector("#backToOpening");
const chat = document.querySelector("#chat");
const userInput = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");
const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const wantList = document.querySelector("#wantList");
const dayGroups = document.querySelector("#dayGroups");
const makeShareText = document.querySelector("#makeShareText");
const copyShareText = document.querySelector("#copyShareText");
const shareText = document.querySelector("#shareText");
const clearWantList = document.querySelector("#clearWantList");
const clearItinerary = document.querySelector("#clearItinerary");
const calcAmount = document.querySelector("#calcAmount");
const calcRate = document.querySelector("#calcRate");
const calcPeople = document.querySelector("#calcPeople");
const rateStatus = document.querySelector("#rateStatus");
const tipButtons = document.querySelectorAll("[data-tip]");
const customTipWrap = document.querySelector("#customTipWrap");
const customTipRate = document.querySelector("#customTipRate");
const calcResult = document.querySelector("#calcResult");
const saveCalcResult = document.querySelector("#saveCalcResult");
const calcHistoryList = document.querySelector("#calcHistoryList");
const clearCalcHistory = document.querySelector("#clearCalcHistory");
const refreshNews = document.querySelector("#refreshNews");
const newsStatus = document.querySelector("#newsStatus");
const newsList = document.querySelector("#newsList");

let spots = [];
let isSending = false;
let savedSpots = loadStoredValue("aiMakotoWantList", []);
let itinerary = loadStoredValue("aiMakotoItinerary", {
  day1: [],
  day2: [],
  day3: [],
});
let calcHistory = loadStoredValue("aiMakotoCalcHistory", []);
let selectedTipRate = 15;
let latestCalcResult = null;
let newsLoaded = false;

const greetingReply =
  "アロハー、AIまことです〜！😆\nハワイのことなら何でも聞いてくださいね〜！\n初日の過ごし方、ごはん、買い物、ハワイイ!?で紹介された場所など、気軽に相談してくださいーーーっ🌴";

const thinkingText =
  "AIまこと、考えています〜！\n少しだけ待っててくださいねーーーっ😆🌴";

const keywordCategories = {
  ごはん: ["お腹", "おなか", "腹", "食べ", "ランチ", "ディナー", "朝食", "ごはん", "レストラン", "カフェ", "フード", "ポケ"],
  買い物: ["買い物", "ショッピング", "お土産", "スーパー", "モール", "アラモアナ", "ドンキ"],
  ビーチ: ["ビーチ", "海", "泳ぐ", "夕日", "サンセット", "砂浜"],
  観光: ["観光", "名所", "景色", "写真", "撮影", "ダイヤモンドヘッド", "見る"],
  散歩: ["散歩", "歩き", "ぶらぶら", "散策", "歩く"],
  雨の日: ["雨", "雨の日", "屋内", "濡れない", "天気悪い", "天気が悪い"],
  レンタカーなし: ["レンタカーなし", "車なし", "徒歩", "バス", "Uber", "uber", "トロリー", "近場"],
  初日: ["初日", "到着", "午後", "着いた", "着いて", "無理なく"],
  朝: ["朝", "午前", "朝食", "モーニング"],
  夜: ["夜", "夕方", "ディナー", "バー", "サンセット"],
  子連れ: ["子連れ", "家族", "キッズ", "子ども", "子供"],
  ワイキキ周辺: ["ワイキキ", "近場", "徒歩", "ホテル周辺"],
  アラモアナ方面: ["アラモアナ", "ドンキ", "ウォルマート", "カカアコ"],
  "ハワイイ!?紹介スポット": ["ハワイイ", "ハワイイ!?", "紹介", "動画", "YouTube", "youtube"],
};

const keywordReplies = {
  ごはん: "お腹すいてきましたね〜！😆 ワイキキ周辺で行きやすそうなごはんスポットを出してみましたーーーっ🌴",
  買い物: "買い物したい感じですね〜！お土産探しにも使いやすそうなスポットを出してみましたーーーっ😆",
  ビーチ: "海を感じたい気分ですね〜！無理なく行きやすそうなビーチ寄りスポットを出してみましたーーーっ🌴",
  観光: "観光したい感じですね〜！ハワイらしさを味わいやすい候補を出してみましたーーーっ😆",
  散歩: "軽く散歩するなら、移動しやすくて景色も楽しめる場所がいいですね〜！候補を出してみましたーーーっ🌴",
  雨の日: "雨の日は無理せず、屋内寄りで楽しめる場所が安心ですね〜！行きやすそうな候補を出してみましたーーーっ🌴",
  レンタカーなし: "レンタカーなしなら、徒歩・バス・トロリーで動きやすい場所が安心です〜！候補を出してみましたーーーっ😆",
  初日: "初日は移動で疲れやすいので、ワイキキ周辺で無理なく楽しめる場所がいいですね〜！候補を出してみましたーーーっ🌴",
  朝: "朝の時間なら、軽めに動けて気持ちよく過ごせる場所がいいですね〜！候補を出してみましたーーーっ😆",
  夜: "夜は移動しすぎず、雰囲気よく楽しめる場所が安心です〜！候補を出してみましたーーーっ🌴",
  子連れ: "子連れなら、移動しやすくて休憩しやすい場所を選ぶのが安心ですね〜！候補を出してみましたーーーっ😆",
  ワイキキ周辺: "ワイキキ周辺なら、徒歩でも動きやすい場所から選ぶのがよさそうです〜！候補を出してみましたーーーっ🌴",
  アラモアナ方面: "アラモアナ方面ですね〜！買い物やごはんをまとめやすい候補を出してみましたーーーっ😆",
  "ハワイイ!?紹介スポット": "ハワイイ!?で気になった場所ですね〜！紹介スポット寄りで候補を出してみましたーーーっ🌴",
};

openingTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openAppTab(button.dataset.openTab);
  });
});

backToOpening.addEventListener("click", () => {
  chatScreen.classList.remove("active");
  openingScreen.classList.add("active");
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    userInput.value = button.dataset.prompt;
    userInput.focus();
    resizeComposer();
  });
});

userInput.addEventListener("input", resizeComposer);
sendBtn.addEventListener("click", submitMessage);
tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});
makeShareText.addEventListener("click", generateShareText);
copyShareText.addEventListener("click", copyGeneratedText);
clearWantList.addEventListener("click", clearAllSavedSpots);
clearItinerary.addEventListener("click", clearAllItinerary);
clearCalcHistory.addEventListener("click", clearAllCalcHistory);
saveCalcResult.addEventListener("click", saveCurrentCalcResult);
refreshNews.addEventListener("click", () => loadNews({ force: true }));
[calcAmount, calcRate, calcPeople, customTipRate].forEach((input) => {
  input.addEventListener("input", updateCalcResult);
});
tipButtons.forEach((button) => {
  button.addEventListener("click", () => selectTipRate(button.dataset.tip));
});

const spotsReady = loadSpots();
loadReferenceRate();
renderSavedViews();
updateCalcResult();

async function loadSpots() {
  try {
    const response = await fetch("./spots.json");
    if (!response.ok) throw new Error(`spots.json ${response.status}`);
    spots = await response.json();
  } catch (error) {
    console.error("spots.jsonの読み込みに失敗しました", error);
    spots = [];
  }
}

async function loadReferenceRate() {
  const fallbackRate = calcRate.value || "155";

  try {
    const response = await fetch("/api/rate");
    if (!response.ok) throw new Error(`rate API ${response.status}`);
    const data = await response.json();
    const jpyRate = Number(data?.rate);
    if (!jpyRate) throw new Error("JPY rate missing");

    calcRate.value = jpyRate.toFixed(2);
    rateStatus.textContent =
      data.source === "frankfurter"
        ? `Frankfurter APIの参考レートを反映しました：1ドル 約${formatNumber(jpyRate)}円`
        : `参考レートを取得できなかったため、手入力の初期値 ${formatNumber(jpyRate)}円を使っています。`;
    updateCalcResult();
  } catch (error) {
    console.warn("参考レートの取得に失敗しました", error);
    calcRate.value = fallbackRate;
    rateStatus.textContent = `参考レートを取得できなかったため、手入力の初期値 ${formatNumber(fallbackRate)}円を使っています。`;
    updateCalcResult();
  }
}

async function submitMessage() {
  const message = userInput.value.trim();
  if (!message || isSending) return;

  appendMessage("user", message);
  userInput.value = "";
  resizeComposer();

  if (isGreetingOnly(message)) {
    appendMessage("bot", greetingReply);
    logSuggestionDebug({
      mode: "greeting",
      categories: [],
      usedGemini: false,
      fallback: false,
      spotCount: 0,
    });
    return;
  }

  isSending = true;
  sendBtn.disabled = true;
  const thinkingRow = appendMessage("bot", thinkingText, { thinking: true });

  await spotsReady;
  const categories = detectKeywordCategories(message);
  const selectedSpots = pickSpots(message, spots, categories);

  if (categories.length > 0) {
    thinkingRow.remove();
    appendMessage("bot", buildKeywordReply(categories));
    if (selectedSpots.length > 0) {
      appendSpotCards(selectedSpots);
    }
    logSuggestionDebug({
      mode: "keyword",
      categories,
      usedGemini: false,
      fallback: false,
      spotCount: selectedSpots.length,
    });
    isSending = false;
    sendBtn.disabled = false;
    userInput.focus();
    return;
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        spots: selectedSpots.map(toPromptSpot),
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new ApiError(response.status, details || `API ${response.status}`);
    }

    const data = await response.json();
    thinkingRow.remove();
    appendMessage("bot", data.reply || fallbackTravelReply(message));
    if (selectedSpots.length > 0) {
      appendSpotCards(selectedSpots);
    }
    logSuggestionDebug({
      mode: "gemini",
      categories,
      usedGemini: true,
      fallback: false,
      spotCount: selectedSpots.length,
    });
  } catch (error) {
    console.error("AIまことAPIエラー", error);
    thinkingRow.remove();
    appendMessage("bot", buildFallbackReply(error, categories));
    if (selectedSpots.length > 0) {
      appendSpotCards(selectedSpots);
    }
    logSuggestionDebug({
      mode: "fallback",
      categories,
      usedGemini: true,
      fallback: true,
      spotCount: selectedSpots.length,
    });
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

class ApiError extends Error {
  constructor(status, details) {
    super(details);
    this.status = status;
  }
}

function fallbackErrorReply(error) {
  if (error instanceof ApiError && (error.status === 429 || error.status === 503)) {
    return "すみません〜！🙇\nいまAIまこと側が少し混み合っています。\n短い案内文はうまく作れなかったのですが、候補スポットは下に出しておきますねーーーっ🌴";
  }

  return "すみません〜！🙇\nいま少しうまく回答できませんでした。\n候補スポットは下に出しておきますねーーーっ🌴";
}

function buildFallbackReply(error, categories) {
  if (categories.length > 0) return buildKeywordReply(categories);
  return fallbackErrorReply(error);
}

function appendMessage(role, text, options = {}) {
  const row = document.createElement("section");
  row.className = `message-row ${role}${options.thinking ? " thinking" : ""}`;

  if (role === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "ま";
    row.append(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "bot" ? "bot-bubble" : "user-bubble"}`;
  bubble.textContent = text;
  row.append(bubble);

  chat.append(row);
  scrollToLatest();
  return row;
}

function appendSpotCards(selectedSpots) {
  const list = document.createElement("section");
  list.className = "spot-list";
  list.setAttribute("aria-label", "おすすめスポット");

  selectedSpots.forEach((spot) => {
    const card = document.createElement("article");
    card.className = "spot-card";

    const title = document.createElement("h3");
    title.textContent = spot.name;

    const meta = document.createElement("div");
    meta.className = "spot-meta";
    [spot.area, spot.genre, spot.transport, spot.duration].forEach((value) => {
      if (!value) return;
      const item = document.createElement("span");
      item.textContent = value;
      meta.append(item);
    });

    const comment = document.createElement("p");
    comment.textContent = spot.makotoComment;

    const caution = document.createElement("p");
    caution.className = "spot-note";
    caution.textContent = `注意点：${spot.caution}`;

    const actions = document.createElement("div");
    actions.className = "spot-actions";
    const saveButton = document.createElement("button");
    saveButton.className = "save-spot-btn";
    saveButton.type = "button";
    saveButton.textContent = isSavedSpot(spot.name) ? "保存済み" : "行きたいに保存";
    saveButton.disabled = isSavedSpot(spot.name);
    saveButton.addEventListener("click", () => saveSpot(spot, saveButton));

    actions.append(
      saveButton,
      createActionLink("動画を見る", spot.videoUrl, "video-link"),
      createActionLink("Mapで開く", spot.mapUrl, "map-link")
    );

    card.append(title, meta, comment, caution, actions);
    list.append(card);
  });

  chat.append(list);
  scrollToLatest();
}

function switchTab(tabName) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
  });

  renderSavedViews();
  if (tabName === "news") loadNews();
  if (tabName === "consult") userInput.focus();
}

function openAppTab(tabName) {
  openingScreen.classList.remove("active");
  chatScreen.classList.add("active");
  switchTab(tabName);
}

async function loadNews(options = {}) {
  if (newsLoaded && !options.force) return;

  newsLoaded = true;
  refreshNews.disabled = true;
  newsStatus.textContent = "ニュースを読み込んでいます...";
  newsList.innerHTML = "";

  try {
    const response = await fetch("/api/news");
    if (!response.ok) throw new Error(`news API ${response.status}`);
    const data = await response.json();
    renderNews(data.items || []);
    newsStatus.textContent = data.items?.length
      ? `最新見出しを${data.items.length}件表示しています。`
      : "ニュースが見つかりませんでした。時間を置いて更新してください。";
    console.log("AI Makoto news debug", {
      source: data.source,
      fetchedAt: data.fetchedAt,
      count: data.items?.length || 0,
    });
  } catch (error) {
    console.error("ニュースの読み込みに失敗しました", error);
    newsLoaded = false;
    newsStatus.textContent = "ニュースを取得できませんでした。時間を置いて更新してください。";
    newsList.append(createEmptyState("通信状況やニュース取得元の状態によって、読み込めない場合があります。"));
  } finally {
    refreshNews.disabled = false;
  }
}

function renderNews(items) {
  newsList.innerHTML = "";

  if (items.length === 0) {
    newsList.append(createEmptyState("ハワイ関連ニュースが見つかりませんでした。"));
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "news-card";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const meta = document.createElement("p");
    meta.className = "news-meta";
    meta.textContent = [item.source, formatNewsDate(item.pubDate)].filter(Boolean).join(" / ");

    const action = document.createElement("a");
    action.className = "map-link news-link";
    action.href = item.link;
    action.target = "_blank";
    action.rel = "noopener noreferrer";
    action.textContent = "記事を開く";

    card.append(title, meta, action);
    newsList.append(card);
  });
}

function saveSpot(spot, button) {
  if (isSavedSpot(spot.name)) return;
  savedSpots = [...savedSpots, spot];
  storeValue("aiMakotoWantList", savedSpots);
  button.textContent = "保存済み";
  button.disabled = true;
  renderSavedViews();
}

function removeSavedSpot(name) {
  savedSpots = savedSpots.filter((spot) => spot.name !== name);
  Object.keys(itinerary).forEach((dayKey) => {
    itinerary[dayKey] = itinerary[dayKey].filter((spotName) => spotName !== name);
  });
  storeValue("aiMakotoWantList", savedSpots);
  storeValue("aiMakotoItinerary", itinerary);
  renderSavedViews();
}

function isSavedSpot(name) {
  return savedSpots.some((spot) => spot.name === name);
}

function renderSavedViews() {
  renderWantList();
  renderItinerary();
  renderCalcHistory();
}

function renderWantList() {
  wantList.innerHTML = "";
  clearWantList.disabled = savedSpots.length === 0;
  if (savedSpots.length === 0) {
    wantList.append(createEmptyState("気になったスポットを保存すると、ここに一覧で表示されます。"));
    return;
  }

  savedSpots.forEach((spot) => {
    wantList.append(createSavedSpotCard(spot, { showDayButtons: true, showDelete: true }));
  });
}

function renderItinerary() {
  dayGroups.innerHTML = "";
  clearItinerary.disabled = !Object.values(itinerary).some((names) => names.length > 0);
  ["day1", "day2", "day3"].forEach((dayKey, index) => {
    const section = document.createElement("section");
    section.className = "day-group";
    const title = document.createElement("h3");
    title.textContent = `DAY${index + 1}`;
    const names = itinerary[dayKey] || [];
    const daySpots = names.map(findSpotByName).filter(Boolean);
    const list = document.createElement("div");
    list.className = "saved-list compact-list";

    if (daySpots.length === 0) {
      list.append(createEmptyState(`DAY${index + 1}に入れたスポットがここに表示されます。`));
    } else {
      daySpots.forEach((spot) => {
        list.append(createSavedSpotCard(spot, { compact: true, dayKey }));
      });
    }

    section.append(title, list);
    dayGroups.append(section);
  });
}

function createSavedSpotCard(spot, options = {}) {
  const card = document.createElement("article");
  card.className = `spot-card saved-card${options.compact ? " compact-card" : ""}`;

  const title = document.createElement("h3");
  title.textContent = spot.name;

  const meta = document.createElement("div");
  meta.className = "spot-meta";
  [spot.area, spot.genre, spot.transport, spot.duration].forEach((value) => {
    if (!value) return;
    const item = document.createElement("span");
    item.textContent = value;
    meta.append(item);
  });

  const comment = document.createElement("p");
  comment.textContent = spot.makotoComment;

  const actions = document.createElement("div");
  actions.className = "spot-actions";
  actions.append(
    createActionLink("動画を見る", spot.videoUrl, "video-link"),
    createActionLink("Mapで開く", spot.mapUrl, "map-link")
  );

  if (options.showDayButtons) {
    ["day1", "day2", "day3"].forEach((dayKey, index) => {
      const dayButton = document.createElement("button");
      dayButton.type = "button";
      dayButton.className = "save-spot-btn";
      const alreadyInDay = itinerary[dayKey]?.includes(spot.name);
      dayButton.textContent = alreadyInDay ? `DAY${index + 1}に追加済み` : `DAY${index + 1}に追加`;
      dayButton.disabled = alreadyInDay;
      dayButton.addEventListener("click", () => addSpotToDay(spot.name, dayKey));
      actions.append(dayButton);
    });
  }

  if (options.dayKey) {
    const removeDayButton = document.createElement("button");
    removeDayButton.type = "button";
    removeDayButton.className = "danger-btn";
    removeDayButton.textContent = "しおりから削除";
    removeDayButton.addEventListener("click", () => removeSpotFromDay(spot.name, options.dayKey));
    actions.append(removeDayButton);
  }

  if (options.showDelete) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-btn";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => removeSavedSpot(spot.name));
    actions.append(deleteButton);
  }

  card.append(title, meta, comment, actions);
  return card;
}

function addSpotToDay(name, dayKey) {
  if (!itinerary[dayKey]) itinerary[dayKey] = [];
  if (!itinerary[dayKey].includes(name)) {
    itinerary[dayKey] = [...itinerary[dayKey], name];
    storeValue("aiMakotoItinerary", itinerary);
    renderSavedViews();
  }
}

function clearAllSavedSpots() {
  if (!savedSpots.length) return;
  if (!confirm("行きたいリストをすべて削除しますか？しおりに入れた同じスポットも削除されます。")) return;
  savedSpots = [];
  itinerary = { day1: [], day2: [], day3: [] };
  storeValue("aiMakotoWantList", savedSpots);
  storeValue("aiMakotoItinerary", itinerary);
  renderSavedViews();
}

function clearAllItinerary() {
  if (!Object.values(itinerary).some((names) => names.length > 0)) return;
  if (!confirm("しおりをすべて削除しますか？行きたいリストは残ります。")) return;
  itinerary = { day1: [], day2: [], day3: [] };
  storeValue("aiMakotoItinerary", itinerary);
  renderSavedViews();
}

function removeSpotFromDay(name, dayKey) {
  itinerary[dayKey] = (itinerary[dayKey] || []).filter((spotName) => spotName !== name);
  storeValue("aiMakotoItinerary", itinerary);
  renderSavedViews();
}

function generateShareText() {
  const lines = [
    "AIまことが作ったハワイ旅しおり🌴",
    "",
    "この旅、かなりいい感じですーーーっ😆🌴",
    "ワイキキ滞在をベースに、無理なく楽しめるハワイ旅メモです〜！",
    "",
  ];

  ["day1", "day2", "day3"].forEach((dayKey, index) => {
    lines.push(`DAY${index + 1}`);
    const names = itinerary[dayKey] || [];
    if (names.length === 0) {
      lines.push("・まだスポット未定");
    } else {
      names.forEach((name) => lines.push(`・${name}`));
    }
    lines.push("");
  });

  lines.push("#AIまこと #ハワイイ #ハワイ旅行");
  shareText.value = lines.join("\n").trim();
}

function selectTipRate(value) {
  tipButtons.forEach((button) => button.classList.toggle("active", button.dataset.tip === value));
  customTipWrap.classList.toggle("hidden", value !== "custom");
  selectedTipRate = value === "custom" ? Number(customTipRate.value || 0) : Number(value);
  updateCalcResult();
}

function getCalcValues() {
  const amount = Math.max(0, Number(calcAmount.value || 0));
  const rate = Math.max(0, Number(calcRate.value || 0));
  const people = Math.max(1, Math.floor(Number(calcPeople.value || 1)));
  const tipRate = document.querySelector("[data-tip].active")?.dataset.tip === "custom"
    ? Math.max(0, Number(customTipRate.value || 0))
    : selectedTipRate;
  const tipAmount = amount * (tipRate / 100);
  const totalUsd = amount + tipAmount;
  const totalJpy = totalUsd * rate;
  const perPersonUsd = totalUsd / people;
  const perPersonJpy = totalJpy / people;

  return {
    amount,
    rate,
    people,
    tipRate,
    tipAmount,
    totalUsd,
    totalJpy,
    perPersonUsd,
    perPersonJpy,
  };
}

function updateCalcResult() {
  const values = getCalcValues();
  latestCalcResult = values.amount > 0 && values.rate > 0 ? values : null;

  if (!latestCalcResult) {
    calcResult.innerHTML = "<p>ドル金額を入れると、円換算とチップ込みの目安が出ます。</p>";
    saveCalcResult.disabled = true;
    return;
  }

  saveCalcResult.disabled = false;
  const yenOnly = values.amount * values.rate;
  calcResult.innerHTML = `
    <dl>
      <div><dt>円換算</dt><dd>${formatUsd(values.amount)}ドル × ${formatNumber(values.rate)}円 = 約${formatJpy(yenOnly)}円</dd></div>
      <div><dt>チップ額</dt><dd>${formatUsd(values.tipAmount)}ドル（${formatNumber(values.tipRate)}%）</dd></div>
      <div><dt>チップ込み合計</dt><dd>${formatUsd(values.totalUsd)}ドル / 約${formatJpy(values.totalJpy)}円</dd></div>
      <div><dt>人数割り</dt><dd>${values.people}人で割ると、1人あたり${formatUsd(values.perPersonUsd)}ドル / 約${formatJpy(values.perPersonJpy)}円</dd></div>
    </dl>
    <p class="makoto-note">${createCalcComment(values)}</p>
  `;
}

function createCalcComment(values) {
  if (values.totalJpy >= 30000) {
    return "なかなかいいお値段です〜！😆 カード決済レートやチップ込みの合計も見ながら、無理なく楽しんでくださいね〜！";
  }
  return "チップ込みだとこのくらいです〜！旅行中の目安にしてくださいねーーーっ😆🌴";
}

function saveCurrentCalcResult() {
  if (!latestCalcResult) return;
  const item = {
    id: `calc-${Date.now()}`,
    createdAt: new Date().toISOString(),
    amount: latestCalcResult.amount,
    rate: latestCalcResult.rate,
    tipRate: latestCalcResult.tipRate,
    tipAmount: latestCalcResult.tipAmount,
    totalUsd: latestCalcResult.totalUsd,
    totalJpy: latestCalcResult.totalJpy,
    people: latestCalcResult.people,
    perPersonUsd: latestCalcResult.perPersonUsd,
    perPersonJpy: latestCalcResult.perPersonJpy,
  };
  calcHistory = [item, ...calcHistory].slice(0, 20);
  storeValue("aiMakotoCalcHistory", calcHistory);
  renderCalcHistory();
}

function renderCalcHistory() {
  calcHistoryList.innerHTML = "";
  clearCalcHistory.disabled = calcHistory.length === 0;
  if (calcHistory.length === 0) {
    calcHistoryList.append(createEmptyState("保存した計算結果がここに表示されます。"));
    return;
  }

  calcHistory.forEach((item) => {
    const card = document.createElement("article");
    card.className = "spot-card calc-history-card";
    const title = document.createElement("h3");
    title.textContent = formatDateTime(item.createdAt);
    const body = document.createElement("p");
    body.textContent = `食事代 ${formatUsd(item.amount)}ドル / チップ ${formatNumber(item.tipRate)}% / 合計 ${formatUsd(item.totalUsd)}ドル（約${formatJpy(item.totalJpy)}円）`;
    const split = document.createElement("p");
    split.className = "spot-note";
    split.textContent = `${item.people}人なら1人あたり ${formatUsd(item.perPersonUsd)}ドル / 約${formatJpy(item.perPersonJpy)}円`;
    const actions = document.createElement("div");
    actions.className = "spot-actions";
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-btn";
    deleteButton.textContent = "削除";
    deleteButton.addEventListener("click", () => removeCalcHistoryItem(item.id));
    actions.append(deleteButton);
    card.append(title, body, split, actions);
    calcHistoryList.append(card);
  });
}

function removeCalcHistoryItem(id) {
  calcHistory = calcHistory.filter((item) => item.id !== id);
  storeValue("aiMakotoCalcHistory", calcHistory);
  renderCalcHistory();
}

function clearAllCalcHistory() {
  if (!calcHistory.length) return;
  if (!confirm("計算履歴をすべて削除しますか？")) return;
  calcHistory = [];
  storeValue("aiMakotoCalcHistory", calcHistory);
  renderCalcHistory();
}

function formatUsd(value) {
  return Number(value).toLocaleString("ja-JP", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatJpy(value) {
  return Math.round(value).toLocaleString("ja-JP");
}

function formatNumber(value) {
  return Number(value).toLocaleString("ja-JP", {
    maximumFractionDigits: 2,
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function copyGeneratedText() {
  if (!shareText.value.trim()) generateShareText();
  try {
    await navigator.clipboard.writeText(shareText.value);
    copyShareText.textContent = "コピーしました";
    setTimeout(() => {
      copyShareText.textContent = "共有テキストをコピー";
    }, 1600);
  } catch (error) {
    console.error("共有テキストのコピーに失敗しました", error);
  }
}

function createEmptyState(text) {
  const state = document.createElement("p");
  state.className = "empty-state";
  state.textContent = text;
  return state;
}

function findSpotByName(name) {
  return savedSpots.find((spot) => spot.name === name) || spots.find((spot) => spot.name === name);
}

function loadStoredValue(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`${key}の読み込みに失敗しました`, error);
    return fallback;
  }
}

function storeValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createActionLink(label, href, className) {
  const link = document.createElement("a");
  link.className = className;
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = label;
  return link;
}

function isGreetingOnly(input) {
  const normalized = input
    .toLowerCase()
    .replace(/[!！?？。、,.…\s]/g, "");

  const greetings = [
    "こんにちは",
    "こんにちわ",
    "アロハ",
    "aloha",
    "おはよう",
    "こんばんは",
    "ありがとう",
    "ありがとうございます",
    "よろしく",
    "よろしくお願いします",
    "はじめまして",
  ];

  return greetings.some((greeting) => normalized === greeting);
}

function detectKeywordCategories(message) {
  const query = normalizeText(message);
  return Object.entries(keywordCategories)
    .filter(([, keywords]) => keywords.some((keyword) => query.includes(normalizeText(keyword))))
    .map(([category]) => category);
}

function buildKeywordReply(categories) {
  const primaryCategory = categories[0];
  return keywordReplies[primaryCategory] || fallbackTravelReply();
}

function logSuggestionDebug({ mode, categories, usedGemini, fallback, spotCount }) {
  console.log("AI Makoto suggestion debug", {
    mode,
    categories,
    usedGemini,
    fallback,
    spotCount,
  });
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[!！?？。、,.…\s]/g, "");
}

function pickSpots(message, spotList, categories = []) {
  const query = message.toLowerCase();
  const rankedSpots = spotList
    .map((spot) => ({ spot, score: scoreSpot(query, spot, categories) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.spot);

  const defaultSpots = spotList
    .filter((spot) => spot.noCarFriendly || spot.area.includes("ワイキキ"))
    .slice(0, 4);

  if (rankedSpots.length === 0) return defaultSpots;
  if (rankedSpots.length >= 3) return rankedSpots;

  const rankedNames = new Set(rankedSpots.map((spot) => spot.name));
  return [
    ...rankedSpots,
    ...defaultSpots.filter((spot) => !rankedNames.has(spot.name)),
  ].slice(0, 4);
}

function scoreSpot(query, spot, categories = []) {
  let score = 0;
  const joined = [
    spot.name,
    spot.area,
    spot.genre,
    spot.transport,
    spot.duration,
    spot.makotoComment,
    spot.caution,
    ...(spot.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  categories.forEach((category) => {
    const keywords = keywordCategories[category] || [];
    const normalizedJoined = normalizeText(joined);
    if (keywords.some((keyword) => normalizedJoined.includes(normalizeText(keyword)))) score += 7;
    if ((spot.tags || []).some((tag) => String(tag) === category)) score += 8;
    if (category === "ごはん" && /食事|レストラン|カフェ|ポケ|フード/.test(joined)) score += 8;
    if (category === "買い物" && /買い物|ショッピング|スーパー|モール/.test(joined)) score += 8;
    if (category === "ビーチ" && /ビーチ|海|サンセット/.test(joined)) score += 8;
    if (category === "観光" && /観光|景色|公園|名所/.test(joined)) score += 6;
    if (category === "散歩" && /散歩|徒歩|公園|景色/.test(joined)) score += 7;
    if (category === "雨の日" && spot.rainFriendly) score += 10;
    if (category === "レンタカーなし" && spot.noCarFriendly) score += 10;
    if (category === "初日" && (spot.noCarFriendly || spot.area.includes("ワイキキ"))) score += 8;
    if (category === "朝" && /朝食|カフェ|散歩|公園/.test(joined)) score += 6;
    if (category === "夜" && /ディナー|夜|夕方|サンセット|レストラン/.test(joined)) score += 6;
    if (category === "子連れ" && /子連れ|家族|キッズ|公園/.test(joined)) score += 8;
    if (category === "ワイキキ周辺" && spot.area.includes("ワイキキ")) score += 10;
    if (category === "アラモアナ方面" && /アラモアナ|カカアコ|ドンキ|ウォルマート/.test(joined)) score += 10;
    if (category === "ハワイイ!?紹介スポット" && spot.featuredByHawaii) score += 10;
  });

  const keywordGroups = [
    ["初日", "到着", "午後", "無理なく"],
    ["ごはん", "食事", "ランチ", "ディナー", "朝食", "カフェ", "お腹", "腹", "おなか", "食べ", "レストラン"],
    ["買い物", "ショッピング", "お土産"],
    ["ハワイイ", "紹介", "動画"],
    ["レンタカーなし", "車なし", "徒歩", "バス", "トロリー"],
    ["雨", "雨の日", "屋内"],
    ["子連れ", "家族", "キッズ"],
    ["夫婦", "カップル"],
    ["安い", "予算", "節約"],
    ["おすすめ", "オススメ", "どこ", "場所", "スポット", "候補"],
  ];

  keywordGroups.flat().forEach((keyword) => {
    if (query.includes(keyword) && joined.includes(keyword)) score += 3;
  });

  (spot.tags || []).forEach((tag) => {
    if (query.includes(String(tag).toLowerCase())) score += 4;
  });

  if (query.includes("ワイキキ") && spot.area.includes("ワイキキ")) score += 4;
  if (query.includes("ハワイイ") && spot.featuredByHawaii) score += 5;
  if ((query.includes("レンタカーなし") || query.includes("車なし")) && spot.noCarFriendly) score += 5;
  if ((query.includes("雨") || query.includes("屋内")) && spot.rainFriendly) score += 5;
  if ((query.includes("お腹") || query.includes("おなか") || query.includes("腹") || query.includes("食べ")) && joined.includes("食事")) score += 6;

  return score;
}

function toPromptSpot(spot) {
  return {
    name: spot.name,
    area: spot.area,
    genre: spot.genre,
    transport: spot.transport,
    duration: spot.duration,
    makotoComment: spot.makotoComment,
    caution: spot.caution,
  };
}

function fallbackTravelReply() {
  return "いいですね〜！😆\nワイキキ滞在なら、移動に無理が出ない場所から選ぶのがおすすめです。\n下に候補スポットを出しておきますねーーーっ🌴";
}

function resizeComposer() {
  userInput.style.height = "auto";
  userInput.style.height = `${Math.min(userInput.scrollHeight, 140)}px`;
}

function scrollToLatest() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}
