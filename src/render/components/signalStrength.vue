<template>
  <div class="card-container">
    <el-card class="box-card signal-strength" ref="stellarMap" id="columnar">
      <div slot="header" class="clearfix" style="text-align: left; padding: 24px 24px 0 24px">
        <span class="header-text">信号强度</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
      </div>
      <div class="signal-strength-header">
        <div class="signal-strength-item" v-for="(item, i) in colorList" :key="i">
          <span class="item-color" :style="{ background: item.color }"></span>&nbsp; {{ item.label }}
        </div>
      </div>
      <div id="signalStrength"></div>
    </el-card>
  </div>
</template>

<script>
import * as echarts from "echarts";
import elementResizeDetectorMaker from "element-resize-detector";
let signalStrengthCharts = null;
export default {
  name: "SignalStrength",
  props: {
    data: {
      type: Object,
      defalut: {},
    },
  },
  data() {
    return {
      screenWidth: 0,
      screenHight: 0,
      colorList: [
        {
          color: "#62D9AA",
          label: "参与定位",
        },
        {
          color: "#5B8FF9",
          label: "未参与定位",
        },
      ],
      allData: [],
      nameData: [],
    };
  },
  computed: {
    option() {
      return {};
    },
  },

  watch: {
    data() {
      if(signalStrengthCharts){
        this.renderChart();
      }
    },
  },

  methods: {
    /* 监听窗口 */
    renderChart() {

      if (!this.data) return;
      let joinData = [];
      let unJoinData = [];
      let newAllData = [];
      let newNameData = [];
      this.data.joinData &&
        this.data.joinData.forEach((item) => {
          if (item[4]) {
            joinData.push({
              name: item[2],
              value: item[4],
              itemStyle: {
                color: "#62D9AA",
              },
            });
            newNameData.push(item[2]);
          }
        });
      this.data.unJoinData &&
        this.data.unJoinData.forEach((item) => {
          if (item[4]) {
            unJoinData.push({
              name: item[2],
              value: item[4],
              itemStyle: {
                color: "#5B8FF9",
              },
            });
            newNameData.push(item[2]);
          }
        });
      newAllData = [...joinData, ...unJoinData];
      if (this.allData.length === 0) {
        this.allData = newAllData;
        this.nameData = newNameData
      } else {
        if (this.allData.length === newAllData.length) {
          this.allData.forEach((items) => {
            this.data.joinData &&
              this.data.joinData.forEach((item) => {
                if (item[4] && item[2] === items.name) {
                  items.itemStyle.color = "#62D9AA";
                  items.value = item[4];
                }
              });
          });
          this.allData.forEach((items) => {
            this.data.unJoinData &&
              this.data.unJoinData.forEach((item) => {
                if (item[4] && item[2] === items.name) {
                  items.itemStyle.color = "#5B8FF9";
                  items.value = item[4];
                }
              });
          });
        } else {
          this.allData = newAllData;
          this.nameData = newNameData
        }
      }



      let option = {
        tooltip: {
          formatter: (params) => {
            params.value = params.value !== undefined ? params.value : 0;
            return params.name + ': ' + params.value + " dB-Hz";
            // params.value[4] = params.value[4] !== undefined  ? params.value[4] : 0
          },
        },
        // legend: {
        //   data: ['参与定位', '未参与定位'],
        //   left: '12',
        //   top: '12',
        //   type: 'scroll',
        // },
        xAxis: {
          data: this.nameData,
        },
        yAxis: {},
        series: [
          {
            name: "参与定位",
            type: "bar",
            data: this.allData,
          },
          // {
          //   name: '未参与定位',
          //   type: 'bar',
          //   data: [],
          // },
        ],
      };

      signalStrengthCharts.setOption(option);
    },
  },

  mounted() {
    
    let chartDom = document.getElementById("signalStrength");
      
    // 创建实例
    let erd = elementResizeDetectorMaker();
    // 创建实例带参
    let erdUltraFast = elementResizeDetectorMaker({
      strategy: "scroll", //<- For ultra performance.
      callOnAdd: true,
      debug: true,
    });
    //监听id为test的元素 大小变化
    erd.listenTo(document.getElementById("columnar"), (element) => {
      let width = element.offsetWidth;
      let height = element.offsetHeight;
      this.screenWidth = width;
      this.screenHight = height - 68;
      if(!signalStrengthCharts){
        signalStrengthCharts = echarts.init(chartDom);
      }
      signalStrengthCharts.resize({
        width: this.screenWidth,
        height: this.screenHight,
      });
      this.renderChart();
    });
  },
};
</script>

<style>
.signal-strength-header {
  height: 30px;
  padding: 16px 0 0 16px;
  display: flex;
  align-items: center;
  text-align: left;
  justify-content: left;
}

.item-color {
  width: 12px;
  height: 12px;
  display: inline-block;
}

.signal-strength-item {
  margin-right: 24px;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  display: flex;
  align-items: center;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}

#signalStrength {
  height: 100%;
}

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

#columnar {
  height: 100%;
}

.signal-strength {}
</style>
