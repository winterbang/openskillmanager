import { execSync } from 'child_process';
import fs from 'fs-extra';
import { join, basename } from 'path';
import { getConfig, readConfig } from './config.js';
import { resolveHomePath } from '../utils/path.js';

const { existsSync, ensureDir, remove, ensureSymlink, readFileSync } = fs;

/**
 * 安装 Skill
 * @param {string} skillName - Skill 名称
 * @param {string} sourceUrl - 自定义源地址（可选）
 */
export async function installSkill(skillName, sourceUrl) {
  console.log(`📦 正在安装 Skill: ${skillName}`);
  
  // 1. 解析源地址
  const downloadUrl = sourceUrl || `https://github.com/${skillName}.git`;
  console.log(`🔗 源地址: ${downloadUrl}`);
  
  // 2. 获取配置
  const storePath = getConfig('store_path');
  const linkTargets = getConfig('link_targets') || [];
  const autoOverwrite = getConfig('system.auto_overwrite_links') || false;
  
  // 3. 准备存储目录
  const skillStorePath = join(storePath, skillName);
  
  // 4. 拉取文件
  await downloadSkill(downloadUrl, skillStorePath);
  
  // 5. 合法性校验
  await validateSkill(skillStorePath);
  
  // 6. 软链注入
  for (const target of linkTargets) {
    await createSymlink(skillStorePath, target, skillName, autoOverwrite);
  }
  
  console.log(`✅ Skill "${skillName}" 安装成功！`);
}

/**
 * 下载 Skill
 * @param {string} url - 下载地址
 * @param {string} destPath - 目标路径
 */
async function downloadSkill(url, destPath) {
  // 清理已存在的目录
  if (existsSync(destPath)) {
    console.log(`🧹 清理已存在的目录: ${destPath}`);
    await remove(destPath);
  }
  
  // 确保父目录存在
  await ensureDir(join(destPath, '..'));
  
  if (url.endsWith('.git')) {
    // Git 仓库
    console.log(`📥 克隆 Git 仓库...`);
    try {
      execSync(`git clone --depth 1 "${url}" "${destPath}"`, {
        stdio: 'pipe',
        timeout: 60000
      });
    } catch (error) {
      throw new Error(`克隆仓库失败: ${error.message}`);
    }
  } else if (url.endsWith('.zip')) {
    // Zip 压缩包
    console.log(`📥 下载 Zip 包...`);
    const tempZip = join(destPath, '..', 'temp.zip');
    try {
      execSync(`curl -L -o "${tempZip}" "${url}"`, {
        stdio: 'pipe',
        timeout: 120000
      });
      
      // 解压
      await ensureDir(destPath);
      execSync(`unzip -q "${tempZip}" -d "${destPath}"`, { stdio: 'pipe' });
      
      // 清理临时文件
      await remove(tempZip);
    } catch (error) {
      await remove(tempZip).catch(() => {});
      throw new Error(`下载或解压失败: ${error.message}`);
    }
  } else {
    throw new Error(`不支持的源格式: ${url}`);
  }
  
  console.log(`📁 已下载到: ${destPath}`);
}

/**
 * 验证 Skill 合法性
 * @param {string} skillPath - Skill 路径
 */
async function validateSkill(skillPath) {
  console.log(`🔍 验证 Skill 合法性...`);
  
  const skillMdPath = join(skillPath, 'SKILL.md');
  
  if (!existsSync(skillMdPath)) {
    // 清理残余文件
    await remove(skillPath);
    throw new Error(`验证失败: 未找到 SKILL.md 文件。Skill 必须包含 SKILL.md 作为入口说明。`);
  }
  
  console.log(`✅ 验证通过: 找到 SKILL.md`);
}

/**
 * 创建软链接
 * @param {string} sourcePath - 源路径（统一存储库中的 Skill）
 * @param {string} targetDir - 目标目录（如 ~/.claude）
 * @param {string} skillName - Skill 名称
 * @param {boolean} autoOverwrite - 是否自动覆盖
 */
async function createSymlink(sourcePath, targetDir, skillName, autoOverwrite) {
  const resolvedTargetDir = resolveHomePath(targetDir);
  const skillsDir = join(resolvedTargetDir, 'skills');
  const linkPath = join(skillsDir, skillName);
  
  console.log(`🔗 创建软链接到: ${linkPath}`);
  
  // 确保目标 skills 目录存在
  await ensureDir(skillsDir);
  
  // 检查是否已存在
  if (existsSync(linkPath)) {
    if (autoOverwrite) {
      console.log(`⚠️  已存在同名链接，自动覆盖`);
      await remove(linkPath);
    } else {
      console.warn(`⚠️  警告: ${linkPath} 已存在，跳过（设置 auto_overwrite_links 为 true 可自动覆盖）`);
      return;
    }
  }
  
  // 创建软链接
  try {
    await ensureSymlink(sourcePath, linkPath, 'dir');
    console.log(`✅ 软链接创建成功`);
  } catch (error) {
    throw new Error(`创建软链接失败: ${error.message}`);
  }
}