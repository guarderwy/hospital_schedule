<template>
  <div class="shell">
    <aside class="shell-sidebar">
      <div class="brand">
        <div class="brand-mark">HS</div>
        <div>
          <p class="brand-title">医院排班系统</p>
          <p class="brand-subtitle">Nurse Scheduling Studio</p>
        </div>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-card">
        <p class="sidebar-label">设计原则</p>
        <p class="sidebar-copy">以清晰信息层级、柔和医护色系和高频操作可达性为核心，重构现有业务界面。</p>
      </div>
    </aside>

    <div class="shell-main">
      <header class="shell-header">
        <div>
          <p class="header-kicker">Hospital Scheduler</p>
          <h1 class="header-title">{{ pageTitle }}</h1>
        </div>
        <div class="header-meta">
          <div class="meta-card">
            <span class="meta-label">当前时间</span>
            <strong>{{ timeLabel }}</strong>
          </div>
        </div>
      </header>

      <main class="shell-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Calendar, User } from '@element-plus/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { getCurrentTimeLabel } from '@/utils/date'

const route = useRoute()
const timeLabel = ref(getCurrentTimeLabel())
let timer = 0

const navItems = [
  { path: '/schedule', label: '排班中心', icon: Calendar },
  { path: '/staff', label: '人员中心', icon: User },
]

const pageTitle = computed(() => (route.path === '/staff' ? '人员中心' : '排班中心'))

onMounted(() => {
  timer = window.setInterval(() => {
    timeLabel.value = getCurrentTimeLabel()
  }, 1000)
})

onUnmounted(() => {
  window.clearInterval(timer)
})
</script>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px 1fr;
  background:
    radial-gradient(circle at top left, rgba(87, 181, 231, 0.18), transparent 24%),
    linear-gradient(180deg, #f4fbfb 0%, #edf5f7 100%);
}

.shell-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px 22px;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(9, 26, 33, 0.92);
  color: #eff6ff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #67c3d4, #98d7ba);
  color: #083344;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.brand-subtitle {
  margin: 4px 0 0;
  color: rgba(226, 232, 240, 0.72);
  font-size: 12px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  color: rgba(226, 232, 240, 0.78);
  text-decoration: none;
  transition: 0.2s ease;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(103, 195, 212, 0.16);
  color: #f8fafc;
  transform: translateX(2px);
}

.sidebar-card {
  margin-top: auto;
  padding: 18px;
  border-radius: 20px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.sidebar-label {
  margin: 0 0 8px;
  font-size: 12px;
  color: #a5f3fc;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sidebar-copy {
  margin: 0;
  line-height: 1.7;
  font-size: 13px;
  color: rgba(226, 232, 240, 0.82);
}

.shell-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.shell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px 20px;
}

.header-kicker {
  margin: 0 0 8px;
  color: var(--brand-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.header-title {
  margin: 0;
  font-size: 30px;
  line-height: 1.1;
  color: var(--ink-900);
}

.header-meta {
  display: flex;
  gap: 12px;
}

.meta-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 220px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.meta-label {
  font-size: 12px;
  color: var(--ink-500);
}

.shell-content {
  padding: 0 32px 32px;
}

@media (max-width: 1200px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .shell-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }

  .shell-header {
    padding-top: 24px;
  }
}

@media (max-width: 768px) {
  .shell-header,
  .shell-content {
    padding-left: 18px;
    padding-right: 18px;
  }

  .shell-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-card {
    min-width: 0;
    width: 100%;
  }
}
</style>
