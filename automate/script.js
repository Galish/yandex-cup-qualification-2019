function solution(input, element) {
	printString('HTML table', input, element)

	const html = stringToHTML(input)
	const rows = parseRows(html)
	const aligment = parseAligment(html, rows[ 0 ].length)
	const parsed = merge(rows, aligment)

	console.log('parsed:', parsed);

	const markdown = toMarkdown(parsed)

	console.log('markdown:', markdown)

	printString('Result markdown:', markdown, element)
}

function stringToHTML(string) {
	return new DOMParser().parseFromString(string, 'text/xml')
}

function merge([ head, ...body], aligment) {
	return [ head, aligment, ...body ]
}

function parseAligment(document, size) {
	const valuesMap = {
		left: ':---',
		center: ':---:',
		right: '---:'
	}

	const arr = new Array(size).fill(valuesMap.left)

	const colGroupNode = document.querySelector('colgroup')
	if (!colGroupNode) {
		return arr
	}

	const colNodes = [ ...colGroupNode.querySelectorAll('col') ]
	if (!colNodes.length) {
		return arr
	}

	colNodes.forEach((node, index) => {
		const value = node.getAttribute('align')

		if (valuesMap[ value ]) {
			arr[ index ] = valuesMap[ value ]
		}
	})


	return arr
}

function toMarkdown(parsedInput, delimitter = ' | ') {
	const joinCols = row => `${delimitter}${row.join(delimitter)}${delimitter}`
	return parsedInput.map(joinCols).join('\n')
}

function parseRows(document) {
	const filterCellNodes = ({ tagName }) => [ 'th', 'td' ].includes(tagName)
	const getTextContent = ({ tagName, textContent }) => wrapBold(getText(textContent), tagName === 'th')
	const parseRow = node => [ ...node.childNodes ].filter(filterCellNodes).map(getTextContent)

	return [ ...document.querySelectorAll('tr') ].map(parseRow)
}

function wrapBold(string, value = true) {
	return value && `**${string}**` || string
}

function getText(string) {
	string = string.trim()
	string = string.replace(/[\r\n]+/g, ' ')
	string = string.replace(/\s\s+/g, ' ')

	return string
}

function printString(caption, string, element) {
	const h2 = document.createElement('h2')
	h2.innerText = caption

	element.appendChild(h2)

	const div = document.createElement('div')
	div.innerText = string

	element.appendChild(div)
}
