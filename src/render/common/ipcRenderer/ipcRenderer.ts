export class IpcView {
    key:string
    keyMessage:string
    constructor (key:string){
        this.key = key
        this.keyMessage = key+'Message'
    }
    // 获取主程序通讯数据
    getIpcMainData(info:any){
        return new Promise((resolve, reject)=>{
            window.$ipc.invoke(this.key)
            window.$ipc.send(this.key, info)
            window.$ipc.on(this.keyMessage, (event: any, data: any) => {
                resolve(data)
                window.$ipc.removeAllListeners(this.keyMessage)
            })
        })
    }
}