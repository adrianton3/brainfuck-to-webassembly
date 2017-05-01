(() => {
	'use strict'

	const { bfToWasm } = bwasm

	const bytes = bfToWasm('+++[>+++<-]>.')

	const importObject = {
		js: {
			read () {
				console.log('read')
				return 0
			},
			write (value) {
				console.log('write', value)
			},
		},
	}

	WebAssembly.instantiate(new Uint8Array(bytes), importObject)
		.then(({ instance }) => {
			instance.exports.run()
			console.log('done')
		})
})()