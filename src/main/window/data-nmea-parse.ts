import { webContents } from "electron"
import { NtripClient } from "./ntripClient"

/**
 * parse data
 * (RMC GGA GSV VTG GSA)
 */
const ffi = require('ffi-napi')
const StructType = require('ref-struct-napi')
const ref = require('ref-napi')
const ArrayType = require('ref-array-napi')
const path = require('path')
const Store = require('electron-store')

const fixQualityList = [
	'未定位',
	'已定位',
	'差分定位',
	'精确定位',
	'RTK定位',
	'浮点RTK',
	'估计(航位推算)定位',
	'手动模式',
	'仿真模式',
];
class NmeaParse {
	dllObj: any
	// structs
	timeStruct: any
	dateStruct: any
	rmcStruct: any
	ggaStruct: any
	vtgStruct: any
	gsaStruct: any
	nmea_sat_info_Struct: any
	gsvStruct: any
	both_hhh: any
	// other
	parseStore: any
	mapPtIdex: any
	mapPts: any
	serialInfos: string
	paths: any
	index: any
	index_n: any
	parseDataDelete: string
	onceDelete: any
	// basicInfos
	latitude: any
	longitude: any
	ellipsoid_height: any
	altitude: any
	locationMode: any
	hdop: any
	pdop: any
	satellites_tracked: any
	basicInfosObj: any

	private ggaDate: string
	private stellarMapGPS: any
	private joinSatellites: any
	private timer: any
	constructor() {
		this.init()
		this.mapPtIdex = 0
		this.index = 0
		this.index_n = 1
		this.serialInfos = ''
		this.parseDataDelete = ''
		this.onceDelete = 0
		this.mapPts = ''
		this.basicInfosObj = {
			latitude: 0 as number,
			longitude: 0 as number,
			ellipsoid_height: '' as string,
			altitude: 0 as number,
			locationMode: '' as string,
			hdop: 0 as number,
			pdop: 0 as number,
			satellites_tracked: 0 as number,
		}

		this.ggaDate = '';
		this.stellarMapGPS = {};
		this.joinSatellites = {};
		this.timer = null;
	}
	init() {
		/**
		 * parse data
		 * (RMC GGA GSV VTG GSA)
		 */
		// ------------------------------------rmc--
		this.timeStruct = StructType({
			hours: ref.types.int,
			minutes: ref.types.int,
			seconds: ref.types.int,
			microseconds: ref.types.int,
		})

		this.dateStruct = StructType({
			day: ref.types.int,
			month: ref.types.int,
			year: ref.types.int,
		})

		this.rmcStruct = StructType({
			time: this.timeStruct, //?
			valid: ref.types.bool,
			latitude: ref.types.float,
			longitude: ref.types.float,
			gcj_02_lat: ref.types.float,
			gcj_02_lng: ref.types.float,
			speed: ref.types.float,
			course: ref.types.float,
			date: this.dateStruct, // ?
			variation: ref.types.float,
		})

		// ------------------------------------gga--

		this.ggaStruct = StructType({
			time: this.timeStruct, // ?
			latitude: ref.types.float,
			longitude: ref.types.float,
			fix_quality: ref.types.int,
			satellites_tracked: ref.types.int,
			hdop: ref.types.float,
			altitude: ref.types.float,
			altitude_units: ref.types.char,
			geoidal_separation: ref.types.float,
			geoidal_separation_units: ref.types.char,
			dgps_age: ref.types.float,
			ellipsoid_height: ref.types.float,
		})

		//-------------------------------------vtg--

		this.vtgStruct = StructType({
			true_track_degrees: ref.types.float,
			magnetic_track_degrees: ref.types.float,
			speed_knots: ref.types.float,
			speed_kph: ref.types.float,
			faa_mode: ref.types.char,
		})

		//-------------------------------------gsa--
		this.gsaStruct = StructType({
			mode: ref.types.char,
			fix_type: ref.types.int,
			sats: ArrayType(ref.types.int, 12), // ?
			sys_type: ref.types.int,
			pdop: ref.types.float,
			hdop: ref.types.float,
			vdop: ref.types.float,
		})

		//-------------------------------------gsv--
		this.nmea_sat_info_Struct = StructType({
			satelliteSystem: ref.types.int,
			nr: ref.types.int,
			elevation: ref.types.int,
			azimuth: ref.types.int,
			snr: ref.types.int,
		})

		this.gsvStruct = StructType({
			total_msgs: ref.types.int,
			msg_nr: ref.types.int,
			total_sats: ref.types.int,
			sats: ArrayType(this.nmea_sat_info_Struct, 32), // ?
		})

		this.both_hhh = StructType({
			result: ref.types.int,
			rmc: this.rmcStruct,
			gga: this.ggaStruct,
			vtg: this.vtgStruct,
			gsa: this.gsaStruct,
			gsv: this.gsvStruct,
		})
		this.parseStore = new Store()
		// this.paths = path.resolve('src/main/dll/nmea_parsing_dll.dll')
		this.paths = path.join(__dirname, '../../src/dll/nmea_parsing')
		// throw error(path.join(__dirname, '../../src/dll/nmea_parsing'))
		// console.log(this.paths)
		this.dllObj = new ffi.Library(this.paths, {
			nmea_parse_new: [this.both_hhh, ['string']],
		})
	}

