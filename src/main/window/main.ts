import { BrowserWindow } from 'electron'
import { options, getLoadURL, WinSubscribe, EventCallback } from './utils'
const SerialPort = require('serialport')
const ffi = require('ffi-napi');
const { ipcMain } = require('electron')

export class Main extends WinSubscribe {

  public static events: Record<string, Array<EventCallback>> = {}

  public win: BrowserWindow | null = null

  public url = getLoadURL()

  constructor(private opts?: Electron.BrowserWindowConstructorOptions) {
    super(Main.events)
  }

  public open() {
    this.win = new BrowserWindow({
      ...options,
      title: 'ucthings',
      ...this.opts,
      minWidth: 1400,
      minHeight: 700
    })
    this.win.loadURL(this.url)
    // 窗口居中
    this.win.center()
    this.win.maximize() 
    this.win.show()
    // this.win.webContents.openDevTools();
    // this.win.webContents.toggleDevTools()
    //
    // 在主进程中
    // ipcMain.on('asynchronous-message', (event, arg) => {
    //   console.log(arg) // prints "ping"
    //   event.reply('asynchronous-reply', 'pong')
    // })

    // ipcMain.on('synchronous-message', (event, arg) => {
    //   console.log(arg) // prints "ping"
    //   event.returnValue = 'pong'
    // })

  }

  public close() {
    if (!this.win) {
      return
    }
    if (this.win.isClosable()) {
      this.win.close()
      this.win = null
    }
  }

}
