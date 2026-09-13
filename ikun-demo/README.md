# ikun社区 · ikun-demo

> 天下ikun是一家 —— 宗门制粉丝社区(坤系梗文化),移动端优先、PC/平板/手机三端自适应的 Web Demo。

## 功能一览

- **宗门等级体系**:Lv1-4 弟子五阶 + Lv5.1-5.6 长老序列,贡献值驱动自动升级
- **身份编号**:按注册顺序分配(IKUN-000001 起),**第一位注册者自动就任大长老**
- **ikun 字母徽章**:打卡/发帖/被精选点亮 I-K-U-N
- **翻转身份证**:领卡动画 + 卡面展示
- **30 工种坤鸡头像**:预置真图 + 程序化 SVG 兜底 + 自定义上传
- **10 档等级边框**:金属渐变主环、12 宝石镶嵌位、扫光、5.5 炫彩旋转星环
- **社区**:圈子发帖(公开/好友/私密三种可见性)、评论、留言板、通知中心
- **个人主页**:`/u/昵称`,展示动态/评论/收藏/参与活动;自己的动态可随时切换可见性
- **打卡活动**:每日签到 +5 贡献,活动一键参与/取消,参与记录同步到个人主页
- **管理后台**(10 模块):用户/内容/圈子/活动/边框/头像/身份证/消息/公告/系统设置,权限矩阵 + 热帖删帖审批流 + 预置内容删除(回收站可恢复)

## 技术栈

Vue 3 + Vite · Vant 4 · Pinia · Vue Router(hash)· GSAP · Lucide 图标 · SCSS design tokens

## 本地开发

```bash
cd ikun-demo
npm install
npm run dev      # http://localhost:5173
npm run build    # 产物 → dist/(纯静态,平台无关)
```

## Linux 一键部署

项目根目录的 `deploy.sh` 即一键脚本:有现成 `dist/` 就直接起服务,没有就自动构建;优先用系统自带的 python3 提供静态服务,无 python3 回退 npx serve。**路由为 hash 模式,不需要任何 rewrite 配置。**

```bash
# 方式 A:服务器上有 Node(18+)
git clone https://github.com/ikunops/ikun.git
cd ikun/ikun-demo && ./deploy.sh          # 默认 8080,./deploy.sh 3000 换端口

# 方式 B:本地构建产物包,服务器零依赖
npm run build
tar -czf ikun-demo-linux.tar.gz dist deploy.sh README.md
# scp 到服务器后:
tar -xzf ikun-demo-linux.tar.gz && ./deploy.sh

# 后台常驻
nohup ./deploy.sh 8080 > ikun.log 2>&1 &
```

## 账号说明

- 昵称即登录名(全局唯一 2-12 位),密码 ≥6 位;注册顺序决定身份编号
- **第一位注册 = IKUN-000001 = 大长老**(后台全权限),请立即「设置 → 修改密码」
- 微信/抖音登录为模拟授权链路,默认关闭(真实接入需开放平台资质 + 后端换 openid)
- 数据存 localStorage;store 形状即后端表结构(设计文档·九),接后端时替换 store 实现即可

## 相关文档

- 设计总纲:`../docs/IKUN社区小程序-设计文档.md`
- 项目测绘:`../docs/project-map/`
