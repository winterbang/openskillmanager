import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { resolveHomePath, getDefaultConfig } from '../utils/path.js';

const CONFIG_PATH = join(homedir(), '.osmrc');

/**
 * 读取配置文件
 * @returns {Object} 配置对象
 */
export function readConfig() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const content = readFileSync(CONFIG_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  读取配置文件失败: ${error.message}`);
  }
  
  // 返回默认配置并创建文件
  const defaultConfig = getDefaultConfig();
  writeConfig(defaultConfig);
  return defaultConfig;
}

/**
 * 写入配置文件
 * @param {Object} config - 配置对象
 */
export function writeConfig(config) {
  try {
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`写入配置文件失败: ${error.message}`);
  }
}

/**
 * 获取配置值
 * @param {string} key - 配置键（支持点号路径，如 'install.default_registry'）
 * @returns {any} 配置值
 */
export function getConfig(key) {
  const config = readConfig();
  
  if (!key) return config;
  
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value === null || value === undefined || typeof value !== 'object') {
      return undefined;
    }
    value = value[k];
  }
  
  // 如果是路径相关配置，解析波浪号
  if (key === 'store_path' || key.endsWith('_path')) {
    return resolveHomePath(value);
  }
  
  return value;
}

/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 */
export function setConfig(key, value) {
  const config = readConfig();
  const keys = key.split('.');
  
  let target = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in target) || typeof target[k] !== 'object') {
      target[k] = {};
    }
    target = target[k];
  }
  
  // 尝试解析 JSON 值
  const lastKey = keys[keys.length - 1];
  try {
    target[lastKey] = JSON.parse(value);
  } catch {
    target[lastKey] = value;
  }
  
  writeConfig(config);
}

/**
 * 列出所有配置
 */
export function listConfig() {
  const config = readConfig();
  console.log('📋 当前配置:');
  console.log(JSON.stringify(config, null, 2));
}

/**
 * 配置命令处理
 * @param {string} action - 操作类型 (get/set/list)
 * @param {string} key - 配置键
 * @param {string} value - 配置值
 */
export async function configManager(action, key, value) {
  switch (action) {
    case 'get':
      if (!key) {
        console.error('❌ 请提供配置键名');
        process.exit(1);
      }
      const val = getConfig(key);
      if (val !== undefined) {
        console.log(val);
      } else {
        console.log(`配置项 "${key}" 不存在`);
      }
      break;
      
    case 'set':
      if (!key || value === undefined) {
        console.error('❌ 请提供配置键名和值');
        process.exit(1);
      }
      setConfig(key, value);
      console.log(`✅ 已设置 ${key} = ${value}`);
      break;
      
    case 'list':
      listConfig();
      break;
      
    default:
      console.error(`❌ 未知操作: ${action}`);
      console.log('支持的操作: get, set, list');
      process.exit(1);
  }
}