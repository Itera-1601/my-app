---handoff---
from: designer-ui
to: pm-requirements
type: question
iteration: 1
status: needs-discussion
open_issues: REQ-004の未入力の扱い
workspace: /Users/kuromametarou/WorkSpace/product/my-app
inputs: docs/pm-requirements/requirements.md, docs/designer-review/review-warikan.md
outputs: docs/designer-ui/questions.md
---

# pm-requirements への質問

## Q1: 未入力はエラーか、初期(案内)か

REQ-004-1 は「金額・人数が**未入力**・0・負数・範囲外・非整数のとき、不正である旨の表示が出る」と定めているが、designer-review の must-1 指摘のとおり、入力途中(片方が空)でエラー表示を出すと、まだ誤りを犯していない利用者を責める表示になる。

- 提案: 「いずれかのフィールドが空の間は案内表示(エラー扱いしない)。**値が入っているが不正**(0・負数・範囲外・非整数)の場合のみエラー表示」に REQ-004 を改訂してほしい
- いずれの場合も REQ-004-2(古い結果を表示し続けない)は空入力にも適用でよい(結果は消える)
