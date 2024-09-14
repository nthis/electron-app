import { dialog } from 'electron';
import { getPortList, sendPorts } from './device'
import { deviceAgree } from './device-agree'
import { nmeaParse } from './data-nmea-parse';
import { event } from '@src/common/constant';
import { NtripClient } from './ntripClient';
const { ipcMain } = require('electron')
const fs = require('fs');

let message = new Array();
let writeCount: number = -1; // 日志写入次数，超过 120 次清除换成，-1 代表未写入
let writeTimer: any = null;
let logLen: number = -1;

let fileLog: any = null; // 日志实例
let filePath = ''; // 日志路径
class LogStream {
    filePath: string // 文件路径
    private isCheck: boolean // 设置是否写入文件
    private writeStream: any
    private isFirst: boolean //是否是首次写入数据

    constructor(path: string) {
        this.filePath = path;
        this.isCheck = false;
        this.isFirst = true;

        this.initLogStream();
    }
    // 初始化文件流
    initLogStream() {
        this.writeStream = fs.createWriteStream(this.filePath);
        this.writeStream.on('draom', () => {
            console.log('可以开始写入日志~~~~');
        });
    }
    // 设置写入状态
    setCheck(val: any) {
        this.isCheck = val ? true : false
    }
    // 写入文件
    writeContent(data: any) {
        if (this.isCheck && this.writeStream) {
            // 首次写入数据加上当前写入时间
            this.writeStream.write(this.isFirst ? `日志存储时间：${this.logTime()} \n\n ${ data }` : data);

            this.isFirst = false;
        }
    }
    // 结束写入
    stopWrite() {
        this.writeStream.end();
        this.writeStream = null;
        this.isCheck = false;
    }

    logTime() {
        let time = new Date();
        let year = time.getFullYear();
        let Month = time.getMonth() + 1;
        let day = time.getDate();
        let hours = time.getHours() > 9 ? time.getHours() : '0' + time.getHours();
        let minutes = time.getMinutes() > 9 ? time.getMinutes() : '0'+time.getMinutes();
        let sconts = time.getSeconds() > 9 ? time.getSeconds() : '0' + time.getSeconds();
        let timeDate = `${year}-${Month}-${day} ${hours}:${minutes}:${sconts}`;
        return timeDate;
    }
}

// 发送读取到的日志数据，递归调用
const sendLog = (data: Array<any>, PortList: any, webContents: any, index: number = 0) => {
    let dataString = data[index] + '\n';
    nmeaParse.parseDataSplit(dataString, PortList, webContents);
    message.push(dataString);
    // console.log('data[index]:', index + '/' + logLen);

    // 重复发送数据
    if (index + 1 < logLen) {
        setTimeout(() => {
            sendLog(data, PortList, webContents, index + 1);
        }, dataString.substring(3, 6) === 'RMC' ? 900 : 0);
    } else {
        console.log('playback 完毕');
        message = [];
        clearTimeout(writeTimer);
        writeCount = -1;
        PortList.event.sender.send(PortList.ipcSendKey, 'playback 完毕');
    }
}

// 使用 playback 功能，每 1秒 回写一次日志内容
const writeLog = (webContents: any) => {
    if (writeCount > -1) {
        let dataString = message.join('');
        nmeaParse.parseDataSerialInfos(dataString, webContents);
        
        // 当写入次数超过 120 次后释放内存
        if (writeCount === 120) {
            writeCount = 0;
            nmeaParse.clearStoreDatas();
        }
        
        writeCount++;
        writeTimer = setTimeout(() => {
            writeLog(webContents);
        }, 1000);
    }
}

