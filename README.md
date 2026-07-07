# 省钱小助手 💰

一款基于 UniApp 的个人资产管理记账小程序，帮助你养成理性消费的好习惯。

## ✨ 功能

- **首页** — 资产总览、月度预算管理、快捷记账入口、近7天支出趋势
- **资产库** — 物品登记管理（分类、价格、已用时间），支持筛选
- **记账本** — 收支记录、分类统计、月度预算进度追踪
- **想买清单** — 愿望清单 + 冷静期机制，到期前需确认是否购买
- **个人中心** — 预算设置、数据导入导出

## 🎨 设计

采用 **Neo-Brutalism（新粗野主义）** 设计风格：

- 纯白背景 `#ffffff`
- 纯黑边框 `#000` + 硬像素阴影（无模糊无半透明）
- 品牌黄强调色 `#eab308`
- 零圆角，无渐变
- 按钮按下有物理位移反馈

参考 [vaultr-notes](https://github.com/skoowoo/vaultr-notes) 的 UI 风格。

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| [UniApp](https://uniapp.dcloud.net.cn/) | 跨平台框架 |
| Vue 2 | 前端框架 |
| SCSS | 样式预处理 |
| HBuilderX | 开发工具 |

## 🚀 运行

```bash
# 安装依赖
npm install

# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin
```

或直接使用 **HBuilderX** 打开项目，选择运行平台即可。

## 📁 目录结构

```
save-money-app/
├── pages/              # 页面
│   ├── home/           # 首页
│   ├── assets/         # 资产库
│   ├── expense/        # 记账本
│   ├── wishlist/       # 想买清单
│   ├── profile/        # 个人中心
│   ├── add-asset/      # 添加资产
│   ├── add-expense/    # 记账
│   └── add-wish/       # 添加愿望
├── components/         # 公共组件
│   └── TabBar.vue      # 自定义底部导航栏
├── utils/              # 工具函数
├── static/             # 静态资源
├── uni.scss            # 全局样式变量 & Mixin
├── pages.json          # 页面配置
└── App.vue             # 应用入口
```
