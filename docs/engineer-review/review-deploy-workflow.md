---handoff---
from: engineer-review
to: engineer-implement
type: deliverable
iteration: 1
status: ready
open_issues: none
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: .github/workflows/deploy-pages.yml, docs/engineer-design/adr/infra/ADR-0004-pages-actions-deploy.md, issue #16
outputs: docs/engineer-review/review-deploy-workflow.md
---

# レビュー: deploy-pages.yml (iteration 1)

## 判定: **承認**(must 0件)

※ このタスクは claude[bot] の GitHub App 権限に `workflows` が含まれない制約により無人ループで処理不能(issue #16 のbot報告参照)。engineer-implement / engineer-review をローカル実行し、mainへ直接pushする例外運用(経緯は docs/orchestrator/ops-notes.md)。

## issue #16 レビュー観点の照合

1. 公開対象が src/ のみか — ✅ `upload-pages-artifact` の `path: src`。docs/ や .github/ は成果物に含まれない
2. トリガー構成 — ✅ push(paths: `src/**` + ワークフロー自身)+ workflow_dispatch。追加コミット自体で初回デプロイが発火する
3. 既存 claude-*.yml への変更 — ✅ なし(新規ファイルのみ)
4. サードパーティアクション — ✅ なし(actions/checkout@v4, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v4 の公式のみ)

ADR-0004(accepted)との整合、permissions(pages/id-token)・concurrency の設計指示も確認済み。

## 維持すべき良い判断

- paths にワークフロー自身を含め、初回デプロイ問題(設計レビュー should-1)を仕様どおり回避した点
