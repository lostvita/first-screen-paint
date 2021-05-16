## first-screen-paint
非侵入，自动地获取网页首屏渲染时间。

## install
```shell
npm install first-screen-paint --save
```

## Demo
```shell
cd first-screen-paint
npm install
npm run dev
```

## Usage
```js
// import as a module
import 'first-screen-paint'

// or add as a script
<script src="./first-screen-paint/dist/index.js"></script>

// Obtain the FSP time anywhere
if (window.$fstp) {
  $fstp.getFirstScreenTime().then((data) => {
    console.log(data)
  })
}
```

## Api
api | desc | params
----- | ----- | -----
getFirstScreenTime | obtian FSP time | delay:[Number]5000(default), stop: [Bollean]true(default)
getRequestTime | obtain resource time with white list | format: [RegExp], delay:[Number]5000(default), stop: [Bollean]true(default)
reopen | reopen listiner | ele: [Element]document(default)
