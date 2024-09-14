# ucchip-gnss-top

御智微设备测试器(ucchip-gnss-top)：基于 electron + vue3 + ts + element-plus 技术栈集成串口通信模块的御智微硬件设备测试器。主要用于设备在工厂生产下线时的合格测试，通过串口直接连接设备、读取设备信息、控制设备、测试验证设备各项功能，测试通过把设备信息上报到“智微云平台”的“设备基础信息库”，建立设备生命周期管理的第一环节基础数据。

## 项目初始化
命令：npm install (最好使用国内镜像 cnpm install)

## 基本环境配置
1. python 2.7版本并配置环境变量
2. 下载npm install -g node-gyp
3. npm install --global windows-build-tools
4. node版本在14版本

## 编译electron串口原生模块
命令：.\node_modules\.bin\electron-rebuild.cmd

## 运行项目
命令：cnpm run dev


