# ADR-0004: GitHub Pages は Actions デプロイで src/ を公開する

- **ステータス**: accepted
- **コンテキスト**: 完全無料・新規サービス登録なしで公開する。リポジトリには docs/(ロール成果物)や .github/ など公開すべきでないファイルが多数あり、公開範囲を src/ に限定したい
- **決定ドライバー**: 公開範囲の限定、URL の綺麗さ、既存の無人ループ(Actions)との整合、無料維持
- **検討した選択肢**:
  - 案A: Pages ソース = main ブランチのルート — 利点: 設定のみで済む / 欠点: docs/ 等リポジトリ全体が公開される。アプリURLが /src/ 付きになる
  - 案B: Pages ソース = main の /docs フォルダ — 利点: 設定のみ / 欠点: docs/ はロール成果物置き場(規約§2)であり用途が衝突。採用不可
  - 案C: GitHub Actions デプロイ(actions/upload-pages-artifact で src/ のみを成果物化 → actions/deploy-pages) — 利点: 公開範囲が src/ に限定され、URL 直下がアプリになる。公式アクションのみ・無料・追加登録なし / 欠点: ワークフローファイルが1つ増える
- **決定**: 案C。main への push(src/ 変更時)で自動デプロイする。Pages の有効化(Source: GitHub Actions)は人間の1回操作が必要になる場合があるが、gh api でも設定可能
- **帰結**: 公開URLは `https://itera-1601.github.io/my-app/` 直下 / docs/ 成果物は公開されない / 無人ループのマージ→デプロイが自動連鎖する
