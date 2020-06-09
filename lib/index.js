const util = require('util');
const _ = require('lodash');
const filesize = require('filesize');
const gzipSize = require('gzip-size');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');
const formatResult = require('./format-result');
const stringifyResults = require('./stringify-results');

const statsOpts = {
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
	source: false,
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

	async calculateSize(stats, cb = _.noop) {
		const { outputPath, outputFileSystem: fs } = this.compiler;

		if (!fs.readFileSync) {
			const realFs = require('fs');
			fs.readFileSync = realFs.readFileSync.bind(realFs);
		}

		const statsJson = stats.toJson(statsOpts);
		const assets = statsJson.assets
			.filter(a => a.emitted)
			.filter(a => {
				if (!this.filter) { return true; }
				if (typeof this.filter === 'function') {
					return this.filter(a.name);
				}
				return a.name.match(this.filter);
			})
			.map(a => {
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

		assets.sort((a, b) => a.name.localeCompare(b.name));

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

		if (this.log) {
			this.logResult(result);
		}

		if (this.filepath) {
			const $writeFile = promisify(fs.writeFile);
			await $writeFile(
				path.resolve(outputPath, this.filepath),
				stringifyResults(result, this.indent),
			);
		}

		cb();
	}

	logResult(result) {
		const stdout = formatResult(result, this.thresholds);
		console.log('\n' + stdout + '\n\n');
	}
}

module.exports = DistsizePlugin;