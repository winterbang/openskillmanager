# OpenSkillManager (osm)

AI Agent Skill 包管理器 - 统一管理、分发你的 AI Skills。

## 简介

OpenSkillManager (简称 osm) 是一个基于 Node.js 开发的全局命令行界面 (CLI) 工具。它的核心定位是作为 AI Agent（如 Claude、Codex 等）的"Skill 包管理器"，类似于 Node 生态中的 npm 或 Python 生态中的 pip。

## 解决痛点

随着 AI 驱动开发的普及，开发者通常需要在多个 AI 工具或工作流之间复用特定的 Prompt、脚本和配置文件（即 Skill）。手动复制粘贴或管理这些离散文件不仅低效，而且难以保持版本一致性。osm 通过"统一存储 + 动态软链分发"的机制，彻底解决多终端、多环境下的 Skill 同步与管理问题。

## 安装

```bash
npm install -g openskillmanager
```

## 快速开始

### 1. 安装 Skill

从 GitHub 安装：
```bash
osm install username/skill-name
```

从 GitHub 仓库的子目录安装：
```bash
# 安装仓库中特定文件夹作为 Skill
osm install username/repo-name/path/to/skill

# 示例：安装 baoyu-skills 仓库中的某个 skill
osm install jimliu/baoyu-skills/skills/baoyu-image-gen

# 支持 tree/branch 格式（适用于 GitHub URL 或简写）
osm install username/repo-name/tree/main/path/to/skill
osm install https://github.com/username/repo-name/tree/main/path/to/skill
```

从自定义源安装：
```bash
osm install my-skill -s https://github.com/user/repo.git
osm install my-skill -s https://example.com/skill.zip
```

### 2. 配置管理

查看配置：
```bash
osm config list
```

获取配置项：
```bash
osm config get store_path
osm config get link_targets
```

设置配置项：
```bash
osm config set store_path ~/.my_skills
osm config set system.auto_overwrite_links true
```

### 3. 查看版本

```bash
osm -v
osm --version
```

### 4. 同步 Skills

当你修改了 `link_targets` 配置（如添加了新的 Agent 目录），可以使用 sync 命令将所有已安装的 Skill 同步到新的目录：

```bash
# 同步所有 Skill 到配置的软链目录
osm sync
```

示例场景：
```bash
# 1. 初始状态：只配置了 ~/.claude
osm install user/skill-a  # 软链到 ~/.claude/skills/skill-a

# 2. 添加新的 Agent 目录
osm config set link_targets '["~/.claude", "~/.cursor", "~/.gemini"]'

# 3. 同步 - 将 skill-a 也链接到新添加的 ~/.cursor 和 ~/.gemini
osm sync
# 输出：
# 🔄 开始同步 Skills...
# 📦 发现 1 个 Skill(s): skill-a
# 🔗 目标软链目录: 3 个
#
# 📋 同步 Skill: skill-a
#   ✅ ~/.claude: 已存在且指向正确
#   ✅ ~/.cursor: 软链创建成功
#   ✅ ~/.gemini: 软链创建成功
```

### 5. 帮助

```bash
osm -h
osm --help
```

## 核心概念

### Skill 规范

一个标准的 Skill 必须是一个包含特定结构的文件夹：

```
skill-name/
├── SKILL.md              # 【必填】Skill 的核心描述或 Prompt
├── scripts/              # 【选填】执行脚本目录
│   ├── deploy.sh
│   └── validate.py
├── references/           # 【选填】参考资料或上下文文档
│   └── REFERENCE.md
└── assets/               # 【选填】静态资源或配置模板
    └── config-template.json
```

### 统一存储与分发 (Symlink 机制)

- **统一存储库**：所有通过工具下载的 Skill 实体文件，统一存放在 `~/.open_skills` 文件夹中。
- **动态分发**：工具读取配置文件中定义的 `link_targets`（如 `~/.claude`），并在其内部的 `skills/` 子目录中创建指向统一存储库中对应 Skill 的软链接（Symlink）。

## 配置说明

配置文件位于 `~/.osmrc`，JSON 格式：