	clearStoreDatas() {
		if (this.parseStore.has('stellarMap')) {
			this.parseStore.delete('stellarMap')
		}
		if (this.parseStore.has('map')) {
			this.parseStore.delete('map')
		}
		if (this.parseStore.has('speedMap')) {
			this.parseStore.delete('speedMap')
		}
		if (this.parseStore.has('joinSatellite')) {
			this.parseStore.delete('joinSatellite')
		}
		if (this.parseStore.has('serialInfos')) {
			this.parseStore.delete('serialInfos')
		}
	}

	parseDataSerialInfos(parseData: string, webContents: any) {
		if (!parseData) return;
		try {
			// 向渲染进程发送数据
			webContents.send('SERIALINFOS', { message: parseData });
		} catch (error) {
			console.warn('error', error)
		}
	}

	parseDataSplit(parseData: string, PortList: any, webContents: any) {
		if (!parseData) return
		return new Promise<void>((resolve, reject) => {
			this.parseDataDelete += parseData
			this.index = this.newIndexOf('$', this.parseDataDelete, 0)
			if (this.index === -1 && this.onceDelete === 0) {
				this.parseDataDelete = ''
				return
			} else {
				this.onceDelete++
				while (this.index !== -1) {
					this.index = this.newIndexOf('$', this.parseDataDelete, 0)
					this.index_n = this.newIndexOf(
						'\n',
						this.parseDataDelete,
						this.index + 1
					)
					if (this.index !== -1 && this.index_n === -1) {
						break
					} else {
						let data = this.parseDataDelete.substring(
							this.index,
							this.index_n
						)
						this.parseDataDelete = this.parseDataDelete.slice(
							this.index_n
						)
						data = data.replace(/\s*/g, '')
						this.parseDataByType(data, PortList, webContents)
					}
				}
			}
		})
	}

	newIndexOf(cStr: any, pStr: any, n: any) {
		// n为起始位置
		let i // 循环变量
		let len1 = pStr.length // 父串长度
		let len2 = cStr.length // 子串长度

		if (n == undefined || n == null || n == -1) {
			i = 0
		} else if (n > len1 - 1) {
			// 如果起始位置大于父串最后一位，返回-1，不存在
			return -1
		} else {
			// 如果不存在上述情况，从第n位开始
			i = n
		}

		if (len2 > len1) {
			// 如果子串长度大于父串，那么肯定不存在，返回-1
			return -1
		} else if (len2 == len1) {
			// 如果相等，那就直接对比两个字符串是否相等
			if (cStr === pStr) {
				// 如果内容相等，那么就是从第一位开始的
				return 0
			} else {
				// 如果长度不相等，那么返回-1
				return -1
			}
		} else {
			let tempStr = ''
			while (i < len1) {
				// 截取父串，起始位置为i，每次长度为子串长度
				tempStr = pStr.substr(i, len2)
				if (cStr === tempStr) {
					return i // 返回字符串第一次出现的位置
				}
				i++
			}

			if (i == len1) {
				// 直到父元素的最后一位还没有出现相等，那么就是不存在返回-1
				return -1
			}
		}
	}

