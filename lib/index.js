const path = require('path');
const { promisify } = require('util');
const _ = require('lodash');
const byteSize = require('byte-size');
const gzipSize = require('gzip-size');
const formatResult = require('./format-result');
const stringifyResults = require('./stringify-results');

const statsOptions = {
	builtAt: false,
	moduleAssets: false,
	moduleTrace: false,
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
	modules: false,
};

class DistsizePlugin {
	constructor({
		log = true,
		filepath = '.distsize.json',
		indent = 2,
		filter = null,
		thresholds,
	} = {}) {
		this.log = log;
		this.filepath = filepath;
		this.indent = indent;
		this.filter = filter;
		this.thresholds = thresholds;
	}

	apply(compiler) {
		this.compiler = compiler;
		const calculateSize = this.calculateSize.bind(this);

		if (compiler.hooks) {
			compiler.hooks.done.tapAsync('webpack-distsize-plugin', calculateSize);
		} else {
			compiler.plugin('done', calculateSize);
		}
	}

	async calculateSize(stats, callback = _.noop) {
		const { outputPath, outputFileSystem: fs } = this.compiler;

		if (!fs.readFileSync) {
			// eslint-disable-next-line node/global-require
			const realFs = require('fs');
			fs.readFileSync = realFs.readFileSync.bind(realFs);
		}

		const statsJson = stats.toJson(statsOptions);
		const assets = statsJson.assets
			.filter(a => a.emitted)
			.filter((a) => {
				if (!this.filter) {
					return true;
				}
				if (typeof this.filter === 'function') {
					return this.filter(a.name);
				}
				return a.name.match(this.filter);
			})
			.map((a) => {
				const source = fs.readFileSync(path.resolve(outputPath, a.name));
				const gzip = gzipSize.sync(source);

				return {
					name: a.name,
					size: {
						raw: [a.size, byteSize(a.size).toString()],
						gzip: [gzip, byteSize(gzip).toString()],
					},
				};
			});

		assets.sort((a, b) => a.name.localeCompare(b.name));

		// eslint-disable-next-line unicorn/no-reduce
		const totalSize = assets.reduce((sum, a) => a.size.raw[0] + sum, 0);
		// eslint-disable-next-line unicorn/no-reduce
		const totalGzipSize = assets.reduce((sum, a) => a.size.gzip[0] + sum, 0);

		const result = {
			hash: stats.hash,
			totalSize: {
				raw: [totalSize, byteSize(totalSize).toString()],
				gzip: [totalGzipSize, byteSize(totalGzipSize).toString()],
			},
			assets,
		};

		const outputAbsPath = path.resolve(outputPath, this.filepath);

		if (this.log) {
			let oldSize;
			try {
				oldSize = JSON.parse(fs.readFileSync(outputAbsPath).toString());
			} catch {} // eslint-disable-line no-empty
			this.logResult(result, oldSize);
		}

		if (this.filepath) {
			const $writeFile = promisify(fs.writeFile);
			await $writeFile(
				outputAbsPath,
				stringifyResults(result, this.indent),
			);
		}

		callback();
	}

	logResult(result, oldSize) {
		const stdout = formatResult(result, oldSize, this.thresholds);

		// eslint-disable-next-line no-console
		console.log(`\n${stdout}\n\n`);
	}
}

module.exports = DistsizePlugin;
