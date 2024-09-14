<template>
  <div class="card-container">
    <el-card class="box-card stellar-map" id="bullChartsBox">
      <div slot="header" class="clearfix" style="text-align: left; padding: 24px">
        <span class="header-text">靶心图</span>
        <span @click="clearBullData" class="clear-btn">清空</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
      </div>
      <div class="bull-content-box">
        <div class="bull-charts" ref="bullChartsBoxBox" id="bullChartsBoxBox">
          <div class="bull-charts-div" v-bind:style="{
            width: screenWidth,
            height: screenHight,
          }">
            <div class="bull-charts-xy">
              <div class="bull-charts-x"></div>
              <div class="bull-charts-y"></div>
            </div>
            <div class="bull-charts-n bull-charts-position">N</div>
            <div class="bull-charts-e bull-charts-position">E</div>
            <div class="bull-charts-s bull-charts-position">S</div>
            <div class="bull-charts-w bull-charts-position">W</div>
            <div class="bull-charts-rate1 bull-charts-rate"></div>
            <div class="bull-charts-rate2 bull-charts-rate"></div>
            <div class="bull-charts-rate3 bull-charts-rate"></div>
            <div class="bull-charts-rate4 bull-charts-rate"></div>
            <div class="bull-charts-rate5 bull-charts-rate"></div>
            <div class="bull-charts-number">{{ Number(scaleValue) }}m</div>
            <div class="bull-charts-number-ban">
              {{ Number(scaleValue) / 2 }}m
            </div>
            <div class="lat-lng-position">
              <div class="position-style" v-for="(item, index) in dotPosition" :key="index" v-bind:style="{
                top: `calc(${item.top}% - 4px)`,
                right: `calc(${item.right}% - 4px)`,
              }" :title="`经度：${item.lng},纬度：${item.lat}`"></div>
            </div>
          </div>
        </div>
        <div class="bull-config">
          <div class="bull-config-title">比例尺</div>
          <div class="bull-config-value">
            <el-radio class="bull-config-radio" v-for="item in configValue" :key="item" v-model="scaleValue"
              :label="item" @change="changeScale">{{ item }} m</el-radio>
          </div>
          <div class="bull-config-title">参考位置</div>
          <div class="bull-config-value">
            <el-radio class="bull-config-radio" v-for="item in configPosition" :key="item.value" v-model="positionValue"
              :label="item.value" @change="changePositionRadio">{{ item.label }}</el-radio>
          </div>
        </div>
      </div>
    </el-card>
    <el-dialog title="设置参考位置" v-model="dialogVisible" width="30%">
      <div class="bull-config-input">
        <div class="bull-input">
          <span class="bull-input-label">经度：</span>
          <el-input placeholder="请输入经度" v-model="longitudeSetValue" clearable size="mini" width="80%"
            :disabled="positionValue === 'meanValue'">
            <template slot="append">°</template>
          </el-input>
        </div>
        <div class="bull-input">
          <span class="bull-input-label">纬度：</span>
          <el-input placeholder="请输入纬度" v-model="latitudeSetValue" clearable size="mini" width="80%"
            :disabled="positionValue === 'meanValue'">
            <template slot="append">°</template>
          </el-input>
        </div>
        <div class="share-set">
          <el-button @click="setPosition" :disabled="positionValue === 'meanValue'" class="share-set-btn" type="primary"
            size="small">确定</el-button>
        </div>
        <!-- <div class="bull-config-title">可视范围</div>
						<div class="bull-input-a">
							<span class="bull-input-label-a">最大偏移量：</span>
							<el-input
								placeholder="请输入最大偏移量"
								v-model="maxDeviationValue"
								clearable
								size="mini"
								width="80%"
								:disabled="positionValue === 'meanValue'"
							>
								<template slot="append">m</template>
							</el-input>
						</div> -->
      </div>
      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span> -->
    </el-dialog>
  </div>
</template>

