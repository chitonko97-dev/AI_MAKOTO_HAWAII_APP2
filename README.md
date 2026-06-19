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
