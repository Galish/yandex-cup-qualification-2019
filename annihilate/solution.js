function findLatestWeight(input) {
	const weights = [ ...input ]

	while (true) {
		const [ value1, index1, value2, index2 ] = findTwoMax(weights)

		if (value2 === 0) {
			return value1
		}

		weights[ index1 ] = Math.abs(value1 - value2)
		weights[ index2 ] = 0
	}
}

function findTwoMax(weights) {
	const result = [ weights[ 0 ], 0, weights[ 1 ], 1 ]

	for(let i = 2; i < weights.length; i++) {
		if (weights[ i ] > result[ 0 ]) {
			result[ 0 ] = weights[ i ]
			result[ 1 ] = i
		}
		else if (weights[ i ] > result[ 2 ]) {
			result[ 2 ] = weights[ i ]
			result[ 3 ] = i
		}
	}

	return result
}

module.exports = findLatestWeight
