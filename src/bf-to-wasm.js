(() => {
	'use strict'

	const { leb } = bwasm

	function getSize (bodySize) {
		return bodySize < 124 ? {
				section: bodySize + 6,
				run: bodySize + 4,
			} : {
				section: bodySize + 7,
				run: bodySize + 4,
			}
	}

	const header = ({ bodySize }) => {
		const size = getSize(bodySize)

		return [
			0x00, 0x61, 0x73, 0x6d,               // WASM_BINARY_MAGIC
			0x01, 0x00, 0x00, 0x00,               // WASM_BINARY_VERSION
			// section "Type" (1)
			0x01,                                 // section code
			0x0c,                                 // section size (guess)
			0x03,                                 // num types
			// type 0
			0x60,                                 // func
			0x00,                                 // num params
			0x01,                                 // num results
			0x7f,                                 // i32
			// type 1
			0x60,                                 // func
			0x01,                                 // num params
			0x7f,                                 // i32
			0x00,                                 // num results
			// type 2
			0x60,                                 // func
			0x00,                                 // num params
			0x00,                                 // num results
			// section "Import" (2)
			0x02,                                 // section code
			0x16,                                 // section size (guess)
			0x02,                                 // num imports
			// import header 0
			0x02,                                 // string length
			0x6a, 0x73,                           // "js" import module name
			0x04,                                 // string length
			0x72, 0x65, 0x61, 0x64,               // "read" import field name
			0x00,                                 // import kind
			0x00,                                 // import signature index
			// import header 1
			0x02,                                 // string length
			0x6a, 0x73,                           // "js" import module name
			0x05,                                 // string length
			0x77, 0x72, 0x69, 0x74, 0x65,         // "write" import field name
			0x00,                                 // import kind
			0x01,                                 // import signature index
			// section "Function" (3)
			0x03,                                 // section code
			0x02,                                 // section size (guess)
			0x01,                                 // num functions
			0x02,                                 // function 0 signature index
			// section "Memory" (5)
			0x05,                                 // section code
			0x03,                                 // section size (guess)
			0x01,                                 // num memories
			// memory 0
			0x00,                                 // limits: flags
			0x0a,                                 // limits: initial
			// section "Export" (7)
			0x07,                                 // section code
			0x0d,                                 // section size (guess)
			0x02,                                 // num exports
			0x03,                                 // string length
			0x6d, 0x65, 0x6d,                     // "mem" export name
			0x02,                                 // export kind
			0x00,                                 // export memory index
			0x03,                                 // string length
			0x72, 0x75, 0x6e,                     // "run" export name
			0x00,                                 // export kind
			0x02,                                 // export func index
			// section "Code" (10)
			0x0a,                                 // section code
			...leb(size.section),                 // section size (guess)
			0x01,                                 // num functions
			// function body 0
			...leb(size.run),                     // func body size (guess)
			0x01,                                 // local decl count
			0x01,                                 // local type count
			0x7f,                                 // i32
		]
	}

	const footer = () => [
		0x0b, // end
	]

	const map = {
		'+': [
			0x20, // get_local
			0x00, // local index
			0x20, // get_local
			0x00, // local index
			0x28, // i32.load
			0x02, // alignment
			0x00, // load offset
			0x41, // i32.const
			0x01, // i32 literal
			0x6a, // i32.add
			0x36, // i32.store
			0x02, // alignment
			0x00, // store offset
		],

		'-': [
			0x20, // get_local
			0x00, // local index
			0x20, // get_local
			0x00, // local index
			0x28, // i32.load
			0x02, // alignment
			0x00, // load offset
			0x41, // i32.const
			0x01, // i32 literal
			0x6b, // i32.sub
			0x36, // i32.store
			0x02, // alignment
			0x00, // store offset
		],

		'>': [
			0x20, // get_local
			0x00, // local index
			0x41, // i32.const
			0x04, // i32 literal
			0x6a, // i32.add
			0x21, // set_local
			0x00, // local index
		],

		'<': [
			0x20, // get_local
			0x00, // local index
			0x41, // i32.const
			0x04, // i32 literal
			0x6b, // i32.sub
			0x21, // set_local
			0x00, // local index
		],

		'.': [
			0x20, // get_local
			0x00, // local index
			0x28, // i32.load
			0x02, // alignment
			0x00, // load offset
			0x10, // call
			0x01, // function index
		],

		',': [
			0x20, // get_local
			0x00, // local index
			0x10, // call
			0x00, // function index
			0x36, // i32.store
			0x02, // alignment
			0x00, // store offset
		],

		'[': [
			0x02, // block
			0x40, // void
			0x03, // loop
			0x40, // void
			0x20, // get_local
			0x00, // local index
			0x28, // i32.load
			0x02, // alignment
			0x00, // load offset
			0x45, // i32.eqz
			0x0d, // br_if
			0x01, // break depth
		],

		']': [
			0x0c, // br
			0x00, // break depth
			0x0b, // end
			0x0b, // end
		],
	}

	function bfToWasm (source) {
		const bodyBytes = []

		source.split('').forEach((char) => {
			if (map[char]) {
				bodyBytes.push(...map[char])
			}
		})

		const headerBytes = header({
			bodySize: bodyBytes.length
		})

		const footerBytes = footer()

		return [...headerBytes, ...bodyBytes, ...footerBytes]
	}

	window.bwasm = window.bwasm || {}
	Object.assign(window.bwasm, {
		bfToWasm,
	})
})()