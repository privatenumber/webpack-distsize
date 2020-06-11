<h1>
	Webpack Distsize
	<a href="https://npm.im/webpack-distsize-plugin"><img src="https://badgen.net/npm/v/webpack-distsize-plugin"></a>
	<a href="https://npm.im/webpack-distsize-plugin"><img src="https://badgen.net/npm/dm/webpack-distsize-plugin"></a>
	<a href="https://packagephobia.now.sh/result?p=webpack-distsize-plugin"><img src="https://packagephobia.now.sh/badge?p=webpack-distsize-plugin"></a>
	<a href="https://bundlephobia.com/result?p=webpack-distsize-plugin"><img src="https://badgen.net/bundlephobia/minzip/webpack-distsize-plugin"></a>
</h1>

<p align="center">
	<img src="/.github/screenshot.png">
</p>

Be conscious of distrubtion size by tracking asset size stats with version control

## 🙋‍♀️ Why?
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


## License

MIT

