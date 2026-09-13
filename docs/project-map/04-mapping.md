# 04-mapping.md — 设计文档 ↔ ikun-demo 双向映射(v2)

参考 = 设计文档十五章;v2 增补二期/三期/管理后台落点。

| 文档章节 | 实现落点 | 状态 |
|---|---|---|
| 一 项目概述 | — | ✅ |
| 二 等级与身份体系 | mock/levels + stores/level(+大长老 override) | ✅ 全对齐,大长老=ID1/Lv5.5 |
| 三 头像体系 | KunChicken + assets/avatars(13 张真图:8 用户供图+4 即梦去水印+1 品牌图) | ✅ 30 工种,缺图 SVG 兜底 |
| 四 边框体系 | BorderRing v3(宝石座/金属渐变/扫光/饰徽/5.5 彩虹+闪烁星) + border-select | ✅ |
| 五 身份证系统 | IdCard + id-card-issue(GSAP) | ✅ |
| 六 打卡与贡献值 | checkin + user store(+contributionBonus:发帖+5/被赞+1) | ✅ 打卡/发帖/被赞 三源 |
| 七 功能清单·前台 | 11 views 全量 | ✅ 用户端功能全部落地 |
| 七 功能清单·后台CMS | /admin 9 模块 | ✅ 仪表盘/用户/内容/圈子/活动/身份证/边框/消息/设置 全部落地(广告位为文档·八设置项,Demo 未做 → 🕳️ 广告位配置) |
| 八 权限矩阵 | admin store PERMS + can() | ✅ 9 权限 × 角色全部生效;审批流(流程3)真实可走 |
| 九 数据库 | stores 即表投影 | ✅ 新增 admins/roles→PERMS、approvals、notifications、activities 落地 |
| 十 技术栈 | package.json | ✅ |
| 十一 目录结构 | src/**(+assets/images 品牌图、views/admin 9 页) | ✅ |
| 十二 交互流程 1-4 | 守卫/checkin/admin | ✅ 全部四条流程真实可走 |
| 十三 Demo 优先级 | — | ✅ 一二三期全交付 |
| 十四 合规资质 | docs | ⛔ 小程序阶段 |
| 十五 AI提示词模板 | — | ✅ |

**🪝 悬空调用**:0(fetchActivities 已删,活动源迁 admin store)。
**🕳️ 未暴露**:广告位配置(文档·八 系统设置内,Demo 不做,上线前补)。

**验证记录 v2**:大长老登录→仪表盘(6用户/等级分布/大长老视角)→用户管理路由 ✓;机械回归:emoji 0、黑描边 0、硬投影 0、字号 15 档(新增 admin 页 9px 微标签×2,P2 可接受)。
