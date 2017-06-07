(() => {
	'use strict'

	const header = [
		'const { read, write } = options',
		'const m = new Uint8Array(1024)',
		'let p = 0',
	]

	const map = {
		'+': 'm[p]++',
		'-': 'm[p]--',
		'>': 'p++',
		'<': 'p--',
		'.': 'write(m[p])',
		',': 'm[p] = read()',
		'[': 'while (m[p] > 0) {',
		']': '}',
	}

	function bfToJs (source) {
		const body = []

		source.split('').forEach((char) => {
			if (map[char]) {
				body.push(map[char])
			}
		})

		const compiled = `${header.join('\n')}\n${body.join('\n')}`

		return new Function('options', compiled)
	}

	window.bjs = window.bjs || {}
	Object.assign(window.bjs, {
		bfToJs,
	})
})()