// 主进程与渲染进程通信
class IpcCommunication {
    ipcKey: string;
    ipcSendKey: string;
    dataLinsent!: sendPorts;
    constructor(key: string) {
        this.ipcKey = key
        this.ipcSendKey = key + "Message"
    }
    //主进程渲染通讯获取串口列表
    ipcLogicPorts() {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {
            let ports: getPortList;
            ports = new getPortList(event, this.ipcSendKey)
            ports.getPorts()
        })
    }
    // 主进程发送单灯控制器串口协议通讯
    sendPorts(webContents: any) {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {

            this.dataLinsent = new sendPorts(event, this.ipcSendKey, data, deviceAgree.gpsAgree)
            this.dataLinsent.openPort(webContents)
        })
    }

    sendAgreePort() {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {
            let openPort: sendPorts
            openPort = new sendPorts(event, this.ipcSendKey, data, deviceAgree.gpsAgree)
            openPort.sendAgree(data)
        })
    }

    // close串口通讯
    closePort() {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {
            let openPort: sendPorts
            openPort = new sendPorts(event, this.ipcSendKey, data, deviceAgree.gpsAgree)
            openPort.closePort()
        })
    }
    // 保存日志
    saveLog() {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {
            // this.dataLinsent.logCheck = data.check;
            // fileLog.path = data.path;
            // fileLog.typeFileWrite = data.typeFileWrite
            event.sender.send(this.ipcSendKey, 'ok');
        })
    }
    // 取消日志保存
    closeLog() {
        ipcMain.on(this.ipcKey, (event: any, data: any) => {
            event.sender.send(this.ipcSendKey, 'ok');
        })
    }

    // 打开文件夹
    handleFileOpen() {
        ipcMain.on(this.ipcKey, async (event: any) => {
            const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] })
            if (canceled) {
                event.sender.send(this.ipcSendKey, 'cancel');
            } else {
                event.sender.send(this.ipcSendKey, filePaths[0]);
            }
        })
    }

    // 选择 log 文件
    handleLogFile(webContents: any) {
        ipcMain.on(this.ipcKey, async (event: any) => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                properties: ['openFile'],
                filters: [{ name: '请选择日志', extensions: ['log'] }]
            });

            if (canceled) {
                event.sender.send(this.ipcSendKey, 'cancel');
            } else {
                const filePath = filePaths[0];
                // 读取 txt 文件的内容
                fs.readFile(filePath, 'utf-8', (err: any, data: any) => {
                    if (err) {
                        event.sender.send(this.ipcSendKey, 'err');
                        console.error(err);
                        return;
                    }

                    try {
                        // const filteredData = data.replace(/[^\x20-\x7E]/g, '');
 
                        // 匹配出所有 nmea 语句
                        let matches = (data + '').split('\n');
                        // const regex = /\$[A-Z]{2,5},[^*]+\*[0-9A-F]{2}/g;
                        // const matches = filteredData.match(regex);
                        if (matches) {
                            event.keyIpc = 'sendgpsagreeMessage';
                            
                            // 写入数据
                            logLen = matches.length;
                            sendLog(matches, {
                                event,
                                keyIpc: 'sendgpsagreeMessage',
                                ipcSendKey: this.ipcSendKey
                            }, webContents);
    
                            // 写入日志
                            writeCount = 0;
                            writeLog(webContents);
                        } else {
                            event.sender.send(this.ipcSendKey, 'err');
                        }
                    } catch (error) {
                        console.error('')
                    }
                });
            }
        })
    }
    // 停止 playback
    stopPlayback() {
        ipcMain.on(this.ipcKey, (event: any) => {
            message = [];
            clearTimeout(writeTimer);
            writeCount = -1;
            logLen = -1;

            event.sender.send('停止 playback')
        });
    }
    setLogFilePath() {
        ipcMain.on(this.ipcKey, (event: any, path: string) => {
            if (path && filePath !== path) {
                if (fileLog) fileLog.stopWrite();
                fileLog = new LogStream(path);

                event.sender.send('设置日志存储路径~~~');
            }
        });
    }
    setLogFileStatus() {
        ipcMain.on(this.ipcKey, (event: any, state: boolean) => {
            try {
                fileLog.setCheck(state);
                event.sender.send('设置状态成功');
            } catch (error) {
                event.sender.send('设置状态失败');
            }
        });
    }
    // 获取 ntrip 挂载点
    getNtripMountpointList() {
        ipcMain.on(this.ipcKey, (event: any, data: string) => {
            try {
                let obj = JSON.parse(data);
                NtripClient.getMountPoints(obj.port, obj.address, (err, data) => {
                    event.sender.send(this.ipcSendKey, {err, data});
                });
            } catch (error) {
                event.sender.send(this.ipcSendKey, {err: new Error('参数错误'), data: []});
            }
        });
    }
    // 连接 ntrip 服务
    setNtripServer(webContents:any) {
        ipcMain.on(this.ipcKey, (event: any, data: string) => {
            try {
                let obj = JSON.parse(data);
                // console.log(this.dataLinsent)
                NtripClient.connectNtrip({ ...obj, event, ipcKey: this.ipcKey, webContents: webContents }, (err, data) => {
                    event.sender.send(this.ipcSendKey, {err, data});
                });
            } catch (error) {
                event.sender.send(this.ipcSendKey, {err: new Error('参数错误'), data: []});
            }
        });
    }
}

export {
    IpcCommunication,
    fileLog
}
