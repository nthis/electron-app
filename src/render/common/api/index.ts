//对于axios进行二次封装
import { message } from "ant-design-vue";
import axios from "axios";

//底下的代码也是创建axios实例
let requests = axios.create({
    //基础路径
    baseURL: "", // 测试环境
    // baseURL: "http://172.16.2.70:60006/", // 本地环境
    //请求不能超过5S
    timeout: 5000,
});
//请求拦截器（可以在请求发出去之前，做一些事情）
requests.interceptors.request.use((config) => {
    return config;
});

//响应拦截器（在数据返回之后，做一些事情）
requests.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (err) => {
        const { response } = err;
        //响应失败
        message.error(response ? response.data.message ? response.data.message : "服务器响应数据失败" : "服务器响应数据失败");
        if (response) return response.data;
        else return { state: 808 };
    }
);
export default requests;
