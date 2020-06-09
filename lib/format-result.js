const chalk = require('chalk');
const { version } = require('../package');
const CliTable = require('./cli-table');

const normalizeThresholds = (thresholds) => (thresholds || [])
		.slice()
		.map(({ threshold, color }) => {
			let colorFn = color;
			if (typeof colorFn === 'string') {
				try {
					colorFn = chalk.keyword(colorFn);
				} catch (err) {
					console.log(`Invalid color "${colorFn}". Make sure it's a CSS color.`);
					colorFn = chalk.white;
				}
			}

			return {
				threshold,
				color: colorFn,
			};
		});


function formatResult(
	result,
	thresholds = [
		{ threshold: 100000, color: 'red' },
		{ threshold: 50000, color: 'orange' },
		{ threshold: 10000, color: 'yellow' },
		{ threshold: 5000, color: 'dodgerblue' },
		{ threshold: 0, color: 'lime' },
	],
) {
	thresholds = normalizeThresholds(thresholds);

	const outputTitle = `${chalk.dim('Distsize Plugin')} ${version}`;
	const table = new CliTable();

	table.headers(
		{
			text: 'Asset',
		},
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
		chalk.underline(result.totalSize.raw[1]),
		chalk.underline(result.totalSize.gzip[1]),
	);

	table.row();

	result.assets
		.slice()
		.sort((a, b) => b.size.gzip[0] - a.size.gzip[0])
		.forEach((asset) => {
			const { color } = thresholds.find(({ threshold }) => threshold < asset.size.gzip[0]) || { color: chalk.white };
			table.row(color(asset.name), asset.size.raw[1], asset.size.gzip[1]);
		});

	return `\n${outputTitle}\n\n${table.toString()}`;
}

module.exports = formatResult;
