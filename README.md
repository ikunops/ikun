# ikun社区 · ikun-demo

> 天下ikun是一家 —— 宗门制粉丝社区(坤系梗文化),移动端优先、三端自适应的 Web Demo。

一只坤系小鸡为主题的全功能社区 Demo:宗门等级体系、ikun 字母点亮、翻转身份证、
30 工种坤鸡头像、10 档等级边框(金属渐变/扫光/炫彩旋转)、打卡升级、圈子发帖、
评论留言、通知中心,以及一个 10 模块的管理后台(用户/内容/圈子/活动/边框/头像/
身份证/消息/系统设置,含权限矩阵与热帖删帖审批流)。

## 技术栈

Vue 3 + Vite · Vant 4 · Pinia · Vue Router · GSAP · Lucide 图标 · SCSS(design tokens)

## 快速开始

```bash
cd ikun-demo
npm install
npm run dev      # 开发:http://localhost:5173
npm run build    # 生产构建 → dist/
npm run preview  # 本地预览构建产物
```

## 部署(Linux 一键)

`ikun-demo/deploy.sh`:有现成 `dist/` 直接起服务(服务器无需 Node),没有则自动构建;优先 python3 静态服务,回退 npx serve。hash 路由,无需任何 rewrite 配置。

```bash
# 服务器有 Node(18+):克隆即部署
git clone https://github.com/ikunops/ikun.git
cd ikun/ikun-demo && ./deploy.sh            # 默认 8080,可传端口

# 服务器零依赖:本地构建产物包,scp 上去解压即跑
(cd ikun-demo && npm run build && tar -czf ikun-demo-linux.tar.gz dist deploy.sh README.md)
nohup ./deploy.sh 8080 > ikun.log 2>&1 &    # 后台常驻
```

详见 [ikun-demo/README.md](ikun-demo/README.md)。

## 账号体系

昵称 + 密码登录/注册(users 表:用户名/密码/手机/邮箱/等级/编号等字段)。
注册后自选工种头像、领取身份证;手机号/邮箱在「设置」中补充。

账号体系(昵称即登录名,全局唯一;身份编号按注册顺序分配):

- **第一位注册的用户自动获得 IKUN-000001,就任大长老**(管理后台全权限、全边框),请立即在「设置→修改密码」改密
- 后续注册自 IKUN-000002 起编号,预备弟子起步,走选头像→领身份证的新人流程
- 第三方登录(微信/抖音)功能已内置(模拟授权链路),默认关闭

## 目录

```
ikun-demo/            应用源码(Vue 3)
docs/                 设计文档(十五章总纲)与项目测绘地图
```

设计文档:`docs/IKUN社区小程序-设计文档.md`(等级/身份/头像/边框/权限/数据表/交互流程的完整设定)。

## 说明

- 纯前端 Demo:数据存 localStorage,store 形状即后端表结构(见设计文档·九),接后端时替换 store 内部实现即可。
- 头像素材:预置坤系形象 + 管理后台上传;缺失工种自动回退程序化绘制的坤鸡 SVG。
