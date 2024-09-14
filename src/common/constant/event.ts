/**
 * 主进程、渲染进程公用事件常量
 */

 /** 退出 */
export const LOGOUT = '@event/logout'

/** 登录 */
export const LOGIN = '@event/login'

/** 关闭登录面板 */
export const LOGIN_CLOSE = '@event/login-close'

/** 切换开发者工具 */
export const TOGGLE_DEVTOOLS = 'toggle-devtools'

/** 建立串口通讯 */

export const SERIALPORT = 'serialport'

/** 发送GPS串口命令 */
export const SENDGPSAGREE = 'sendgpsagree'

export const CLOSEPORT = 'closeport'

export const SENDAGREE = 'sendagree'

// 日志存储
export const SAVELOG = 'saveLog'

export const CLOSELOG = 'closeLog'

export const HANDLEFILEOPEN = 'handleFileOpen'

export const HANDLELOGFILE = 'handleLogFile'

export const STOPPLAYBACK = 'stopPlayback'

export const SETLOGFILEPATH = 'setLogFilePath'

export const SETLOGWRITESTATUS = 'setLogWriteStatus'

export const GETNTRIPMOUNTPOINTLIST = 'getNtripMountpointList'

export const SETNTRIPSERVER = 'setNtripServer'
