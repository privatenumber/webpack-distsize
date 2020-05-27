const util = require('util');
const _ = require('lodash');

const filesize = require('filesize');
const gzipSize = require('gzip-size');
const path = require('path');
const writeJsonFile = require('write-json-file');
const NodeOutputFileSystem = require('webpack/lib/node/NodeOutputFileSystem');
const { promisify } = require('util');

const statsOpts = {
	// assets: false,
	builtAt: false,
	moduleAssets: false,
	moduleTrace: false,
	// cachedAssets: false,
	children: false,
	chunks: false,
	chunkGroups: false,
	chunkModules: false,
	chunkRootModules: false,
	chunkOrigins: false,
	source: false,
	performance: false,
	providedExports: false,
	errors: false,
	errorDetails: false,
	errorStack: false,
	entrypoints: false,
	warnings: false,
	outputPath: false,
	hash: false,
	publicPath: false,
	timings: false,
	version: false,
	logging: 'none',
};


class DistsizePlugin {
	
	constructor({
		filepath = 'dist-size.json'
	} = {}) {
		this.filepath = filepath;
	}

	apply(compiler) {

		this.compiler = compiler;
		const calculateFilesize = this.calculateFilesize.bind(this);

		if (compiler.hooks) {
			compiler.hooks.done.tapAsync('webpack-dependency-size', calculateFilesize);
		} else {
			compiler.plugin('done', calculateFilesize);
		}
	}

	async calculateFilesize(stats, cb = _.noop) {
		const statsJson = stats.toJson({
			...statsOpts,
		});
		const { outputPath, outputFileSystem: fs } = this.compiler;

		console.log(fs);
		if (fs instanceof NodeOutputFileSystem) {
			console.log('IS instanceof');
			const realFs = require('fs');
			fs.readFileSync = realFs.readFileSync.bind(realFs);
		}

		const assets = statsJson.assets.map(a => {
			const source = fs.readFileSync(path.resolve(outputPath, a.name));
			const gzip = gzipSize.sync(source);

			return {
				name: a.name,
				size: {
					raw: [a.size, filesize(a.size)],
					gzip: [gzip, filesize(gzip)],
				},
			};
		});

		const totalSize = assets.reduce((sum, a) => a.size.raw[0] + sum, 0);
		const totalGzipSize = assets.reduce((sum, a) => a.size.gzip[0] + sum, 0);

		const result = {
			hash: stats.hash,
			totalSize: {
				raw: [totalSize, filesize(totalSize)],
				gzip: [totalGzipSize, filesize(totalGzipSize)],
			},
			assets,
		};

		await writeJsonFile(path.resolve(outputPath, this.filepath), result, { fs });

		console.log(util.inspect(result, { colors: true, depth: null, maxArrayLength: null }));

		cb();
	}

}


module.exports = DistsizePlugin;