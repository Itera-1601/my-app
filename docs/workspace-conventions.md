# ワークスペース規約 (workspace-conventions)

全ロール共通の成果物配置・履歴管理ルール。スキル本体(SKILL.md)とは独立したプロジェクト側の規約であり、orchestrator がキックオフ時に全ロールへ周知する。

---

## 1. スキル置き場と成果物置き場の分離

**原則: スキルはマスター(読み取り専用)、成果物は必ずプロジェクトワークスペース配下。**

```
[スキルマスター]                     [プロジェクトワークスペース]
~/skills/ または Claude設定内         人間が指定するパス(例: ~/projects/earopen/)
  ├── orchestrator/                    ├── docs/        ← 全ロールの成果物ルート
  ├── pm-requirements/                 ├── src/         ← アプリ本体
  └── ...(33+ロール)                   ├── .github/
                                       └── .git
```

- **ワークスペースのパスは人間がキックオフ時に指定する。** orchestrator は開始時の必須確認事項として「ワークスペースルートのパス」を人間に確認し、未指定なら作業を開始しない
- 各ロールはスキルディレクトリ配下・カレントディレクトリ直下など、ワークスペース外への出力を禁止する
- ワークスペースのパスは handoff で下流に伝搬する(後述のヘッダ拡張)

## 2. ロール別成果物ディレクトリ

成果物は `<workspace>/docs/<ロール名>/` 配下に置く。ロール名 = スキル名(ディレクトリ名の揺れを禁止)。

```
docs/
├── pm-requirements/
│   └── requirements.md
├── engineer-design/
│   ├── design-audio-unlock.md        # 設計ドキュメント本文(ADRへの参照のみ持つ)
│   └── adr/                          # 詳細は §4
│       ├── README.md                 # ADR索引
│       ├── auth/
│       │   └── ADR-0001-clerk-session-auth.md
│       └── audio/
│           └── ADR-0002-chunk-offsets-in-db.md
├── designer-ui/
│   ├── spec-listening-screen.md
│   └── mockups/                      # 詳細は §5
│       ├── flow.mermaid
│       ├── listening-main.html
│       └── listening-empty-state.html
├── pm-prioritization/
│   ├── roadmap.md
│   └── issues/                       # 起票前のissue下書き(起票後はGitHubが正)
├── qa-test-design/
│   └── test-plan-v1.md
└── ...(他ロールも同様)
```

- 1ロールが複数機能を扱う場合はファイル名に機能スラッグを含める(`design-<feature>.md`)。ファイル数が10を超えたら機能サブディレクトリを切ってよい
- `src/` は engineer-implement の専有領域。docs 配下のロールは src を変更しない

## 3. 履歴管理: 「編集禁止・新規作成」vs「git管理」

### メリデメ比較

| 観点 | A: 編集禁止+新規ファイル(v1, v2...) | B: git管理(同一ファイルを更新) |
|---|---|---|
| 履歴の追跡 | ○ ファイル名で世代が見える | ◎ diff/blame/log で変更理由まで追える |
| 依存関係の明示 | △ 手動でマニフェスト管理(安いモデルほど記載漏れが起きる) | ○ commit単位で「何と一緒に変わったか」が残る |
| 「最新版」の一意性 | ✕ v3とv4が併存し、下流ロールが古い版を参照する事故が起きやすい | ◎ 常にHEADが正。参照ミスが構造的に起きない |
| ファイル数 | ✕ 往復のたびに増殖。33ロール×iteration3で爆発する | ◎ 増えない |
| 差分レビューのしやすさ | ✕ 2ファイルを人間が目視比較 | ◎ `git diff` 一発 |
| 改ざん不可能性 | ○ 規約で守れば物理的に旧版が残る | △ 規約次第(force push禁止などの運用が必要) |
| 環境依存 | ◎ gitがない環境でも成立 | △ git必須(ただしClaude Code環境では常に利用可) |
| 安いモデルでの運用 | ✕ バージョン管理・依存記載という追加作業が失敗点になる | ○ 「編集してcommit」だけ。作業が単純 |

### 結論(推奨): **B の git管理を採用。ただしADRのみAの不変ルールを維持するハイブリッド。**

理由:
1. あなたのループは既にGitHub(issue/PR/Actions)を軸に回っており、成果物だけファイル増殖方式にすると管理系が二重になる
2. 「別ラベルで禁止行為を実行する」型の失敗と同じで、A方式は安いモデルに規律(依存記載・版数管理)を要求するほど破綻しやすい。B方式は守るべきことが「編集したらcommit」の1つで済む
3. ADRは engineer-design の既存ルール(書き換え禁止・superseded で新番号)がまさにA方式であり、意思決定の監査性はここで担保済み。全ファイルをAにする必要はない

### git運用ルール(全ロール共通)

1. **1 handoff = 1 commit**。成果物を下流に渡すタイミングでcommitする
2. commitメッセージ形式: `[ロール名] type: 一言サマリ (iteration N)`
   例: `[engineer-design] deliverable: 音声チャンク解放の設計 (iteration 2)`
