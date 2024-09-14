<template>
	<div class="card-container">
		<el-card class="box-card stellar-map" id="bullMapBox">
			<div slot="header" class="clearfix" style="text-align: left; padding: 24px">
				<span class="header-text">靶心图</span>
				<i class="el-icon-close" style="float: right; padding: 3px 0"></i>
			</div>
			<div>
				<div style="margin: auto; width: 50%">
					<div id="bullMap"></div>
				</div>
				<!--        <div>-->
				<!--          635353-->
				<!--        </div>-->
			</div>
		</el-card>
	</div>
</template>

<script>
import * as echarts from 'echarts'
import elementResizeDetectorMaker from 'element-resize-detector'
const dimensions = ['纬度', '经度']
let myChart;
export default {
	name: 'bullMap',
	components: {},
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
			flag: false
		}
	},

	watch: {
		data() {
			this.renderChart();
		},
	},

	methods: {
		/* 换算经度 */
		lngToPx(lng) {
			return ((lng + 180) * (256 << 2)) / 360 + 512
		},

		/* 换算纬度 */
		latToPx(lat) {
			let siny = Math.sin((lat * Math.PI) / 180)
			let y = Math.log((1 + siny) / (1 - siny))
			return (128 << 2) * (1 - y / (2 * Math.PI))
		},

		/* 渲染chart */
		renderChart() {
			if (this.flag) return;
			flag = true;
			let bullData = []
			let data = {
				0: {
					latitude: '39.90923',
					longitude: '116.397428',
				},
				1: {
					latitude: '32',
					longitude: '102.397428',
				},
				2: {
					latitude: '56',
					longitude: '117.397428',
				},
				3: {
					latitude: '40',
					longitude: '102.397428',
				},
				4: {
					latitude: '20',
					longitude: '102.397428',
				},
			}
			if (!this.data) return
			for (let key in data) {
				bullData.push([
					this.latToPx(data[key].latitude),
					this.lngToPx(data[key].longitude),
				])
			}
			let chartDom = document.getElementById('bullMap')
			if (myChart != null && myChart !== '' && myChart !== undefined) {
				myChart.dispose()
			}
			myChart = echarts.init(chartDom)
			myChart.resize({
				width: this.screenHight,
				height: this.screenHight,
			})
			// window.onresize = myChart.resize
			let option
			option = {
				color: ['#34bfa3'],
				radar: {
					indicator: [
						{ text: '', max: 100 },
					],
					center: ['50%', '48%'],
					radius: '100%',

					splitNumber: 15,

					shape: 'circle',

					splitLine: {

						show: false

					},

					axisLine: {

						show: false

					}
				},
				tooltip: {
					borderWidth: 0,
					borderRadius: 2,
					formatter: (params) => {
						params.value[0] = params.value[0] !== undefined ? params.value[0] : '未知'
						params.value[1] = params.value[1] !== undefined ? params.value[1] : '未知'
						return (
							`<div style="text-align: left; margin-bottom: 12px; padding-left: 12px"">位置信息</div>` +
							'<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">经度</div>` + (Number(data[(Number(params.seriesIndex) - 1).toString()].longitude)).toFixed(4) + '</div>' +
							'<div style="margin-bottom: 12px;display: flex;justify-content: space-around;padding-left: 12px">' + `<div style="display: inline-block;margin-right: 72px;text-align: left">纬度</div>` + (Number(data[(Number(params.seriesIndex) - 1).toString()].latitude)).toFixed(4) + '</div>'
						);
					}
				},
				legend: {
					show: false,
					// data: ['bar', 'error']
				},
				// dataZoom: [
				//   {
				//     type: 'slider',
				//     show:false
				//   },
				//   {
				//     type: 'inside',
				//     show:false
				//   }
				// ],
				grid: {
					bottom: 6,
					top: -16,
					left: 12,
					right: 12,
					containLabel: true
				},

				xAxis: {
					splitLine: {
						show: false
					},
					show: true,
					min: -1024,
					max: 1024,
					axisLabel: {
						show: false,
					},
				},
				yAxis: {
					splitLine: {
						show: false
					},
					min: -1024,
					max: 1024,
					show: true,
					axisLabel: {
						show: false,
					}
				},

				series: [
					{
						name: '雷达图1',
						type: 'radar',
						zlevel: 10,
						data: []
					},
					{
						type: 'scatter',
						name: '',
						data: bullData,
						dimensions: dimensions,
						encode: {
							x: 2,
							y: 1,
							tooltip: [2, 1, 3, 4, 5, 6],
							itemName: 0
						},
						itemStyle: {
							color: '#77bef7'
						},
					}

				]

			}

			myChart.setOption(option);
			setTimeout(() => {
				this.flag = false;
			}, 1000);
		},
	},

	mounted() {
		// this.onWindowSize()
			// 创建实例
			let erd = elementResizeDetectorMaker()
			// 创建实例带参
			let erdUltraFast = elementResizeDetectorMaker({
				strategy: 'scroll', //<- For ultra performance.
				callOnAdd: true,
				debug: true,
			})
			//监听id为test的元素 大小变化
			erd.listenTo(document.getElementById('bullMapBox'), (element) => {
				let width = element.offsetWidth
				let height = element.offsetHeight
				this.screenWidth = width
				this.screenHight = height - 48
				this.renderChart()
			})

	},
}
</script>

<style>
.card-container .el-card__body {
	padding: 0 !important;
	position: relative;
}

.card-container {
	height: 100%;
}

#bullMapBox {
	height: 100%;
}

.header-text {
	font-size: 16px;
	font-family: PingFangSC-Medium, PingFang SC;
	font-weight: bold;
	color: rgba(0, 0, 0, 0.85);
}

.right-operation {
	position: absolute;
	right: 15%;
	top: 15%;
}

.right-operation .title {
	font-size: 14px;
	font-weight: 400;
	color: rgba(0, 0, 0, 0.45);
}

.item {
	margin-bottom: 16px;
}

.right-operation .item-color {
	display: inline-block;
	width: 16px;
	height: 16px;
	border-radius: 2px;
}
</style>
