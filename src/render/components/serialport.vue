<template>
  <div class="card-container">
    <el-card class="box-card serialport" id="serialport">
      <div
        slot="header"
        class="clearfix"
        style="text-align: left; padding: 24px 24px 0 24px"
      >
        <span class="header-text">串口信息</span>
        <i class="el-icon-close" style="float: right; padding: 3px 0"></i>
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
      <div class="list-body">
        <div class="operation">
          <div style="width: 50%; display: flex">
            <el-input
              class="textarea-box-a"
              placeholder="输入命令"
              type="textarea"
              v-model="code"
              size="mini"
              :autosize="{ maxRows: 4 }"
              resize="none"
            ></el-input>
            <el-button
              style="background: #009fb9; color: #ffffff"
              type="primary"
              size="mini"
              @click="sendAgree"
              >发送</el-button
            >
          </div>
          <div class="right">
            <div style="display: inline-block">
              <el-checkbox
                v-model="checked"
                style="margin: 0 16px 0 0"
                fill="#009FB9"
                :disabled="pathShare === ''"
                @change="onCheck"
              ></el-checkbox>
            </div>
            <div v-if="pathShare !== ''" style="display: inline-block">
              <el-tooltip
                effect="dark"
                :content="pathShare"
                placement="top-start"
              >
                <span
                  class="path-text text-path"
                  style="display: inline-block"
                  >{{ pathShare }}</span
                >
              </el-tooltip>
            </div>
            <div v-else style="display: inline-block">
              <span class="path-text">日志保存路径</span>
            </div>
            <!-- <span>{{ path }}</span>
           <el-input
               disabled
               style="width:120px;margin:0 20px 0 0"
               placeholder="储存路径"
               v-model="path"
               size="mini"
           ></el-input>
           <div class="right-btn" @click="download">
             <img src="../assets/daochu.png" alt="" /><a
               class="right-btn-text"
               id="download"
               >导出</a
             >
           </div> -->
            <!--               <el-button style="background: #009FB9; color: #ffffff" type="primary" size="mini" @click="sendAgree"></el-button>-->
            <!-- <div class="input-box" style="display: inline-block"> -->
            <div class="input-box" style="display: inline-block" @click="openFileDialog">
              <a href="javascript:;" :class="checked ? 'fileing' : 'file'">
                {{ checked ? "持续存储中.." : "选择路径" }}
              </a>
            </div>

            <!-- <a-button>过滤</a-button> -->
            <div class="input-box file" style="display: inline-block" @click="openFilterConfig">
              <a href="javascript:;" style="color: #fff;">
                过滤
              </a>
            </div>

            <div class="right-btn" @click="clear" style="display: inline-block">
              <img src="../assets/clear.png" alt="" /><span
                class="right-btn-text"
                >清空</span
              >
            </div>
          </div>
        </div>
        <div class="data-box">
          <el-input
            class="textarea-box"
            id="textarea_id"
            type="textarea"
            v-model="info"
          >
          </el-input>
        </div>
      </div>
    </el-card>
    <el-dialog v-model="statusFile" title="新增日志文件" width="30%">
      <span class="file-bull-name">文件名称：</span>
      <el-input v-model="fileLogVal" placeholder="请输入文件名称" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusFile = false">取消</el-button>
          <el-button type="primary" @click="statusFileSet">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="filterVisible" title="日志过滤配置" width="30%" :show-close="true">
      <div class="filter-dialog">
        <el-tag
          v-for="(tag, index) in logFilterList"
          :key="index"
          class="mx-1 ml-1"
          closable
          :disable-transitions="false"
          @close="handleClose(index)"
        >
          {{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          class="ml-1 w-20"
          size="small"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
          + 新增
        </el-button>
      </div>

      <template #footer>
        <el-button size="small" type="primary" @click="saveFilterKeys">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IpcView } from "@/common/ipcRenderer/ipcRenderer";
import {
  HANDLEFILEOPEN, SETLOGFILEPATH, SETLOGWRITESTATUS
} from "@src/common/constant/event";
import { ElCard, ElInput, ElButton, ElCheckbox, ElTooltip, ElDialog } from "element-plus";
import { message } from "ant-design-vue";

const Store = require("electron-store");
const defalutFilterKeys = [
    "GGA",
    "GSV",
    "GSA",
    "GLL",
    "RMC",
    "VTG",
    "ZDA",
    "GST",
    "TXT",
    "HDT",
    "GRS",
    "GNS",
    "DTM",
    "GBS"
]
export default defineComponent({
  name: "serialport",
  props: {
    data: {
      type: String,
      defalut: "",
    },
    isContant: {
      type: Boolean,
      defalut: false,
    },
    fullStatus: {
      type: Boolean,
      defalut: false,
    },
    isPlayback: {
      type: Boolean,
      default: false
    }
  },
  emits: ["fullScreenStatus", "sendAgree", "changeFilterKeys"],
  data() {
    return {
      fullscreen: false,
      checked: false,
      code: "",
      path: "",
      info: "",
      allInfo:"",
      portList: [],
      tableData: [],
      portValue: "",
      totalInfo: "",
      indexFs: 0, // 是否是第一次写入
      statusFile: false,
      fileLogVal: "",
      fileLogName: "",
      pathShare: "",
      dataIndex:0,

      filterVisible: false,
      logFilterList: [] as Array<string>,
      inputVisible: false,
      inputValue : '',

    };
  },
  watch: {
    data: {
      handler(newData: any, oldData: any) {
        if(!newData){
            return;
        }
        this.$nextTick(() => {
          const textarea: any = document.getElementById("textarea_id");
          textarea.scrollTop = textarea.scrollHeight;
        });
        let replceNewstr: string = newData.replace(oldData, "");
        let timeDate = `\n 上报时间: ${this.logTime()} \n`;
        // 当处于 playback 状态时，不写入当前时间
        if (this.isPlayback) timeDate = '';
        
        this.dataIndex++
        if(this.dataIndex === 15){
            this.dataIndex = 0;
            this.info = timeDate + replceNewstr
        }else{
            let timeDateStr = timeDate + replceNewstr
            this.info += timeDateStr;
        }
      },
      immediate: true,
    },
    fullStatus: {
      handler(newStr, oldStr) {
        this.fullscreen = newStr;
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    openFileDialog() {
      let ports: IpcView;
      ports = new IpcView(HANDLEFILEOPEN);
      ports.getIpcMainData('').then((res: any) => {
        if (res && res !== 'cancel') {
          this.path = res + '\\';
          this.indexFs = 0;
          this.statusFile = true;
        }
      });
    },
    // 设置文件名称
    statusFileSet() {
      if (!this.fileLogVal) {
        message.error("请输入文件名称！");
        return;
      }
      this.fileLogName = this.fileLogVal;
      this.statusFile = false;
      this.pathShare = this.path + this.fileLogName + ".log";
      this.indexFs = 0;
      this.fileLogVal = "";

      // 向主进程发送文件路径，初始化写入文件流
      let ports: IpcView;
      ports = new IpcView(SETLOGFILEPATH);
      ports.getIpcMainData(this.pathShare).then(res => {
        console.log('SETLOGFILEPATH:', res)
      })
    },

    screen() {
      // let element = document.documentElement;//设置后就是我们平时的整个页面全屏效果
      let element: any = document.getElementById("serialport"); //设置后就是   id==con_lf_top_div 的容器全屏
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
      this.$emit("fullScreenStatus", this.fullscreen);
    },
    onCheck(e: boolean) {
      console.log('e:', e)
      if(!this.checked){
        this.indexFs = 1;
      }

      // 设置文件写入状态
      let ports: IpcView;
      ports = new IpcView(SETLOGWRITESTATUS);
      ports.getIpcMainData(e).then(res => {
        console.log('SETLOGWRITESTATUS:', res)
      })
    },
    // 当前日志存储时间
    logTime() {
      let time = new Date();
      let year = time.getFullYear();
      let Month = time.getMonth() + 1;
      let day = time.getDate();
      let hours = time.getHours()>9 ? time.getHours() : '0' + time.getHours();
      let minutes = time.getMinutes()>9 ? time.getMinutes() : '0'+time.getMinutes();
      let sconts = time.getSeconds()>9 ? time.getSeconds() : '0'+time.getSeconds();
      let timeDate = `${year}-${Month}-${day} ${hours}:${minutes}:${sconts}`;
      return timeDate;
    },

    clear() {
      this.allInfo = "";
      this.info = "";
      this.dataIndex = 0;
    },

    /* 下载文本 */
    download() {
      // if (!this.info) {
      //   this.$message.warning("没有导出内容");
      //   return;
      // }
      let aTag:any = document.getElementById("download");
      aTag.setAttribute("download", "串口信息.txt");
      let blob = new Blob([this.allInfo], { type: "txt" });
      aTag.setAttribute("href", URL.createObjectURL(blob));
      // document.body.appendChild(aTag);
    },

    sendAgree() {
      if (!this.code) {
        message.warning("请输入命令");
        return;
      }
      this.$emit("sendAgree", this.code);
    },

    openFilterConfig() {
      this.filterVisible = true;
      const filterKeys = new Store().get('GNSS-TOP-LOG-FILTER-KEYS');
      this.logFilterList = filterKeys
        ? filterKeys.split(',')
        : defalutFilterKeys.map(e => e);
    },
    handleClose(index: number) {
      this.logFilterList.splice(index, 1);
    },
    showInput() {
      this.inputVisible = true;

      this.$nextTick(() => {
        this.$refs.InputRef.focus();
      });
    },
    handleInputConfirm() {
      if (this.inputValue) {
        // 去掉所有空格
        this.logFilterList.push(this.inputValue.replace(/\s/g, ''));
      }

      this.inputVisible = false;
      this.inputValue = '';
    },
    saveFilterKeys() {
      const filterKeys = this.logFilterList.join(',');
      new Store().set('GNSS-TOP-LOG-FILTER-KEYS', filterKeys);
      this.filterVisible = false;
      this.$emit('changeFilterKeys', this.logFilterList)
    }
  },
  mounted() {
    const filterKeys = new Store().get('GNSS-TOP-LOG-FILTER-KEYS');
    this.logFilterList = filterKeys
      ? filterKeys.split(',')
      : defalutFilterKeys.map(e => e);
    
    this.$emit('changeFilterKeys', this.logFilterList);
  }
});
</script>

<style scoped>
.chooseSrc {
  width: 100%;
}
.input-box {
  margin-right: 30px;
  cursor: pointer;
}
.file {
  cursor: pointer;
  background: rgb(0, 159, 185);
  color: rgb(255, 255, 255);
  position: relative;
  padding: 7px 15px;
  font-size: 12px;
  border-radius: calc(var(--el-border-radius-base) - 1px);
}

.fileing {
  cursor: pointer;
  background: #dcdfe6;
  color: rgb(255, 255, 255);
  position: relative;
  padding: 7px 15px;
  font-size: 12px;
  border-radius: calc(var(--el-border-radius-base) - 1px);
}

.input-box input {
  position: absolute;
  right: 0;
  top: 0;
  opacity: 0; /*关键点*/
  cursor: pointer;
}

.el-icon-full-screen,
.el-icon-copy-document {
  position: absolute;
  right: 43px;
  cursor: pointer;
}
.el-textarea__inner {
  resize: none !important;
  border: none !important;
}
.el-card__body {
  height: 100% !important;
}

.list-body {
  text-align: left;
  padding: 16px;
  height: calc(100% - 48px);
}
.list-body .operation {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.operation {
  height: 30px;
  position: relative;
}

.path-text {
  width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.45);
  margin-right: 16px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}
.text-path {
  position: relative;
  top: 6px;
}

.data-box {
  height: calc(100% - 30px) !important;
}

.card-container {
  height: 100%;
}

#serialport {
  height: 100%;
}

.right {
  /*display: flex;*/
  /*align-items: center;*/
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.right-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.right-btn:nth-child(1) {
  margin-right: 34px;
}

.right-btn img {
  width: 14px;
  height: 14px;
  margin-right: 9px;
}

.right-btn-text {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.data-box {
  /*height: 415px;*/
  /*overflow: auto;*/
  padding: 16px 0;
}
.header-text {
  font-size: 16px;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.85);
}

.textarea-box {
  height: 100% !important;
}

/* ::v-deep.textarea-box > .el-textarea__inner {
} */
:deep(.textarea-box > .el-textarea__inner) {
  height: 100% !important;
}

.textarea-box::-webkit-scrollbar {
  width: 4px;
}
.textarea-box::-webkit-scrollbar-track {
  background-color: rgba(190, 180, 180, 0.5);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.textarea-box::-webkit-scrollbar-thumb {
  background-color: rgb(190, 180, 180);
  -webkit-border-radius: 2em;
  -moz-border-radius: 2em;
  border-radius: 2em;
}
.file-bull-name {
  display: inline-block;
  width: 100%;
  height: auto;
  text-align: left;
}

.filter-dialog {
  text-align: left;
}
.ml-1 {
  /* margin-top: 12px; */
  margin-bottom: 12px;
}

.w-20 {
  width: 120px;
}
</style>
