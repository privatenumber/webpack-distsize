# Webpack Distsize <a href="https://npm.im/webpack-distsize"><img src="https://badgen.net/npm/v/webpack-distsize"></a> <a href="https://npm.im/webpack-distsize"><img src="https://badgen.net/npm/dm/webpack-distsize"></a> <a href="https://packagephobia.now.sh/result?p=webpack-distsize"><img src="https://packagephobia.now.sh/badge?p=webpack-distsize"></a>

<p align="center">
  <img src="https://github.com/privatenumber/webpack-distsize/raw/master/.github/screenshot.png" width="70%">
  <br>
  <i>Track Webpack output size via version control</i>
</p>

## ⭐️ Features
- **📊 Size conscious** Be aware of how your changes impact file size
- **💅 Pretty formatting** View color-coded assets ordered by size via `npx distsize`
- **⚙️ Configurable** Save distsize data where you like and set custom thresholds


## 🚀 Install
```sh
npm i -D webpack-distsize
```


## 👩‍🏫 Easy setup

Add to your Webpack config:
```js
// 1. Import plugin
const Distsize = require('webpack-distsize');

module.exports = {
	...,

	plugins: [
		// 2. Add to plugins array
		new Distsize({
			// Options
		})
	]
};
```

Run your Webpack build and track the produced `.distsize.json` file via version control.

### Distsize viewing

The plugin installs the `distsize` binary to view the outputted distsize JSON file. IT defaults to reading `.distsize.json` in the current directory, but pass in a path to read from a custom path.

```sh
npx distsize
```


## 🎛 Options 

- `log` `<Boolean>` (default `true`)  - Whether to log the distsize to stdout

- `filepath` `<String>` (default `.distsize.json`) - Output location for distsize JSON data

- `indent` `<Number|String>`  (default `2`) - Indentation for distsize JSON data

- `filter` `<Function|RegExp|String>` (`null`)  - Filter to include assets by name

- `thresholds` `<Array>` - Color coding to use for size thresholds

  ```json5
  [
    { threshold: 100000, color: 'red' },
    { threshold: 50000, color: 'orange' },
    { threshold: 10000, color: 'yellow' },
    { threshold: 5000, color: 'dodgerblue' },
    { threshold: 0, color: 'lime' },
  ]
  ```

  
## 💁‍♀️ FAQ
- **Can it track and display asset growth?**

  Depends on your Webpack configuration. If your assets are emitted under the same name, then yes.

  But if it usses [`[hash]`, `[contenthash]`, `[chunkhash]`](https://webpack.js.org/configuration/output/#template-strings), then it's not possible to _accurately_ draw a comparison across builds.

- **Can it track size impact from dependency changes?**

  If a dependency change impacts distribution size, it will be reflected by this plugin, but it will not contain any details that hint at which dependency grew in size. I recommend doing upgrades in isolation so it's easily identifiable. 

  Distsize focuses specifically on distribution size and making it digestible because that alone can be overwhelming -- a large codebase can produce hundreds of assets.

  If you want something similar for dependencies, I recommend using [webpack-dependency-size](https://github.com/privatenumber/webpack-dependency-size).


## 👨‍👩‍👧 Related
- [webpack-dependency-size](https://github.com/privatenumber/webpack-dependency-size) - Analyze dependency assets bundled into your Webpack build

## 💼 License

MIT

