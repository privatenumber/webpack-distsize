const webpack = require('webpack');
const { Volume } = require('memfs');
const fs = require('fs');
const path = require('path');
const { ufs } = require('unionfs');
const DistsizePlugin = require('..');

function build(volJson, config = {}) {
	return new Promise((resolve, reject) => {
		const mfs = Volume.fromJSON(volJson);
		
		Object.entries(Volume.prototype).forEach(([name, fn]) => {
			mfs[name] = fn.bind(mfs);
		});
		mfs.join = path.join.bind(path);

		const compiler = webpack({
			mode: 'production',
			optimization: {
				minimize: false,
				providedExports: false,
			},
			resolve: {
				modules: [path.resolve('../node_modules')]
			},
			plugins: [
				new DistsizePlugin(),
			],
			...config,
			output: {
				path: '/dist',
			},
		});

		compiler.inputFileSystem = ufs.use(fs).use(mfs);
		compiler.outputFileSystem = mfs;

		compiler.run((err, stats) => {
			if (err) {
				reject(err);
				return;
			}

			if (stats.compilation.errors.length > 0) {
				reject(stats.compilation.errors);
				return;
			}

			// console.log(stats.compilation)

			resolve(JSON.parse(mfs.readFileSync('/dist/.distsize.json').toString()));
		});
	});
}


module.exports = {
	build,
};
