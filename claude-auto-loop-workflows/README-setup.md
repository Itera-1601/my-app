# Claude 自動実装ループ セットアップガイド

pm-prioritization が起票したissueを、「1件実装 → ダブルレビュー → approve → マージ → 次を自動開始」のループで回すためのGitHub Actions一式。

## 全体の流れ

```
pm-prioritization がissue起票(P0/P1/P2ラベル + Blocked by 記載)
        ↓
[claude-implement-next.yml] Ready最優先の1件を選定 → in-progress ラベル付与 → 実装 → PR作成(Closes #N)
        ↓
[claude-pr-review.yml] AIレビュー(engineer-review相当)がPRコメントで判定
        ↓
あなたのレビュー → 要修正なら「@claude 指摘を修正して」[claude.yml が対応]
        ↓
あなたが approve → マージ → issueが自動close
        ↓
[claude-implement-next.yml] マージをフックに再発火 → 次のReady最優先1件へ(先頭に戻る)
```

WIP上限1は「in-progress ラベルのissueが存在する間は次を選定しない」ことで保証。

## 初回セットアップ(1度だけ)

### 1. ファイル配置
`.github/workflows/` の3ファイルをリポジトリのデフォルトブランチにコミットする。

### 2. Claude GitHub App + APIキー
リポジトリのあるディレクトリで Claude Code を開き:
```
/install-github-app
```
を実行(リポジトリ管理者権限が必要)。GitHub Appのインストールと
`ANTHROPIC_API_KEY` のSecrets登録まで対話的に完了する。
※手動でやる場合: github.com/apps/claude をインストールし、
  Settings → Secrets and variables → Actions に `ANTHROPIC_API_KEY` を追加。

### 3. ラベル作成
```
gh label create P0 --color d73a4a --description "最優先"
gh label create P1 --color fbca04 --description "高"
gh label create P2 --color 0e8a16 --description "中"
gh label create in-progress --color 1d76db --description "実装中(WIP=1の管理用)"
gh label create bug --color d73a4a --description "バグ(qa-bug-management管理)"
gh label create S1 --color b60205 --description "深刻度: データ損失/セキュリティ/全停止"
gh label create S2 --color d93f0b --description "深刻度: 主要機能不全・回避策なし"
gh label create S3 --color fbca04 --description "深刻度: 回避策あり"
gh label create S4 --color c2e0c6 --description "深刻度: 軽微"
```

### 4. ブランチ保護(重要)
Settings → Branches → デフォルトブランチに保護ルールを追加:
- ✅ Require a pull request before merging
- ✅ Require approvals: 1

これで**あなたのapproveなしにマージされることがなくなる** = 人間チェックポイントの物理的な保証。
AIレビューはコメントとして参考情報になり、close条件の「ダブルapprove」は
「AIレビューの approve 相当判定 + あなたのapprove」で運用する。

### 5. GitHub Projects(カンバン)
1. リポジトリの Projects で新規ボード作成、列を Backlog / Ready / In Progress / In Review / Done にする
2. Projectの Workflows(ボード右上の…メニュー)で標準自動化をON:
   - Item added → Backlog
   - Pull request merged / Issue closed → Done
3. Ready/In Progress/In Review への移動は当面は目視+手動でOK
   (自動化の実体はラベルと着手順選定ロジックが担っており、ボードは可視化用)

## 運用

- **キックオフ**: 全issue起票後、Actions タブ → "Claude Implement Next Task" → Run workflow で初回を手動起動
- **差し戻し**: PRに「@claude レビュー指摘の◯◯を修正して」とコメント
- **緊急停止**: Actions タブでワークフローを Disable するか、対象issueの in-progress ラベルを付けたままにする
- **順序変更**: issueのP0/P1/P2ラベルを付け替える(判断は pm-prioritization ロールを通す)

## 注意事項

- Actions経由のClaude利用も通常のClaudeサブスクリプション/API利用枠から消費される
- パブリックリポジトリの場合、フォークからのPRで @claude が動かないのは仕様(書き込み権限のあるユーザーのみトリガー可能)。悪用防止のため変更しないこと
- 選定ロジックはissue本文の `Blocked by: #N` 表記に依存する。pm-prioritization のissueテンプレートの形式を崩さないこと

## プロジェクトモード切替(supervised / autonomous)

既定は supervised(あなたのapprove必須)。量産プロジェクトでAIに任せ切る場合:

```
# autonomous に切替
gh variable set PROJECT_MODE --body autonomous
gh label create needs-human --color b60205 --description "自動ループ停止・人間判断待ち"
```

さらにブランチ保護の Require approvals を**外す**(付けたままだと自動マージが止まる)。
supervised に戻すには `gh variable set PROJECT_MODE --body supervised` + approvals復活。

autonomous での動き:
- AIレビューが `VERDICT: APPROVE` → 自動squashマージ → 次タスク自動開始
- `VERDICT: REQUEST_CHANGES` → Claudeが自動修正 → 再レビュー(このループ上限3回)
- 3回超え or escalate-to-human → `needs-human` ラベルで停止し、あなたの判断待ち
