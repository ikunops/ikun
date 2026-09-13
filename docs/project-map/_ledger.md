# _ledger.md — ikun-demo 测绘台账(v2,三期+管理后台后)

> 倒模模式:参考 = DeepSeek 设计文档(`../IKUN社区小程序-设计文档.md`)
> v2 更新:二期内容互动、三期消息设置、管理后台 CMS 全量落地
> 状态:✅ 已测绘 ｜ ⛔ 死胡同(注明原因+回头路)｜ 无 🚧,已闭环

| # | 节点 | 状态 | 备注 |
|---|---|---|---|
| B-1 | 数据层 stores(user/level/border/posts/notify/admin) | ✅ | admin 含权限矩阵 PERMS + 审批流 + 活动运营 |
| B-1.1 | mock 7 文件(levels/avatars/borders/users/posts/activities/boards) | ✅ | activities 迁入 admin store 播种;api 仅剩 fetchAnnouncements |
| F-1 | 路由 20+ 条 + 三段式守卫 + /admin 管理员守卫 | ✅ | 大长老/核心长老放行 |
| F-2~F-6 | 流程页 splash/login/avatar-select/id-card-issue/id-card | ✅ | login 新增大长老一键登录(IKUN-000001, Lv5.5, 66天) |
| F-7 | home 首页 | ✅ | 品牌图 logo + 站点公告(管理端下发)插 banner 首 |
| F-8 | circles 圈子列表 + circle-detail 板块详情 | ✅ | 二期;动态计数 + FAB 发帖 |
| F-9 | checkin 打卡 | ✅ | 活动源 = admin store(运营发布实时同步) |
| F-10 | messages 消息中心 | ✅ | 三期;通知流 + 未读红点(TabBar/侧栏) + 留言板入口 |
| F-11 | profile 个人中心 | ✅ | 管理后台入口(大长老/核心长老可见) |
| F-12 | level 等级详情 | ✅ | 大长老账号按 Lv5.5 呈现(level store override) |
| F-13 | post-create / post-detail / guestbook / border-select / settings / my-content | ✅ | 二三期全量 |
| F-14 | 组件 12 个 | ✅ | BorderRing v3(宝石座/金属渐变/扫光/饰徽);全局风格 v2(细线柔影) |
| A-1 | 管理后台 /admin(AdminLayout + 9 模块) | ✅ | 仪表盘/用户(任命·封禁)/内容(加精·删帖审批流)/圈子/活动/身份证/边框(特殊授予)/消息(系统通知)/设置(公告+日志) |
| A-1.1 | 权限矩阵(文档·八) | ✅ | PERMS 表 + can();任命/管理管理员仅大长老;删热帖(≥100赞)走审批流(流程3) |
| X-1 | 合规资质(文档·十四) | ⛔ 小程序阶段 | 文档留存 |
| X-2 | 真实后端/小程序迁移 | ⛔ 后续阶段 | store 形状即文档·九表结构,接后端替换 store 内部 |
