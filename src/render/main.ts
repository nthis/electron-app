import { createApp } from 'vue'
import App from './App'
import router from './router'
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';

// vite 会编译 import 的形式；所以 electron 及 node.js 内置模块用 require 形式
const fs = require('fs')
const { ipcRenderer } = require('electron')
import 'ant-design-vue/dist/antd.css'
import '@/assets/style/boot4-part.less'
import './index.less'
window.$ipc = ipcRenderer


const app = createApp(App)
  .use(router)
  .use(ElementPlus)
  .mount('#app')
  .$nextTick(window.ClosePreloadLoading)
