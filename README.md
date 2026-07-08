# 天気予報アプリ

OpenWeatherMap API と連携した天気予報 Web アプリです。都市名検索または現在地から、気温・天気・湿度・降水確率を表示し、カレンダーで日付(当日〜4日後)を選んで予報を切り替えられます。

- フレームワーク: Next.js (App Router, TypeScript, Tailwind CSS)
- API: [OpenWeatherMap](https://openweathermap.org/api)(現在の天気 + 5日間/3時間ごと予報)
- デプロイ: Vercel

## セットアップ

```bash
npm install
```

`.env.local.example` を `.env.local` にコピーし、OpenWeatherMap の API キーを設定してください。

```bash
cp .env.local.example .env.local
```

```
OPENWEATHER_API_KEY=your_api_key_here
```

APIキーはコードに直書きせず、必ず環境変数で管理します。API へのリクエストはサーバー側の API Route (`src/app/api/weather/route.ts`) でのみ行われ、キーがクライアントに露出することはありません。

## 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて確認できます。

## 機能

- 都市名検索、または現在地(Geolocation API)からの天気取得
- 現在の気温・天気・湿度を表示
- カレンダーから当日〜4日後の日付を選択し、その日の最高/最低気温・湿度・降水確率・天気アイコンを表示

## デプロイ

Vercel にデプロイし、環境変数 `OPENWEATHER_API_KEY` を Vercel 側(Production / Preview / Development)に設定してください。

```bash
vercel link
vercel env add OPENWEATHER_API_KEY
vercel --prod
```
