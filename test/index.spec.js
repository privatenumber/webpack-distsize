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

	expect(typeof built).toBe('object');
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

	expect(typeof built).toBe('object');
	console.log(built);
});

test('Single output file w/ chunk', async () => {
	const built = await build({
		'/index.js': outdent`
		import('/dep').then(console.log);
		const value = 'hello world A';
		export default value;
		`,
		'/dep.js': outdent`
		const value = 'goodbye world B';
		export default value;
		`,
	}, {
		entry: '/index.js'
	});

	expect(typeof built).toBe('object');
	console.log(built);
});
