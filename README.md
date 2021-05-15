## first-screen-paint
Obtain the web page first screen pain(fsp) time automatically, non-implanted.

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
<script src="./first-screen-time/dist/index.js"></script>

// Obtain the FSP time anywhere
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