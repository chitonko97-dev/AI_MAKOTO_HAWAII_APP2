const openingScreen = document.querySelector("#openingScreen");
const chatScreen = document.querySelector("#chatScreen");
const startBtn = document.querySelector("#startBtn");
const backToOpening = document.querySelector("#backToOpening");
const chat = document.querySelector("#chat");
const userInput = document.querySelector("#userInput");
const sendBtn = document.querySelector("#sendBtn");

let spots = [];
let isSending = false;

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
userInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitMessage();
  }
});

sendBtn.addEventListener("click", submitMessage);

loadSpots();

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
      throw new Error(details || `API ${response.status}`);
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
    appendMessage(
      "bot",
      "すみません〜！🙇\nいま少しうまく回答できませんでした。\n少し時間をおいて、もう一度試してみてください〜！"
    );
  } finally {
    isSending = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
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
    actions.append(
      createActionLink("動画を見る", spot.videoUrl, "video-link"),
      createActionLink("Mapで開く", spot.mapUrl, "map-link")
    );

    card.append(title, meta, comment, caution, actions);
    list.append(card);
  });

  chat.append(list);
  scrollToLatest();
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
  return spotList
    .map((spot) => ({ spot, score: scoreSpot(query, spot) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.spot);
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
    ["ごはん", "食事", "ランチ", "ディナー", "朝食", "カフェ"],
    ["買い物", "ショッピング", "お土産"],
    ["ハワイイ", "紹介", "動画"],
    ["レンタカーなし", "車なし", "徒歩", "バス", "トロリー"],
    ["雨", "雨の日", "屋内"],
    ["子連れ", "家族", "キッズ"],
    ["夫婦", "カップル"],
    ["安い", "予算", "節約"],
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
