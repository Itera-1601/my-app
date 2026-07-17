# ADR 索引

分類はアプリ本体(`app/`)とビルド・配信基盤(`infra/`)の技術ドメインで切る(プロジェクト開始時決定。途中で機能別分類と混在させない)。

| 番号 | タイトル | 分類 | ステータス | 決定日 |
|---|---|---|---|---|
| ADR-0001 | ソースは3ファイル構成(index.html + app.js + warikan.js)の ESM とする | app | proposed | 2026-07-17 |
| ADR-0002 | 丸め計算は整数比に対する ceil/floor で行う | app | proposed | 2026-07-17 |
| ADR-0003 | テストは Node 内蔵ランナー(node:test)で行う | app | proposed | 2026-07-17 |
| ADR-0004 | GitHub Pages は Actions デプロイで src/ を公開する | infra | proposed | 2026-07-17 |
