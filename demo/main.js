(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const codeElement = document.getElementById('code')
	const inputElement = document.getElementById('input')
	const outputElement = document.getElementById('output')
	const statElement = document.getElementById('stat')

	const options = {
		inputFormat: 'num',
		outputFormat: 'char',
	}

	const stat = {
		wasm: {
			compile: null,
			run: null,
		},
		js: {
			compile: null,
			run: null,
		}
	}

	function runWasm (source, input) {
		const startWasmCompile = performance.now()
		const bytes = bfToWasm(source)
		stat.wasm.compile = performance.now() - startWasmCompile

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
				const startWasmRun = performance.now()
				instance.exports.run()
				stat.wasm.run = performance.now() - startWasmRun

				return output
			})
	}

	function runJs (source, input) {
		const startJsCompile = performance.now()
		const run = bjs.bfToJs(source)
		stat.js.compile = performance.now() - startJsCompile

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

		const startJsRun = performance.now()
		run({ read, write })
		stat.js.run = performance.now() - startJsRun

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

					const stringifyTime = (time) =>
						time != null ? `${time.toFixed(3)} ms` : '-'

					statElement.value = [
						`Wasm compile: ${stringifyTime(stat.wasm.compile)}`,
						`Wasm run: ${stringifyTime(stat.wasm.run)}`,
						`JS compile: ${stringifyTime(stat.js.compile)}`,
						`JS run: ${stringifyTime(stat.js.run)}`,
					].join('\n')
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

	codeElement.value = '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.'

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