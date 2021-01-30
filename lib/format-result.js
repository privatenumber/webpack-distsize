const SimpleTable = require('cli-simple-table');
const chalk = require('chalk');
const byteSize = require('byte-size');
const { version } = require('../package');

const normalizeThresholds = thresholds => (thresholds || [])
	.slice()
	.map(({ threshold, color }) => {
		let colorFunction = color;
		if (typeof colorFunction === 'string') {
			try {
				colorFunction = chalk.keyword(colorFunction);
			} catch {
				// eslint-disable-next-line no-console
				console.error(`Invalid color "${colorFunction}". Make sure it's a CSS color.`);
				colorFunction = chalk.white;
			}
		}

		return {
			threshold,
			color: colorFunction,
		};
	});

const calcGrowth = (before, after) => {
	const diff = after[0] - before[0];
	if (diff === 0) {
		return '';
	}
	return chalk[diff <= 0 ? 'green' : 'redBright'](`${diff >= 0 ? '+' : ''}${byteSize(diff)}`);
};

const compareOld = (before, after) => {
	const growth = calcGrowth(before, after);
	if (!growth) {
		return '';
	}
	return `(${calcGrowth(before, after)}) `;
};

function formatResult(
	result,
	oldSize,
	_thresholds = [
		{ threshold: 100000, color: 'red' },
		{ threshold: 50000, color: 'orange' },
		{ threshold: 10000, color: 'yellow' },
		{ threshold: 5000, color: 'dodgerblue' },
		{ threshold: 0, color: 'lime' },
	],
) {
	const thresholds = normalizeThresholds(_thresholds);
	const outputTitle = `${chalk.dim('Distsize Plugin')} ${version}`;
	const table = new SimpleTable();

	table.header(
		'Asset',
		{
			text: 'Size',
			align: 'right',
		},
		{
			text: 'Gzip size',
			align: 'right',
		},
	);

	table.row(
		chalk.underline('Total'),
		(oldSize ? compareOld(oldSize.totalSize.raw, result.totalSize.raw) : '') + chalk.underline(result.totalSize.raw[1]),
		(oldSize ? compareOld(oldSize.totalSize.gzip, result.totalSize.gzip) : '') + chalk.underline(result.totalSize.gzip[1]),
	);

	table.row();

	result.assets
		.slice()
		.sort((a, b) => b.size.gzip[0] - a.size.gzip[0])
		.forEach((asset) => {
			const { color } = thresholds.find(
				({ threshold }) => threshold < asset.size.gzip[0],
			) || { color: chalk.white };

			const old = oldSize && oldSize.assets.find(a => a.name === asset.name);

			table.row(
				color(asset.name),
				(old ? compareOld(old.size.raw, asset.size.raw) : '') + asset.size.raw[1],
				(old ? compareOld(old.size.gzip, asset.size.gzip) : '') + asset.size.gzip[1],
			);
		});

	return `\n${outputTitle}\n\n${table.toString()}`;
}

module.exports = formatResult;
