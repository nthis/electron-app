<template>
  <div class="card-container">
    <el-card class="box-card map" id="mapBox">
      <div
        slot="header"
        class="clearfix"
        style="text-align: left; padding: 24px"
      >
        <span class="header-text">地图</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
        <span @click="clearMap" class="clear-btn">清空</span>
        <i
          class="el-icon-full-screen"
          style="float: right; padding: 10px 0"
          @click="screen"
          v-if="!fullscreen"
        ></i>
        <i
          class="el-icon-copy-document"
          style="float: right; padding: 10px 0"
          @click="screen"
          v-if="fullscreen"
        ></i>
      </div>
      <div id="map-container"></div>
    </el-card>
  </div>
</template>

<script>
import mapLoader from "@src/common/utils/amap";

export default {
  name: "Map",
  props: {
    data: {
      type: Array,
      defalut: [],
    },
    fullStatus:{
      type: Boolean,
      defalut: false,
    }

  },
  emits:['fullMapScreenStatus'],
  data() {
    return {
      AMap: null,
      fullscreen: false,
      isFirst: true,
      path: [],
      polyline: null,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.mapRender();
    });
  },

  watch: {
    data: {
      handler(newName, oldName) {
        // setTimeout(() => {
        if (this.AMap) {
          this.renderMarker();
        }
        // }, 2000);
      },
      deep: true,
      immediate: true,
    },
    fullStatus: {
      handler(newStr) {
        this.fullscreen = newStr
      },
      immediate: true,
      deep:true,
    },
  },

  methods: {
    clearMap() {
      if (this.polyline) {
        this.map.remove(this.polyline)
        this.polyline.setMap(null)
        this.path = []
      }
    },
    screen() {
      // let element = document.documentElement;//设置后就是我们平时的整个页面全屏效果
      let element = document.getElementById("mapBox"); //设置后就是   id==con_lf_top_div 的容器全屏
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      }
      // this.fullscreen = !this.fullscreen;
      this.$emit('fullMapScreenStatus',this.fullscreen)
    },

    mapRender() {
      mapLoader()
        .then((AMap) => {
          this.AMap = AMap;
          const map = new AMap.Map("map-container", {
            // resizeEnable: true,
            // zoom: 16,
            zooms: [10, 20],
            layers: [
              // 卫星
              new AMap.TileLayer.Satellite(),
              // 路网
              new AMap.TileLayer.RoadNet()
            ],
           });
          this.polyline = new this.AMap.Polyline({
            path: this.path,
            map: map,
            borderWeight: 2, // 线条宽度，默认为 1
            strokeColor: "#5B8FF9", // 线条颜色
            lineJoin: "round", // 折线拐点连接处样式
            lineCap: "round", // 折线拐点连接处样式
            dirImg: "https://a.amap.com/jsapi_demos/static/images/mass0.png",
            showDir: true,
            strokeWeight: 3,
          });
          this.map = map;
          return new Promise((resolve) => {
            AMap.plugin(
              [
                "AMap.ToolBar",
                "AMap.Scale",
                "AMap.OverView",
                "AMap.Geolocation",
                "AMap.DistrictSearch",
                "AMap.MouseTool",
                "AMap.PolyEditor",
                "AMap.Autocomplete",
                "AMap.PlaceSearch",
              ],
              () => {
                const scale = new AMap.Scale({
                  visible: true,
                });
                const toolBar = new AMap.ToolBar({
                  visible: true,
                  position: "LT",
                });
                // const mapType = new AMap.MapType();
                const overView = new AMap.OverView({ isOpen: false });
                map.addControl(scale);
                map.addControl(toolBar);
                // map.addControl(mapType);
                map.addControl(overView);
                resolve();
              }
            );
          });
        })
        .then(() => {
          this.mapUpdate();
        });
    },

    async mapUpdate() {
      // this.renderMarker();
    },

    renderMarker() {
      const AMap = this.AMap;
      const map = this.map;
      if (!this.data) return;
      if (this.data.length !== 0) {
        // const marker = new AMap.Marker({
        //   position: [this.data[0].longitude, this.data[0].latitude], // 经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
        // });
        this.path.push([
          this.data[this.data.length - 1].longitude,
          this.data[this.data.length - 1].latitude,
        ]);

        if (this.polyline) {
          this.polyline.setOptions({
            path: this.path,
            map: map,
          });
        } else {
          this.polyline = new this.AMap.Polyline({
            path: this.path,
            map: map,
            borderWeight: 2, // 线条宽度，默认为 1
            strokeColor: "#5B8FF9", // 线条颜色
            lineJoin: "round", // 折线拐点连接处样式
            lineCap: "round", // 折线拐点连接处样式
            dirImg: "https://a.amap.com/jsapi_demos/static/images/mass0.png",
            showDir: true,
            strokeWeight: 3,
          });
        }

        if (this.isFirst) {
          map.setZoomAndCenter(
            18,
            new AMap.LngLat(+this.data[0].longitude, +this.data[0].latitude)
          );
        }
        this.isFirst = false;
        // this.polyline.setMap(map);
        // map.add(this.polyline);
        // map.add(marker);
      }
    },
  },
};
</script>

<style scoped>
.card-container .el-card__body {
  padding: 0 !important;
}

.card-container {
  height: 100%;
}

#mapBox {
  height: 100%;
}

.clearfix {
  height: 48px;
  padding: 0 16px !important;
  display: flex;
  border-bottom: 1px solid #f0f2f5;
  align-items: center;
}

.el-icon-close {
  cursor: pointer;
  position: absolute;
  right: 16px;
}

.clear-btn {
  cursor: pointer;
  position: absolute;
  right: 75px;
  color: #009FB9;
  font-size: 12px;
}

.el-icon-full-screen,
.el-icon-copy-document {
  position: absolute;
  right: 43px;
  cursor: pointer;
}

.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

#map-container {
  width: 100%;
  height: 100%;
}
</style>