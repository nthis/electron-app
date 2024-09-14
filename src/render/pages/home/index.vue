<template>
  <div class="home">
    <div class="header">
      <div class="header-item" @click="tabClick(0, 0)">
        <img src="../../assets/equipAccess.png" alt="" />
        <div class="label">设备接入</div>
      </div>
      <div class="header-item">
        <img src="../../assets/serialInfor.png" alt="" />
        <div class="label">串口信息</div>
      </div>
      <div class="header-item" @click="tabClick(0, 2)">
        <img src="../../assets/basicInfor.png" alt="" />
        <div class="label">基本信息</div>
      </div>
      <div class="header-item" @click="tabClick(0, 3)">
        <img src="../../assets/utc.png" alt="" />
        <div class="label">世界协调时</div>
      </div>
      <div class="header-item" @click="tabClick(0, 4)">
        <img src="../../assets/speed.png" alt="" />
        <div class="label">速度</div>
      </div>
      <!--      <div class="header-item"-->
      <!--           @click="tabClick(0, 5)">-->
      <!--        <img src="../../assets/bulletGraph.png"-->
      <!--             alt="">-->
      <!--        <div class="label">靶心图</div>-->
      <!--      </div>-->
      <div class="header-item" @click="tabClick(0, 6)">
        <img src="../../assets/map.png" alt="" />
        <div class="label">地图</div>
      </div>
      <div class="header-item" @click="tabClick(0, 7)">
        <img src="../../assets/stellarMap.png" alt="" />
        <div class="label">星空图</div>
      </div>
      <!-- <div class="header-item" @click="tabClick(0, 8)">
        <img src="../../assets/satelliteSignal.png" alt="" />
        <div class="label">卫星信号</div>
      </div> -->
      <div class="header-item" @click="openNtripSet">
        <img src="../../assets/satelliteSignal.png" alt="" />
        <div class="label">NTRIP配置</div>
      </div>
      <div class="header-item" @click="playback">
        <img src="../../assets/playback.png" alt="" />
        <div class="label">playback</div>
      </div>
    </div>
    <div class="charts">
      <div class="charts-item">
        <el-row :gutter="24" style="margin-bottom: 24px; height: 50%">
          <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" style="height: 100%">
            <Clock></Clock>
            <!-- <h2>世界时</h2> -->
          </el-col>
          <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16" style="height: 100%">
            <SignalStrength :data="stellarMapData"></SignalStrength>
            <!-- <h2>信号强度</h2> -->
          </el-col>
          <el-col :xs="4" :sm="4" :md="4" :lg="4" :xl="4" style="height: 100%">
            <SatelliteSpeed :data="speedData"></SatelliteSpeed>
            <!-- <h2>速度</h2> -->
          </el-col>
        </el-row>

        <el-row :gutter="24" style="margin-bottom: 24px; height: 50%">
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" style="height: 100%">
            <StellarMap :data="stellarMapData"></StellarMap>
            <!-- <h2>星空图</h2> -->
          </el-col>
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" style="height: 100%">
            <BaseInfo :data="basicInfos"></BaseInfo>
          </el-col>
        </el-row>
      </div>
      <div class="charts-item">
        <el-row :gutter="24" style="margin-bottom: 24px; height: 50%">
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" style="height: 100%">
            <Serialport
              :fullStatus="fullStatus"
              :data="serialInfos"
              :isContant="connactText === '断开'"
              :isPlayback="isPlayback"
              @sendAgree="sendAgree"
              @fullScreenStatus="fullScreenStatus"
              @changeFilterKeys="changeFilterKeys"
            ></Serialport>
            <!-- <h2>串口信息</h2> -->
          </el-col>
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" style="height: 100%">
            <Map ref="gnssMap" :data="mapData" :fullStatus="fullMapStatus"
              @fullMapScreenStatus="fullMapScreenStatus"></Map>
            <!-- <h2>地图</h2> -->
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-bottom: 24px; height: 50%">
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" style="height: 100%">
            <BullCharts :dataList="bullList" @clearBullData="clearDataBull"></BullCharts>
          </el-col>
        </el-row>
      </div>
      <div class="charts-item">
        <el-row :gutter="24" style="margin-bottom: 24px; height: 50%"></el-row>
      </div>
    </div>

    <el-drawer title="连接设备" v-model="drawerVisible" direction="ltr" append-to-body :close-on-click-modal="true"
      size="20%">
      <div class="drawer-box">
        <div class="select-item">
          <p>Port</p>
          <el-select v-model="port" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in portList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-item">
          <p>Baud rate</p>
          <el-select v-model="baudRate" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in baudRateList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-item">
          <p>Data bits</p>
          <el-select v-model="dataBits" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in dataBitsList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-item">
          <p>Stop bits</p>
          <el-select v-model="stopBits" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in stopBitsList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-item">
          <p>Parity</p>
          <el-select v-model="parity" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in parityList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="select-item">
          <p>Flow control</p>
          <el-select v-model="clowControl" placeholder="请选择" style="width: 100%">
            <el-option v-for="item in clowControlList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        
        <div class="drawer__footer" style="text-align: center">
          <!-- <el-button size="small" :disabled="connactText === '连接'" @click="openNtripSet">NTRIP配置</el-button> -->
          <el-button size="small" @click="drawerVisible = false">取消</el-button>
          <el-button size="small" class="connact-btn" type="primary" @click="connact" :loading="loading">{{ connactText
          }}</el-button>
        </div>
      </div>
    </el-drawer>

    <NtripSetting ref="NTRIPSetting" />

    <el-dialog v-model="dialogVisible" title="提示" width="30%">
      <p class="style-tip-port">当前串口号无法打开！请检查后重新打开！</p>
      <p class="style-tip-port">1. usb串口松了?</p>
      <p class="style-tip-port">2. 波特率设置太高?</p>
      <p class="style-tip-port">3. 主板串口不能大于115200BPS且停止位不能用1.5位</p>
      <p class="style-tip-port">4. USB串口无此限制.请试一下：115200，8，1，None，None</p>
      <p class="style-tip-port">5. 是否被其他程序占用了?</p>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SignalStrength from "../../components/signalStrength.vue";
