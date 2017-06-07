(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const codeElement = document.getElementById('code')
	const inputElement = document.getElementById('input')
	const outputElement = document.getElementById('output')

	codeElement.value = '++++++++[>++++++++<-]>+.'

	function runWasm (source, input) {
		const bytes = bfToWasm(source)

		const output = []
		let inputPointer = 0

		const importObject = {
			js: {
				read () {
					const value = input[inputPointer]
					inputPointer++
					return value
				},
				write (value) {
					output.push(value)
				},
			},
		}

		return WebAssembly.instantiate(new Uint8Array(bytes), importObject)
			.then(({ instance }) => {
				instance.exports.run()

				return output
			})
	}

	document.getElementById('run').addEventListener('click', () => {
		outputElement.value = ''

		runWasm(
			codeElement.value,
			inputElement.value.split(/\s+/).map(Number)
		).then((output) => {
			outputElement.value = String.fromCharCode(...output)
		})
	})
})()