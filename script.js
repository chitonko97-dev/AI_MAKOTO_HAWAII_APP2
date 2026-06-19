const openingScreen = document.querySelector("#openingScreen");
const chatScreen = document.querySelector("#chatScreen");
const startBtn = document.querySelector("#startBtn");
const backToOpening = document.querySelector("#backToOpening");
const chat = document.querySelector("#chat");
const userInput = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");
const tabButtons = document.querySelectorAll("[data-tab]");
const tabPanels = document.querySelectorAll("[data-tab-panel]");
const wantList = document.querySelector("#wantList");
const genreFilters = document.querySelector("#genreFilters");
const mapGroups = document.querySelector("#mapGroups");
const dayGroups = document.querySelector("#dayGroups");
const makeShareText = document.querySelector("#makeShareText");
const copyShareText = document.querySelector("#copyShareText");
const shareText = document.querySelector("#shareText");

let spots = [];
let isSending = false;
let savedSpots = loadStoredValue("aiMakotoWantList", []);
let itinerary = loadStoredValue("aiMakotoItinerary", {
  day1: [],
  day2: [],
  day3: [],
});
let activeGenre = "all";

const greetingReply =
  "アロハー、AIまことです〜！😆\nハワイのことなら何でも聞いてくださいね〜！\n初日の過ごし方、ごはん、買い物、ハワイイ!?で紹介された場所など、気軽に相談してくださいーーーっ🌴";

const thinkingText =
  "AIまこと、考えています〜！\n少しだけ待っててくださいねーーーっ😆🌴";

startBtn.addEventListener("click", () => {
  openingScreen.classList.remove("active");
  chatScreen.classList.add("active");
  userInput.focus();
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

loadSpots();
renderSavedViews();

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

async function submitMessage() {
  const message = userInput.value.trim();
  if (!message || isSending) return;

  appendMessage("user", message);
  userInput.value = "";
  resizeComposer();

  if (isGreetingOnly(message)) {
    appendMessage("bot", greetingReply);
    return;
  }

  isSending = true;
  sendBtn.disabled = true;
  const thinkingRow = appendMessage("bot", thinkingText, { thinking: true });

  const selectedSpots = pickSpots(message, spots);

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
  } catch (error) {
    console.error("AIまことAPIエラー", error);
    thinkingRow.remove();
    appendMessage("bot", fallbackErrorReply(error));
    if (selectedSpots.length > 0) {
      appendSpotCards(selectedSpots);
    }
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
  if (tabName === "consult") userInput.focus();
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
  renderGenreFilters();
  renderMapGroups();
  renderItinerary();
}

function renderWantList() {
  wantList.innerHTML = "";
  if (savedSpots.length === 0) {
    wantList.append(createEmptyState("気になったスポットを保存すると、ここに一覧で表示されます。"));
    return;
  }

  savedSpots.forEach((spot) => {
    wantList.append(createSavedSpotCard(spot, { showDayButtons: true, showDelete: true }));
  });
}

function renderGenreFilters() {
  const filters = ["all", "ごはん", "買い物", "ビーチ", "観光", "休憩"];
  genreFilters.innerHTML = "";
  filters.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = activeGenre === filter ? "active" : "";
    button.textContent = filter === "all" ? "すべて" : filter;
    button.addEventListener("click", () => {
      activeGenre = filter;
      renderMapGroups();
      renderGenreFilters();
    });
    genreFilters.append(button);
  });
}

function renderMapGroups() {
  mapGroups.innerHTML = "";
  const filteredSpots = savedSpots.filter(matchesGenreFilter);

  if (filteredSpots.length === 0) {
    mapGroups.append(createEmptyState("保存したスポットが、エリア別にここへ表示されます。"));
    return;
  }

  const groups = groupByArea(filteredSpots);
  Object.entries(groups).forEach(([areaLabel, groupSpots]) => {
    const section = document.createElement("section");
    section.className = "area-group";
    const title = document.createElement("h3");
    title.textContent = areaLabel;
    const list = document.createElement("div");
    list.className = "saved-list compact-list";
    groupSpots.forEach((spot) => {
      list.append(createSavedSpotCard(spot, { compact: true }));
    });
    section.append(title, list);
    mapGroups.append(section);
  });
}

function renderItinerary() {
  dayGroups.innerHTML = "";
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
      dayButton.textContent = `DAY${index + 1}に追加`;
      dayButton.disabled = itinerary[dayKey]?.includes(spot.name);
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

function groupByArea(spotList) {
  const groups = {
    "ワイキキ周辺": [],
    "アラモアナ方面": [],
    "カイルア方面": [],
    "ノースショア方面": [],
    "その他": [],
  };

  spotList.forEach((spot) => {
    groups[getAreaGroup(spot.area)].push(spot);
  });

  return Object.fromEntries(Object.entries(groups).filter(([, groupSpots]) => groupSpots.length > 0));
}

function getAreaGroup(area) {
  if (area.includes("ワイキキ")) return "ワイキキ周辺";
  if (area.includes("アラモアナ")) return "アラモアナ方面";
  if (area.includes("カイルア")) return "カイルア方面";
  if (area.includes("ノース")) return "ノースショア方面";
  return "その他";
}

function matchesGenreFilter(spot) {
  if (activeGenre === "all") return true;
  const joined = [spot.name, spot.genre, spot.makotoComment, ...(spot.tags || [])].join(" ");
  const genreMap = {
    "ごはん": ["ごはん", "食事", "レストラン", "カフェ", "ポケ", "軽食"],
    "買い物": ["買い物", "ショッピング", "お土産"],
    "ビーチ": ["ビーチ", "散歩", "景色"],
    "観光": ["観光", "紹介", "動画", "水族館"],
    "休憩": ["休憩", "カフェ", "公園", "散歩"],
  };
  return (genreMap[activeGenre] || [activeGenre]).some((keyword) => joined.includes(keyword));
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

function pickSpots(message, spotList) {
  const query = message.toLowerCase();
  const rankedSpots = spotList
    .map((spot) => ({ spot, score: scoreSpot(query, spot) }))
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

function scoreSpot(query, spot) {
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
