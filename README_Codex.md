# AIまこと プロトタイプ / Codex引き継ぎメモ

## プロジェクト概要

このリポジトリは、YouTubeチャンネル「ハワイイ!?」の旅行相談AI「AIまこと」のWebプロトタイプです。

ユーザーがハワイ旅行について質問すると、ワイキキ滞在を前提に、AIまことがハワイ旅行の過ごし方やスポットを提案する想定です。

## 現在の構成

- フロントエンド：HTML / CSS / JavaScript
- 公開環境：Vercel
- AI：Gemini API
- APIキー管理：Vercel Environment Variables
- スポットDB：spots.json
- サーバーAPI：api/chat.js

## 重要なセキュリティ方針

Gemini APIキーはコード内に直接書かないでください。

VercelのEnvironment Variablesに以下の名前で設定します。

```text
GEMINI_API_KEY
```

任意で以下も設定可能です。

```text
GEMINI_MODEL=gemini-2.5-flash
```

## ファイル構成

```text
.
├── index.html
├── style.css
├── script.js
├── spots.json
├── api/
│   └── chat.js
├── package.json
├── .env.example
├── README.txt
├── README_Codex.md
└── TASKS.md
```

## 現在できていること

- Vercelへのデプロイ
- Gemini API接続
- ワイキキ特化DBの読み込み
- ユーザー質問に対するAIまこと風の回答
- 回答待ち中の「考え中」表示
- URLの自動ハイパーリンク化

## 現在の問題点

- Geminiの回答が途中で切れることがある
- 回答が長くなりすぎることがある
- スポット紹介までGeminiに任せているため、表示が不安定
- スポットカード表示とAI回答文の役割分担がまだ不十分
- 挨拶だけの入力にも旅行提案を始めてしまう場合がある

## 次の修正方針

v10として、以下の方針で安定版にしたいです。

1. Geminiには短い案内文だけ作らせる
2. スポット一覧は `spots.json` からアプリ側でカード表示する
3. GeminiにはURLやスポット一覧を直接書かせない
4. 回答は350文字以内を目安にする
5. 挨拶だけの場合は短く自然に返す
6. 旅行相談の場合のみスポットカードを表示する
7. 回答待ち中は「考え中」表示を出し続ける
8. APIキーは環境変数 `GEMINI_API_KEY` のまま扱う

## Codexへの依頼文例

```text
このリポジトリは、ハワイ旅行専用AI「AIまこと」のプロトタイプです。

現在、Vercel上でGemini API接続はできていますが、回答が途中で切れる・長くなりすぎる・スポット表示が不安定という問題があります。

v10として、以下の方針で修正してください。

- Geminiには350文字以内の短い案内文だけ作らせる
- スポット一覧は spots.json からアプリ側でカード表示する
- GeminiにはURLやスポット一覧を直接書かせない
- 挨拶だけの場合は短く返す
- 旅行相談の場合のみスポットカードを表示する
- 回答待ち中は考え中表示を出し続ける
- APIキーは環境変数 GEMINI_API_KEY のまま扱う
- 既存のUIトーン、AIまことの口調はなるべく維持する
```

## デプロイ方法

Vercel CLIで以下を実行します。

```bash
npx vercel --prod
```

## 補足

`index.html` をローカルで直接開くと、`/api/chat` は動きません。  
Gemini API接続の確認はVercelにデプロイしてから行ってください。
