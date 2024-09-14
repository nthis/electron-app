<template>
    <el-dialog v-model="dialogFormVisible" title="NTRIP 配置">
        <el-form ref="NtripFormRef" :model="NTRIP" label-position="top" class="custom-form">
            <el-form-item
                label="NTRIP Caster Address"
                prop="address"
                :rules="formRules.address"
            >
                <el-input v-model="NTRIP.address" placeholder="请输入NTRIP服务地址" @blur="getMountpointList" />
            </el-form-item>
            <el-form-item label="Port" prop="port" :rules="formRules.port">
                <el-input v-model="NTRIP.port" placeholder="请输入端口号" @blur="getMountpointList" />
            </el-form-item>
            <el-form-item label="挂载点" prop="mountpoint" :rules="formRules.mountpoint">
                <el-select v-model="NTRIP.mountpoint" filterable placeholder="请选择挂载点" :loading="loadingMountpoint">
                    <el-option v-for="item in mountpointList" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="账号" prop="userID" :rules="formRules.userID">
                <el-input v-model="NTRIP.userID" placeholder="请输入账号" />
            </el-form-item>
            <el-form-item label="密码" prop="password" :rules="formRules.password">
                <el-input v-model="NTRIP.password" placeholder="请输入密码" type="password" show-password />
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="connectNtrip(NtripFormRef)" :loading="connectLoading">
                    确定
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>
  
<script lang="ts" setup>
import { IpcView } from '@/common/ipcRenderer/ipcRenderer';
import { GETNTRIPMOUNTPOINTLIST, SETNTRIPSERVER } from '@src/common/constant/event';
import { message } from 'ant-design-vue';
import { reactive, ref } from 'vue'

interface NtripForm {
    address: string;
    port: string;
    mountpoint: string;
    userID: string;
    password: string;
}

const dialogFormVisible = ref(false)
const NTRIP = reactive<NtripForm>({
    address: '',
    port: '',
    mountpoint: '',
    userID: '',
    password: ''
});
const NtripFormRef = ref()
const formRules = reactive({
    address: [
        { required: true, message: '请输入NTRIP服务地址', trigger: 'blur' }
    ],
    port: [
        { required: true, message: '请输入NTRIP服务地址', trigger: 'blur' }
    ],
    mountpoint: [
        { required: true, message: '请选择挂载点', trigger: 'change' }
    ],
    userID: [
        { required: true, message: '请输入账号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
});

const mountpointList = ref<Array<{ label: string; value: string }>>([]);
const loadingMountpoint = ref<boolean>(false);
const getMountpointList = () => {
    if (NTRIP.address && NTRIP.port) {
        let ports: IpcView;
        ports = new IpcView(GETNTRIPMOUNTPOINTLIST);
        ports.getIpcMainData(JSON.stringify(NTRIP)).then((res: any) => {
            loadingMountpoint.value = false;
            if (Array.isArray(res.data) && !res.err) {
                mountpointList.value = res.data.map((e: string)=> ({ label: e, value: e }));
            } else mountpointList.value = [];
        });
    }
};

const connectLoading = ref<boolean>(false);
const connectNtrip = async (formEl: any) => {
    if (!formEl) return

    await formEl.validate((valid: boolean) => {
        let ports: IpcView;
        ports = new IpcView(SETNTRIPSERVER);
        connectLoading.value = true;
        ports.getIpcMainData(JSON.stringify(NTRIP)).then((res: any) => {
            connectLoading.value = false;
            console.log('tcp 服务连接', res);
            if (res === 'ok') {
                message.success('配置成功');
                dialogFormVisible.value = false;
            } else message.error('配置失败');
        });
    });
};

const openDialog = () => {
    dialogFormVisible.value = true;
};

defineExpose({
    openDialog
});
</script>
<style scoped>
.custom-form {
    display: grid;
    grid-template-columns: repeat(2, 50%);
    grid-column-gap: 24px;

    width: 100%;
    padding-right: 24px;
    box-sizing: border-box;
}
</style>
  