<script>
import elementResizeDetectorMaker from "element-resize-detector";
export default {
  name: "bullCharts",
  components: {},
  props: {
    dataList: {
      type: Array,
      default: [],
    },
  },
  emits: ["clearBullData"],
  data() {
    return {
      configValue: [1, 5, 10, 50, 100, 300, 500, 1000],
      scaleValue: 50,
      configPosition: [
        {
          label: "均值",
          value: "meanValue",
        },
        {
          label: "设定值",
          value: "setValue",
        },
      ],
      positionValue: "meanValue",
      screenWidth: 0,
      screenHight: 0,
      centerLatLng: [],
      maxDeviationValue: "",
      latitudeSetValue: "",
      longitudeSetValue: "",
      distanceLatLng: [],
      coordinateList: [],
      dotPosition: [],
      dialogVisible: false,
    };
  },

  watch: {
    dataList: {
      handler: function (val) {
        this.drawInit(val);
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    // 初始化绘图
    drawInit(val) {
      this.distanceLatLng = [];
      if (this.positionValue === "meanValue") {
        this.centerLatLng = this.getCenter(val);
      } else {
        this.centerLatLng = [this.longitudeSetValue, this.latitudeSetValue];
      }
      let deltaCenter = this.delta(this.centerLatLng[1], this.centerLatLng[0]);
      val.forEach((item) => {
        let distance = this.getDistance(
          this.centerLatLng[1],
          this.centerLatLng[0],
          item.latitude,
          item.longitude
        );

        let valItemDelta = this.delta(item.latitude, item.longitude);
        let angle = this.getAngle(
          deltaCenter.lat,
          deltaCenter.lon,
          valItemDelta.lat,
          valItemDelta.lon
        );
        let obj = {
          angle,
          distance,
          lat: item.latitude,
          lng: item.longitude,
        };
        this.distanceLatLng.push(obj);
      });
      let coordinateList = [];
      this.distanceLatLng.forEach((items) => {
        let coordinate = this.getCoordinateXY(items);
        coordinateList.push(coordinate);
      });
      this.coordinateList = coordinateList;
      this.calcCoordinateValue();
    },
    // 清空数据
    clearBullData() {
      this.$emit("clearBullData", []);
    },
    // 改变比例尺
    changeScale() {
      this.drawInit(this.dataList);
    },
    // 改变设定值
    setPosition() {
      if (this.latitudeSetValue && this.longitudeSetValue) {
        this.drawInit(this.dataList);
        this.dialogVisible = false;
      } else {
        this.$message.warning('请完善经纬度内容！')
      }
    },
    // 切换参考位置
    changePositionRadio(value) {
      if (value === "meanValue") {
        this.drawInit(this.dataList);
      } else {
        this.dialogVisible = true;
      }
    },
    // 计算坐标在图上的百分比
    calcCoordinateValue() {
      let dotPosition = [];
      const dataList = JSON.parse(JSON.stringify(this.coordinateList));
      const scale = this.scaleValue;
      dataList.forEach((items) => {
        let top = 0,
          right = 0;
        top = 50 * (1 - Number(items.y) / Number(scale));
        right = 50 * (1 - Number(items.x) / Number(scale));
        let dotObj = {
          top,
          right,
          lat: items.lat,
          lng: items.lng,
        };
        dotPosition.push(dotObj);
      });
      this.dotPosition = dotPosition;
    },

    //计算两坐标点的距离
    getDistance(centerLat, centerLng, lat, lng) {
      let radLat1 = (centerLat * Math.PI) / 180.0;
      let radLat2 = (lat * Math.PI) / 180.0;
      let a = radLat1 - radLat2;
      let b = (centerLng * Math.PI) / 180.0 - (lng * Math.PI) / 180.0;
      let s =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) *
            Math.cos(radLat2) *
            Math.pow(Math.sin(b / 2), 2)
          )
        );
      s = s * 6378.137; // EARTH_RADIUS;
      s = Math.round(s * 10000) / 10000;
      return Math.floor(s * 1000000) / 1000;
    },

    // 转化经纬度转换地理坐标
    delta(lat, lon) {
      let PI = 3.14159265358979324;
      let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
      var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
      var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
      var x = lon - 105.0;
      var y = lat - 35.0;
      var ret1 =
        -100.0 +
        2.0 * x +
        3.0 * y +
        0.2 * y * y +
        0.1 * x * y +
        0.2 * Math.sqrt(Math.abs(x));
      ret1 +=
        ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) *
          2.0) /
        3.0;
      ret1 +=
        ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) /
        3.0;
      ret1 +=
        ((160.0 * Math.sin((y / 12.0) * PI) + 320 * Math.sin((y * PI) / 30.0)) *
          2.0) /
        3.0;
      var dLat = ret1;
      var ret2 =
        300.0 +
        x +
        2.0 * y +
        0.1 * x * x +
        0.1 * x * y +
        0.1 * Math.sqrt(Math.abs(x));
      ret2 +=
        ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) *
          2.0) /
        3.0;
      ret2 +=
        ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) /
        3.0;
      ret2 +=
        ((150.0 * Math.sin((x / 12.0) * PI) +
          300.0 * Math.sin((x / 30.0) * PI)) *
          2.0) /
        3.0;
      var dLon = ret2;
      var radLat = (lat / 180.0) * PI;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat =
        (-10000000.0 * (dLat * 180.0)) /
        (((a * (1 - ee)) / (magic * sqrtMagic)) * PI);
      dLon =
        (10000000.0 * (dLon * 180.0)) /
        ((a / sqrtMagic) * Math.cos(radLat) * PI);
      return { lat: dLat, lon: dLon };
    },

    // 获取两坐标之间的角度
    getAngle(centerLat, centerLng, lat, lng) {
      var a = ((90 - lat) * Math.PI) / 180;
      var b = ((90 - centerLat) * Math.PI) / 180;
      var AOC_BOC = ((lng - centerLng) * Math.PI) / 180;
      var cosc =
        Math.cos(a) * Math.cos(b) +
        Math.sin(a) * Math.sin(b) * Math.cos(AOC_BOC);
      var sinc = Math.sqrt(1 - cosc * cosc);
      var sinA = (Math.sin(a) * Math.sin(AOC_BOC)) / sinc;
      var A = (Math.asin(sinA) * 180) / Math.PI;
      var res = 0;
      if (lng > centerLng && lat > centerLat) res = A;
      else if (lng > centerLng && lat < centerLat) res = 180 - A;
      else if (lng < centerLng && lat < centerLat) res = 180 - A;
      else if (lng < centerLng && lat > centerLat) res = 360 + A;
      else if (lng > centerLng && lat == centerLat) res = 90;
      else if (lng < centerLng && lat == centerLat) res = 270;
      else if (lng == centerLng && lat > centerLat) res = 0;
      else if (lng == centerLng && lat < centerLat) res = 180;

      return res;
    },

    // 计算坐标轴xy坐标
    getCoordinateXY(coordinate) {
      // 原点
      let dots = {
        x: 0,
        y: 0,
      };
      // 半径
      let radius = coordinate.distance;
      // 角度
      let angle = coordinate.angle;

      let x = dots.x + radius * Math.sin((angle * 3.14) / 180);
      let y = dots.y + radius * Math.cos((angle * 3.14) / 180);

      return { x, y, lat: coordinate.lat, lng: coordinate.lng };
    },

    // 获取中心坐标点
    getCenter(pointArray) {
      let sortedLongitudeArray = pointArray
        .map((item) => item.longitude)
        .sort(); //首先对经度进行排序，红色部分是array中经度的名称
      let sortedLatitudeArray = pointArray.map((item) => item.latitude).sort(); //对纬度进行排序，红色部分是array中纬度的名称
      const centerLongitude = (
        (parseFloat(sortedLongitudeArray[0]) +
          parseFloat(sortedLongitudeArray[sortedLongitudeArray.length - 1])) /
        2
      ).toFixed(6);
      const centerLatitude = (
        (parseFloat(sortedLatitudeArray[0]) +
          parseFloat(sortedLatitudeArray[sortedLatitudeArray.length - 1])) /
        2
      ).toFixed(6);

      //如果经纬度在array中不是数字类型，需要转化为数字类型进行计算，如果是可以去掉parseFloat处理
      return [parseFloat(centerLongitude), parseFloat(centerLatitude)];
    },
  },

  mounted() {
      // 创建实例
      let erd = elementResizeDetectorMaker();
      // 创建实例带参
      let erdUltraFast = elementResizeDetectorMaker({
        strategy: "scroll", //<- For ultra performance.
        callOnAdd: true,
        debug: true,
      });
      //监听id为test的元素 大小变化
      erd.listenTo(document.getElementById("bullChartsBoxBox"), (element) => {
        // 获取this.$refs.bullCharts宽高
        let offsetHeight = element.offsetHeight;
        let offsetWidth = element.offsetWidth;
        if (offsetHeight > offsetWidth) {
          offsetHeight = offsetWidth;
        } else {
          offsetWidth = offsetHeight;
        }
        this.screenWidth = offsetWidth + "px";
        this.screenHight = offsetHeight + "px";
      });

  },
};
</script>

