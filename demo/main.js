(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const codeElement = document.getElementById('code')
	const inputElement = document.getElementById('input')
	const outputElement = document.getElementById('output')

	codeElement.value = '++++++++[>++++++++<-]>+.'

	function runWasm (source, input) {
		console.time('bf->wasm compile')
		const bytes = bfToWasm(source)
		console.timeEnd('bf->wasm compile')

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
				console.time('wasm run')
				instance.exports.run()
				console.timeEnd('wasm run')

				return output
			})
	}

	function runJs (source, input) {
		console.time('bf->js compile')
		const run = bjs.bfToJs(source)
		console.timeEnd('bf->js compile')

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

		console.time('js run')
		run({ read, write })
		console.timeEnd('js run')

		return Promise.resolve(output)
	}

	function makeRunHandler (run) {
		return () => {
			outputElement.value = ''

			setTimeout(() => {
				run(
					codeElement.value,
					inputElement.value.split(/\s+/).map(Number)
				).then((output) => {
					outputElement.value = String.fromCharCode(...output)
				})
			}, 4)
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