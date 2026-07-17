# ADR-0003: テストは Node 内蔵ランナー(node:test)で行う

- **ステータス**: proposed
- **コンテキスト**: 無人実装ループの完了条件に「テスト実行」があり、QA工程(qa-test-execute)も機械実行可能な検証手段を必要とする。一方プロジェクト制約は依存ゼロ
- **決定ドライバー**: 依存ゼロ制約、無人ループでの実行可能性(npm install 不要)、十分なアサーション機能
- **検討した選択肢**:
  - 案A: Jest / Vitest — 利点: 機能豊富 / 欠点: devDependencies のインストールが必要。依存ゼロ方針に反し、この規模に過剰
  - 案B: Node 内蔵の node:test + node:assert — 利点: `node --test` だけで動く。インストール不要、CI・ローカル・無人ループのどこでも同一 / 欠点: watch やカバレッジ等の便利機能が薄い(この規模では不要)
  - 案C: テストなし(手動確認のみ) — 利点: 最小 / 欠点: 無人ループの完了条件・QAゲートが成立しない
- **決定**: 案B。`package.json` は `{"type": "module"}` のみ(dependencies なし)とし、`node --test` で test/ 配下を実行する
- **帰結**: テスト対象は warikan.js(純粋ロジック)のみ。DOM(app.js)の自動テストは持たず、UI検証は qa-test-execute の手動手順とする(ADR-0001 の分離が前提)