import Clock from "@/components/clock.vue";
import Map from "@/components/Map.vue";
import StellarMap from "../../components/stellarMap.vue";
import BaseInfo from "../../components/baseInfo.vue";
import SatelliteSpeed from "../../components/satelliteSpeed.vue";
import Serialport from "../../components/serialport.vue";
import BullMap from "../../components/bullMap.vue";
import BullCharts from "../../components/bullCharts.vue";
import NtripSetting from '../../components/ntripSetting.vue'
import { IpcView } from "@/common/ipcRenderer/ipcRenderer";
import {
  SERIALPORT,
  SENDGPSAGREE,
  CLOSEPORT,
  SENDAGREE,
  HANDLELOGFILE,
  STOPPLAYBACK,
} from "@src/common/constant/event";
import { Modal, message } from "ant-design-vue";
import { throttle } from "echarts";

const { ipcRenderer } = require('electron');
let portTim: any = null;
let windowObj: any = window;

const systemEnum: any = {
  'GPS': 'G',
  'GLO': 'R',
  'GAL': 'E',
  'QZS': 'Q',
  'BDS': 'B',
  'SBS': 'S',
  'IRN': 'I'
}

interface SatelliteData {
  azimuth: number;
  elevation: number;
  satelliteSystem: string;
  signalStrength: number;
};
let tuple: [number, number, string, string, number];

