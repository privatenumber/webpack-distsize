const outdent = require('outdent');
const { createFsFromVolume, Volume } = require('memfs');
const { build } = require('./utils');

const createFs = (vol) => createFsFromVolume(Volume.fromJSON(vol));

test('Single output file', async () => {
	const mfs = createFs({
		'/index.js': outdent`
		const value = 'hello world';
		export default value;
		`,
	});

	const built = await build(mfs, {
		entry: '/index.js',
	});

	expect(typeof built).toBe('object');

	expect(built.totalSize.raw[0]).toBe(3850);
	expect(built.totalSize.gzip[0]).toBe(1099);

	expect(built.assets[0].name).toBe('main.js');
	expect(built.assets[0].size.raw[0]).toBe(3850);
	expect(built.assets[0].size.gzip[0]).toBe(1099);
});

test('Multiple output files', async () => {
	const mfs = createFs({
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
	});

	const built = await build(mfs, {
		entry: {
			entryA: '/entry-a.js',
			entryB: '/entry-b.js',
			entryC: '/entry-c.js',
		},
	});

	expect(typeof built).toBe('object');
	expect(built.totalSize.raw[0]).toBe(11572);
	expect(built.totalSize.gzip[0]).toBe(3313);

	expect(built.assets[0].name).toBe('entryA.js');
	expect(built.assets[1].name).toBe('entryB.js');
	expect(built.assets[2].name).toBe('entryC.js');
});

test('Single output file w/ chunks', async () => {
	const mfs = createFs({
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
	});

	const built = await build(mfs, {
		entry: '/index.js',
	});

	expect(typeof built).toBe('object');

	expect(built.totalSize.raw[0]).toBe(551365);
	expect(built.totalSize.gzip[0]).toBe(98995);

	expect(built.assets[0].name).toBe('1.js');
	expect(built.assets[1].name).toBe('2.js');
	expect(built.assets[2].name).toBe('3.js');
	expect(built.assets[3].name).toBe('main.js');
});


test('Single output file w/ chunks', async () => {
	const mfs = createFs({
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
		`,
	});

	const built = await build(mfs, {
		entry: {
			longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].[contenthash].js',
		},
	});

	expect(typeof built).toBe('object');

	expect(built.totalSize.raw[0]).toBe(551909);
	expect(built.totalSize.gzip[0]).toBe(99342);

	expect(built.assets[0].name).toBe('1.5a6ea2d40bd1d9f5a0b8.js');
	expect(built.assets[1].name).toBe('2.96d4afac23210f1c4b1a.js');
	expect(built.assets[2].name).toBe('3.c3c808e12a44982a7a86.js');
	expect(built.assets[3].name).toBe('4.ab58408659f5d92c4988.js');
	expect(built.assets[4].name).toBe('longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName.eab4008460d759da42e8.js');
});

test('Log decrease in size', async () => {
	const mfs = createFs({
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
		`,
	});

	await build(mfs, {
		entry: {
			longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].js',
		},
	});

	mfs.writeFileSync('/index.js', 'console.log(1);');

	await build(mfs, {
		entry: {
			longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].js',
		},
	}, true);
});

test('Log increase in size', async () => {
	const mfs = createFs({
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
		`,
	});

	await build(mfs, {
		entry: {
			longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].js',
		},
	});

	mfs.writeFileSync('/dep3.js', 'import chalk from \'chalk\';');

	await build(mfs, {
		entry: {
			longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglongEntryName: '/index.js',
		},
		output: {
			filename: '[name].js',
		},
	}, true);
});
