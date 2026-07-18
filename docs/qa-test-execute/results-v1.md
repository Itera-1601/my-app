---handoff---
from: qa-test-execute
to: orchestrator, qa-bug-management
type: deliverable
iteration: 1
status: ready
open_issues: ブラウザ実機での操作確認(TC-002/013の体感部分)は人間の受け入れ確認に委ねる(下記スキップ理由参照)
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: docs/qa-test-design/test-plan-v1.md, https://itera-1601.github.io/my-app/ (commit 9b6d4fd, deploy run 29624594015)
outputs: docs/qa-test-execute/results-v1.md
---

# テスト実行レポート: 割り勘計算機 (commit 9b6d4fd / 公開URL https://itera-1601.github.io/my-app/)

## サマリ: 合格 12 / 不合格 0 / 実行不能 0 / スキップ 2(全14件)

| TC | 結果 | 実行手段(対応付けの記録) |
|---|---|---|
| TC-001 | 合格 | validate('10000','4')→valid + calc 実行(node)。UI結線は TC-004/012 の実ページ検査で確認 |
| TC-002 | **スキップ** | 「1秒以内の更新」の体感計測はブラウザ操作環境がなく未実施。コード検査では input/change イベントで同期再計算(非同期処理なし)であることを確認(解釈: 事実上1秒以内だが、計画の手順どおりの操作実測ではないためスキップ扱い) |
| TC-003 | 合格 | calc(10000,4,100,'ceil') = 2500円 / diff 0(ぴったり) |
| TC-004 | 合格 | 公開ページのHTML検査: unit radio 5択(1/10/100/500/1000)で100にchecked、direction radio 2択でceil(切り上げ)にchecked |
| TC-005 | 合格 | calc(10000,3,100,'ceil') = 3400 / 10200 / +200 |
| TC-006 | 合格 | calc(10000,3,1,'floor') = 3333 / 9999 / −1(幹事負担) |
| TC-007 | 合格 | validate で 0 / −100 / 3.5 / abc / 人数1 / 人数0 / 人数2.5 の7パターン全て invalid |
| TC-008 | 合格 | validate('','') と validate('10000','') が empty(エラーでなく案内)。案内文言「金額と人数を入れると結果が出ます」が公開ページに存在 |
| TC-009 | 合格 | app.js のコード検査: render() が結果カードを毎回全置換し状態別に描画(古い結果のDOM残留経路なし)。ロジック面は TC-007/008 で確認 |
| TC-010 | 合格 | validate (1,2) / (9999999,99) → valid |
| TC-011 | 合格 | validate 金額10000000 / 人数100 → invalid |
| TC-012 | 合格 | 公開URLが HTTP 200、タイトル「割り勘計算機」。インストール・登録なし(静的配信) |
| TC-013 | **スキップ** | 375px実機操作は未実施。検査では viewport meta あり・max-width 480px 中央寄せ・固定幅なしを確認(解釈: 横スクロール要因は見当たらないが、計画の手順どおりの操作ではないためスキップ扱い) |
| TC-014 | 合格 | 公開中の index.html / app.js / warikan.js の全文から外部URL参照を検索し **0件**(自ドメイン以外への参照なし) |

補助エビデンス: リポジトリの `node --test` 21件全合格(実装付属テスト)。

## 不合格一覧

なし(バグ報告 0件)

## 実行不能・スキップ一覧

- TC-002 / TC-013: ブラウザ実機操作環境がないため、操作実測部分をスキップ。コード・HTML検査による傍証は上表のとおり。**人間がスマホで公開URLを開いて数タップ確認すれば完了する残作業**

## 探索的に発見した事項

なし(計画外の異常は観察されなかった)

## 環境情報

- 対象: commit 9b6d4fd / GitHub Pages デプロイ run 29624594015 / 実行日 2026-07-18
- 実行手段: node v系(ローカル)、curl による公開ページ取得・静的検査
