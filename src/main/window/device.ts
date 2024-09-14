const SerialportOBJ = require('serialport')
import { nmeaParse } from './data-nmea-parse'
import { fileLog } from './ipcmain'
let portGps: any
SerialportOBJ.parsers = {
	ByteLength: require('@serialport/parser-byte-length'),
	CCTalk: require('@serialport/parser-cctalk'),
	Delimiter: require('@serialport/parser-delimiter'),
	InterByteTimeout: require('@serialport/parser-inter-byte-timeout'),
	Readline: require('@serialport/parser-readline'),
	Ready: require('@serialport/parser-ready'),
	Regex: require('@serialport/parser-regex'),
}
interface postParameter {
	portName: string
	baudRate: number
	dataBits: number
	parity: any
	stopBits: number
	flowControl: boolean
	autoOpen: boolean
}

export class getPortList {
	event: any
	keyIpc: string
	constructor(e: any, key: string | undefined) {
		this.event = e || {}
		this.keyIpc = key || ''
	}
	//获取串口列表方法
	getPorts() {
		let that = this
		// SerialportOBJ.list((err:any,ports:any) => {
		//     console.log(err,ports)
		// })
		SerialportOBJ.list().then(
			(res: any[]) => {
				that.event.sender.send(that.keyIpc, res)
			},
			(err: any) => {
				that.event.sender.send(that.keyIpc, 'listError')
				console.log(err)
			}
		)
	}
}

// 建立串口通讯
export class sendPorts extends getPortList {
	private agree: any
	private portConfig: postParameter | undefined
	public logCheck: boolean = false
	//   portobj: any;
	constructor(e: any, key: string | undefined, portObj: any = {}, agree: any = '') {
		super(e, key)
		if (portObj == 'close' || key == 'sendagreeMessage') {
			return
		}
		// portGps ? portGps portGps = null
		this.agree = agree
		this.portConfig = {
			portName: portObj.portName,
			baudRate: portObj.baudRate,
			dataBits: portObj.dataBits,
			parity: portObj.parity,
			stopBits: portObj.stopBits,
			flowControl: portObj.flowControl,
			autoOpen: portObj.autoOpen,
		}
	}
	// 打开串口通讯
	openPort(webContents: any) {
		let that = this
		//初始化串口
		if (portGps) {
			portGps.open((err: any) => {
				if (err) {
					that.closePort()
					console.log('Error1:' + err.message)
					return 
				}
				// that.sendAgree();
			})
		} else {
			portGps = new SerialportOBJ(this.portConfig?.portName, {
				baudRate: this.portConfig?.baudRate, // 波特率
				dataBits: this.portConfig?.dataBits, // 数据位
				parity: this.portConfig?.parity, // 奇偶校验
				stopBits: this.portConfig?.stopBits, // 停止位
				flowControl: this.portConfig?.flowControl,
				autoOpen: this.portConfig?.autoOpen,
			})

			portGps.open((err: any) => {
				if (err) {
					that.closePort()
					console.log('Error2:' + err.message)
					return
				}
				// that.sendAgree();
				that.event.sender.send(that.keyIpc, 'ok')
                that.dataMonitor(webContents)
			})
		}
		return that;
	}

	// 数据监听
	dataMonitor(webContents: any) {
		let oppr = 0
        let that = this
		if (portGps && portGps.isOpen) {
			let message = new Array()
			let once = 0
			portGps.on('data', function (data: any) {
				// 写入日志
				try {
					fileLog.writeContent(data);
				} catch (error) {
					
				}
				// data为监听到的内容
				const filteredData = data.toString();
				if (filteredData) message.push(filteredData);
				setTimeout(()=>{
					nmeaParse.parseDataSplit(data.toString(), that, webContents)
				},0)
			})

			let timer = setInterval(() => {
				oppr++;
				if(oppr === 20){
					oppr = 0
					nmeaParse.clearStoreDatas()
					message.length = 0;
				}
				if (portGps) {
					if (message) {
						let dataString = message.join('');
						nmeaParse.parseDataSerialInfos(dataString, webContents)
					}
				} else {
					clearInterval(timer)
					return
				}
			}, 1000)
		}
	}
	// 发送指令
	sendAgree(dataAgree: any) {
		let that = this
		portGps.write(dataAgree+"\r\n", (err: any) => {
			if (err) {
				that.closePort() //自动关闭串口
				return console.log('Error3:' + err.message)
			} else {
				// portGps.removeAllListeners()
				let message = 'ok'
                that.event.sender.send(that.keyIpc, message)
				// portGps.on('data', function (data: any) {
				// 	_data = data
				// 	// data为监听到的内容，即下位机返回的数据

				// 	message = message + data.toString()
				// 	console.log(message)
				// })
				// setTimeout(() => {
				// 	if (message) {
				// 		nmeaParse.parseDataSerialInfos(_data.toString())
				// 		that.event.sender.send(that.keyIpc, message)
				// 	}
				// }, 3000)
			}
		})
	}
	// 发送指令
	sendAgreeBUF(dataAgree: any) {
		if (!portGps) return;
		let that = this;
		portGps.write(dataAgree, (err: any) => {
			if (err) {
				that.closePort() //自动关闭串口
                that.event.sender.send(that.keyIpc+"Message", 'err')
				return console.log('Error3:' + err.message)
			} else {
                that.event.sender.send(that.keyIpc+"Message", 'ok')
			}
		})
	}
	// 关闭串口通讯
	closePort() {
		let that = this
		if (portGps) {
			portGps.close((err: any) => {
				if (err) {
					portGps = null
					that.event.sender.send(that.keyIpc, 'closeerror')
					return
				} else {
					portGps = null
					that.event.sender.send(that.keyIpc, 'closeok')
					return
				}
			})
		} else {
			that.event.sender.send(that.keyIpc, 'closeerrornodata')
			return
		}
	}
}