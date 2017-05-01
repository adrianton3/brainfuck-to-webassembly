'use strict'

describe('leb', () => {
	const { leb } = bwasm

	const specs = [
		[0, [0]],
		[1, [1]],
		[2, [2]],
		[127, [0b01111111]],
		[128, [0b10000000, 1]],
		[129, [0b10000001, 1]],
		[256, [0b10000000, 2]],
		[624485, [0xe5, 0x8e, 0x26]],
	]

	specs.forEach(([value, expected]) => {
		it(`${value}`, () => {
			const actual = leb(value)
			expect(actual).toEqual(expected)
		})
	})
})