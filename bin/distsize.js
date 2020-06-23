#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const chalk = require('chalk');
const { promisify } = require('util');
const { version } = require('../package');
const formatResult = require('../lib/format-result');

const $readFile = promisify(fs.readFile);

const readJson = (filepath) => $readFile(filepath).then(JSON.parse);

(async () => {
	const argv = minimist(process.argv.slice(2), {
		boolean: [
			'help',
		],
		alias: {
			help: 'h',
			version: 'v',
		},
	});

	if (argv.version) {
		// eslint-disable-next-line no-console
		console.log(`Distsize plugin ${version}`);
		return;
	}

	if (argv.help) {
		// eslint-disable-next-line no-console
		console.log(`
Usage: distsize [distsize.json]

Options:
   --help, -h            [boolean] show help
   --version, -v         [boolean] show version
		`);
		return;
	}

	const [filepath = '.distsize.json'] = argv._;
	if (!fs.existsSync(filepath)) {
		// eslint-disable-next-line no-console
		console.error(chalk.bold.red('[distsize error]'), `"${filepath}" doesn't exist\n`);
		return;
	}
	const distsizeData = await readJson(filepath);

	// eslint-disable-next-line no-console
	console.log(formatResult(distsizeData));
})();
