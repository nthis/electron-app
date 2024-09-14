<template>
  <div class="card-container">
    <el-card class="box-card satellite-speed" id="satelliteSpeedBox">
      <div slot="header" class="clearfix" style="text-align: left; padding: 24px 24px 0 24px">
        <span class="header-text">速度</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
      </div>
      <div id="satelliteSpeed"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import elementResizeDetectorMaker from "element-resize-detector"
let satelliteSpeedCharts = null;
export default {
  name: 'satelliteSpeed',
  components: {},
  props: {
    data: {
      type: Object,
      defalut: {
        speed: 0
      }
    }
  },
  data() {
    return {
      screenWidth: 0,
      screenHight: 0,
      
    }
  },

  watch: {
    data() {
      if(satelliteSpeedCharts){
        this.renderChart()
      }
    },
  },

  methods: {
    /* 渲染chart */
    renderChart() {
      const data = this.data && this.data.speed || 0
      

      let option = {

        series: [
          {
            animation: false,
            type: 'gauge',
            min: 0,
            max: 250,
            // splitNumber: 8,
            axisLine: {
              lineStyle: {
                width: 15,
                color: [
                  [0.3, '#fd666d'],
                  [0.7, '#37a2da'],
                  [1, '#67e0e3']
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '60%',
              width: 8,
              offsetCenter: [0, '0%'],
              itemStyle: {
                color: 'auto'
              }
            },
            axisTick: {
              distance: 5,
              length: 5,
              lineStyle: {
                color: 'auto',
                width: 1
              }
            },
            splitLine: {
              distance: 5,
              length: 8,
              lineStyle: {
                color: 'auto',
                width: 1
              }
            },
            axisLabel: {
              color: 'auto',
              fontSize: 10,
              distance: 25,
            },
            title: {
              offsetCenter: [0, '80%'],
              fontSize: 10
            },
            detail: {
              fontSize: 15,
              offsetCenter: [0, '95%'],
              valueAnimation: true,
              formatter: function (value) {
                return `${Number(value).toFixed(2)}km/h = ${(Number(value) / 3.6).toFixed(2)}m/s`
              },
              color: 'auto'
            },
            data: [
              {
                fontSize: 10,
                value: data || 0,
                name: ''
              }
            ]
          }
        ]
      };
      satelliteSpeedCharts.setOption(option, true)

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
      erd.listenTo(document.getElementById("satelliteSpeedBox"), (element) => {
        let width = element.offsetWidth;
        let height = element.offsetHeight;
        this.screenWidth = width
        this.screenHight = height - 48
        let chartDom = document.getElementById('satelliteSpeed')
        if (!satelliteSpeedCharts) {
          satelliteSpeedCharts = echarts.init(chartDom);
        }
        satelliteSpeedCharts.resize({
          width: this.screenWidth,
          height: this.screenHight,
        })
        this.renderChart()
      });

  }
}
</script>

<style>
.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.card-container .el-card__body {
  padding: 0 !important;
}

.card-container {
  height: 100%;
}

#satelliteSpeedBox {
  height: 100%;
}

/*.box-card {*/
/*  padding: 24px;*/
/*}*/

.satellite-speed {
  /*margin-left: 34px;*/
}
</style>