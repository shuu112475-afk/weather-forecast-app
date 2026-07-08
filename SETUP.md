# 天気予報アプリ 構築手順書

## 概要
OpenWeatherMap API と連携した天気予報 Web アプリ。
都市名検索または現在地から、気温・天気・湿度・降水確率を表示し、
カレンダーで日付(当日〜4日後)を選んで予報を切り替えられる。

- フレームワーク: Next.js (App Router, TypeScript)
- API: OpenWeatherMap
  - 現在の天気: `/data/2.5/weather`
  - 5日間/3時間ごと予報: `/data/2.5/forecast`(降水確率 `pop` を含む、無料枠で利用可)
- デプロイ: Vercel
- ソース管理: GitHub

## 手順

### 1. OpenWeatherMap APIキー取得
1. https://openweathermap.org/api で無料アカウント登録
2. マイページの「API keys」タブでデフォルトキーを取得
3. 発行直後は有効化まで時間がかかる場合がある

### 2. プロジェクト作成
- `create-next-app` で TypeScript / App Router / Tailwind 構成を作成

### 3. 実装
- `app/api/weather/route.ts`: サーバー側でOpenWeatherMap APIを呼び出すAPI Route(APIキーはここでのみ使用し、クライアントに露出させない)
  - クエリパラメータ: `city` または `lat`/`lon`
  - 現在天気 + 5日間予報(3時間ごと)を取得し、日付ごとに集約して返す
- `app/page.tsx`: クライアントコンポーネント
  - 都市名入力フォーム + 現在地取得ボタン
  - カレンダー(当日から4日後まで選択可能な日付ピッカー)
  - 選択日の気温・天気・湿度・降水確率を表示
- `.env.local`: `OPENWEATHER_API_KEY=xxxx` を設定(`.gitignore` 対象、コードに直書きしない)

### 4. ローカル動作確認
- `npm run dev` で起動し、都市検索・現在地取得・日付切り替えを確認

### 5. GitHub リポジトリ作成
- `gh repo create` でリポジトリ作成し、初回コミットをpush

### 6. Vercel デプロイ
- `vercel link` でプロジェクトを連携
- `vercel env add OPENWEATHER_API_KEY production/preview/development` で環境変数を設定
- `vercel --prod` で本番デプロイ

### 7. 最終確認
- デプロイ済みURLにアクセスし、実機で都市検索・現在地・カレンダー切り替え・気温/天気/湿度/降水確率表示を確認
