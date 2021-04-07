## first-screen-time
统计首屏渲染时间（渲染完成），自动计算，无感植入。

## 安装
```shell
npm install first-screen-time --save
```

## Demo
```shell
cd first-screen-time
npm install
npm run dev
```

## 使用
```js
// 在入口文件顶部引入
import 'first-screen-time'

// or 下载引入
<script src="./first-screen-time/dist/index.js"></script>

// 在任意地方获取统计时间
if (window.$fstp) {
  $fstp.getFirstScreenTime().then((data) => {
    console.log(data)
  })
}
```

## Api
- getFirstScreenTime
- getRequestTime
- reopen