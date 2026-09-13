# _receipt.md — 机械对账凭证(可复跑)

日期:2026-09-13 ｜ 基线:ikun-demo 最终构建(✓ built in ~3.5s, vite 6.4.3)

## 数字断言(复跑命令 → 输出)

1. 路由 11 条:`grep -c "name: '" src/router/index.js` → **11**
2. 组件 10 个:`ls src/components/*.vue | wc -l` → **10**(+avatarIcons.js)
3. 页面 11 个:`ls src/views` → **11 个目录**
4. mock 表 6 个:`ls src/mock` → **6 文件**(levels/avatars/borders/users/posts/activities)
5. stores 3 个:`ls src/stores` → **3**
6. UI emoji 残留:正则 `[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F]` 全 src 扫描 → **0**
7. font-size 档位:19 档 → **14 档**[8,10,11,12,13,14,15,16,18,20,22,24,30,36]
8. !important:**3 处**,全部位于 global.scss 的 `prefers-reduced-motion` 块(合理)
9. z-index 分布:{2:1, 5:1, 10:1, 100:1}(badge/footer/rail/splash)—— 无失控
10. U+FFFD 乱码:**0**

## file:line 抽查(3 处)

- `src/router/index.js:31` 守卫 id-card-issue 加固分支 ✓(avatarCode||customAvatar 才放行)
- `src/mock/levels.js:6` Lv2 内门弟子 days:20, contribution:10 ✓(与文档·二一致)
- `src/mock/users.js:12` nextIdNumber = max(id)+1 → IKUN-000006 ✓(与浏览器实测 IKUN-000006 一致)

## 运行时实测记录

- 首跑流程:退出登录→一键体验→选头像(主唱A02)→发卡→首页 ✓(Edge 桌面 2893px)
- 打卡:打卡+5 → 连续13天/贡献65 → 明日再来禁用态 ✓
- 桌面布局:home(双列动态+rail)/checkin(双列+sticky日历)/level(双列阶梯)/profile(双列)/circles(四列)/avatar-select(六列)✓
- 未实测(如实声明):发卡 GSAP 逐帧(旧版观察过,新版仅换彩纸)、平板宽度实机、自定义上传头像全流程

## 费曼自测(对照地图)

Q1 新用户从打开到拿到身份证经过哪几步?→ F-1/F-3/F-4/F-5(守卫三段式)
Q2 贡献值从哪来、在哪算?→ S-1 user.checkins×5(getter),打卡+5(checkin 页)
Q3 升级边框怎么自动换?→ S-1 border.syncDefault(等级 borderId 兜底+用户选择优先)
Q4 30 工种图标在哪集中管理?→ components/avatarIcons.js
Q5 哪些功能是"文档有、Demo 无"?→ 04-mapping 🕳️ 清单(全部为规划内二三期/后台)

## v2 增补(三期 + 管理后台 + 风格翻转)

- 路由:`grep -c "name: '" src/router/index.js` → 24
- 管理页:`ls src/views/admin/*.vue | wc -l` → 10(布局+9模块)
- stores:6 个(user/level/border/posts/notify/admin)
- 机械回归:emoji 0 / solid-ink 边框 0 / 硬投影 0 / 字号 15 档 / !important 3(reduced-motion)
- 运行时:大长老登录→仪表盘(大长老视角+9侧栏)→/admin/users 路由 ✓;守卫拦截普通号进 /admin ✓(弹回 home)
- 品牌图:A01 裁边→brand-logo.png(256)+favicon.png(64),首页/登录页/favicon 三处生效
