# src/assets/avatars — 30 工种默认头像素材

即梦生成的坤系头像放这里,**按工种编号命名**:`A01.png` … `E06.png`(支持 png/jpg/jpeg/webp)。

- `src/mock/avatars.js` 的 `avatarImage(code)` 会自动匹配文件名(大小写不敏感)。
- `AvatarWithBorder` / `AvatarPicker` 检测到图片就用图,没有的工种自动回退 `KunChicken` 程序化绘制——**可以分批补图**。
- 生成参数基准(即梦 图片 5.0 Lite / 1:1 / 2K / 数量1 / 参考图模式):
  统一基因 = 黄色鸡头 + 银灰中分 + 超大圆眼 + 红腮红 + 橙鸭嘴 + 粗黑描边 + 纯钴蓝底;
  工种差异 = DS 对话 30 条提示词的服饰/道具部分(见 `docs/IKUN社区小程序-设计文档.md` 第一部分)。
