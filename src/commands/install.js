import { execSync } from 'child_process';
import fs from 'fs-extra';
import { join, basename } from 'path';
import { getConfig, readConfig } from './config.js';
import { resolveHomePath } from '../utils/path.js';

const { existsSync, ensureDir, remove, ensureSymlink, readFileSync, copy } = fs;

/**
 * 安装 Skill
 * @param {string} skillInput - Skill 输入（可以是 user/repo 或 user/repo/path/to/skill）
 * @param {string} sourceUrl - 自定义源地址（可选）
 */
export async function installSkill(skillInput, sourceUrl) {
  console.log(`📦 正在安装 Skill: ${skillInput}`);
  
  // 1. 解析输入，判断是否包含子路径
  const { repoPath, subPath, skillName } = parseSkillInput(skillInput, sourceUrl);
  console.log(`🔗 仓库: ${repoPath}`);
  if (subPath) {
    console.log(`📁 子目录: ${subPath}`);
  }
  
  // 2. 获取配置
  const storePath = getConfig('store_path');
  const linkTargets = getConfig('link_targets') || [];
  const autoOverwrite = getConfig('system.auto_overwrite_links') || false;
  
  // 3. 准备存储目录
  const skillStorePath = join(storePath, skillName);
  
  // 4. 拉取文件
  await downloadSkill(repoPath, subPath, skillStorePath, sourceUrl);
  
  // 5. 合法性校验
  await validateSkill(skillStorePath);
  
  // 6. 软链注入
  for (const target of linkTargets) {
    await createSymlink(skillStorePath, target, skillName, autoOverwrite);
  }
  
  console.log(`✅ Skill "${skillName}" 安装成功！`);
}

/**
 * 解析 Skill 输入
 * 支持格式：
 * - user/repo
 * - user/repo/path/to/skill
 * @param {string} input - 用户输入
 * @param {string} sourceUrl - 自定义源地址
 * @returns {Object} { repoPath, subPath, skillName }
 */
function parseSkillInput(input, sourceUrl) {
  // 如果提供了自定义源地址，直接使用
  if (sourceUrl) {
    return {
      repoPath: sourceUrl,
      subPath: null,
      skillName: basename(input)
    };
  }
  
  // 解析输入路径
  const parts = input.split('/');
  
  if (parts.length === 2) {
    // 标准格式: user/repo
    return {
      repoPath: `https://github.com/${input}.git`,
      subPath: null,
      skillName: parts[1]
    };
  } else if (parts.length > 2) {
    // 带子路径格式: user/repo/path/to/skill
    const user = parts[0];
    const repo = parts[1];
    const subPath = parts.slice(2).join('/');
    const skillName = parts[parts.length - 1]; // 使用最后一级作为 skill 名称
    
    return {
      repoPath: `https://github.com/${user}/${repo}.git`,
      subPath: subPath,
      skillName: skillName
    };
  } else {
    throw new Error(`无效的 Skill 格式: ${input}。请使用 "user/repo" 或 "user/repo/path/to/skill" 格式`);
  }
}

/**
 * 下载 Skill
 * @param {string} repoPath - 仓库地址
 * @param {string} subPath - 子目录路径（可选）
 * @param {string} destPath - 目标路径
 * @param {string} customSource - 自定义源地址
 */
async function downloadSkill(repoPath, subPath, destPath, customSource) {
  // 清理已存在的目录
  if (existsSync(destPath)) {
    console.log(`🧹 清理已存在的目录: ${destPath}`);
    await remove(destPath);
  }
  
  // 确保父目录存在
  await ensureDir(join(destPath, '..'));
  
  if (customSource) {
    // 自定义源处理
    if (customSource.endsWith('.zip')) {
      await downloadZip(customSource, destPath);
    } else {
      await cloneGitRepo(customSource, destPath);
    }
  } else if (subPath) {
    // 需要下载子目录的情况
    await downloadSubdirectory(repoPath, subPath, destPath);
  } else {
    // 普通 Git 仓库克隆
    await cloneGitRepo(repoPath, destPath);
  }
  
  console.log(`📁 已下载到: ${destPath}`);
}

/**
 * 克隆 Git 仓库
 * @param {string} url - Git 地址
 * @param {string} destPath - 目标路径
 */
async function cloneGitRepo(url, destPath) {
  console.log(`📥 克隆 Git 仓库...`);
  try {
    execSync(`git clone --depth 1 "${url}" "${destPath}"`, {
      stdio: 'pipe',
      timeout: 60000
    });
  } catch (error) {
    throw new Error(`克隆仓库失败: ${error.message}`);
  }
}

/**
 * 下载 Zip 压缩包
 * @param {string} url - Zip 地址
 * @param {string} destPath - 目标路径
 */
async function downloadZip(url, destPath) {
  console.log(`📥 下载 Zip 包...`);
  const tempZip = join(destPath, '..', `temp-${Date.now()}.zip`);
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
}

/**
 * 下载仓库中的子目录
 * 使用 svn export 来下载特定目录（Git 不支持直接下载子目录）
 * @param {string} repoPath - 仓库地址
 * @param {string} subPath - 子目录路径
 * @param {string} destPath - 目标路径
 */
async function downloadSubdirectory(repoPath, subPath, destPath) {
  console.log(`📥 下载仓库子目录...`);
  
  // 将 Git 地址转换为 GitHub SVN 地址
  // https://github.com/user/repo.git -> https://github.com/user/repo/trunk/path
  const svnUrl = repoPath
    .replace(/\.git$/, '')
    .replace('https://github.com/', 'https://github.com/')
    + '/trunk/' + subPath;
  
  console.log(`🔗 SVN 地址: ${svnUrl}`);
  
  try {
    // 检查 svn 是否可用
    execSync('which svn', { stdio: 'pipe' });
  } catch {
    // svn 不可用，使用替代方案：克隆整个仓库然后复制子目录
    console.log(`⚠️  svn 未安装，使用替代方案...`);
    await downloadSubdirectoryFallback(repoPath, subPath, destPath);
    return;
  }
  
  try {
    // 使用 svn export 下载特定目录
    execSync(`svn export "${svnUrl}" "${destPath}"`, {
      stdio: 'pipe',
      timeout: 120000
    });
  } catch (error) {
    throw new Error(`下载子目录失败: ${error.message}`);
  }
}

/**
 * 下载子目录的替代方案
 * 克隆整个仓库，然后只复制需要的子目录
 * @param {string} repoPath - 仓库地址
 * @param {string} subPath - 子目录路径
 * @param {string} destPath - 目标路径
 */
async function downloadSubdirectoryFallback(repoPath, subPath, destPath) {
  const tempDir = join(destPath, '..', `temp-repo-${Date.now()}`);
  
  try {
    // 克隆仓库到临时目录
    console.log(`📥 克隆完整仓库...`);
    execSync(`git clone --depth 1 "${repoPath}" "${tempDir}"`, {
      stdio: 'pipe',
      timeout: 60000
    });
    
    // 检查子目录是否存在
    const sourceSubPath = join(tempDir, subPath);
    if (!existsSync(sourceSubPath)) {
      throw new Error(`子目录不存在: ${subPath}`);
    }
    
    // 复制子目录到目标路径
    console.log(`📋 复制子目录...`);
    await ensureDir(join(destPath, '..'));
    await copy(sourceSubPath, destPath);
    
    // 清理临时目录
    await remove(tempDir);
  } catch (error) {
    // 清理临时目录
    await remove(tempDir).catch(() => {});
    throw error;
  }
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