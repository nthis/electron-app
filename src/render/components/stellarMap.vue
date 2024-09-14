<template>
  <div class="card-container">
    <el-card class="box-card stellar-map" id="stellarMapBox">
      <div slot="header" class="clearfix header-box" style="text-align: left; padding:24px">
        <span class="header-text">星空图</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
      </div>
      <div style="display: flex; align-items: center;padding-top: 16px;">
        <div id="stellarMap"></div>
      </div>
      <div class="right-operation-container">
        <div class="right-operation_" style="text-align: left;">
          <p class="title">卫星系统</p>
          <div class="right-operation-box">
            <div class="item" v-for="(item, i) in colorList" :key="i">
              <span class="item-color" :style="{ background: item.color }"></span>&nbsp; {{ item.label }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import elementResizeDetectorMaker from "element-resize-detector"
let stellarMapCharts = null;
export default {
  name: 'stellarMap',
  components: {},
  props: {
    data: {
      type: Object,
      defalut: {}
    }
  },
  data() {
    return {
      screenWidth: 0,
      screenHight: 0,
      colorList: [
        {
          "color": "#9a60b4",
          'label': 'GPS（G）'
        },
        {
          "color": "#91cc75",
          'label': 'GLO（R）'
        },
        {
          "color": "#795548",
          'label': 'GAL（E）'
        },
        {
          "color": "#FFC069",
          'label': 'BDS（B）'
        },
        {
          "color": "#8CA2E4",
          'label': 'IRN（I）'
        },
        {
          "color": "#F658AA",
          'label': 'SBS (S)'
        },
        {
          "color": "#FF4D4F",
          'label': 'QZS（Q）'
        }
      ],
    }
  },

  watch: {
    data() {
      if (stellarMapCharts) {
        this.renderChart()
      }
    },
  },

  methods: {
    /* 渲染chart */
    renderChart() {
      if (!this.data) return
      let option;
      const lonLat = [
        'N 0°', '15°', '30°', '45°',
        '60°', '75°', '90°E', '105°',
        '120°', '135°', '150°', '165°',
        'S 180°', '195°', '210°', '225°',
        '240°', '255°', '270°W', '285°',
        '300°', '315°', '330°', '345°',
      ];
      const angle = [
        '10°', '20°', '30°', '40°', '50°', '60°', '70°', '80°', '90°',

      ];
      const join = this.data.joinData || []
      const unJoin = this.data.unJoinData || []
      let _join = []
      let _unJoin = []
      join && join.forEach(item => {
        if (item[0] !== 0) {
          _join.push(
            item
          )

        }
      });
      unJoin && unJoin.forEach(item => {
        if (item[0] !== 0) {
          _unJoin.push(
            item
          )
        }
      });
      option = {
        title: {
          text: ''
        },
        legend: {
          data: ['参与定位', '未参与定位'],
          left: '12',
          top: '-5',
          type: 'scroll'
        },
        polar: {},
        tooltip: {
          borderWidth: 0,
          borderRadius: 2,
          formatter: function (params) {
            params.value[4] = params.value[4] !== undefined ? params.value[4] : 0
            return (
              `<div style="text-align: left; margin-bottom: 12px; padding-left: 12px"">${params.value[2]}</div>` +
              '<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">卫星系统</div>` + params.value[3] + '</div>' +
              '<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">俯仰角</div>` + params.value[0] * 10 + '°' + '</div>' +
              '<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">方位角</div>` + Number(params.value[1] * 15).toFixed(1) + '°' + '</div>' +
              '<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">信号强度</div>` + params.value[4] + ' dB-Hz' + '</div>'
            );
          }
        },
        //最外经纬度环
        angleAxis: {
          type: 'category',
          data: lonLat,
          boundaryGap: false,
          splitLine: {
            show: true
          },
          axisLine: {
            show: true
          }
        },
        //角度数据
        radiusAxis: {
          type: 'category',
          data: angle,
          axisLine: {
            show: false
          },
          axisLabel: {
            rotate: 45
          },
          inverse: true
        },
        series: [
          {
            animation: false,
            name: '参与定位',
            type: 'scatter',
            coordinateSystem: 'polar',
            color: '#62D9AA ',

            symbolSize: function (val) {
              return 30;
            },
            data: _join,
            animationDelay: function (idx) {
              return idx * 5;
            },
            label: {
              normal: {
                show: true,
                fontSize: 10,
                fontWeight: 'bold',
                formatter: function (params) {
                  return  `{${params.data[2].substr(0, 1)}|${params.data[2]}}`;
                },
                "rich": {
                  "G": {
                    "color": "#9a60b4",
                  },
                  "R": {
                    "color": "#91cc75",
                  },
                  "E": {
                    "color": "#795548",
                  },
                  "B": {
                    "color": "#FFC069",
                  },
                  "I": {
                    "color": "#8CA2E4",
                  },
                  "S": {
                    "color": "#F658AA",
                  },
                  "Q": {
                    "color": "#FF4D4F",
                  },
                },
              }
            },
            emphasis: {
              focus: 'self'
            },
          },
          {
            animation: false,
            name: '未参与定位',
            type: 'scatter',
            color: '#5B8FF9',
            coordinateSystem: 'polar',
            symbolSize: function (val) {
              return 30;
            },
            emphasis: {
              focus: 'self'
            },
            data: _unJoin,
            animationDelay: function (idx) {
              return idx * 5;
            },
            label: {
              normal: {
                show: true,
                fontSize: 6,
                fontWeight: 'bold',
                formatter: function (params) {
                  return  `{${params.data[2].substr(0, 1)}|${params.data[2]}}`;
                },
                "rich": {
                  "G": {
                    "color": "#9a60b4",
                  },
                  "R": {
                    "color": "#91cc75",
                  },
                  "E": {
                    "color": "#795548",
                  },
                  "B": {
                    "color": "#FFC069",
                  },
                  "I": {
                    "color": "#8CA2E4",
                  },
                  "S": {
                    "color": "#F658AA",
                  },
                  "Q": {
                    "color": "#FF4D4F",
                  },
                },
              }
            },
          }
        ]
      };
      stellarMapCharts.setOption(option)
    }
  },

  mounted() {
    // this.onWindowSize()
    // 创建实例
    let erd = elementResizeDetectorMaker();
    // 创建实例带参
    let erdUltraFast = elementResizeDetectorMaker({
      strategy: "scroll", //<- For ultra performance.
      callOnAdd: true,
      debug: true
    });
    //监听id为test的元素 大小变化
    erd.listenTo(document.getElementById("stellarMapBox"), (element) => {
      let width = element.offsetWidth;
      let height = element.offsetHeight;
      this.screenWidth = width
      this.screenHight = height
      let chartDom = document.getElementById('stellarMap')
      if (!stellarMapCharts) {
        stellarMapCharts = echarts.init(chartDom)
      }
      stellarMapCharts.resize({
        width: this.screenWidth / 1.5,
        height: this.screenHight / 1.1 - 48,
      })
      this.renderChart()
    });

  }
}
</script>

<style>
.header-box {
  z-index: 100
}

.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.card-container .el-card__body {
  padding: 0 !important;
  position: relative;
}

.card-container {
  height: 100%
}

#stellarMapBox {
  height: 100%
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

.right-operation_ {
  height: 100%;
  padding: 64px 0 0 16px;
  border-left: 1px solid rgba(0, 0, 0, .1);
}

.right-operation-container {
  position: absolute;
  right: 15%;
  top: 0;
  height: 100%;
  padding: 48px 0 0 16px;
}

.right-operation_ .title {
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}

.item {
  margin-bottom: 16px;
}

.right-operation_ .item-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 2px;
}
</style>
