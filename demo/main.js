(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const codeElement = document.getElementById('code')
	const inputElement = document.getElementById('input')
	const outputElement = document.getElementById('output')

	codeElement.value = '+++[>+++<-]>.'

	document.getElementById('run').addEventListener('click', () => {
		const code = codeElement.value
		const bytes = bfToWasm(code)

		const input = inputElement.value.split(/\s+/)
		let inputPointer = 0

		outputElement.value = ''

		const importObject = {
			js: {
				read () {
					const value = input[inputPointer]
					inputPointer++
					return value
				},
				write (value) {
					outputElement.value += `${value} `
				},
			},
		}

		WebAssembly.instantiate(new Uint8Array(bytes), importObject)
			.then(({ instance }) => {
				instance.exports.run()
			})
	})
})()