export default defineComponent({
  name: "Home",
  components: {
    SignalStrength,
    SatelliteSpeed,
    Map,
    StellarMap,
    Clock,
    Serialport,
    BaseInfo,
    BullMap,
    BullCharts,
    NtripSetting,
  },

  methods: {
    clearStore() {
      this.mapData = new Array();
      this.bullList = new Array();
    },
    // 清除星空图
    clearDataBull(data: any) {
      this.bullList = new Array();
    },
    //串口信息退出大屏
    fullScreenStatus(state: any) {
      this.fullStatus = !state;
    },
    // 地图退出大屏
    fullMapScreenStatus(state: any) {
      this.fullMapStatus = !state
    },


    // 发送协议
    sendAgree(data: any) {
      let ports: IpcView;
      ports = new IpcView(SENDAGREE);
      ports.getIpcMainData(data).then((res: any) => {
        message.success("发送成功");
      });
    },

    /* 断开连接
     *  */
    closePort() {
      let ports: IpcView;
      ports = new IpcView(CLOSEPORT);
      ports.getIpcMainData("close").then((res: any) => {
        if (res == "closeok" || res === 'closeerror') {
          this.connactText = "连接";
          this.loading = false;
          message.success("断开连接成功");
        } else {
          this.connactText = "断开";
        }
      });
    },

    /* 获取串口列表 */
    initPortList() {
      let that = this;
      that.portList = new Array();
      let ports: IpcView;
      ports = new IpcView(SERIALPORT);
      ports
        .getIpcMainData("ping")
        .then((res: any) => {
          if (res === "listError") {
            message.error("获取串口失败");
            return;
          }
          res.forEach((item: any, index: any) => {
            let obj: any = {
              label: item.path,
              value: item.path,
            };
            this.portList.push(obj);
          });
          if (!this.port) {
            this.port = this.portList[0] && this.portList[0].value;
          };
        })
        .catch((err: any) => {
          console.log(err);
        });
    },

    /* 链接或者断开 */
    connact() {
      this.loading = true;
      const form = {
        portName: this.port || "COM1",
        flowControl: false,
        parity: this.parity,
        stopBits: Number(this.stopBits),
        dataBits: Number(this.dataBits),
        baudRate: Number(this.baudRate),
        autoOpen: false,
      };
      if (this.connactText === "断开") {
        this.closePort();
        clearInterval(portTim);
        return;
      }
      let openPort: IpcView;
      openPort = new IpcView(SENDGPSAGREE);
      openPort.getIpcMainData(form).then((res: any) => {
        if (res === "ok") {
          message.success("连接成功");
          this.connactText = "断开";
        } else {
          message.error("连接失败");
          this.connactText = "连接";
          this.dialogVisible = true;
        }
        this.loading = false;
        this.drawerVisible = false;
      });
    },
    /**
     * @description 处理星空图数据
     * @param stellarMap 通过 GSV 语句解析出来的卫星信号信息 { '卫星系统-卫星编号': SatelliteData }
     * @param joinSatellite 通过 GSA 语句解析出来的参与定位的卫星 { '卫星系统-卫星编号': 卫星编号(number) }
     *  */
    parseStellarMap(stellarMap: { [key: string]: SatelliteData }, joinSatellite: { [key: string]: number }) {
      return Object.keys(stellarMap).reduce((prov, cur: string) => {
        let satelliteInfo = [
          Number(stellarMap[cur].elevation || 0) / 10,
          Number((Number(stellarMap[cur].azimuth) / 15).toFixed(1)),
          // stellarMap[cur].satelliteSystem[0] + cur,
          (systemEnum[stellarMap[cur].satelliteSystem] || '') + (cur + '').split('-')[1],
          stellarMap[cur].satelliteSystem,
          stellarMap[cur].signalStrength,
        ];
        // QZS 卫星编号不会与其他卫星系统编号重新，只需要判断卫星编号即可
        switch (stellarMap[cur].satelliteSystem) {
          case 'QZS':
            let joinKeys = Object.values(joinSatellite);
            let satelliteNumber = Number(cur.split('-')[1])
            joinKeys.includes(satelliteNumber) ? prov.joinData.push(satelliteInfo): prov.unJoinData.push(satelliteInfo);
            break;
          default:
            joinSatellite[cur] ? prov.joinData.push(satelliteInfo): prov.unJoinData.push(satelliteInfo);
            break;
        }

        return prov;
      }, { joinData: [] as Array<any>, unJoinData: [] as Array<any> });
    },

    tabClick(item: any, i: any) {
      if (i === 0) {
        if (this.isPlayback) {
          message.warning('当前正在 playback')
          return;
        }

        this.drawerVisible = true;
        this.initPortList();
      }
    },
    playback() {
      if (this.isPlayback) {
        // message.warning('当前正在 playback')
        this.stopPlayback();
        return;
      }

      this.mapData = [];
      this.bullList = [];
      // 如果连接了串口，断开串口连接
      if (this.connactText === '断开') this.closePort();
      this.isPlayback = true;

      // 清除地图路线
      this.$refs.gnssMap.clearMap();

      let ports: IpcView;
      ports = new IpcView(HANDLELOGFILE);
      ports.getIpcMainData('').then((res: any) => {
        // console.log('chooseFile:', res)
        this.isPlayback = false;
        clearInterval(portTim);

        res === 'cancel' ? message.info('取消 playback') : message.success(res);
      });
    },
    stopPlayback() {
      Modal.confirm({
        title: '提示!',
        content: '当前正在 playback 中，是否停止 playback',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          let ports: IpcView;
          ports = new IpcView(STOPPLAYBACK);
          ports.getIpcMainData('').then(res => {
            console.log('停止 playback:', res)
          })
        },
        onCancel: () => { }
      })
    },
    formatBasicInfos(basicInfos: any) {
      if (
        basicInfos &&
        basicInfos?.latitude !== this.repeatCom.latitude &&
        basicInfos?.longitude !== this.repeatCom.longitude &&
        basicInfos?.latitude && basicInfos?.longitude
      ) {
        this.mapData.push({
          latitude: basicInfos?.latitude,
          longitude: basicInfos?.longitude,
        });
        this.bullList.push({
          latitude: basicInfos?.latitude,
          longitude: basicInfos?.longitude,
        });
        this.repeatCom.latitude = basicInfos?.latitude;
        this.repeatCom.longitude = basicInfos?.longitude;
      }
      this.basicInfos = basicInfos;
    },
    formatMapData() {
      const GPSData = this.parseStellarMap(this.stellarMapGPS, this.joinSatelliteGPS);
      // const BDSData = this.parseStellarMap(this.stellarMapBDS, this.joinSatelliteBDS);
      this.stellarMapData = {
        joinData: [...GPSData.joinData],
        unJoinData: [...GPSData.unJoinData],
      };
    },
    openNtripSet() {
      if (this.connactText === '连接') {
        message.warning('请先连接串口');
        return
      };

      this.$refs.NTRIPSetting.openDialog();
    },
    changeFilterKeys(filterKeys: Array<string>) {
      this.filterKeys = filterKeys;
    },
    isNMEACode(code: string) {
      return this.filterKeys.reduce((prov: boolean, cur: string) => {
        if (code.indexOf(cur) > -1) prov = true;

        return prov;
      }, false);
    }
  },

  data() {
    return {
      fullMapStatus: false,
      fullStatus: false,
      basicInfos: {
        latitude: "",
        longitude: "",
        ellipsoid_height: "",
        altitude: "",
        locationMode: "",
        hdop: "",
        pdop: "",
        satellites_tracked: "",
      },
      connactText: "连接",
      parseStore: {},
      stellarMapData: {},
      speedData: [],
      serialInfos: "",
      mapData: new Array(),
      bullList: new Array(),
      loading: false,
      portList: new Array(),
      port: "",
      parity: "none",
      parityList: [
        {
          value: "none",
          label: "none",
        },
        {
          value: "odd",
          label: "odd",
        },
        {
          value: "even",
          label: "even",
        },
        {
          value: "mark",
          label: "mark",
        },
        {
          value: "space",
          label: "space",
        },
      ],
      clowControl: "None",
      clowControlList: [
        {
          value: "None",
          label: "None",
        },
        {
          value: "Hardware",
          label: "Hardware",
        },
        {
          value: "Software",
          label: "Software",
        },
        {
          value: "Custom",
          label: "Custom",
        },
      ],
      stopBitsList: [
        {
          value: "1",
          label: "1",
        },
        {
          value: "1.5",
          label: "1.5",
        },
        {
          value: "2",
          label: "2",
        },
      ],
      stopBits: "1",
      dataBitsList: [
        {
          value: "5",
          label: "5",
        },
        {
          value: "6",
          label: "6",
        },
        {
          value: "7",
          label: "7",
        },
        {
          value: "8",
          label: "8",
        },
      ],
      dataBits: "8",
      baudRateList: [
        {
          value: "9600",
          label: "9600",
        },
        {
          value: "14400",
          label: "14400",
        },
        {
          value: "19200",
          label: "19200",
        },
        {
          value: "38400",
          label: "38400",
        },
        {
          value: "43000",
          label: "43000",
        },
        {
          value: "57600",
          label: "57600",
        },
        {
          value: "76800",
          label: "76800",
        },
        {
          value: "115200",
          label: "115200",
        },
        {
          value: "128000",
          label: "128000",
        },
        {
          value: "230400",
          label: "230400",
        },
        {
          value: "256000",
          label: "256000",
        },
        {
          value: "460800",
          label: "460800",
        },
        {
          value: "500000",
          label: "500000",
        },
        {
          value: "512000",
          label: "512000",
        },
        {
          value: "600000",
          label: "600000",
        },
      ],
      baudRate: "115200",
      drawerVisible: false,
      headerList: [
        {
          src: "../../assets/equipAccess.png",
          label: "设备接入",
        },
        // {
        //   src: '../../assets/serialInfor.png',
        //   label: '串口信息',
        // },
        // {
        //   src: '../../assets/basicInfor.png',
        //   label: '基本信息',
        // },
        // {
        //   src: '../../assets/utc.png',
        //   label: '世界协调时'
        // }, {
        //   src: '../../assets/speed.png',
        //   label: '速度'
        // }, {
        //   src: '../../assets/bulletGraph.png',
        //   label: '靶心图'
        // },
        // {
        //   src: '../../assets/map.png',
        //   label: '地图'
        // },
        // {
        //   src: '../../assets/stellarMap.png',
        //   label: '星空图'
        // },
        // {
        //   src: '../../assets/satelliteSignal.png',
        //   label: '卫星信号'
        // },
      ],
      repeatCom: { latitude: 0, longitude: 0 },
      dialogVisible: false,
      isPlayback: false, // 是否处于 playback
      stellarMapGPS: {},
      joinSatelliteGPS: {},
      stellarMapBDS: {},
      joinSatelliteBDS: {},

      NTRIP: {
        address: '',
        mountpoint: '',
        userID: '',
        password: ''
      },
      mountpointList: [
        { label: '', value: '' }
      ],
      filterKeys: [] as Array<string>
    };
  },

  mounted() {
    this.mountpointList.splice(0, 1)

    this.clearStore();
    let that: any = this;
    document.onkeydown = function (event) {
      let key: any = windowObj.event.keyCode;
      if (key == 27) {
        that.fullStatus = false
        that.fullMapStatus = false
      }
    };

    // 参与定位key
    ipcRenderer.on('STELLARMAPGPS', (event, data) => {
      this.stellarMapGPS = data.message;
    });
    // 参与定位的卫星系统
    ipcRenderer.on('JOINSATELLITEGPS', (event, data) => {
      this.joinSatelliteGPS = data.message;
      this.formatMapData();
    });

    // 监听日志信息
    ipcRenderer.on('SERIALINFOS', (event, data) => {
      if (data.message) {
        const logArr = data.message.split('\n').reduce((prov: Array<string>, cur: string) => {
          if (cur.startsWith('日志存储时间')) {
            prov.push(cur)
          } else {
            const arr = cur.split('$');
            arr.forEach(item => {
              if (this.isNMEACode(item)) prov.push('$' + item);
            });
          }

          return prov;
        }, []);
        this.serialInfos = logArr.join('\n');
        console.log('logArr:', logArr);
        console.log('this.serialInfos:', this.serialInfos);
      }
    });

    const throttleBasicInfo = throttle(this.formatBasicInfos, 2000);
    // const throttleMapData = throttle(this.formatMapData, 10);
    // 监听日志信息
    ipcRenderer.on('BASICINFOS', (event, data) => {
      throttleBasicInfo(data.message);
    });

    ipcRenderer.on('SPEEDMAP', (event, data) => {
      this.speedData = data.message;
    });
  },
});
</script>

