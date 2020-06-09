#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const { version } = require('../package');
const formatResult = require('../lib/format-result');
const { promisify } = require('util');
const $readFile = promisify(fs.readFile);

const readJson = filepath => $readFile(filepath).then(JSON.parse);

(async () => {
	const argv = minimist(process.argv.slice(2), {
		boolean: [
			'help',
		],
		alias: {
			help: 'h',
		},
	});

	if (argv.version) {
		return console.log(`Distsize plugin ${version}`);
	}

	if (argv.help) {
		return console.log(`HELP!`);
	}

	const [filepath = '.distsize.json'] = argv._;


	const distsizeData = await readJson(filepath);

	console.log(formatResult(distsizeData))


})();
