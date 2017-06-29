(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const codeElement = document.getElementById('code')
	const inputElement = document.getElementById('input')
	const outputElement = document.getElementById('output')

	const options = {
		inputFormat: 'num',
		outputFormat: 'num',
	}

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
				const inputText = inputElement.value
				const input = options.inputFormat === 'char'
					? inputText.split('').map((char) => char.charCodeAt(0))
					: inputText.split(/\s+/)

				run(
					codeElement.value,
					input
				).then((output) => {
					outputElement.value = options.outputFormat === 'char'
						? String.fromCharCode(...output)
						: output.join(' ')
				})
			}, 4)
		}
	}

	function makeFormatHandler (
		format,
		propName,
		thisButton,
		thatButton,
		textarea
	) {
		return () => {
			if (options[propName] === format) { return }

			thisButton.classList.add('selected')
			thatButton.classList.remove('selected')

			const text = textarea.value

			options[propName] = format

			if (text.length === 0) { return }

			if (format === 'num') {
				textarea.value = text.split('')
					.map((char) => char.charCodeAt(0))
					.join(' ')
			} else {
				textarea.value = String.fromCharCode(...text.split(/\s+/))
			}
		}
	}

	function setFormatPair (charElement, numElement, textarea, propName) {
		charElement.addEventListener(
			'click',
			makeFormatHandler('char', propName, charElement, numElement, textarea)
		)

		numElement.addEventListener(
			'click',
			makeFormatHandler('num', propName, numElement, charElement, textarea)
		)
	}

	codeElement.value = '++++++++[>++++++++<-]>+.'

	document.getElementById('run-js').addEventListener(
		'click',
		makeRunHandler(runJs)
	)

	document.getElementById('run-wasm').addEventListener(
		'click',
		makeRunHandler(runWasm)
	)

	setFormatPair(
		document.getElementById('input-char'),
		document.getElementById('input-num'),
		inputElement,
		'inputFormat'
	)

	setFormatPair(
		document.getElementById('output-char'),
		document.getElementById('output-num'),
		outputElement,
		'outputFormat'
	)
})()