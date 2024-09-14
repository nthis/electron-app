/**
 * electron 主文件
 */
import { join } from "path";
import { BrowserWindow, app } from "electron";
import { Main, IpcCommunication } from "./window";
import dotenv from "dotenv";
import {
  SERIALPORT,
  SENDGPSAGREE,
  CLOSEPORT,
  SENDAGREE,
  SAVELOG,
  CLOSELOG,
  HANDLEFILEOPEN,
  HANDLELOGFILE,
  STOPPLAYBACK,
  SETLOGFILEPATH,
  SETLOGWRITESTATUS,
  GETNTRIPMOUNTPOINTLIST,
  SETNTRIPSERVER
} from "@src/common/constant/event";

dotenv.config({ path: join(__dirname, "../../.env") });

let webContents: any = null

function init() {
  //   const loginWin = new Login()
  const mainWin = new Main();

  const mainOpen = () => {
    mainWin.open();

    const serialportObject = mainWin.subscribe(SERIALPORT, (win) => {
      serialportObject();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SERIALPORT);
      ipc.ipcLogicPorts();
    });

    const gpsAgreeSend = mainWin.subscribe(SENDGPSAGREE, (win) => {
      gpsAgreeSend()
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SENDGPSAGREE);
      ipc.sendPorts(webContents);
    })
    const closePort = mainWin.subscribe(CLOSEPORT, (win) => {
      closePort()
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(CLOSEPORT);
      ipc.closePort();
    })

    // 发送串口命令
    const sendAgreePort = mainWin.subscribe(SENDAGREE, (win) => {
      sendAgreePort()
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SENDAGREE);
      ipc.sendAgreePort();
    })

    // 日志存储保存
    const saveLog = mainWin.subscribe(SAVELOG, (win) => {
      saveLog();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SAVELOG);
      ipc.saveLog();
    })
    // 取消日志保存
    const closeLog = mainWin.subscribe(CLOSELOG, (win) => {
      closeLog();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(CLOSELOG);
      ipc.closeLog();
    })

    // 打开文件夹
    const openFile = mainWin.subscribe(HANDLEFILEOPEN, (win) => {
      openFile();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(HANDLEFILEOPEN);
      ipc.handleFileOpen();
    })

    // 选择日志文件
    const chooseLogFile = mainWin.subscribe(HANDLELOGFILE, () => {
      chooseLogFile();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(HANDLELOGFILE);
      ipc.handleLogFile(webContents);
    })

    // 停止 playback
    const stopPlayback = mainWin.subscribe(STOPPLAYBACK, () => {
      stopPlayback();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(STOPPLAYBACK);
      ipc.stopPlayback();
    })

    // 设置日志文件路径
    const setLogFilePath = mainWin.subscribe(SETLOGFILEPATH, () => {
      setLogFilePath();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SETLOGFILEPATH);
      ipc.setLogFilePath();
    })
    // 设置日志写入状态
    const setLogWriteStatus = mainWin.subscribe(SETLOGWRITESTATUS, () => {
      setLogWriteStatus();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SETLOGWRITESTATUS);
      ipc.setLogFileStatus();
    });

    // 获取 ntrip 挂载点西信息
    const getNtripMountpointList = mainWin.subscribe(GETNTRIPMOUNTPOINTLIST, () => {
      getNtripMountpointList();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(GETNTRIPMOUNTPOINTLIST);
      ipc.getNtripMountpointList();
    });
    // 配置 ntrip 服务
    const setNtripServer = mainWin.subscribe(SETNTRIPSERVER, () => {
      setNtripServer();
      let ipc: IpcCommunication;
      ipc = new IpcCommunication(SETNTRIPSERVER);
      ipc.setNtripServer(webContents);
    });

    // const unsubscribeDevtool = mainWin.subscribe(TOGGLE_DEVTOOLS, win => {
    //   mainWin.win?.webContents.toggleDevTools()
    // })
    // const unsubscribeLogin = mainWin.subscribe(LOGOUT, win => {
    //   unsubscribeDevtool()
    //   unsubscribeLogin()
    //   mainWin.close()
    // })
  };
  mainOpen();
}

app.whenReady().then(() => {
  init();
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    webContents = mainWindow.webContents;
  }
});
