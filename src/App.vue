<script setup>
import { ref, onMounted } from 'vue'
import { 
  Package, 
  Download, 
  RefreshCw, 
  Terminal, 
  Zap, 
  Shield, 
  Github, 
  Twitter,
  ChevronRight,
  Star,
  Command,
  CheckCircle2,
  ArrowRight
} from 'lucide-vue-next'

const isVisible = ref(false)
const copied = ref(false)

onMounted(() => {
  isVisible.value = true
})

const copyInstall = () => {
  navigator.clipboard.writeText('npm install -g open-skill-manager')
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}

const features = [
  {
    icon: Package,
    title: '一键安装',
    desc: '简单命令即可安装和管理 AI Agent Skills',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: RefreshCw,
    title: '自动同步',
    desc: '跨设备自动同步技能配置，无缝切换工作环境',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Shield,
    title: '版本管理',
    desc: '智能版本控制和回滚，确保稳定性',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Zap,
    title: '极速体验',
    desc: '优化的缓存机制，秒级安装响应',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Terminal,
    title: 'CLI 工具',
    desc: '强大的命令行接口，自动化工作流',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Star,
    title: '社区生态',
    desc: '丰富的开源技能库，持续更新',
    color: 'from-yellow-500 to-orange-500'
  }
]

const commands = [
  { cmd: 'osm install skill-name', desc: '安装指定技能' },
  { cmd: 'osm sync', desc: '同步所有技能' },
  { cmd: 'osm list', desc: '列出已安装技能' },
  { cmd: 'osm config', desc: '配置管理' }
]
</script>

<template>
  <div class="min-h-screen gradient-bg">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 z-50 glass-card border-b border-slate-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Package class="w-6 h-6 text-white" />
            </div>
            <span class="font-bold text-xl text-slate-800">OSM</span>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-slate-600 hover:text-primary-600 transition-colors">功能</a>
            <a href="#commands" class="text-slate-600 hover:text-primary-600 transition-colors">命令</a>
            <a href="https://www.npmjs.com/package/open-skill-manager" target="_blank" class="btn-primary flex items-center gap-2">
              <Download class="w-4 h-4" />
              安装
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow" style="animation-delay: 2s"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div 
          class="transition-all duration-1000 transform"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 shadow-sm mb-8">
            <span class="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-sm font-medium text-slate-600">v1.0.1 现已发布</span>
          </div>

          <!-- Title -->
          <h1 class="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span class="text-slate-900">Open</span>
            <span class="gradient-text">Skill Manager</span>
          </h1>
          
          <p class="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            优雅管理 AI Agent Skills 的命令行工具。<br class="hidden md:block">
            一键安装、自动同步、跨平台支持。
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button @click="copyInstall" class="btn-primary flex items-center gap-2 text-lg">
              <CheckCircle2 v-if="copied" class="w-5 h-5" />
              <Terminal v-else class="w-5 h-5" />
              {{ copied ? '已复制!' : 'npm install -g open-skill-manager' }}
            </button>
            <a href="https://github.com/Winterbang/OpenSkillManager" target="_blank" class="btn-secondary flex items-center gap-2">
              <Github class="w-5 h-5" />
              GitHub
            </a>
          </div>

          <!-- Stats -->
          <div class="flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div class="flex items-center gap-2">
              <Download class="w-5 h-5 text-primary-500" />
              <span class="font-semibold">1,000+</span>
              <span>下载</span>
            </div>
            <div class="flex items-center gap-2">
              <Star class="w-5 h-5 text-yellow-500" />
              <span class="font-semibold">100+</span>
              <span>Stars</span>
            </div>
            <div class="flex items-center gap-2">
              <Command class="w-5 h-5 text-secondary-500" />
              <span class="font-semibold">50+</span>
              <span>Skills</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 lg:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            强大而简单的功能
          </h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto">
            为 AI Agent 开发者和用户打造的专业工具
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="feature-card group"
          >
            <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`">
              <component :is="feature.icon" class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-xl font-semibold text-slate-900 mb-2">{{ feature.title }}</h3>
            <p class="text-slate-600">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Commands Section -->
    <section id="commands" class="py-20 lg:py-32 bg-slate-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
              简洁的命令行界面
            </h2>
            <p class="text-lg text-slate-400 mb-8">
              直观的命令设计，让您快速上手。支持自动补全和详细帮助文档。
            </p>
            <div class="space-y-4">
              <div 
                v-for="(item, index) in commands" 
                :key="index"
                class="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700"
              >
                <code class="text-primary-400 font-mono text-sm">{{ item.cmd }}</code>
                <span class="text-slate-400">{{ item.desc }}</span>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="code-block">
              <div class="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700">
                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <pre class="text-sm leading-relaxed"><span class="text-slate-500">$</span> <span class="text-primary-400">osm</span> install buffett-analysis
<span class="text-green-400">✓</span> 正在解析 buffett-analysis
<span class="text-green-400">✓</span> 下载依赖...
<span class="text-green-400">✓</span> 安装完成!

<span class="text-slate-500">$</span> <span class="text-primary-400">osm</span> sync
<span class="text-blue-400">ℹ</span> 正在同步 12 个 skills...
<span class="text-green-400">✓</span> 同步完成

<span class="text-slate-500">$</span> <span class="text-primary-400">osm</span> list
<span class="text-yellow-400">→</span> buffett-analysis  v1.0.0
<span class="text-yellow-400">→</span> a-stock-monitor   v1.1.2
<span class="text-yellow-400">→</span> skill-creator     v0.1.0</pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 lg:py-32">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="glass-card rounded-3xl p-8 md:p-12 text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            开始您的技能管理之旅
          </h2>
          <p class="text-lg text-slate-600 mb-8">
            只需一行命令，即可体验优雅的 AI Agent Skills 管理
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button @click="copyInstall" class="btn-primary flex items-center gap-2 text-lg">
              <Terminal class="w-5 h-5" />
              {{ copied ? '已复制到剪贴板!' : 'npm install -g open-skill-manager' }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Package class="w-5 h-5 text-white" />
            </div>
            <span class="font-bold text-lg text-slate-800">OSM</span>
          </div>
          <div class="flex items-center gap-6">
            <a href="https://github.com/Winterbang/OpenSkillManager" target="_blank" class="text-slate-500 hover:text-slate-800 transition-colors">
              <Github class="w-5 h-5" />
            </a>
            <a href="#" class="text-slate-500 hover:text-slate-800 transition-colors">
              <Twitter class="w-5 h-5" />
            </a>
          </div>
          <p class="text-slate-500 text-sm">
            © 2026 OpenSkillManager. MIT License.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Additional custom styles */
</style>
