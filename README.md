# README

これは「AIまこと」プロトタイプをCodexへ移管するためのパッケージです。

## 最初に読むファイル

1. README_Codex.md
2. TASKS.md

## 注意

Gemini APIキーはこのZIPには含まれていません。
APIキーはVercelのEnvironment Variablesで管理してください。

必要な環境変数：

```text
GEMINI_API_KEY
```

任意：

```text
GEMINI_MODEL=gemini-2.5-flash
```

## デプロイ

```bash
npx vercel --prod
```

## iOSアプリ版

iOS版はCapacitorで既存のWeb画面を包む構成です。API通信はVercelの公開APIを利用します。

1. Mac App StoreからXcodeをインストールする
2. `npm install` を実行する
3. 初回だけ `npm run ios:add` を実行する
4. 変更時は `npm run ios:prepare` を実行する
5. `npm run ios:open` でXcodeを開く

App Store提出にはApple Developer Programへの登録が必要です。APIキーはiOSアプリ内に入れず、これまでどおりVercelの環境変数で管理します。
