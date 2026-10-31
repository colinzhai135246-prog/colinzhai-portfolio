# Colin Zhai 个人网站

此网站以 Figma 的 53:2 页面为基础，继续优化为原生 HTML、CSS 和 JavaScript 个人作品集。包含绿色玻璃姓名、个人介绍、兴趣照片、网球项目和一起玩无畏契约手游的介绍。

## 如何打开

直接双击 `index.html`，即可在浏览器打开网站。保留整个文件夹，图片和字体均已保存在本地，可离线查看。

## 文件内容

- `index.html`：页面内容、导航、项目介绍、照片和联系邮箱。
- `styles.css`：桌面布局、手机适配、本地字体和悬停效果。
- `app.js`：导航、手机菜单、姓名局部高光、兴趣说明、图库和复制邮箱。
- `assets/`：原始照片、SVG 素材和玻璃文字遮罩；`web/` 保存网页使用的轻量 WebP 图片，`favicon.png` 为独立的小图标。`glass-masks.css` 内嵌遮罩，确保双击 HTML 时人物也能正确挡住姓名。
- `fonts/`：Inter、Caveat、Pacifico、Source Serif Pro 字体及各自许可文件。

## 页面交互

封面姓名默认保持静态绿色玻璃质感，采用通透字面、窄反射和明暗双边呈现玻璃厚度。Zhai 采用互补裁剪的前后两层：只有 Z 顶部横笔及其起笔弯钩在人物后方，Z 的斜笔和底部横笔在人物前方。Colin 保留原有遮挡。鼠标移到姓名范围内时，指针附近出现局部高光，高光随鼠标位置变化；移开后恢复静态。没有自动扫光或字形变形，触屏保持静态显示。

Home、About、Work、Play、Let’s talk 和正文按钮会跳转到相应章节。导航悬浮在页面顶部，当前阅读章节会高亮，到页脚时会正确高亮 Let’s talk。点击左上角姓名可返回顶部。手机菜单可展开或收起，点击链接、点击外部或按 Esc 后会关闭；按钮的无障碍名称会随开关状态更新。

兴趣区默认显示标题与对应照片。鼠标移入卡片时展开说明，移开后收起；手机上点击卡片可展开或收起。键盘 Tab 聚焦标题时也会展开，按 Esc 可收起。

点击任意网球项目照片或 Open gallery 可进入图库。支持左右按钮、键盘方向键、手机左右滑动、Esc 关闭、点击遮罩关闭；关闭后键盘焦点回到原入口。手机上的横图按比例显示，竖图受屏幕高度限制；上下滑动和双指缩放不作为切图操作。弹窗图片在打开图库时才加载。

最下方的 I can help you with 板块使用英文介绍，保留提供的完整战绩截图，点击截图可在新标签页查看原尺寸。Play together 和顶部 Let’s talk 都会直接定位到页脚的 Copy email 按钮。Copy email 会把邮箱复制到剪贴板；若浏览器限制复制，则显示可自行选择的地址。只有点击页脚邮箱地址本身才会调用邮件应用，网页不会自动发送邮件。

正文只在首次进入视口时轻微显现；系统开启“减少动态效果”后会直接显示。

## 加载与分享

七张正文图片使用 WebP 版本，文件合计从约 7.26 MB 降到 0.82 MB，原始图片仍保留。首页人物照片、玻璃遮罩和姓名效果不参与这次压缩。正文图片保留懒加载并异步解码，浏览器标签图标使用独立的 48px PNG，避免首屏为小图标读取完整网球大图。

页面包含分享标题、简介、人物预览图和 canonical 链接，地址按当前仓库的 GitHub Pages 主页配置。如果以后换域名，请同步更新 `index.html` 中的 canonical、`og:url` 和 `og:image`。

## 图片说明

- `assets/cover-photo-clear.png`：以原始封面为参考，通过内置 imagegen 图片编辑工具增强清晰度，保留原始照片备份。
- `assets/valorant-profile.jpg`：由提供的 `IMG_9938.HEIC` 转成浏览器兼容的 JPEG，保留完整截图，未改写游戏数据。

封面增强使用的最终提示词：

> Use case: identity-preserve. Edit target: this exact photograph. Improve resolution and clarity subtly for use as a website cover while preserving the photograph. This is a restoration, not a new portrait or restaging. Preserve this same boy's exact facial geometry, original lips/jaw/nose/ears, expression and age, same sunglasses, same hat ornaments, same raised arm pose, original silver jacket and mint shirt, exact silhouette, exact position and crop. Keep the same cloudy sky and softly blurred mountains, same lighting and original colors. Only restore fine natural detail to the PERSON (especially clothing seams, hat stitching and existing face detail); leave the background's intentional soft focus. No beautification, no new face, no reshaping, no invented features, no new objects, no artificial sharpen halos. Keep the exact original 3:4 photo composition; deliver a higher-resolution faithful photo, around 1536x2048. Do not add text or graphics. Aim for restrained photographic restoration and fidelity above detail invention.

## 修改内容

文字和邮箱在 `index.html` 中修改。主题色在 `styles.css` 的 `--green` 中修改。封面保留 1440px 画板比例；正文使用自适应网格，760px 以下采用单栏布局。

替换图片时，请使用 HTML 中 `src` 指向的文件；正文优先引用 `assets/web/` 内的 WebP，`assets/` 内的对应原图作为备份保留。如果换成新的文件名，请同步修改图片 `src` 和图库链接 `href`；JavaScript 会自动从照片链接读取图库内容。

## 部署

将这个文件夹的全部内容一起上传到静态网站托管服务或 Web 服务器即可，入口是 `index.html`。不需要 npm 安装或打包。

如希望在本机通过 HTTP 预览，可以在此文件夹打开终端并运行：

```sh
python3 -m http.server 8000
```

然后在浏览器访问 `http://localhost:8000`。

[查看 Figma 设计来源](https://www.figma.com/design/qtQtw7UDlaIrPIX7YKvNzm/Personal-Portfolio-Website-Design?node-id=53-2)
