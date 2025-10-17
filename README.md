# vibesurfing
Vibe Surfing 是一个轻量级 Chrome AI 扩展，目标：通过最少的交互（键盘优先：Tab / Enter / 一次点击）提升网页阅读与写作效率，使日常信息处理更丝滑、高效。


## vibesurfing — 精简版需求说明

目标：打造一款“轻量级 Chrome AI 扩展”，通过最少的交互步骤（键盘优先，Tab/Enter/一次点击）帮助用户更快完成阅读与写作任务，从而提高日常效率。

本 README 把原始想法转成更清晰的需求与验收标准，便于实现、评审与测试。

### MVP（最小可行产品）概要
- 触发方式：全局快捷键（默认 Ctrl+M）打开右侧对话框；在网页上选中文本后按 Ctrl+M 把选中内容复制到对话框并把光标聚焦到对话框。
- 写作（writing）功能：
    - 在输入框输入简短提示，支持 Tab 补全建议，Enter 确认插入。
    - 自动生成为电子邮件或文档段落的能力（例如：给定主题+语气+收件人，生成完整邮件草稿）。
- 阅读（reading）功能：
    - Summary：基于所选或页面全部内容生成要点列表；点击要点可在页面中跳转到对应原文位置。
    - Ask：允许基于选中内容提问并返回答案；答案中的引用可点击跳转到页面位置。

vibesurfing/                                    # 项目根
├── manifest.json
├── background/
│   └── background.js      # 全局事件监听、快捷键绑定
├── content/
│   └── content.js         # 与页面 DOM 交互（复制选中、定位高亮、在页面插入文本）
├── popup/
│   └── popup.html / popup.js    # 右侧对话框 UI 与前端交互
├── scripts/
│   └── ai.js              # 与 AI 后端交互（请求/响应处理、速率限制、错误处理）
├── modules/
│   ├── writer.js          # 写作相关逻辑（模板、tab 补全、插入）
│   ├── reader.js          # 阅读解析/摘要/问答逻辑（要点定位）
│   └── autofill.js        # 简历/表单自动填写（后期）
├── assets/
│   └── icon.png
└── styles/
        └── style.css

### 运行与测试（快速验证步骤）
1. 在 Chrome/Chromium 中加载扩展（开发者模式）并选择 `vibesurfing/` 目录。
2. 打开一个包含可编辑区域或文本的网页。选中文本，按 Ctrl+M，验证对话框是否弹出并填入选中内容。
3. 在对话框中测试 Writing（输入 prompt -> Tab 补全 -> Enter 插入）和 Reading（Summary/Ask -> 点击要点跳转）。

## 本地加载与快速验证
1. 在 Chrome/Chromium 中打开 `chrome://extensions/`，启用“开发者模式”。
2. 点击“加载已解压的扩展程序（Load unpacked）”，选择项目目录 `vibesurfing/`。
3. 打开任意包含可选中文本与可编辑区域的网页（例如一个文章页面或在线文本编辑器）。
4. 选中页面一段文字，按 Ctrl+M（或使用扩展快捷键），右侧面板应弹出并将选中文本填入输入框。
5. 在面板输入 prompt：
    - 点击 `Summary`：应看到要点列表，点击某个要点会滚动并选中对应页面片段（基于文本片段的朴素实现）。
    - 点击 `Write`：会把生成的文本通过 content script 插入到当前活动的可编辑区域，若无可编辑区域则复制到剪贴板。

注意：当前实现为最小可运行骨架，AI 调用使用本地 stub；后续应替换 `scripts/ai.js` 和 popup 的 stub 调用以接入真实后端或第三方 API，并在隐私策略中记录数据传输规则。