<style>
.card-container .el-card__body {
  padding: 0 !important;
  position: relative;
}

.card-container {
  height: 100%;
}

#bullChartsBox {
  height: 100%;
}

.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.bull-content-box {
  width: 100%;
  height: calc(100% - 48px);
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.bull-charts {
  width: 70%;
  height: 100%;
  display: flex;
  flex-flow: wrap;
  justify-content: center;
  align-items: center;
}

.bull-charts-div {
  position: relative;
}

.bull-config {
  width: 30%;
  height: 100%;
  border-left: 1px dashed #cdcdcd;
}

.bull-config-title {
  width: 100%;
  height: auto;
  text-align: left;
  padding: 12px 12px 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.bull-config-value {
  display: flex;
  flex-flow: wrap;
  padding: 12px;
  justify-content: flex-start;
  text-align: left;
}

.bull-config-radio {
  width: 50%;
  height: auto;
  margin: 0 0 4px 0 !important;
}

.bull-charts-xy {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.bull-charts-x {
  width: 90%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.25);
  position: absolute;
  top: calc(50% - 1px);
  left: 5%;
  z-index: 6;
}

.bull-charts-y {
  width: 1px;
  height: 90%;
  background-color: rgba(0, 0, 0, 0.25);
  position: absolute;
  top: 5%;
  left: calc(50% - 1px);
  z-index: 6;
}

.bull-charts-position {
  font-size: 16px;
  font-weight: 500;
}

.bull-charts-n {
  position: absolute;
  top: 0;
  left: calc(50% - 6px);
}

.bull-charts-e {
  position: absolute;
  top: calc(50% - 12px);
  right: 8px;
}

.bull-charts-s {
  position: absolute;
  left: calc(50% - 6px);
  bottom: 0;
}

.bull-charts-w {
  position: absolute;
  top: calc(50% - 12px);
  left: 4px;
}

.bull-charts-rate {
  border-radius: 50%;
}

.bull-charts-rate1 {
  width: 90%;
  height: 90%;
  background-color: #cdcdcd32;
  position: absolute;
  top: 5%;
  left: 5%;
  z-index: 1;
}

.bull-charts-rate2 {
  width: 72%;
  height: 72%;
  background-color: #fff;
  position: absolute;
  top: 14%;
  left: 14%;
  z-index: 2;
}

.bull-charts-rate3 {
  width: 54%;
  height: 54%;
  background-color: #cdcdcd32;
  position: absolute;
  top: 23%;
  left: 23%;
  z-index: 3;
}

.bull-charts-rate4 {
  width: 36%;
  height: 36%;
  background-color: #fff;
  position: absolute;
  top: 32%;
  left: 32%;
  z-index: 4;
}

.bull-charts-rate5 {
  width: 18%;
  height: 18%;
  background-color: #cdcdcd32;
  position: absolute;
  top: 41%;
  left: 41%;
  z-index: 5;
}

.bull-charts-number {
  position: absolute;
  top: 50%;
  right: 8px;
  z-index: 10;
}

.bull-charts-number-ban {
  position: absolute;
  top: 50%;
  right: 25%;
  z-index: 10;
}

.bull-input {
  width: 100%;
  height: auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 12px 0 12px;
}

.bull-input-a {
  width: 100%;
  height: auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 12px 0 12px;
}

.bull-input .el-input {
  width: 80% !important;
}

.bull-input-a .el-input {
  width: 60% !important;
}

.bull-input-label-a {
  width: 36%;
  height: auto;
}

.share-set {
  width: 100%;
  height: auto;
  padding: 24px;
}

.share-set-btn {
  width: 100%;
}

.lat-lng-position {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 100;
  overflow: hidden;
}

.position-style {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #a0cfff;
  position: absolute;
  /* top: calc(50% - 6px);
    left: calc(50% - 6px); */
}

.clear-btn {
  cursor: pointer;
  position: absolute;
  right: 45px;
  color: #009fb9;
  font-size: 12px;
}
</style>
