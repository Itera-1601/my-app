# 無人ループ運用ノート(orchestrator)

## ✅ 一時停止は2026-07-18 00:29 UTCに解消(下記手順で再開し、#16まで完走・ローンチ済み)

## claude[bot] はワークフローファイルをpushできない

GitHub App(claude[bot])のインストール権限に `workflows` が含まれないため、`.github/workflows/` 配下を変更するタスクは無人ループで処理不能(#16で発生。botは正しくブロック報告して終了した)。さらにワークフロー変更を含むPRは claude-code-action の版数検証によりAIレビューも不能。

- 対処: ワークフロー変更タスクは無人ループに投入せず、ローカルの engineer-implement / engineer-review で処理して直接pushする(例外運用として成果物に明記する)
- タスク分解時の教訓: pm-prioritization は「.github/workflows/ を触るタスク」をローカル実行枠としてラベル分けするとよい

## (履歴)一時停止(2026-07-17 14:41 UTC、人間の指示による)

停止時点の状態と再開手順:

- 完了: #14 計算ロジック(PR #17)/ #15 UI(PR #18)マージ済み。残: **#16 Pagesデプロイのみ**
- #16 は選定済み(in-progressラベルあり)だが実装runをキャンセルしたため**PRなしの中断状態**
- `PROJECT_MODE` リポジトリ変数は削除済み(自動マージ・自動修正は無効)

再開手順(この順で):
0. リポジトリをパブリックに戻す: `gh repo edit Itera-1601/my-app --visibility public --accept-visibility-change-consequences`(2026-07-17にプライベート化済み。FreeプランのPagesはパブリック限定のため、#16のデプロイ前に必須。Pages設定の再有効化も確認: `gh api repos/Itera-1601/my-app/pages` が404なら `gh api -X POST repos/Itera-1601/my-app/pages -f build_type=workflow`)
1. `gh variable set PROJECT_MODE --body autonomous --repo Itera-1601/my-app`
2. `gh issue edit 16 --repo Itera-1601/my-app --remove-label in-progress`
3. `gh workflow run "Claude Implement Next Task" --repo Itera-1601/my-app`
4. #16完了後: qa-test-execute(テスト計画 docs/qa-test-design/test-plan-v1.md のTC-012〜014は公開URL必要)→ 実装ゲート判定 → 完了報告

## mainのclaude系ワークフロー変更と開いているbot PR

claude-code-action は「実行時のワークフローファイルがデフォルトブランチと同一」であることを検証する。mainの `claude-*.yml` を変更すると、変更前に分岐した開いているbot PRの rework はスキップされる(2026-07-17 PR #17で発生)。

- 対処: `gh api -X PUT repos/Itera-1601/my-app/pulls/<N>/update-branch` でPRブランチをmainで更新する
- 恒久ガード: autonomous-rework に「修正pushなし検知」ステップを追加済み(commit 158fd99)。スキップ・push失敗時は needs-human ラベル+コメントでエスカレーションし、ジョブを失敗させる(サイレント停止の防止)

## AIレビューの判定ゆらぎ

同一コードに対して1回目 REQUEST_CHANGES(人数負数テスト欠落)→ 2回目 APPROVE となった事例あり(PR #17)。レビューは非決定的であり、境界的な指摘は通過しうる。深刻度の高い観点はissueの「レビュー観点」に明示的な承認条件として書くことで安定させる。
