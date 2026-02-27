import { homedir } from 'os';
import { join } from 'path';

/**
 * 解析路径中的波浪号 ~ 为用户主目录
 * @param {string} path - 可能包含 ~ 的路径
 * @returns {string} 绝对路径
 */
export function resolveHomePath(path) {
  if (!path) return path;
  if (path.startsWith('~/')) {
    return join(homedir(), path.slice(2));
  }
  if (path === '~') {
    return homedir();
  }
  return path;
}

/**
 * 获取默认配置对象
 * @returns {Object} 默认配置
 */
export function getDefaultConfig() {
  return {
    store_path: '~/.open_skills',
    link_targets: [
      '~/.claude',
      '~/.codex'
    ],
    install: {
      default_registry: 'github',
      github_proxy: ''
    },
    system: {
      auto_overwrite_links: false,
      log_level: 'info'
    }
  };
}