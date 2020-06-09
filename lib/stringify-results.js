const stringifyResults = (obj, indent) => {
	const replaceWith = [];

	let result = JSON.stringify(obj, (key, value) => {
		if (['totalSize', 'size'].includes(key)) {
			const id = replaceWith.push(value) - 1;
			return `⏣${id}⏣`;
		}
		return value;
	}, indent);

	replaceWith.forEach((value, id) => {
		result = result.replace(`"⏣${id}⏣"`, JSON.stringify(value));
	});

	return result;
};

module.exports = stringifyResults;
