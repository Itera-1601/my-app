---handoff---
from: pm-prioritization
to: pm-progress, orchestrator
type: deliverable
iteration: 1
status: ready
open_issues: none
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: docs/pm-requirements/requirements.md (v1.1), docs/engineer-design/design-warikan.md (v1.1), docs/designer-ui/spec-warikan.md (v2)
outputs: docs/pm-prioritization/roadmap.md, GitHub issues #14 #15 #16
---

# 優先順位: 割り勘計算機 初回リリース

## 判断基準

技術依存(T1→T2→T3 の一方向依存。出所: 設計v1.1の実装への申し送り)が着手順を一意に決めるため、価値評価による並べ替えの余地はない。全タスクがリリース必須(どれを欠いても公開URLで動くアプリにならない)。

## 優先順位付きバックログ

### 1. #14 計算ロジック+テスト(P0)
- 価値: リリース必須(推定) / コスト: 1PT(推定) / リスク: 低(ADR-0002で式確定済み) / 依存: なし
- 理由: 全タスクの依存元。テスト基盤も兼ねる

### 2. #15 UI実装(P1)
- 価値: リリース必須(推定) / コスト: 1〜2PT(推定) / リスク: 低(UI仕様v2確定・モックあり) / 依存: #14
- 理由: ロジック確定後にのみ着手可能(import 先が必要)

### 3. #16 Pagesデプロイ(P2)
- 価値: リリース必須(推定。REQ-005-1の充足手段) / コスト: 1PT(推定) / リスク: 中(Pages有効化という無人ループ権限外の前提あり) / 依存: #15
- 理由: 公開物が揃ってからデプロイ。前提の Pages 有効化は orchestrator が起票後・実装前に実施する(設計v1.1 should-2 対応)

## 判断保留

なし

## 今回見送ったもの

なし(要件スコープ内の全タスクを起票。スコープ外機能は要件v1.1で除外済み)

## 前提と再検討トリガー

- 前提: 無人実装ループ(issue→PR→AIレビュー→自動マージ)が正常稼働していること(2026-07-17検証済み)
- 再検討トリガー: いずれかのissueで rework 上限到達(needs-human)/ Pages 有効化が不可能と判明した場合
