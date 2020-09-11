const barCodeStyles = `
	body {
		font-family: Arial;
		background-color: white;
		padding: 20px 40px;
	}
	.barcode-container {
		width: 136px;
		height: 144px;
		background-color: white;
		border: 3px solid black;
		margin-top: 40px;
		padding: 3px;
	}
	.barcode-block {
		width: 8px;
		height: 8px;
		float: left;
		background-color: white;
	}
	.barcode-block.black {
		background-color: black;
	}
	.barcode-error {
		color: red;
	}
`

const sexValueMap = {
	male: 1,
	female: 0
}

function renderBarcode(cloneInfo, element) {
	try {
		validateEntity(cloneInfo)

		const sexBinaryString = sexValueMap[ cloneInfo.sex ]

		const fixedLengthName = toFixedLengthString(26, ' ')(cloneInfo.name)
		const idAndNameBinaryString = stringToBinaryArray( cloneInfo.id + fixedLengthName ) // 288

		let finalBinaryString = sexBinaryString + idAndNameBinaryString // 289
		finalBinaryString += getControlInfo(finalBinaryString) // 306

		displayInfo(cloneInfo, element)
		draw(finalBinaryString, element)
	} catch (err) {
		printError(err, element)
	} finally {
		appendStyles(barCodeStyles)
	}
}

function validateEntity(props) {
	const rules = [
		{
			id: 'id',
			required: true,
			type: 'string',
			length: 10
		},
		{
			id: 'name',
			required: true,
			type: 'string',
			maxLength: 26
		},
		{
			id: 'sex',
			required: true,
			type: 'string',
			oneOf: Object.keys(sexValueMap)
		}
	]

	const handlers = {
		type: (value, type) => typeof value === type,
		required: value => !!value,
		length: (value, length) => value.length === length,
		maxLength: (value, maxLength) => value.length <= maxLength,
		oneOf: (value, oneOf) => oneOf.includes(value)
	}

	const handleRule = rule => propValue => (
		Object.entries(rule).every(([ key, value ]) => (
			!value || handlers[ key ](propValue, value)
		))
	)

	const nonValidProps = rules
		.map(({ id, ...rule}) => [ id, handleRule(rule)(props[ id ]) ])
		.filter(([ _, isValid ]) => !isValid)
		.map(([ id ]) => id)

	if (!nonValidProps.length) {
		return
	}

	throw `Invalid property values: ${nonValidProps.join(', ')}`
}

function getControlInfo(binaryString) {
	const sum = (acc, string) => acc + +string
	const rowSum = row => row.reduce(sum, 0)
	const even = sum => sum % 2

	return rotateMatrix(chunks([ ...binaryString ], 17))
		.map(rowSum)
		.map(even)
		.join('')
}

function chunks(array, size) {
	const chunks = []

	for (let i = 0; i < size; i++) {
		chunks.push( array.slice(i * size, (i + 1) * size) )
	}

	return chunks
}

function rotateMatrix(matrix) {
	const rotated = []

	for (let i = 0; i < matrix.length; i++) {
		const row = matrix.map(r => r[ i ]).reverse()
		rotated.push(row)
	}

	return rotated
}

function stringToBinaryArray(string) {
	return [ ...string ]
		.map(getSymbolASCII)
		.map(decimalToBinary)
		.map(toFixedLengthString(8, '0', 'right'))
		.reduce((acc, current) => acc + current, '')
}

function getSymbolASCII(symbol) {
	return symbol.charCodeAt(0)
}

function decimalToBinary(value) {
	return parseInt(value).toString(2)
}

function toFixedLengthString(size, fillWith, align) {
	return function (string) {
		const stringArr = [ ...string ]

		if (stringArr.length === size) {
			return string
		}

		const arr = new Array(size).fill(fillWith)
		const start = align === 'right' && (size - stringArr.length) || 0

		arr.splice(start, stringArr.length, ...stringArr)

		return arr.join('')
	}
}

function appendStyles(css) {
	const head = document.head || document.getElementsByTagName('head')[0]

	const style = document.createElement('style')
	style.type = 'text/css'
	style.appendChild(document.createTextNode(css))

	head.appendChild(style)
}

function displayInfo(props, element) {
	const caption = document.createElement('h3')
	caption.innerText = 'Информация о клоне:'
	element.appendChild(caption);

	[ 'sex', 'id', 'name' ].forEach(key => {
		const textLine = document.createElement('p')
		textLine.innerText = `${key}: ${props[ key ]}`

		element.appendChild(textLine)
	})
}

function draw(binaryString, element) {
	const container = document.createElement('div')
	container.classList.add('barcode-container');

	[ ...binaryString ].forEach(value => {
		const block = document.createElement('div')

		block.classList.add('barcode-block')
		!!+value && block.classList.add('black')

		container.appendChild(block)
	})

	element.appendChild(container)
}

function printError(errorMessage, element) {
	const warning = document.createElement('p')
	warning.innerText = errorMessage.toString()
	warning.classList.add('barcode-error')

	element.appendChild(warning);
}