<style>
.el-card__body {
  height: 100% !important;
}

.el-card.is-always-shadow {
  box-shadow: none !important;
  border: none !important;
}

.el-drawer__body {
  overflow: auto !important;
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.home .el-select {
  width: 100% !important;
}

.charts {
  /*display: flex;*/
  padding: 24px;
  width: 100%;
  height: auto;
}

.charts-item {
  width: 100%;
  /*margin-bottom: 24px*/
  /*padding-bottom: 24px*/
}

.charts-item:nth-child(1) {
  width: 100%;
  height: calc(100vh - 132px);
}

.charts-item:nth-child(2) {
  width: 100%;
  height: calc(100vh - 104px);
  margin-top: 48px;
}

.header {
  box-shadow: 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  height: 60px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding-left: 24px;

  /* 兼容chorme */
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
  width: 100%;
  z-index: 1000;
}

.header .header-item {
  margin-right: 40px;
  cursor: pointer;
}

.header .header-item img {
  width: 24px;
  height: 24px;
}

.label {
  margin-top: 6px;
  font-size: 10px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
}
.drawer-box {
  padding: 24px;
  height: 100%;
  overflow: auto;
  padding-top: 0;
}
.select-item {
  margin-bottom: 32px;
}

.connact-btn {
  background: #019fb8 !important;
}

.style-tip-port {
  text-align: left;
}
</style>