	parseDataByType(parseData: string, PortList: any, webContents: any) {
		if (parseData.match('$')) {
			let nmeaType = parseData.substring(3, 6);
			switch (nmeaType) {
				case 'RMC':
					this.parseRMC(parseData, webContents)
						.then((res: any) => {
							// PortList.event.sender.send(PortList.keyIpc, res);
						})
						.catch((err: any) => {
							console.log(err)
						})
					break
				case 'GGA':
					// GGA 时间信息
					let ggaDate = parseData.split(',')[1];
					// console.log('ggaDate~~~~~~~~~~~~~~~~~~~:', ggaDate);
					// 由于最后一条语句可能不是 GGA，故设置定时器将最后解析的 GSA、GSV 数据延迟发送到渲染进程
					if (this.timer) clearTimeout(this.timer);
					this.timer = setTimeout(() => {
						webContents.send('STELLARMAPGPS', { message: JSON.parse(JSON.stringify(this.stellarMapGPS)) });
						webContents.send('JOINSATELLITEGPS', { message: JSON.parse(JSON.stringify(this.joinSatellites)) });
					}, 2000);
					
					if (ggaDate !== this.ggaDate) {
						webContents.send('STELLARMAPGPS', { message: JSON.parse(JSON.stringify(this.stellarMapGPS)) });
						webContents.send('JOINSATELLITEGPS', { message: JSON.parse(JSON.stringify(this.joinSatellites)) });
						this.ggaDate = ggaDate;
						this.stellarMapGPS = {};
						this.joinSatellites = {};
					}
					// 将获取到的 GGA 数据通过 tcp 发送给附近基站
					NtripClient.sendData(parseData);
					
					this.parseGGA(parseData, webContents)
						.then((res: any) => {
							// PortList.event.sender.send(PortList.keyIpc, res);
						})
						.catch((err: any) => {
							console.log(err)
						})
					break
				case 'GSV':
					this.parseGPGSV(parseData, webContents)
						.then((res: any) => {
							PortList.event.sender.send(PortList.keyIpc, res)
						})
						.catch((err: any) => {
							console.log(err)
						})
					break
				case 'VTG':
					this.parseVTG(parseData, webContents)
						.then((res: any) => {
							// PortList.event.sender.send(PortList.keyIpc, res);
						})
						.catch((err: any) => {
							console.log(err)
						})
					break
				case 'GSA':
					this.parseGPGSA(parseData, webContents)
						.then((res: any) => {
							// PortList.event.sender.send(PortList.keyIpc, res);
						})
						.catch((err: any) => {
							console.log(err)
						})
					break
				default:
					break
			}
		} else {
			return
		}
	}

