import website from '../website'
/*
 ** 异步加载高德地图
 */
export default function mapLoader() {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve(window.AMap)
    } else {
      var url = `https://webapi.amap.com/maps?v=1.4.15&key=${website.amapKey}&callback=onLoad&plugin=AMap.PlaceSearch`
      var script = document.createElement('script')
      script.src = url
      script.onerror = reject
      document.head.appendChild(script)
    }

    window.onLoad = () => {
      resolve(window.AMap)
    }
  })
}
