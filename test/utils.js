const webpack = require('webpack');
const merge = require('webpack-merge');
const { createFsFromVolume, Volume } = require('memfs');
const fs = require('fs');
const path = require('path');
const { ufs } = require('unionfs');
const DistsizePlugin = require('..');

function build(volJson, config = {}) {
	return new Promise((resolve, reject) => {
		const mfs = createFsFromVolume(Volume.fromJSON(volJson));

		mfs.join = path.join.bind(path);

		const compiler = webpack(merge({
			mode: 'production',
			optimization: {
				minimize: false,
				providedExports: false,
			},
			resolve: {
				modules: [path.resolve(__dirname, '../node_modules')],
			},
			plugins: [
				new DistsizePlugin({ log: false }),
			],
			output: {
				path: '/dist',
			},
		}, config));

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

			resolve(JSON.parse(mfs.readFileSync('/dist/.distsize.json').toString()));
		});
	});
}


module.exports = {
	build,
};
