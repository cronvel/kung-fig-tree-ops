/*
	Kung Fig Tree Ops

	Copyright (c) 2015 - 2020 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;

/* global describe, it, expect */



var treeOps = require( '..' ) ;



describe( "Operator behaviours" , () => {

	it( "simple stack and reduce on a single object" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;

		expect( treeOps.stack( creature ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ) ;

		expect( treeOps.reduce( creature ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 6 ,
			move: 1
		} ) ;
	} ) ;

	it( "simple stack and reduce on two and three objects" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;

		var amulet = {
			"+defense": 1 ,
			"+hp": 1
		} ;

		var ring = {
			"+defense": 1 ,
			"#+hp": [ 1 , 1 ]
		} ;

		expect( treeOps.stack( creature , amulet ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [ 3 , 1 ] ,
			"+hp": 1
		} ) ;

		expect( treeOps.stack( creature , amulet , ring ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [ 3 , 1 , 1 ] ,
			"#+hp": [ 1 , 1 , 1 ]
		} ) ;

		expect( treeOps.reduce( creature , amulet ) ).to.equal( {
			hp: 9 ,
			attack: 5 ,
			defense: 7 ,
			move: 1
		} ) ;

		expect( treeOps.reduce( creature , amulet , ring ) ).to.equal( {
			hp: 11 ,
			attack: 5 ,
			defense: 8 ,
			move: 1
		} ) ;
	} ) ;

	it( "check stack behaviour bugs, when a 'foreach' and 'non-foreach' key are mixed" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;

		var warrior = {
			hp: 10 ,
			"#+defense": [ 2 ] ,
			evasion: 7
		} ;

		expect( treeOps.stack( creature , warrior ) ).to.equal( {
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			'#hp': [ 8 , 10 ] ,
			'#+defense': [ 3 , 2 ] ,
			evasion: 7
		} ) ;

		expect( treeOps.stack( warrior , creature ) ).to.equal( {
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			'#hp': [ 10 , 8 ] ,
			'#+defense': [ 2 , 3 ] ,
			evasion: 7
		} ) ;
	} ) ;

	it( "mixing + and * for the same base key should preserve operation order (first *, then +)" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1
		} ;

		var shield = {
			"+defense": 3
		} ;

		var enchantedArmor = {
			"*defense": 2 ,
			"+defense": 1 ,
			"+magic": 1
		} ;

		var helmet = {
			"+defense": 1
		} ;

		expect( treeOps.stack( creature , shield , enchantedArmor ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [ 3 , 1 ] ,
			"*defense": 2 ,
			"+magic": 1
		} ) ;

		expect( treeOps.stack( creature , shield , enchantedArmor , helmet ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [ 3 , 1 , 1 ] ,
			"*defense": 2 ,
			"+magic": 1
		} ) ;

		expect( treeOps.reduce( creature , shield , enchantedArmor , helmet ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 11 ,
			move: 1 ,
			"+magic": 1
		} ) ;
	} ) ;

	it( "the combining after operator *>" , () => {

		var tree = {
			subtree: {
				a: 3 ,
				b: 5 ,
				c: 11
			}
		} ;

		var mods = {
			"*>subtree": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12
			}
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			subtree: {
				a: 3 ,
				b: 5 ,
				c: 11
			} ,
			"*>subtree": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12
			}
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			subtree: {
				a: 4 ,
				b: 8 ,
				c: 12
			}
		} ) ;
	} ) ;

	it( "*> and *>> priorities" , () => {

		var tree = {
			subtree: {
				a: 3 ,
				b: 5
			}
		} ;

		var mods1 = {
			"*>>subtree": {
				a: 1
			}
		} ;

		var mods2 = {
			"*>subtree": {
				a: 2
			}
		} ;

		expect( treeOps.reduce( tree , mods1 , mods2 ) ).to.equal( { subtree: { a: 1 , b: 5 } } ) ;

		expect( treeOps.reduce( tree , mods2 , mods1 ) ).to.equal( { subtree: { a: 1 , b: 5 } } ) ;

		tree = {
			subtree: {
				a: 3 ,
				b: 5
			} ,
			"*>>subtree": {
				a: 1
			} ,
			"*>subtree": {
				a: 2
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 1 , b: 5 } } ) ;

		tree = {
			subtree: {
				a: 3 ,
				b: 5
			} ,
			"*>subtree": {
				a: 2
			} ,
			"*>>subtree": {
				a: 1
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 1 , b: 5 } } ) ;
	} ) ;

	it( "<* and <<* priorities" , () => {

		var tree = {
			subtree: {
				b: 5
			}
		} ;

		var mods1 = {
			"<<*subtree": {
				a: 1
			}
		} ;

		var mods2 = {
			"<*subtree": {
				a: 2
			}
		} ;

		expect( treeOps.reduce( tree , mods1 , mods2 ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		expect( treeOps.reduce( tree , mods2 , mods1 ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		tree = {
			subtree: {
				b: 5
			} ,
			"<<*subtree": {
				a: 1
			} ,
			"<*subtree": {
				a: 2
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		tree = {
			subtree: {
				b: 5
			} ,
			"<*subtree": {
				a: 2
			} ,
			"<<*subtree": {
				a: 1
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;
	} ) ;

	it( "the combining before operator <*" , () => {

		var tree = {
			subtree: {
				a: 3 ,
				b: 5 ,
				c: 11
			}
		} ;

		var mods = {
			"<*subtree": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12 ,
				d: 7
			}
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			subtree: {
				a: 3 ,
				b: 5 ,
				c: 11
			} ,
			"<*subtree": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12 ,
				d: 7
			}
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			subtree: {
				a: 4 ,
				b: 8 ,
				c: 11 ,
				d: 7
			}
		} ) ;
	} ) ;

	it( "the combining after operator *> with no baseKey should combine in the root element" , () => {

		var tree = {
			a: 3 ,
			b: 5 ,
			c: 11
		} ;

		var mods = {
			"*>": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12
			}
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			a: 3 ,
			b: 5 ,
			c: 11 ,
			"*>": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12
			}
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			a: 4 ,
			b: 8 ,
			c: 12
		} ) ;

		//console.log( "\n---------\n" ) ;

		tree = {
			a: 3 ,
			b: 5 ,
			c: 11 ,
			"*>": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( {
			a: 4 ,
			b: 8 ,
			c: 12
		} ) ;
	} ) ;

	it( "the combining before operator <* with no baseKey should combine in the root element" , () => {

		var tree = {
			a: 3 ,
			b: 5 ,
			c: 11
		} ;

		var mods = {
			"<*": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12 ,
				d: 7
			}
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			a: 3 ,
			b: 5 ,
			c: 11 ,
			"<*": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12 ,
				d: 7
			}
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			a: 4 ,
			b: 8 ,
			c: 11 ,
			d: 7
		} ) ;

		tree = {
			a: 3 ,
			b: 5 ,
			c: 11 ,
			"<*": {
				"+a": 1 ,
				"+b": 3 ,
				c: 12 ,
				d: 7
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( {
			a: 4 ,
			b: 8 ,
			c: 11 ,
			d: 7
		} ) ;
	} ) ;

	it ( "root and non-root operator priorities" , () => {

		var tree = {
			subtree: {
				a: 3 ,
				b: 5
			}
		} ;

		var mods1 = {
			"*>subtree": {
				a: 1
			}
		} ;

		var mods2 = {
			"*>": {
				subtree: {
					a: 2
				}
			}
		} ;

		expect( treeOps.reduce( tree , mods1 , mods2 ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		expect( treeOps.reduce( tree , mods2 , mods1 ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		tree = {
			subtree: {
				a: 3 ,
				b: 5
			} ,
			"*>subtree": {
				a: 1
			} ,
			"*>": {
				subtree: {
					a: 2
				}
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;

		tree = {
			subtree: {
				a: 3 ,
				b: 5
			} ,
			"*>": {
				subtree: {
					a: 2
				}
			} ,
			"*>subtree": {
				a: 1
			}
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { subtree: { a: 2 , b: 5 } } ) ;
	} ) ;

	it( "the concat after (append) operator +>" , () => {

		var tree = {
			array: [ 3 , 5 , 11 ]
		} ;

		var mods = {
			"+>array": [ 2 , 7 ]
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			array: [ 3 , 5 , 11 ] ,
			"+>array": [ 2 , 7 ]
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			array: [ 3 , 5 , 11 , 2 , 7 ]
		} ) ;
	} ) ;

	it( "the concat before (prepend) operator <+" , () => {

		var tree = {
			array: [ 3 , 5 , 11 ]
		} ;

		var mods = {
			"<+array": [ 2 , 7 ]
		} ;

		//console.log( treeOps.stack( tree , mods ) ) ;
		expect( treeOps.stack( tree , mods ) ).to.equal( {
			array: [ 3 , 5 , 11 ] ,
			"<+array": [ 2 , 7 ]
		} ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( {
			array: [ 2 , 7 , 3 , 5 , 11 ]
		} ) ;
	} ) ;
	it( "arrays should not be combined recursively" , () => {

		var o = { a: [ { b: 2 , c: 3 } , { d: 5 } ] } ;
		var o2 = { a: [ { b: 52 } ] } ;

		expect( treeOps.reduce( {} , o , o2 ) ).to.equal( { a: [ { b: 52 } ] } ) ;
	} ) ;

} ) ;



describe( "Complex, deeper test" , () => {

	it( "simple foreach" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			"#+defense": [ 3 , 4 , 5 ]
		} ;

		expect( treeOps.reduce( creature ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 15 ,
			move: 1
		} ) ;
	} ) ;

	it( "combining foreach on nested objects" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			attacks: {
				kick: {
					toHit: 10 ,
					damage: 15 ,
					elements: {
						impact: true
					}
				}
			} ,
			"#*>": [
				{
					hp: 10 ,
					evasion: 5 ,
					attacks: {
						kick: {
							toHit: 8 ,
							elements: {
								lightning: true ,
								wind: true
							}
						}
					}
				} ,
				{
					hp: 9 ,
					attacks: {
						kick: {
							elements: {
								fire: true ,
								wind: false
							}
						}
					}
				}
			]
		} ;

		expect( treeOps.reduce( creature ) ).to.equal( {
			hp: 9 ,
			attack: 5 ,
			defense: 3 ,
			move: 1 ,
			evasion: 5 ,
			attacks: {
				kick: {
					toHit: 8 ,
					damage: 15 ,
					elements: {
						impact: true ,
						lightning: true ,
						fire: true ,
						wind: false
					}
				}
			}
		} ) ;
	} ) ;
} ) ;



describe( "To regular object" , () => {

	it( "simple tree-ops object" , () => {

		var creature = {
			hp: 8 ,
			attack: 5 ,
			"*attack": 1.2 ,
			defense: 3 ,
			move: 1 ,
			"+defense": 3
		} ;

		expect( treeOps.toObject( creature ) ).to.equal( {
			hp: 8 ,
			attack: 5 ,
			defense: 3 ,
			move: 1
		} ) ;

		expect( treeOps.reduceToObject( creature ) ).to.equal( {
			hp: 8 ,
			attack: 6 ,
			defense: 6 ,
			move: 1
		} ) ;
	} ) ;

	it( "edge cases" , () => {

		var o = {
			"()*.kfg": "*.gz" ,
			"()*/*.jpeg": "*/*.jpg"
		} ;

		expect( treeOps.toObject( o ) ).to.equal( {
			"*.kfg": "*.gz" ,
			"*/*.jpeg": "*/*.jpg"
		} ) ;

		expect( treeOps.reduceToObject( o ) ).to.equal( {
			"*.kfg": "*.gz" ,
			"*/*.jpeg": "*/*.jpg"
		} ) ;
	} ) ;
} ) ;



describe( "Operator extensions" , () => {

	it( "simple operator extension" , () => {

		treeOps.extendTreeOperators( {
			pow: {
				priority: 100 ,
				reduce: function( existing , operands ) {
					var i , iMax = operands.length , operand = 1 ;

					for ( i = 0 ; i < iMax ; i ++ ) {
						if ( ! isNaN( operands[ i ] ) ) {
							operand *= + operands[ i ] ;
						}
					}

					if ( ! isNaN( existing ) ) {
						existing = Math.pow( + existing , operand ) ;
						operands.length = 0 ;
						return existing ;
					}

					operands[ 0 ] = operand ;
					operands.length = 1 ;
					return existing ;

				}
			}
		} ) ;

		var tree = {
			a: 3 ,
			b: 5 ,
			"+b": 2 ,
			"(pow)a": 2
		} ;

		expect( treeOps.reduce( tree ) ).to.equal( { a: 9 , b: 7 } ) ;

		tree = {
			a: 3 ,
			b: 5 ,
			"(pow)a": 2
		} ;

		var mods = {
			"(pow)a": 3
		} ;

		expect( treeOps.stack( tree , mods ) ).to.equal( { a: 3 , b: 5 , "(#pow)a": [ 2 , 3 ] } ) ;

		expect( treeOps.reduce( tree , mods ) ).to.equal( { a: 729 , b: 5 } ) ;
	} ) ;
} ) ;

