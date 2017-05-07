(() => {
	'use strict'

	function leb (value) {
		const bytes = []

		do {
			let byte = value & 0x7f

			value >>= 7

			if (value > 0) {
				byte |= 0x80
			}

			bytes.push(byte)
		} while (value > 0)

		return bytes
	}

	window.bwasm = window.bwasm || {}
	Object.assign(window.bwasm, {
		leb,
	})
})()