```json
{
  "store_path": "~/.open_skills",
  "link_targets": [
    "~/.claude",
    "~/.agents",
    "~/.cursor",
    "~/.gemini",
    "~/.gemini/antigravity",
    "~/.copilot",
    "~/.config/opencode",
    "~/.codeium/windsurf"
  ],
  "install": {
    "default_registry": "github",
    "github_proxy": ""
  },
  "system": {
    "auto_overwrite_links": false,
    "log_level": "info"
  }
}
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `store_path` | Skill 统一存储路径 | `~/.open_skills` |
| `link_targets` | 软链接目标目录列表 | 见下方支持的 Agent 列表 |
| `install.default_registry` | 默认注册表 | `github` |
| `install.github_proxy` | GitHub 代理地址 | `""` |
| `system.auto_overwrite_links` | 自动覆盖已存在的链接 | `false` |
| `system.log_level` | 日志级别 | `info` |

### 支持的 Agent 软链目录

安装 Skill 时，osm 会自动在以下 Agent 目录创建软链接（`{target}/skills/{skill-name}`）：

| Agent | 软链目标目录 | Skill 最终路径 |
|-------|-------------|---------------|
| Claude Code | `~/.claude` | `~/.claude/skills/{skill}/` |
| Codex | `~/.agents` | `~/.agents/skills/{skill}/` |
| Cursor | `~/.cursor` | `~/.cursor/skills/{skill}/` |
| Gemini CLI | `~/.gemini` | `~/.gemini/skills/{skill}/` |
| Antigravity | `~/.gemini/antigravity` | `~/.gemini/antigravity/skills/{skill}/` |
| GitHub Copilot | `~/.copilot` | `~/.copilot/skills/{skill}/` |
| OpenCode | `~/.config/opencode` | `~/.config/opencode/skills/{skill}/` |
| Windsurf | `~/.codeium/windsurf` | `~/.codeium/windsurf/skills/{skill}/` |

你可以通过 `osm config set link_targets` 自定义需要创建软链的目录。

### Registry 配置

`install.default_registry` 支持以下值：

| Registry | 说明 | 示例 |
|----------|------|------|
| `github` | GitHub（默认） | `osm install user/repo` → 从 github.com 安装 |
| `gitlab` | GitLab | `osm install user/repo` → 从 gitlab.com 安装 |
| `gitee` | Gitee（码云） | `osm install user/repo` → 从 gitee.com 安装 |
| 自定义 URL | 自托管 Git 服务 | `https://git.mycompany.com` |

**使用 GitHub 代理：**

如果访问 GitHub 较慢，可以配置代理：

```bash
# 使用镜像代理（如 ghproxy.com）
osm config set install.github_proxy "https://ghproxy.com/https://github.com"

# 恢复直连
osm config set install.github_proxy ""
```

**切换 Registry 示例：**

```bash
# 切换到 Gitee
osm config set install.default_registry "gitee"
osm install user/repo  # 将从 gitee.com 安装

# 切换到自托管 GitLab
osm config set install.default_registry "https://git.mycompany.com"
osm install user/repo  # 将从自托管服务器安装
```

## 安装流程

用户触发 `osm install` 后，系统按以下顺序执行：

1. **解析源地址**：根据用户输入的参数，决定是拼接 GitHub 地址还是使用提供的 `--source` URL。
2. **拉取文件**：将目标项目克隆或下载解压至 `~/.open_skills/<skill-name>`。
3. **合法性校验**：检查下载的目录中是否存在 `SKILL.md` 文件。若缺失，则中断安装并清理残余文件。
4. **软链注入**：遍历 `~/.osmrc` 中的 `link_targets` 列表，在目标目录创建软链接。

## 技术栈

- **开发语言**：Node.js (ES Modules)
- **核心依赖**：
  - `commander` - CLI 路由与参数解析
  - `fs-extra` - 文件读写、目录创建及跨平台软链操作

## 开发说明

### 项目结构

```
osm/
├── bin/
│   └── osm.js              # CLI 入口文件
├── src/
│   ├── commands/
│   │   ├── install.js      # install 命令实现
│   │   └── config.js       # config 命令实现
│   └── utils/
│       └── path.js         # 路径处理工具
├── package.json
└── README.md
```

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/winterbang/openskillmanager.git
cd openskillmanager

# 安装依赖
npm install

# 链接到全局（本地测试）
npm link

# 测试命令
osm --version
osm config list
```

### 重新安装/更新

本地开发时，修改代码后需要重新链接：

```bash
# 1. 取消旧链接
npm unlink -g openskillmanager

# 2. 重新链接
cd openskillmanager
npm link

# 3. 如需重置配置（让新的默认配置生效）
rm ~/.osmrc
osm config list
```

### 添加新命令

1. 在 `src/commands/` 下创建命令文件
2. 在 `bin/osm.js` 中使用 `program.command()` 注册命令
3. 遵循现有命令的错误处理模式

### 发布到 npm

```bash
# 登录 npm
npm login

# 发布
npm publish

# 更新版本
npm version patch|minor|major
npm publish
```

## License

MIT