3. docs/ 配下の履歴改変(amend, rebase, force push)を禁止する
4. **ADRファイルは一度commitしたら編集禁止**。ステータス変更(accepted等)のみ該当行の更新を許可し、決定内容の変更は superseded + 新ADRファイルで行う
5. 依存関係はhandoffヘッダの `inputs:` / `outputs:` で明示する(§6)

## 4. ADRルール: 1 ADR = 1 ファイル

- **1ファイルに複数のADRを書くことを禁止する**
- パス: `docs/engineer-design/adr/<分類>/ADR-NNNN-<slug>.md`
  - `NNNN`: プロジェクト全体の通し番号(4桁ゼロ埋め。ファイル分割後も再利用禁止は既存ルールどおり)
  - `<分類>`: 機能または技術ドメインのディレクトリ(例: `auth/` `audio/` `payment/` `infra/`)。どちらで切るかはプロジェクト開始時に engineer-design が決めて adr/README.md に明記し、途中で混在させない
  - `<slug>`: 決定内容の英語スラッグ(例: `clerk-session-auth`)
- `adr/README.md` を索引として維持する(新ADR追加のたびに1行追記):
  ```
  | 番号 | タイトル | 分類 | ステータス | 決定日 |
  ```
- 設計ドキュメント本文にはADR全文を書かず、`ADR-0002 参照` のようにパスで参照する
- ADR本文の構成(ステータス/コンテキスト/決定ドライバー/選択肢/決定/帰結)は engineer-design の既存形式を踏襲する

## 5. デザイン成果物: 静的モック必須

designer-ui の成果物に、テキスト仕様に加えて以下を**必須**とする:

1. **画面フロー図**: `docs/designer-ui/mockups/flow.mermaid`(遷移図)
2. **静的HTMLモック**: 主要画面ごとに1ファイル
   - パス: `docs/designer-ui/mockups/<画面スラッグ>.html`
   - 単一ファイル完結(CSS埋め込み、外部ビルド不要、ブラウザで開くだけで見える)
   - JSロジック不要。ダミーデータで見た目と情報の優先度が判断できる忠実度でよい(ハイファイ禁止ではないが、ワイヤーフレーム忠実度で十分)
   - 主要状態(空状態・エラー等)は同一ファイル内に縦に並べるか、`<画面>-<状態>.html` で分割
3. モックはレビュー(designer-review)と人間確認の対象。**テキスト仕様のみでのhandoffは差し戻し対象**とする
4. モックは仕様の視覚化であり実装ではない。engineer-implement はモックのHTMLを流用してよいが、正は仕様書とする

## 6. handoffヘッダ拡張(全ロール共通)

既存ヘッダに3フィールドを追加する:

```
---handoff---
from: [ロール名]
to: [宛先ロール名]
type: deliverable | feedback | rejection | question
iteration: [往復回数]
status: ready | needs-discussion | escalate-to-human
open_issues: [未解決論点。なければ "none"]
workspace: [ワークスペースルートの絶対パス]
inputs: [この成果物が依拠した入力ファイルのパス一覧。なければ "none"]
outputs: [この成果物として作成/更新したファイルのパス一覧]
---
```

- `workspace` は orchestrator がキックオフ時に設定し、全handoffで伝搬する
- `inputs` / `outputs` により、git方式でもファイル間の依存関係がhandoff単位で追跡できる(§3の依存明示の実体)
- 受け取ったロールは `outputs` のパスだけを読めばよく、docs全体を探索しない

## 7. プロジェクトモード

プロジェクトごとに2つの運用モードのどちらかを選ぶ。**人間がキックオフ時に指定し**、orchestrator が確認、GitHubリポジトリ変数 `PROJECT_MODE` に設定する。

| 観点 | supervised(既定) | autonomous |
|---|---|---|
| 想定 | 実装を把握したい重要プロダクト | AIに任せ切る量産プロジェクト |
| PRマージ | AIレビュー + **人間のapprove必須** | AIレビューの APPROVE 判定で**自動マージ** |
| 人間CP(要件確定・設計確定・タスク一覧承認) | 必須(回答があるまで進まない) | スキップ(確認要求は事後報告ログとして記録のみ) |
| 差し戻しループ | 人間が「@claude 修正して」で指示 | 自動修正 → 再レビュー(**上限3回**) |
| エスカレーション | escalate-to-human は人間へ | **同じ**(autonomousでも必ず人間へ。唯一の安全弁) |
| ブランチ保護 | Require approvals: 1 | approvals必須にしない(auto-mergeが止まるため) |
| 事後監査 | - | git履歴 + ADR + issue/PRログで全判断を後から追跡可能 |

- モードは途中で切り替えてよい(リポジトリ変数の変更のみ)。切替時は orchestrator が人間に影響を要約して確認する
- autonomous でも `needs-human` ラベルが付いたPR/issueは自動処理の対象外とする

---

## 導入手順

1. このファイルを `<workspace>/docs/workspace-conventions.md` として各プロジェクトに配置する
2. 付属の「スキル追記パッチ」(skill-amendments.md)に従い、orchestrator / engineer-design / designer-ui と全ロール共通ヘッダを更新する
3. 既存プロジェクトがある場合、成果物を新構造へ移動する作業は1コミットで行い、以降は本規約に従う
