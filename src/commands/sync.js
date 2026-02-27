import { readdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { getConfig } from './config.js';
import { resolveHomePath } from '../utils/path.js';
import fs from 'fs-extra';

const { ensureDir, ensureSymlink, remove } = fs;

/**
 * 同步所有 Skill 到配置的软链目录
 * 扫描 store_path 中的所有 skill，为每个 skill 在所有 link_targets 中创建软链
 */
export async function syncSkills() {
  console.log('🔄 开始同步 Skills...');
  
  // 1. 获取配置
  const storePath = getConfig('store_path');
  const linkTargets = getConfig('link_targets') || [];
  const autoOverwrite = getConfig('system.auto_overwrite_links') || false;
  
  // 2. 检查存储目录是否存在
  if (!existsSync(storePath)) {
    console.log('📂 存储目录不存在，暂无 Skills 需要同步');
    return;
  }
  
  // 3. 扫描所有已安装的 skill
  const skills = scanSkills(storePath);
  
  if (skills.length === 0) {
    console.log('📭 暂无已安装的 Skills');
    return;
  }
  
  console.log(`📦 发现 ${skills.length} 个 Skill(s): ${skills.map(s => s.name).join(', ')}`);
  console.log(`🔗 目标软链目录: ${linkTargets.length} 个`);
  console.log('');
  
  // 4. 同步每个 skill 到所有 link_targets
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const skill of skills) {
    console.log(`📋 同步 Skill: ${skill.name}`);
    
    for (const target of linkTargets) {
      try {
        const result = await syncSkillToTarget(skill.path, target, skill.name, autoOverwrite);
        if (result === 'created') {
          successCount++;
        } else if (result === 'skipped') {
          skipCount++;
        }
      } catch (error) {
        console.error(`  ❌ ${target}: ${error.message}`);
        errorCount++;
      }
    }
    console.log('');
  }
  
  // 5. 输出统计
  console.log('✅ 同步完成！');
  console.log(`   创建软链: ${successCount}`);
  console.log(`   跳过已有: ${skipCount}`);
  if (errorCount > 0) {
    console.log(`   失败: ${errorCount}`);
  }
}

/**
 * 扫描存储目录中的所有 Skill
 * @param {string} storePath - 存储路径
 * @returns {Array} [{ name, path }, ...]
 */
function scanSkills(storePath) {
  const skills = [];
  
  try {
    const entries = readdirSync(storePath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = join(storePath, entry.name);
        const skillMdPath = join(skillPath, 'SKILL.md');
        
        // 验证是否是合法的 skill（包含 SKILL.md）
        if (existsSync(skillMdPath)) {
          skills.push({
            name: entry.name,
            path: skillPath
          });
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  扫描存储目录时出错: ${error.message}`);
  }
  
  return skills;
}

/**
 * 同步单个 Skill 到指定目标目录
 * @param {string} sourcePath - Skill 源路径
 * @param {string} targetDir - 目标目录
 * @param {string} skillName - Skill 名称
 * @param {boolean} autoOverwrite - 是否自动覆盖
 * @returns {string} 'created' | 'skipped' | 'overwritten'
 */
async function syncSkillToTarget(sourcePath, targetDir, skillName, autoOverwrite) {
  const resolvedTargetDir = resolveHomePath(targetDir);
  const skillsDir = join(resolvedTargetDir, 'skills');
  const linkPath = join(skillsDir, skillName);
  
  // 确保目标 skills 目录存在
  await ensureDir(skillsDir);
  
  // 检查是否已存在
  if (existsSync(linkPath)) {
    // 检查是否指向正确的目标
    try {
      const existingTarget = await fs.readlink(linkPath);
      if (existingTarget === sourcePath) {
        console.log(`  ⏭️  ${targetDir}: 已存在且指向正确`);
        return 'skipped';
      }
      
      // 指向不同目标
      if (autoOverwrite) {
        console.log(`  📝 ${targetDir}: 已存在但指向不同，自动覆盖`);
        await remove(linkPath);
      } else {
        console.log(`  ⚠️  ${targetDir}: 已存在但指向不同，跳过（设置 auto_overwrite_links 为 true 可自动覆盖）`);
        return 'skipped';
      }
    } catch {
      // 不是软链接，可能是普通目录或文件
      if (autoOverwrite) {
        console.log(`  📝 ${targetDir}: 已存在（非软链），自动覆盖`);
        await remove(linkPath);
      } else {
        console.log(`  ⚠️  ${targetDir}: 已存在（非软链），跳过`);
        return 'skipped';
      }
    }
  }
  
  // 创建软链接
  await ensureSymlink(sourcePath, linkPath, 'dir');
  console.log(`  ✅ ${targetDir}: 软链创建成功`);
  return 'created';
}
