'use strict'

describe('bfToWasm', () => {
	const { bfToWasm } = bwasm

	const specs = [{
		source: '.',
		write: 0,
	}, {
		source: '+.',
		write: 1,
	}, {
		source: '+++++.',
		write: 5,
	}, {
		source: '[].',
		write: 0,
	}, {
		source: '+++[>+++<-]>.',
		write: 9,
	}, {
		source: '+++[>+++[>+++<-]<-]>>.',
		write: 27,
	}]

	specs.forEach((spec) => {
		it(spec.source, (done) => {
			const bytes = bfToWasm(spec.source)

			const importObject = {
				js: {
					read: jasmine.createSpy('read'),
					write: jasmine.createSpy('write'),
				},
			}

			WebAssembly.instantiate(new Uint8Array(bytes), importObject)
				.then(({ instance }) => {
					instance.exports.run()

					if (spec.read != null) {
						expect(importObject.js.read).toHaveBeenCalledWith(spec.read)
					}

					if (spec.write != null) {
						expect(importObject.js.write).toHaveBeenCalledWith(spec.write)
					}

					done()
				})
		})
	})
})