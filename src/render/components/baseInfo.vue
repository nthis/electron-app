<template>
  <div class="card-container">
    <el-card class="box-card baseInfo" id="baseInfo">
      <div slot="header" class="clearfix" style="text-align: left; padding: 24px 24px 0 24px">
        <span class="header-text">基本信息</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
      </div>
      <div class="list-body">
        <div class="item" v-for="(item, i) in list" :key="i">
          <span class="label">{{ item.label }}</span>
          <span class="value">{{ item.val }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
let that: any = null
export default defineComponent({
  name: 'baseInfo',
  props: {
    data: {
      type: Object,
      defalut: {}
    }
  },


  data() {
    return {
      list: [
        {
          label: '经度',
          key: 'longitude',
          val: '未知'
        },
        {
          label: '纬度',
          key: 'latitude',
          val: '未知'
        },
        {
          label: '椭球高',
          key: 'ellipsoid_height',
          val: '未知'
        },
        {
          label: '海拔高',
          key: 'altitude',
          val: '未知'
        },
        {
          label: '定位模式',
          key: 'locationMode',
          val: '未知'
        },
        {
          label: 'PDOP',
          key: 'pdop',
          val: '未知'
        },
        {
          label: 'HDOP',
          key: 'hdop',
          val: '未知'
        },
        {
          label: '跟踪卫星数量',
          key: 'satellites_tracked',
          val: '未知'
        }
      ],
    }
  },
  mounted() {
    // this.initSerialport()
  },

  watch: {
    data: {
      handler(newData) {
        this.list.forEach((item) => {
          switch (item.key) {
            case 'longitude':
            case 'latitude':
              item.val = newData[item.key] && (Number(newData[item.key])).toFixed(8) || '未知';
              break;
            case 'ellipsoid_height':
            case 'altitude':
              item.val = newData[item.key] && (Number(newData[item.key])).toFixed(3) || '未知';
              break;
            case 'pdop':
            case 'hdop':
              item.val = newData[item.key] && (Number(newData[item.key])).toFixed(2) || '未知';
              break;
            default:
              item.val = newData[item.key] && newData[item.key] || '未知'
              break;
          }
        })
      },
      immediate: true,
    },
  },
  methods: {

  },
})
</script>

<style scoped>
.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.card-container {
  height: 100%;
}

.baseInfo {
  height: 100%
}

.list-body {
  text-align: left;
  padding: 16px;
  height: calc(100% - 48px)
}

.list-body .item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: calc(100% / 8);
  margin-bottom: 0 !important
}

.label {
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
}

.value {
  font-size: 14px;
  font-family: HelveticaNeue;
  color: rgba(0, 0, 0, 0.85);
}
</style>
