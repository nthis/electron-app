<template>
    <div class="card-container">
        <el-button style="background: #009fb9; color: #ffffff" type="primary" size="mini"
            @click="chooseFile">选择文件</el-button>
    </div>
</template>

<script lang="ts">
import { IpcView } from "@/common/ipcRenderer/ipcRenderer";
import { HANDLELOGFILE } from "@src/common/constant/event";
import { defineComponent } from "vue";
export default defineComponent({
    setup() {
        const chooseFile = () => {
            console.log('选择文件')
            let ports: IpcView;
            ports = new IpcView(HANDLELOGFILE);
            ports.getIpcMainData('').then((res: any) => {
                console.log('chooseFile:', res)
            });
        }

        return {
            chooseFile
        }
    }
})
</script>

<style scoped>
.card-container {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    text-align: left;
}
</style>
