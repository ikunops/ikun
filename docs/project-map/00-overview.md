# 00-overview.md — ikun-demo 总体架构(A 型)

```text
ikun-demo
├── 1. 入口与外壳
│   ├── main.js(createApp + Pinia + Router + Vant 全量 + 登录态恢复)
│   ├── App.vue(router-view + TabBar[meta.tab])
│   └── router/index.js(11 路由 + 三段式守卫)
├── 2. 页面层 views/(11 个)
│   ├── 流程页:splash → login → avatar-select → id-card-issue
│   ├── 主社区:home / circles⛔ / checkin / messages⛔ / profile(5 tab)
│   └── 详情页:id-card / level
├── 3. 组件层 components/(10 个,全部 scoped SCSS + Lucide 图标)
│   ├── 身份:IkonBadge(ikun字母) · IdCard(3D翻面) · AvatarWithBorder(头像+边框+徽章)
│   ├── 选择:AvatarPicker(30工种) · BorderRing(10档边框环)
│   ├── 展示:PostCard · CheckinCalendar · LevelProgress · TabBar(双形态)
│   └── 素材:KunChicken(程序化坤鸡 SVG) + avatarIcons.js(工种→Lucide)
├── 4. 状态层 stores/(Pinia + localStorage)
│   ├── user.js(登录态/头像/编号/打卡数组/加精数)
│   ├── level.js(等级判定 getter:info/next/elderLadder)
│   └── border.js(解锁列表/当前边框,syncDefault 跟随等级)
└── 5. 数据层 mock/(= 文档·九数据库的 Demo 投影,api/index.js 门面)
    └── levels · avatars · borders · users · posts · activities
```

**设计基因**(frontend-design 承诺方向):贴纸卡通风 —— 粗墨描边(2px #262338)+ 实心偏移投影(4px 4px 0)+ 坤鸡黄主色 + Lucide 线性图标体系;动效只用 CSS 3D(翻卡/边框旋转/脉冲)+ GSAP(仅发卡时间线)。

**响应式契约**:手机 <768(设计稿 375 直出,底部 tabbar)/ 平板 768-1199(内容居中限宽 680-880)/ 桌面 ≥1200(左侧 96px 导航栏 + 内容放宽至 1080,网格 3→4→6 列、打卡与等级页双列、动态流双列)。

**文档偏离记录**(有意为之,非缺口):
1. postcss-px-to-viewport → 移除,改断点式响应式(用户要求 PC/平板/手机三端;vw 全局缩放与桌面布局冲突)。
2. assets/avatars、assets/borders 图片素材 → 程序化 SVG(KunChicken/BorderRing),正式素材生成后按原目录回落。
3. axios+Mock.js → 直接 import mock(api/index.js 门面已预留切换点)。
