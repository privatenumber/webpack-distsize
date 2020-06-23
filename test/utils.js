const webpack = require('webpack');
const merge = require('webpack-merge');
const fs = require('fs');
const path = require('path');
const { ufs } = require('unionfs');
const DistsizePlugin = require('..');

function build(mfs, config = {}, log = false) {
	return new Promise((resolve, reject) => {
		if (!mfs.join) {
			mfs.join = path.join.bind(path); // eslint-disable-line no-param-reassign
		}

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
				new DistsizePlugin({ log }),
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