	parseGPGSV(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData);
			if (resultObj.result === 6 && resultObj.gsv.sats.length) {
				let nr
				for (let i = 0; i < resultObj.gsv.sats.length; i++) {
					const stellarMapNR = {
						azimuth: 0 as number,
						elevation: 0 as number,
						satelliteSystem: '' as string,
						signalStrength: 0 as number,
					}
					nr = resultObj.gsv.sats[i].nr
					if (!nr) break
					if (resultObj.gsv.sats[i].azimuth) {
						if (resultObj.gsv.sats[i].azimuth === -1) {
							stellarMapNR.azimuth = 0 // 方位角
						} else {
							stellarMapNR.azimuth = resultObj.gsv.sats[i].azimuth // 方位角
						}
					}
					if (resultObj.gsv.sats[i].elevation) {
						if (resultObj.gsv.sats[i].elevation === -1) {
							stellarMapNR.elevation = 0 // 俯仰角
						} else {
							stellarMapNR.elevation =
								resultObj.gsv.sats[i].elevation // 俯仰角
						}
					}
					if (resultObj.gsv.sats[i].satelliteSystem) {
						switch (resultObj.gsv.sats[i].satelliteSystem) {
							case 1:
								stellarMapNR.satelliteSystem = 'GPS' // 卫星系统GPS
								break
							case 2:
								stellarMapNR.satelliteSystem = 'GLO' // 卫星系统GLO
								break
							case 3:
								stellarMapNR.satelliteSystem = 'GAL' // 卫星系统GAL
								break
							case 4:
								stellarMapNR.satelliteSystem = 'BDS' // 卫星系统BDS
								break
							case 5:
								stellarMapNR.satelliteSystem = 'IRN' // 卫星系统IRN
								break
							case 6:
								stellarMapNR.satelliteSystem = 'SBS' // 卫星系统SBS
								break
							case 7:
								stellarMapNR.satelliteSystem = 'QZS' // 卫星系统QZS
								break
							default:
								break
						}
					}
					if (resultObj.gsv.sats[i].snr) {
						if (resultObj.gsv.sats[i].snr === -1) {
							stellarMapNR.signalStrength = 0 // 信号强度
						} else {
							stellarMapNR.signalStrength = resultObj.gsv.sats[i].snr // 信号强度
							// 有信号强度才赋值
							let stellarKey = resultObj.gsv.sats[i].satelliteSystem + '-' + resultObj.gsv.sats[i].nr;
							this.stellarMapGPS[stellarKey] = stellarMapNR;
						}
					}
					// console.log('卫星系统:', resultObj.gsv.sats[i].satelliteSystem + ';信号强度: ' + resultObj.gsv.sats[i].snr + '；卫星编号：' + resultObj.gsv.sats[i].nr)
				}
			} else {
				// reject("error")
			}
			try {
				// webContents.send('STELLARMAPGPS', { message: this.stellarMapGPS });
			} catch (error) {}
		})
	}

	parseGBGSV(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData)
			let stellarMapBDS: any = {};
			if (resultObj.result === 6 && resultObj.gsv.sats.length) {
				let nr
				for (let i = 0; i < resultObj.gsv.sats.length; i++) {
					const stellarMapNR = {
						azimuth: 0 as number,
						elevation: 0 as number,
						satelliteSystem: '' as string,
						signalStrength: 0 as number,
					}
					nr = resultObj.gsv.sats[i].nr
					if (!nr) break
					if (resultObj.gsv.sats[i].azimuth) {
						if (resultObj.gsv.sats[i].azimuth === -1) {
							stellarMapNR.azimuth = 0 // 方位角
						} else {
							stellarMapNR.azimuth = resultObj.gsv.sats[i].azimuth // 方位角
						}
					}
					if (resultObj.gsv.sats[i].elevation) {
						if (resultObj.gsv.sats[i].elevation === -1) {
							stellarMapNR.elevation = 0 // 俯仰角
						} else {
							stellarMapNR.elevation =
								resultObj.gsv.sats[i].elevation // 俯仰角
						}
					}
					if (resultObj.gsv.sats[i].satelliteSystem) {
						switch (resultObj.gsv.sats[i].satelliteSystem) {
							case 1:
								stellarMapNR.satelliteSystem = 'GPS' // 卫星系统GPS
								break
							case 2:
								stellarMapNR.satelliteSystem = 'QZS' // 卫星系统QZS
								break
							case 3:
								stellarMapNR.satelliteSystem = 'BDS' // 卫星系统BDS
								break
							default:
								break
						}
					}
					if (resultObj.gsv.sats[i].snr) {
						if (resultObj.gsv.sats[i].snr === -1) {
							stellarMapNR.signalStrength = 0 // 信号强度
						} else {
							stellarMapNR.signalStrength = resultObj.gsv.sats[i].snr // 信号强度
						}
					}
					stellarMapBDS[resultObj.gsv.sats[i].nr] = stellarMapNR;
				}
			} else {
				// reject("error")
			}
			try {
				// 向渲染进程发送数据
				webContents.send('STELLARMAPBDS', { message: stellarMapBDS });
			} catch (error) {}
		})
	}

	parseRMC(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData)
			const mapIdex = {
				latitude: 0 as number,
				longitude: 0 as number,
			}
			if (resultObj.result === 1) {
				if (resultObj.rmc.gcj_02_lat) {
					mapIdex.latitude = resultObj.rmc.gcj_02_lat // 纬度
				}
				if (resultObj.rmc.gcj_02_lng) {
					mapIdex.longitude = resultObj.rmc.gcj_02_lng // 经度
				}
				if (resultObj.rmc.valid) {
					let year = resultObj.rmc.date.year + 2000
					let month = resultObj.rmc.date.month - 1
					let day = resultObj.rmc.date.day
					let hours = resultObj.rmc.time.hours
					let minutes = resultObj.rmc.time.minutes
					let seconds = resultObj.rmc.time.seconds
					let microseconds = resultObj.rmc.time.microseconds
					let timeStamp = new Date(
						year,
						month,
						day,
						hours,
						minutes,
						seconds,
						microseconds
					).getTime()
					try {
						// this.parseStore.set('timeStamp', timeStamp) // utc timeStamp
						webContents.send('TIMESTAMP', { message: timeStamp })
					} catch (error) {}
				}
			} else {
				// reject("error")
			}
			if (mapIdex.latitude && mapIdex.longitude) {
				var output = JSON.stringify(mapIdex)
				try {
					this.parseStore.set('map', output)
				} catch (error) {}
			}
		})
	}

	parseVTG(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData)
			const speedMap = {
				speed: 0 as number,
			}
			if (resultObj.result === 7 && resultObj.vtg.speed_kph) {
				speedMap.speed = resultObj.vtg.speed_kph
				// var output = JSON.stringify(speedMap)
				try {
					// this.parseStore.set('speedMap', output) // 速度  km/h
					webContents.send('SPEEDMAP', { message: speedMap });
				} catch (error) {
					console.warn('error:', error);
				}
			} else {
				// reject("error")
			}
		})
	}

	parseGPGSA(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData)
			// let joinSatellites: any = {};
			if (resultObj.result === 3 && resultObj.gsa.sats.length) {
				for (let i = 0; i < resultObj.gsa.sats.length; i++) {
					if (resultObj.gsa.sats[i] === 0) break;
					// 卫星系统-卫星编号
					let stellarKey = resultObj.gsa.sys_type + '-' + resultObj.gsa.sats[i];
					this.joinSatellites[stellarKey] = resultObj.gsa.sats[i];
				}
				try {
					// webContents.send('JOINSATELLITEGPS', { message: this.joinSatellites })
				} catch (error) {}
				this.hdop = resultObj.gsa.hdop || '';
				this.pdop = resultObj.gsa.pdop || '';

				// if (resultObj.gsa.pdop) {
				// 	this.basicInfosObj.pdop = resultObj.gsa.pdop // PDOP
				// }
				// if (resultObj.gsa.hdop && resultObj.gsa.hdop !== this.hdop) {
				// 	let parseHdop = resultObj.gsa.hdop
				// 	this.basicInfosObj.hdop = parseHdop // HDOP
				// 	this.hdop = parseHdop
				// }
				// try {
				// 	webContents.send('BASICINFOS', { message: this.basicInfosObj });
				// } catch (error) {}
			} else {
				// reject("error")
			}
		})
	}

	parseGBGSA(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData)
			let joinSatellites: any = {};
			if (resultObj.result === 3 && resultObj.gsa.sats.length) {
				for (let i = 0; i < resultObj.gsa.sats.length; i++) {
					if (resultObj.gsa.sats[i] === 0) break

					joinSatellites[resultObj.gsa.sats[i]] = resultObj.gsa.sats[i];
				}
				if (resultObj.gsa.sats.length) {
					try {
						webContents.send('JOINSATELLITEBDS', { message: joinSatellites })
					} catch (error) {}
				}
				this.hdop = resultObj.gsa.hdop || '';
				this.pdop = resultObj.gsa.pdop || '';

				// if (resultObj.gsa.pdop) {
				// 	this.basicInfosObj.pdop = resultObj.gsa.pdop // PDOP
				// }
				// if (resultObj.gsa.hdop && resultObj.gsa.hdop !== this.hdop) {
				// 	let parseHdop = resultObj.gsa.hdop
				// 	this.basicInfosObj.hdop = parseHdop // HDOP
				// 	this.hdop = parseHdop
				// }
				// try {
				// 	webContents.send('BASICINFOS', { message: this.basicInfosObj });
				// } catch (error) {}
			} else {
				if (this.parseStore.has('basicInfos')) this.parseStore.delete('basicInfos');
			}
		})
	}

	parseGGA(parseData: string, webContents: any) {
		return new Promise<void>((resolve, reject) => {
			const resultObj = this.dllObj.nmea_parse_new(parseData);
			if (resultObj.result === 2) {
				this.basicInfosObj = {};
				if (resultObj.gga.longitude && resultObj.gga.latitude) {
					let ggaLngLat = wgs84togcj02(
						resultObj.gga.longitude,
						resultObj.gga.latitude
					)
					let ggaLng = ggaLngLat[0]
					let ggaLat = ggaLngLat[1]
					let parseLatitude = ggaLat
					this.basicInfosObj.latitude = parseLatitude // 纬度
					this.latitude = parseLatitude
					
					let parseLongitude = ggaLng
					this.basicInfosObj.longitude = parseLongitude // 经度
					this.longitude = parseLongitude
				}

				let parseEllipsoidHeight = resultObj.gga.ellipsoid_height || '';
				this.basicInfosObj.ellipsoid_height = parseEllipsoidHeight; // 椭球高（大地高）
				this.ellipsoid_height = parseEllipsoidHeight;

				let parseAltitude = resultObj.gga.altitude || '';
				this.basicInfosObj.altitude = parseAltitude; // 海拔高
				this.altitude = parseAltitude;

				try {
					this.basicInfosObj.locationMode = fixQualityList[resultObj.gga.fix_quality];
				} catch (error) {
					this.basicInfosObj.locationMode = fixQualityList[0];
				}

				let parseSatellitesTracked = resultObj.gga.satellites_tracked || '';
				this.basicInfosObj.satellites_tracked = parseSatellitesTracked; // 跟踪卫星数量
				this.satellites_tracked = parseSatellitesTracked;

				this.basicInfosObj.hdop = this.hdop;
				this.basicInfosObj.pdop = this.pdop;

				try {
					webContents.send('BASICINFOS', { message: this.basicInfosObj });
				} catch (error) {}
			} else {
				// reject("error")
			}
		})
	}
}
let PI = 3.1415926535897932384626
let a = 6378245.0
let ee = 0.00669342162296594323
function wgs84togcj02(lng: number, lat: number) {
	var lat = +lat
	var lng = +lng
	if (out_of_china(lng, lat)) {
		return [lng, lat]
	} else {
		var dlat = transformlat(lng - 105.0, lat - 35.0)
		var dlng = transformlng(lng - 105.0, lat - 35.0)
		var radlat = (lat / 180.0) * PI
		var magic = Math.sin(radlat)
		magic = 1 - ee * magic * magic
		var sqrtmagic = Math.sqrt(magic)
		dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI)
		dlng = (dlng * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI)
		var mglat = lat + dlat
		var mglng = lng + dlng
		return [mglng, mglat]
	}
}
function transformlat(lng: number, lat: number) {
	var lat = +lat
	var lng = +lng
	var ret =
		-100.0 +
		2.0 * lng +
		3.0 * lat +
		0.2 * lat * lat +
		0.1 * lng * lat +
		0.2 * Math.sqrt(Math.abs(lng))
	ret +=
		((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
			2.0) /
		3.0
	ret +=
		((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) *
			2.0) /
		3.0
	ret +=
		((160.0 * Math.sin((lat / 12.0) * PI) +
			320 * Math.sin((lat * PI) / 30.0)) *
			2.0) /
		3.0
	return ret
}

function transformlng(lng: number, lat: number) {
	var lat = +lat
	var lng = +lng
	var ret =
		300.0 +
		lng +
		2.0 * lat +
		0.1 * lng * lng +
		0.1 * lng * lat +
		0.1 * Math.sqrt(Math.abs(lng))
	ret +=
		((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
			2.0) /
		3.0
	ret +=
		((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) *
			2.0) /
		3.0
	ret +=
		((150.0 * Math.sin((lng / 12.0) * PI) +
			300.0 * Math.sin((lng / 30.0) * PI)) *
			2.0) /
		3.0
	return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
var out_of_china = function out_of_china(lng: number, lat: number) {
	var lat = +lat
	var lng = +lng
	// 纬度 3.86~53.55, 经度 73.66~135.05
	return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
}

export const nmeaParse: any = new NmeaParse()
