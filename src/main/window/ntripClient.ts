import { Socket } from 'net';
import base64 from 'base64-js';
import { sendPorts } from './device';

interface CallbackFunction {
  (error: Error | null, result: any): void
}

interface NtripForm {
  address: string;
  port: number;
  mountpoint: string;
  userID: string;
  password: string;
  event?: any;
  ipcKey?: string;
  webContents?: any;
}

class NTRIPClient {
  private port: number | null;
  private address: string
  private client: any;
  private callBackFn!: CallbackFunction;
  private allowWrite: boolean;
  public mountpointList: Array<string> = [];
  public connectError!: Error;

  constructor() {
    this.port = null;
    this.address = '';
    this.allowWrite = false;
  }

  // 获取挂载点信息
  public getMountPoints(port: number, address: string, cb: CallbackFunction) {
    this.resetClient();
    
    this.port = port;
    this.address = address;
    this.callBackFn = cb;
    this.mountpointList.length = 0;

    this.client = new Socket();
    this.client.connect(this.port, this.address, () => {
      const request = 'GET / HTTP/1.0\r\n' +
        'User-Agent: NTRIP RTKLIB/2.4.2\r\n' +
        'Accept: */*\r\n' +
        'Connection: close\r\n' +
        '\r\n';

      this.client.write(request);
    });

    this.client.on('data', (data: ArrayBuffer) => {
      const response = data.toString();
      let mountpointList = this.parseMountPoints(response);
      this.mountpointList = Array.from(new Set([...this.mountpointList, ...mountpointList]));
      this.client.end();
    });

    this.client.on('error', (error: any) => {
      this.connectError = error;
      this.client.end();
    });
    this.client.on('end', () => {
      this.callBackFn(this.connectError, this.mountpointList);
    });
  }
  // 解析挂载点数据
  private parseMountPoints(data: string): string[] {
    // 找出返回数据中所有  'STR;' 到下一个 ';' 之间的字符
    const pattern = /STR;(.*?);/g;
    const matches = data.matchAll(pattern);

    const extractedStrings = [];
    for (const match of matches) {
      const extractedString = match[1];
      extractedStrings.push(extractedString);
    };

    return extractedStrings;
  }

  // 创建连接
  public connectNtrip(data: NtripForm, cb: CallbackFunction) {
    this.resetClient();

    this.port = data.port;
    this.address = data.address;
    this.callBackFn = cb;

    this.client = new Socket();
    this.client.connect(this.port, this.address, () => {
      let request = `GET /${data.mountpoint} HTTP/1.0\r\n`;
      request += 'User-Agent: BUSSWIL RTKLIB/2.4.2\r\n';
      request += 'Accept: */*\r\n';


      const en_pw = base64.fromByteArray(
        new TextEncoder().encode(`${data.userID}:${data.password}`)
      );
      request += `Authorization: Basic ${en_pw}\r\n`;

      request += '\r\nConnection: close\r\n\r\n';

      this.client.write(request)
      this.allowWrite = true; // 连接后才可以写入数据
    });

    this.client.on('data', (buf: ArrayBuffer) => {
      const portGps = new sendPorts(data.event, data.ipcKey);
      portGps.sendAgreeBUF(buf);
    });
  }

  private resetClient() {
    // 如果已连接 tcp 先断开原有连接再连接新的 tcp
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }

  // 向基站发送数据
  public sendData(data: string) {
    // 限制写入频率，一秒写一次
    if (this.client && this.allowWrite) {
      this.allowWrite = false;
      setTimeout(() => {
        this.allowWrite = true;
      }, 1000);

      this.client.write(data + '\r\n');
    }
  }
}

export const NtripClient = new NTRIPClient();
