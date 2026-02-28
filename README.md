# OpenSkillManager (osm)

AI Agent Skill Package Manager - Unified management and distribution of your AI Skills.

## Introduction

OpenSkillManager (abbreviated as osm) is a global command-line interface (CLI) tool developed based on Node.js. Its core positioning is to serve as a "Skill Package Manager" for AI Agents (such as Claude, Codex, etc.), similar to npm in the Node ecosystem or pip in the Python ecosystem.

## Pain Points Solved

As AI-driven development becomes more prevalent, developers often need to reuse specific Prompts, scripts, and configuration files (i.e., Skills) across multiple AI tools or workflows. Manually copying and pasting or managing these discrete files is not only inefficient but also difficult to maintain version consistency. osm completely solves the multi-terminal, multi-environment Skill synchronization and management problem through a "unified storage + dynamic symlink distribution" mechanism.

## Installation

```bash
npm install -g open-skill-manager
```

## Quick Start

### 1. Install Skill

Install from GitHub:
```bash
osm install username/skill-name
```

Install from a subdirectory of a GitHub repository:
```bash
# Install a specific folder from a repository as a Skill
osm install username/repo-name/path/to/skill

# Example: Install a skill from the baoyu-skills repository
osm install jimliu/baoyu-skills/skills/baoyu-image-gen

# Supports tree/branch format (works with GitHub URLs or shorthand)
osm install username/repo-name/tree/main/path/to/skill
osm install https://github.com/username/repo-name/tree/main/path/to/skill
```

Install from a custom source:
```bash
osm install my-skill -s https://github.com/user/repo.git
osm install my-skill -s https://example.com/skill.zip
```

### 2. Configuration Management

View configuration:
```bash
osm config list
```

Get configuration item:
```bash
osm config get store_path
osm config get link_targets
```

Set configuration item:
```bash
osm config set store_path ~/.my_skills
osm config set system.auto_overwrite_links true
```

### 3. Check Version

```bash
osm -v
osm --version
```

### 4. Sync Skills

When you modify the `link_targets` configuration (e.g., add a new Agent directory), you can use the sync command to synchronize all installed Skills to the new directory:

```bash
# Sync all Skills to the configured symlink directories
osm sync
```

Example scenario:
```bash
# 1. Initial state: only ~/.claude is configured
osm install user/skill-a  # Symlinked to ~/.claude/skills/skill-a

# 2. Add a new Agent directory
osm config set link_targets '["~/.claude", "~/.cursor", "~/.gemini"]'

# 3. Sync - also link skill-a to the newly added ~/.cursor and ~/.gemini
osm sync
# Output:
# 🔄 Starting Skill sync...
# 📦 Found 1 Skill(s): skill-a
# 🔗 Target symlink directories: 3
#
# 📋 Syncing Skill: skill-a
#   ✅ ~/.claude: already exists and points to the correct location
#   ✅ ~/.cursor: symlink created successfully
#   ✅ ~/.gemini: symlink created successfully
```

### 5. Help

```bash
osm -h
osm --help
```

## Core Concepts

### Skill Specification

A standard Skill must be a folder containing a specific structure:

```
skill-name/
├── SKILL.md              # [Required] Core description or Prompt of the Skill
├── scripts/              # [Optional] Execution script directory
│   ├── deploy.sh
│   └── validate.py
├── references/           # [Optional] Reference materials or context documents
│   └── REFERENCE.md
└── assets/               # [Optional] Static resources or configuration templates
    └── config-template.json
```

### Unified Storage and Distribution (Symlink Mechanism)

- **Unified Storage Repository**: All Skill files downloaded through the tool are uniformly stored in the `~/.open_skills` folder.
- **Dynamic Distribution**: The tool reads the `link_targets` defined in the configuration file (e.g., `~/.claude`) and creates symlinks in the internal `skills/` subdirectory pointing to the corresponding Skill in the unified storage repository.

## Configuration

The configuration file is located at `~/.osmrc` in JSON format:

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

### Configuration Options

| Option | Description | Default Value |
|--------|-------------|---------------|
| `store_path` | Skill unified storage path | `~/.open_skills` |
| `link_targets` | List of symlink target directories | See supported Agent list below |
| `install.default_registry` | Default registry | `github` |
| `install.github_proxy` | GitHub proxy address | `""` |
| `system.auto_overwrite_links` | Auto-overwrite existing links | `false` |
| `system.log_level` | Log level | `info` |

