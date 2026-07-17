---handoff---
from: engineer-design
to: engineer-review
type: deliverable
iteration: 1
status: ready
open_issues: none
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: docs/pm-requirements/requirements.md (v1.1), docs/designer-ui/spec-warikan.md (v2)
outputs: docs/engineer-design/design-warikan.md, docs/engineer-design/adr/README.md, docs/engineer-design/adr/app/ADR-0001-three-file-esm-structure.md, docs/engineer-design/adr/app/ADR-0002-integer-ratio-rounding.md, docs/engineer-design/adr/app/ADR-0003-node-builtin-test-runner.md, docs/engineer-design/adr/infra/ADR-0004-pages-actions-deploy.md
---

# 設計: 割り勘計算機(warikan)

## 背景と要件(前提の要約)

要件 v1.1(REQ-001〜005)・UI仕様 v2(designer-review承認済み)に基づく。制約: 静的Web / 実行時依存ゼロ(外部通信一切なし)/ GitHub Pages 配信 / 新規サービス登録なし / 1画面。設計の寿命: パイプライン検証用だが、成果物として公開・維持するため使い捨てではない(過剰設計はしない)。

## 設計方針

**純粋ロジックとDOMの分離だけを行う最小構成。** フレームワーク・ビルドツール・ランタイム依存はゼロ。計算ロジックを単独モジュールに隔離し、Node内蔵ランナーで単体テスト可能にする(無人実装ループの「テストを実行して確認」を成立させるため)。

## 決定記録(ADR)

各ADRは `adr/` 配下の個別ファイル(規約§4)。索引は `adr/README.md`。

- ADR-0001: ソースは3ファイル構成(index.html + app.js + warikan.js)の ESM とする — proposed
- ADR-0002: 丸め計算は整数比に対する ceil/floor で行う — proposed
- ADR-0003: テストは Node 内蔵ランナー(node:test)で行う — proposed
- ADR-0004: GitHub Pages は Actions デプロイで src/ を公開する — proposed

## インターフェース・データ構造(シグネチャレベル)

```
src/
├── index.html      # マークアップ+CSS埋め込み(UI仕様v2のモック構造に準拠)
├── app.js          # DOM結線。入力読み取り→validate→calc→描画
└── warikan.js      # 純粋ロジック(DOM非依存)
test/
└── warikan.test.js # node:test による単体テスト
package.json        # {"type": "module", "private": true} のみ。dependencies なし
```

```js
// warikan.js(擬似シグネチャ)
export function validate(totalRaw, peopleRaw)
// 引数: フォーム生文字列。返値: { state: 'empty' } | { state: 'invalid', errors: ['total'|'people', ...] }
//       | { state: 'valid', total: number, people: number }
// 判定優先順位はUI仕様v2「いずれか空→empty > 値不正→invalid > valid」に従う
// total: 1..9_999_999 の整数 / people: 2..99 の整数(REQ-001-1, REQ-004 v1.1)

export function calc(total, people, unit, direction)
// unit: 1|10|100|500|1000, direction: 'ceil'|'floor'
// 返値: { perPerson, collected, diff }
//   perPerson = (direction==='ceil' ? Math.ceil : Math.floor)(total / (people * unit)) * unit  // ADR-0002
//   collected = perPerson * people
//   diff      = collected - total   // 正=余る / 負=幹事負担 / 0=ぴったり(REQ-003)
```

```js
// app.js(処理フロー擬似コード)
// 1. DOM参照を取得(金額・人数・単位radio群・方向radio群・結果カード)
// 2. 全入力要素の input/change で render() を呼ぶ
// 3. render(): validate() → state に応じて結果カードを 案内/エラー/結果 のいずれかに全置換
//    (古い結果を残さない: REQ-004-3)
// 4. 金額表示は toLocaleString('ja-JP') で3桁区切り(UI仕様の表示例に一致)
```

- セグメントは `<input type="radio">`(name=unit / name=direction)+ label で実装する(UI仕様の申し送り: 選択状態のプログラム的判別、キーボード対応が checked で自動的に満たされるため)
- HTMLの数値入力は `type="text" inputmode="numeric"`(type=number は端末により先頭0や e 記法の挙動差があるため、検証は validate() に一元化)

## 実装ロールへの申し送り(実装順序の提案)

無人実装ループのタスク分割(pm-prioritization への提案):

1. **T1 (P0)**: warikan.js(validate/calc)+ test/warikan.test.js + package.json。完了条件は要件の数値例がテストで通ること
2. **T2 (P1, Blocked by T1)**: index.html + app.js(UI仕様v2準拠)。完了条件はUI仕様の3状態+文言+44pxターゲット
3. **T3 (P2, Blocked by T2)**: `.github/workflows/deploy-pages.yml`(ADR-0004)。完了条件はデプロイ成功。トリガーは `push`(paths: `src/**` と当該ワークフロー自身)+ `workflow_dispatch` の併用とし、ワークフロー追加コミット自体で初回デプロイが発火するようにする(should-1対応)。**前提**: Pages の有効化(Source: GitHub Actions)は無人ループの権限外のため、T3起票前に orchestrator がローカルの `gh api`(管理者権限)で実施しておく(should-2対応)

注意点:
- 外部リソース参照(CDN・フォント・アイコン)を1つも入れないこと(REQ-005-3)
- validate は生文字列を受ける設計のため、`Number()` 変換・整数判定・範囲判定をロジック側で行い、DOM側で事前加工しない(テスト可能性の確保)
- 丸め計算の数値例(要件REQ-002/003の例)をそのままテストケースにすること

## 残論点(未決事項)

なし

## 指摘への応答(engineer-review iteration 1)

- [should-1] 初回デプロイのトリガー → **採用**。T3にトリガー仕様(paths+workflow_dispatch)を明記
- [should-2] Pages有効化の責務 → **採用**。T3の前提として orchestrator のローカル gh api 実施を明記
- [nit-1] package.json の private → **採用**

## 改訂履歴

- v1.1 (2026-07-17): engineer-review iteration 1 の承認(must 0)を受け全ADRを accepted に更新。should/nit 3件を反映(上記応答表)
- v1 (2026-07-17): 初版。CP2/CP3 は autonomous モードのため事後ログ化(docs/orchestrator/cp-log.md)
