<template>
  <div class="card-container">
    <el-card class="box-card clock" id="clockBox">
      <div slot="header" class="clearfix" style="text-align: left; padding: 24px 24px 0 24px">
        <span class="header-text">世界协调时</span>
        <i class="el-icon-close"></i>
      </div>
      <div style="height: 100%">
        <div id="clock"></div>
        <p class="time">{{ timeText }}</p>
      </div>

    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import elementResizeDetectorMaker from "element-resize-detector"
import moment from 'moment'
const { ipcRenderer } = require('electron');
moment.locale('zh-cn')
import 'moment/locale/zh-cn'
// const Store = require('electron-store')
let myChart = null;
let timer = null
export default {
  name: 'clock',
  data() {
    return {
      timeText: '',
      screenWidth: 0,
      screenHight: 0,
    }
  },
  computed: {
    option() {
      return {
        series: [
          {
            name: 'hour',
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            min: 0,
            max: 12,
            splitNumber: 12,
            clockwise: true,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [[1, 'rgba(0,0,0,0.7)']],
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 15
              }
            },
            splitLine: {
              lineStyle: {
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 3,
                shadowOffsetX: 1,
                shadowOffsetY: 2
              }
            },
            axisLabel: {
              fontSize: 10,
              fontWeight: 600,
              distance: 14,
              formatter: function (value) {
                if (value === 0) {
                  return '';
                }
                return value + '';
              }
            },
            anchor: {
              show: true,
              icon: 'path://M73.11,71.196 C74.426,71.196 75.434,70.846 76.148,70.174 C76.862,69.488 77.226,68.494 77.226,67.192 L77.226,61.004 L75.7,61.004 L75.7,67.22 C75.7,68.116 75.49,68.774 75.084,69.208 C74.664,69.642 74.006,69.866 73.11,69.866 C72.2,69.866 71.542,69.642 71.122,69.208 C70.702,68.774 70.506,68.116 70.506,67.22 L70.506,61.004 L68.98,61.004 L68.98,67.192 C68.98,68.494 69.344,69.488 70.072,70.188 C70.772,70.86 71.78,71.196 73.11,71.196 Z M83.274,71 L83.274,62.306 L86.606,62.306 L86.606,61.004 L78.416,61.004 L78.416,62.306 L81.762,62.306 L81.762,71 L83.274,71 Z M92.164,71.196 C93.242,71.196 94.166,70.888 94.936,70.272 C95.762,69.614 96.28,68.704 96.504,67.542 L95.02,67.542 C94.824,68.326 94.474,68.914 93.97,69.306 C93.494,69.67 92.878,69.852 92.15,69.852 C91.03,69.852 90.204,69.502 89.672,68.802 C89.168,68.144 88.916,67.22 88.916,66.016 C88.916,64.854 89.168,63.93 89.686,63.258 C90.232,62.516 91.044,62.152 92.122,62.152 C92.85,62.152 93.438,62.306 93.914,62.628 C94.39,62.95 94.712,63.454 94.88,64.126 L96.364,64.126 C96.21,63.118 95.762,62.306 95.034,61.718 C94.278,61.102 93.312,60.808 92.15,60.808 C90.554,60.808 89.35,61.326 88.51,62.39 C87.754,63.328 87.39,64.532 87.39,66.016 C87.39,67.528 87.74,68.732 88.468,69.628 C89.294,70.664 90.526,71.196 92.164,71.196 Z',
              showAbove: false,
              offsetCenter: [0, '-40%'],
              size: 25,
              keepAspect: true,
              itemStyle: {
                color: '#707177'
              }
            },
            pointer: {
              icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 8,
              length: '45%',
              offsetCenter: [0, '8%'],
              itemStyle: {
                color: '#009FB9 ',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 4
              }
            },
            detail: {
              show: false
            },
            title: {
              offsetCenter: [0, '30%']
            },
            data: [
              {
                value: 0
              }
            ]
          },
          {
            name: 'minute',
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            min: 0,
            max: 60,
            clockwise: true,
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            pointer: {
              icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 5,
              length: '65%',
              offsetCenter: [0, '8%'],
              itemStyle: {
                color: '#009FB9 ',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 4
              }
            },
            anchor: {
              show: false,
              size: 20,
              showAbove: false,
              itemStyle: {
                borderWidth: 1,
                borderColor: '#009FB9',
                shadowBlur: 8,
                shadowOffsetX: 0,
                shadowOffsetY: 0
              }
            },
            detail: {
              show: false
            },
            title: {
              offsetCenter: ['0%', '-40%']
            },
            data: [
              {
                value: 0,
              },
            ]
          },
          {
            name: 'second',
            type: 'gauge',
            startAngle: 90,
            endAngle: -270,
            min: 0,
            max: 60,
            animationEasingUpdate: 'bounceOut',
            clockwise: true,
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            pointer: {
              icon: 'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 3,
              length: '70%',
              offsetCenter: [0, '8%'],
              itemStyle: {
                color: '#009FB9',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 4
              }
            },
            anchor: {
              show: true,
              size: 5,
              showAbove: true,
              itemStyle: {
                color: '#ffffff',
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 8,
                shadowOffsetX: 2,
                shadowOffsetY: 4
              }
            },
            detail: {
              show: false
            },
            title: {
              offsetCenter: ['0%', '-40%']
            },
            data: [
              {
                value: 0,
              }
            ]
          }
        ]
      };
    }
  },

  methods: {
    getWeek(date) { // 参数时间戳
      let week = moment(date).day()
      switch (week) {
        case 1:
          return '星期一'
        case 2:
          return '星期二'
        case 3:
          return '星期三'
        case 4:
          return '星期四'
        case 5:
          return '星期五'
        case 6:
          return '星期六'
        case 0:
          return '星期日'
      }
    },


    renderChart() {
      if (myChart) {
        clearInterval(timer)
        myChart.dispose()
        myChart = null
        timer = null
      }
      let chartDom = document.getElementById('clock')
      myChart = echarts.init(chartDom, null, {
        width: this.screenWidth,
        height: this.screenHight,
      });
      this.option && myChart.setOption(this.option);
    },
    renderChartOption(timeStamp) {
      if (!myChart) return;
      let second
      let minute
      let hour
      if (!timeStamp) {
        second = 0
        minute = 0
        hour = 0
        this.timeText = '年/月/日 时:分:秒 星期'
      } else {
        this.timeText = moment(timeStamp).format("YYYY/MM/DD    HH:mm:ss") + '  ' + this.getWeek(moment(timeStamp).format("YYYY/MM/DD"))
        second = moment(timeStamp).seconds()
        minute = moment(timeStamp).minute()
        hour = moment(timeStamp).hour()
      }
      this.option.animationDurationUpdate = 300;
      myChart.setOption({
        series: [
          {
            name: 'hour',
            animation: hour !== 0,
            data: [{ value: hour }]
          },
          {
            name: 'minute',
            animation: minute !== 0,
            data: [{ value: minute }]
          },
          {
            animation: second !== 0,
            name: 'second',
            data: [{ value: second }]
          }
        ]
      });
    }
  },

  mounted() {
    // 创建实例
    let erd = elementResizeDetectorMaker();
    // 创建实例带参
    let erdUltraFast = elementResizeDetectorMaker({
      strategy: "scroll", //<- For ultra performance.
      callOnAdd: true,
      debug: true
    });
    //监听id为test的元素 大小变化
    erd.listenTo(document.getElementById("clockBox"), (element) => {
      // if(myChart){
      //   myChart.dispose()
      // }
      let width = element.offsetWidth;
      let height = element.offsetHeight;
      if (width !== this.screenWidth || height !== this.screenHight) {
        this.screenWidth = width
        this.screenHight = height - 100
        this.renderChart()
      }
    });
    const throttleRenderChart = echarts.throttle(this.renderChartOption, 1000);
    ipcRenderer.on('TIMESTAMP', (event, data) => {
      // this.stellarMapBDS = data.message;
      throttleRenderChart(data.message);
    });
  }
}
</script>

<style scoped>
.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.clearfix {
  height: 48px;
  padding: 0 16px !important;
  display: flex;
  border-bottom: 1px solid #F0F2F5;
  align-items: center;
}

.el-icon-close {
  position: absolute;
  right: 16px;
}

.card-container .el-card__body {

  padding: 0 !important;
}

.card-container {
  height: 100%;
}

.clock {
  height: 100%;
  /*width: 444px;*/
  /*margin-right: 34px;*/
}

.time {
  /*height: 80px;*/
  margin-bottom: 0;

  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85)
}
</style>