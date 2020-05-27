const util = require('util');
const _ = require('lodash');
const filesize = require('filesize');
const gzipSize = require('gzip-size');
const path = require('path');
const { promisify } = require('util');
const chalk = require('chalk');
const cliui = require('cliui');

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

const normalizeThresholds = (thresholds) => {
	return (thresholds || [])
		.slice()
		.map(({ threshold, color }) => {
			let colorFn = color;
			if (typeof colorFn === 'string') {
				try {
					colorFn = chalk.keyword(colorFn);
				} catch(err) {
					console.log(`Invalid color "${colorFn}". Make sure it's a CSS color.`);
					colorFn = chalk.white;
				}
			}

			return {
				threshold,
				color: colorFn,
			};
		});
};

class DistsizePlugin {
	constructor({
		log = true,
		filepath = '.distsize.json',
		indent = 2,
		filter = null,
		thresholds = [
			{ threshold: 100000, color: 'red' },
			{ threshold: 50000, color: 'orange' },
			{ threshold: 10000, color: 'yellow' },
			{ threshold: 5000, color: 'dodgerblue' },
			{ threshold: 0, color: 'lime' },
		]
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
			const $writeFile = promisify(fs.writeFile).bind(fs);
			await $writeFile(
				path.resolve(outputPath, this.filepath),
				JSON.stringify(result, null, this.indent),
			);
		}

		cb();
	}

	logResult(result) {
		const ui = cliui();

		const thresholds = normalizeThresholds(this.thresholds);

		const { version } = require('../package');

		ui.div({
			text: `Distsize Plugin ${version}`,
			padding: [2, 0, 1, 0]
		});

		ui.div(
			{
				text: chalk.bold('Asset'),
				align: 'left',
				padding: [0, 0, 1, 0],
			},
			{
				text: chalk.bold('Size'),
				align: 'right',
			},
			{
				text: chalk.bold('Gzip size'),
				align: 'right',
			}
		);

		result.assets
			.slice()
			.sort((a, b) => b.size.gzip[0] - a.size.gzip[0])
			.forEach(asset => {
				const { color } = thresholds.find(({ threshold }) => threshold < asset.size.gzip[0]) || { color: chalk.white };

				ui.div(
					{
						text: color(asset.name),
					},
					{
						text: asset.size.raw[1],
						align: 'right',
					},
					{
						text: asset.size.gzip[1],
						align: 'right',
					}
				);
			});

		console.log(ui.toString() + '\n\n');
		// console.log(util.inspect(result, { colors: true, depth: null, maxArrayLength: null }));
	}
}

module.exports = DistsizePlugin;