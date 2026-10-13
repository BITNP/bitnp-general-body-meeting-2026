import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// GitHub Pages 上这个仓库部署在子路径里：https://<user>.github.io/bitnp-general-body-meeting-2026/
// 打包时必须把 base 设成这个子路径，否则 /assets、/model 之类的绝对路径都会 404。
// CI 里会用 actions/configure-pages 的输出（VITE_BASE）覆盖，所以换仓库名 / 换自定义域名都不用改这里。
const REPO_BASE = '/bitnp-general-body-meeting-2026/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // 本地 dev 仍然用根路径；build / preview 用子路径（preview 要跟产物一致才能预览）
  base: process.env.VITE_BASE ?? (command === 'build' || isPreview ? REPO_BASE : '/'),
  plugins: [vue()],
}))
