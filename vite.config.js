import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔍 Vite 配置加载完成')
  console.log('📝 环境变量 VITE_GOOGLE_AI_API_KEY:', env.VITE_GOOGLE_AI_API_KEY ? '✅ 已设置' : '❌ 未设置')
  
  return {
    plugins: [react()],
    base: '/uniapp_web/',
    server: {
      port: 5173
    },
    build: {
      outDir: 'dist'
    },
    define: {
      // 确保环境变量在运行时可用
      'import.meta.env.VITE_GOOGLE_AI_API_KEY': JSON.stringify(env.VITE_GOOGLE_AI_API_KEY)
    }
  }
})