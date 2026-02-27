#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { installSkill } from '../src/commands/install.js';
import { configManager } from '../src/commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 package.json 获取版本
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

program
  .name('osm')
  .description('OpenSkillManager - AI Agent Skill 包管理器')
  .version(packageJson.version, '-v, --version', '输出当前版本号');

// install 命令
program
  .command('install <skill-name>')
  .description('安装 Skill 包')
  .option('-s, --source <url>', '指定自定义源地址（Git 仓库或 Zip 包）')
  .action(async (skillName, options) => {
    try {
      await installSkill(skillName, options.source);
    } catch (error) {
      console.error(`❌ 安装失败: ${error.message}`);
      process.exit(1);
    }
  });

// config 命令
program
  .command('config <action>')
  .description('配置管理')
  .argument('[key]', '配置键名')
  .argument('[value]', '配置值')
  .action(async (action, key, value) => {
    try {
      await configManager(action, key, value);
    } catch (error) {
      console.error(`❌ 配置操作失败: ${error.message}`);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse();