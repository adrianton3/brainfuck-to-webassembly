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

	function runJs (source, input) {
		const run = bjs.bfToJs(source)

		const output = []
		let inputPointer = 0

		function read () {
			const value = input[inputPointer]
			inputPointer++
			return value
		}

		function write (value) {
			output.push(value)
		}

		run({ read, write })

		return Promise.resolve(output)
	}

	function makeRunHandler (run) {
		return () => {
			outputElement.value = ''

			run(
				codeElement.value,
				inputElement.value.split(/\s+/).map(Number)
			).then((output) => {
				outputElement.value = String.fromCharCode(...output)
			})
		}
	}

	document.getElementById('run-js').addEventListener(
		'click',
		makeRunHandler(runJs)
	)

	document.getElementById('run-wasm').addEventListener(
		'click',
		makeRunHandler(runWasm)
	)
})()