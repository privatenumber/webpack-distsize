const stripAnsi = require('strip-ansi');
const chalk = require('chalk');
const truncate = require('cli-truncate');

const pad = ({
 text, length, align,
}) => {
	let fillBy = length - stripAnsi(text).length;
	if (fillBy < 0) {
		fillBy = 0;
	}
	const fill = ' '.repeat(fillBy);
	return (align === 'left') ? (text + fill) : (fill + text);
};

class CliTable {
	constructor() {
		this.columnData = [];
		this.data = [];
	}

	headers(..._columns) {
		this.columnData.push(..._columns.map((c) => ({
			...c,
			align: c.align || 'left',
			maxLength: stripAnsi(c.text).length,
		})));
	}

	row(...columns) {
		columns.forEach((c, i) => {
			const strLen = stripAnsi(c).length;
			if (this.columnData[i].maxLength < strLen) {
				this.columnData[i].maxLength = strLen;
			}
		});
		this.data.push(columns);
	}

	toString({
		maxColumnWidth = 70,
		columnPadding = 10,
	} = {}) {
		const columnFill = ' '.repeat(columnPadding);
		return [

			// Headers
			this.columnData.map(({ text, maxLength, align }) => pad({
				text: chalk.bold(text),
				length: Math.min(maxLength, maxColumnWidth),
				align,
			})).join(columnFill),

			'',

			// Rows
			...this.data.map(
				(row) => row.map((_text, i) => {
					const { maxLength, align } = this.columnData[i];
					const maxWidth = Math.min(maxLength, maxColumnWidth);

					let text = _text;
					if (stripAnsi(text).length > maxWidth) {
						text = truncate(text, maxWidth, { position: 'middle' });
					}

					return pad({
						text,
						length: maxWidth,
						align,
					});
				})
				.join(columnFill),
			),
		].join('\n');
	}
}

module.exports = CliTable;
