
const fs = require('fs')
const path = require('path')

class logFile {
    path: string | undefined
    typeFileWrite: any
    constructor() { }
    fileWriting(data: any) {
        let dataString = this.typeFileWrite.flag == 'w' ? this.timeDate + '\n\n' + data : data;
        fs.writeFile(this.path, dataString,this.typeFileWrite, (err: any) => {
            if (err) throw err;
            this.typeFileWrite = { flag: 'a', encoding: "utf-8" };
            console.log('日志存储成功！',this.typeFileWrite.flag)
        })
    }

    fileAppend(data: any) {
        // let dataString = '\n' + this.timeDate + '\n' + data
        fs.appendFile(this.path, data, (err: any) => {
            if (err) throw err;
        })
    }

    fileReading(pathUrl: string) {
        fs.readFile(pathUrl, function (err: any, data: any) {
            if (err) console.error(err);
            return data.toString()
        })
    }
    timeDate() {
        let time = new Date()
        let year = time.getFullYear()
        let Month = time.getMonth() + 1
        let day = time.getDate()
        let hours = time.getHours()
        let minutes = time.getMinutes() >= 9 ? time.getMinutes() : '0' + time.getMinutes();
        let sconts = time.getSeconds() >= 9 ? time.getSeconds() : '0' + time.getSeconds();
        let timeDate = `\n 上报时间: ${year}-${Month}-${day} ${hours}:${minutes}:${sconts} \n`;
        return timeDate
    }
}

export const fileLog = new logFile()


// export const fileLogText = (data:any,pathUrl:any,index:number = 0)=>{
//     let dataString: string = "",
//         typeFileWrite = "w";
//       if (index === 0) {
//         dataString = fileLog.timeDate() + data;
//         typeFileWrite = "w";
//       } else {
//         dataString = data;
//         typeFileWrite = "a";
//       }
//       if (data === "") {
//         dataString = "";
//       }
//       fs.writeFile(
//         pathUrl,
//         dataString,
//         { flag: typeFileWrite, encoding: "utf-8" },
//         (err: any) => {
//           if (err) { }
//         }
//       );
// }