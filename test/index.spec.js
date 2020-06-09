const outdent = require('outdent');
const { build } = require('./utils');

test('Single output file', async () => {
	const built = await build({
		'/index.js': outdent`
		const value = 'hello world';
		export default value;
		`,
	}, {
		entry: '/index.js'
	});

	expect(typeof built).toBe('string');
	console.log(built);

});

test('Multiple output files', async () => {
	const built = await build({
		'/entry-a.js': outdent`
		const value = 'hello world A';
		export default value;
		`,
		'/entry-b.js': outdent`
		const value = 'goodbye world B';
		export default value;
		`,
		'/entry-c.js': outdent`
		const value = 'goodbye world C';
		export default value;
		`,
	}, {
		entry: {
			entryA: '/entry-a.js',
			entryB: '/entry-b.js',
			entryC: '/entry-c.js',
		},
	});

	expect(typeof built).toBe('string');
	console.log(built);
});

test('Single output file w/ chunks', async () => {
	const built = await build({
		'/index.js': outdent`
		import('/dep1').then(console.log);
		import('/dep2').then(console.log);
		const value = 'hello world A';
		export default value;
		`,
		'/dep1.js': outdent`
		const value = 'goodbye world B';
		export default value;
		`,
		'/dep2.js': outdent`
		import _ from 'lodash';
		console.log('_');
		`,
	}, {
		entry: '/index.js'
	});

	expect(typeof built).toBe('string');
	console.log(built);
});


test('Single output file w/ chunks', async () => {
	const built = await build({
		'/index.js': outdent`
		import('/dep1').then(console.log);
		import('/dep2').then(console.log);
		const value = 'hello world A';
		export default value;
		`,
		'/dep1.js': outdent`
		import('./dep3').then(console.log);
		const value = 'goodbye world B';
		export default value;
		`,
		'/dep2.js': outdent`
		import _ from 'lodash';
		console.log('_');
		`,
		'/dep3.js': outdent`
		const test = Math.random();
		export default test;
		`
	}, {
		entry: {
			longlonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].[contenthash].js'
		},
	});

	expect(typeof built).toBe('string');
	console.log(built);
});

