# 無人ループ運用ノート(orchestrator)

## mainのclaude系ワークフロー変更と開いているbot PR

claude-code-action は「実行時のワークフローファイルがデフォルトブランチと同一」であることを検証する。mainの `claude-*.yml` を変更すると、変更前に分岐した開いているbot PRの rework はスキップされる(2026-07-17 PR #17で発生)。

- 対処: `gh api -X PUT repos/Itera-1601/my-app/pulls/<N>/update-branch` でPRブランチをmainで更新する
- 恒久ガード: autonomous-rework に「修正pushなし検知」ステップを追加済み(commit 158fd99)。スキップ・push失敗時は needs-human ラベル+コメントでエスカレーションし、ジョブを失敗させる(サイレント停止の防止)

## AIレビューの判定ゆらぎ

同一コードに対して1回目 REQUEST_CHANGES(人数負数テスト欠落)→ 2回目 APPROVE となった事例あり(PR #17)。レビューは非決定的であり、境界的な指摘は通過しうる。深刻度の高い観点はissueの「レビュー観点」に明示的な承認条件として書くことで安定させる。