### Supported Agent Symlink Directories

When installing a Skill, osm will automatically create symlinks in the following Agent directories (`{target}/skills/{skill-name}`):

| Agent | Symlink Target Directory | Final Skill Path |
|-------|-------------------------|------------------|
| Claude Code | `~/.claude` | `~/.claude/skills/{skill}/` |
| Codex | `~/.agents` | `~/.agents/skills/{skill}/` |
| Cursor | `~/.cursor` | `~/.cursor/skills/{skill}/` |
| Gemini CLI | `~/.gemini` | `~/.gemini/skills/{skill}/` |
| Antigravity | `~/.gemini/antigravity` | `~/.gemini/antigravity/skills/{skill}/` |
| GitHub Copilot | `~/.copilot` | `~/.copilot/skills/{skill}/` |
| OpenCode | `~/.config/opencode` | `~/.config/opencode/skills/{skill}/` |
| Windsurf | `~/.codeium/windsurf` | `~/.codeium/windsurf/skills/{skill}/` |

You can customize the directories where symlinks are created via `osm config set link_targets`.

### Registry Configuration

`install.default_registry` supports the following values:

| Registry | Description | Example |
|----------|-------------|---------|
| `github` | GitHub (default) | `osm install user/repo` → Install from github.com |
| `gitlab` | GitLab | `osm install user/repo` → Install from gitlab.com |
| `gitee` | Gitee | `osm install user/repo` → Install from gitee.com |
| Custom URL | Self-hosted Git service | `https://git.mycompany.com` |

**Using GitHub Proxy:**

If accessing GitHub is slow, you can configure a proxy:

```bash
# Use a mirror proxy (e.g., ghproxy.com)
osm config set install.github_proxy "https://ghproxy.com/https://github.com"

# Restore direct connection
osm config set install.github_proxy ""
```

**Switching Registry Example:**

```bash
# Switch to Gitee
osm config set install.default_registry "gitee"
osm install user/repo  # Will install from gitee.com

# Switch to self-hosted GitLab
osm config set install.default_registry "https://git.mycompany.com"
osm install user/repo  # Will install from self-hosted server
```

## Installation Process

After the user triggers `osm install`, the system executes in the following order:

1. **Parse Source Address**: Based on the user's input parameters, decide whether to concatenate a GitHub address or use the provided `--source` URL.
2. **Fetch Files**: Clone or download and extract the target project to `~/.open_skills/<skill-name>`.
3. **Legitimacy Check**: Check if a `SKILL.md` file exists in the downloaded directory. If missing, interrupt the installation and clean up residual files.
4. **Symlink Injection**: Traverse the `link_targets` list in `~/.osmrc` and create symlinks in the target directories.

## Tech Stack

- **Development Language**: Node.js (ES Modules)
- **Core Dependencies**:
  - `commander` - CLI routing and parameter parsing
  - `fs-extra` - File read/write, directory creation, and cross-platform symlink operations

## Development Guide

### Project Structure

```
osm/
├── bin/
│   └── osm.js              # CLI entry file
├── src/
│   ├── commands/
│   │   ├── install.js      # install command implementation
│   │   └── config.js       # config command implementation
│   └── utils/
│       └── path.js         # Path processing utilities
├── package.json
└── README.md
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/winterbang/openskillmanager.git
cd openskillmanager

# Install dependencies
npm install

# Link to global (for local testing)
npm link

# Test commands
osm --version
osm config list
```

### Reinstall/Update

During local development, you need to re-link after modifying the code:

```bash
# 1. Unlink old link
npm unlink -g openskillmanager

# 2. Re-link
cd openskillmanager
npm link

# 3. Reset configuration if needed (to let new default configuration take effect)
rm ~/.osmrc
osm config list
```

### Adding New Commands

1. Create a command file in `src/commands/`
2. Register the command using `program.command()` in `bin/osm.js`
3. Follow the error handling patterns of existing commands

### Publishing to npm

```bash
# Login to npm
npm login

# Publish
npm publish

# Update version
npm version patch|minor|major
npm publish
```

## License

MIT

---

[中文文档](README.zh-CN.md)
