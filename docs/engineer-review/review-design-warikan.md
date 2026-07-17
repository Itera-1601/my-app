---handoff---
from: engineer-review
to: engineer-design
type: deliverable
iteration: 1
status: ready
open_issues: should-1, should-2(承認は妨げない。設計v1.1での反映を推奨)
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: docs/engineer-design/design-warikan.md, docs/engineer-design/adr/ (ADR-0001〜0004), docs/pm-requirements/requirements.md (v1.1), docs/designer-ui/spec-warikan.md (v2)
outputs: docs/engineer-review/review-design-warikan.md
---

# レビュー: warikan設計v1 + ADR-0001〜0004 (iteration 1)

## 判定: **承認**(must 0件, should 2件, nit 1件)

全ADRを `accepted` に更新すること。

## レビュー観点(今回重点的に見た範囲)

要件v1.1・UI仕様v2との整合(全REQ・全状態)/ ADRの選択肢比較の妥当性 / ADR-0002の数値正当性 / 依存ゼロ・静的Web制約への適合 / 無人実装ループでのタスク分割可能性。

## 検証結果(要点)

- ADR-0002 の式を要件の全数値例で机上検証: 10000円・3人・100円・切り上げ → ceil(10000/300)×100=3400 ✓ / 1円・切り捨て → floor(10000/3)=3333 ✓ / 10000円・4人 → 2500 ✓。精度の論証(分母≤99,000・分子≤9,999,999で商の整数近傍誤差が1/分母≫ulp)も妥当
- validate() の状態優先順位(empty > invalid > valid)はUI仕様v2の判定優先順位と一致 ✓
- radio採用は designer-ui の申し送り(checked による選択状態のプログラム的判別)を自動的に満たす ✓
- 3タスク分割(T1→T2→T3)は既存の無人ループのissue形式(Blocked by)に適合 ✓

## 指摘

### [should-1] 初回デプロイのトリガー欠落の可能性

- 該当箇所: design-warikan.md 実装への申し送りT3 / ADR-0004
- 問題: デプロイのトリガーを「main への push(src/ 変更時)」とすると、T3(ワークフローファイル追加)のコミット自体は src/ を変更しないため、paths フィルタ次第で初回デプロイが一度も発火しない
- 根拠: GitHub Actions の paths フィルタ仕様
- 承認条件(v1.1反映): workflow_dispatch の併用、または paths にワークフロー自身を含める旨をT3の完了条件に明記

### [should-2] Pages有効化の実施責務が未割り当て

- 該当箇所: ADR-0004 帰結
- 問題: 「Source: GitHub Actions の有効化は人間の1回操作が必要になる場合がある。gh api でも設定可能」とあるが、誰がいつやるかが工程に載っていない。無人ループはリポジトリ設定を変更できない(GITHUB_TOKENの権限外)ため、放置するとT3が成功してもサイトが公開されない
- 根拠: REQ-005-1(公開URLで動作)/ Pages API は管理者権限が必要
- 承認条件(v1.1反映): T3の完了条件または orchestrator の工程に「Pages有効化(ローカルの gh api、管理者権限)」を明記

### [nit-1] package.json に private フィールドがない

- 該当箇所: 設計のファイル構成
- 問題: `{"type": "module"}` のみだと誤 npm publish の理論上の余地がある。`"private": true` の併記が慣行
- 根拠: npm の慣行(好みの範囲)

## 維持すべき良い判断

- ADR-0002 で除算を1回に減らして誤差論証を単純化した点。「実装者は式を分解しないこと」と蒸し返し防止まで書いてあり、無人実装ループでの意図しない「改善」を防げる
- テスト方式(node:test)を依存ゼロで成立させ、無人ループの完了条件と接続した点
