import bowser from 'bowser';
import gifti from 'gifti-reader-js';
import nifti from './nifti-reader.js';
import pako from './pako-inflate.js';

var glMatrixArrayType;
var quat4;

/*
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );
/*jslint white: false, onevar: false, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true, sub: true, nomen: false */

/**
 * This file contains code that may be under the following license:
 *
 * SGI FREE SOFTWARE LICENSE B (Version 2.0, Sept. 18, 2008)
 * Copyright (C) 1991-2000 Silicon Graphics, Inc. All Rights Reserved.
 *
 * See http://oss.sgi.com/projects/FreeB/ for more information.
 *
 * All code in this file which is NOT under the SGI FREE SOFTWARE LICENSE B
 * is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/** @type {Object} */
var GLU = {};

(function($) {
    /**
     * Unproject a screen point.
     *
     * @param {number} winX the window point for the x value.
     * @param {number} winY the window point for the y value.
     * @param {number} winZ the window point for the z value.
     * @param {Array.<number>} model the model-view matrix.
     * @param {Array.<number>} proj the projection matrix.
     * @param {Array.<number>} view the viewport coordinate array.
     * @param {Array.<number>} objPos the model point result.
     * @return {boolean} true if the unproject operation was successful, false otherwise.
     */
    $.unProject = function(winX, winY, winZ, model, proj, view, objPos) {

        /** @type {Array.<number>} */
        var inp = [
            winX,
            winY,
            winZ,
            1.0
        ];

        /** @type {Array.<number>} */
        var finalMatrix = [];

        $.multMatrices(model, proj, finalMatrix);
        if (!$.invertMatrix(finalMatrix, finalMatrix)) {
            return (false);
        }

        /* Map x and y from window coordinates */
        inp[0] = (inp[0] - view[0]) / view[2];
        inp[1] = (inp[1] - view[1]) / view[3];

        /* Map to range -1 to 1 */
        inp[0] = inp[0] * 2 - 1;
        inp[1] = inp[1] * 2 - 1;
        inp[2] = inp[2] * 2 - 1;

        /** @type {Array.<number>} */
        var out = [];

        $.multMatrixVec(finalMatrix, inp, out);

        if (out[3] === 0.0) {
            return false;
        }

        out[0] /= out[3];
        out[1] /= out[3];
        out[2] /= out[3];

        objPos[0] = out[0];
        objPos[1] = out[1];
        objPos[2] = out[2];

        return true;
    };

    /**
     * Multiply the matrix by the specified vector.
     *
     * @param {Array.<number>} matrix the matrix.
     * @param {Array.<number>} inp the vector.
     * @param {Array.<number>} out the output.
     */
    $.multMatrixVec = function(matrix, inp, out) {
        for (var i = 0; i < 4; i = i + 1) {
            out[i] =
                inp[0] * matrix[0 * 4 + i] +
                inp[1] * matrix[1 * 4 + i] +
                inp[2] * matrix[2 * 4 + i] +
                inp[3] * matrix[3 * 4 + i];
        }
    };

    /**
     * Multiply the specified matrices.
     *
     * @param {Array.<number>} a the first matrix.
     * @param {Array.<number>} b the second matrix.
     * @param {Array.<number>} r the result.
     */
    $.multMatrices = function(a, b, r) {
        for (var i = 0; i < 4; i = i + 1) {
            for (var j = 0; j < 4; j = j + 1) {
                r[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
    };

    /**
     * Invert a matrix.
     *
     * @param {Array.<number>} m the matrix.
     * @param {Array.<number>} invOut the inverted output.
     * @return {boolean} true if successful, false otherwise.
     */
    $.invertMatrix = function(m, invOut) {
        /** @type {Array.<number>} */
        var inv = [];

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
            m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];
        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
            m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];
        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
            m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];
        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
            m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];
        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
            m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];
        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
            m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];
        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
            m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];
        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
            m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];
        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
            m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];
        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
            m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];
        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
            m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];
        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
            m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];
        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
            m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];
        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
            m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];
        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
            m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];
        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
            m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

        /** @type {number} */
        var det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det === 0) {
            return false;
        }

        det = 1.0 / det;

        for (var i = 0; i < 16; i = i + 1) {
            invOut[i] = inv[i] * det;
        }

        return true;
    };

}(GLU));

/* EOF */
/*
  M. Martinez: All I needed was inv(), so I removed everything unrelated to this function.
 */

/*
 Numeric Javascript
 Copyright (C) 2011 by Sébastien Loisel

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

"use strict";

var numeric = {};

numeric.inv = function inv(x) {
    var s = numeric.dim(x), abs = Math.abs, m = s[0], n = s[1];
    var A = x.clone(), Ai, Aj;
    var I = numeric.identity(m), Ii, Ij;
    var i,j,k,x;
    for(j=0;j<n;++j) {
        var i0 = -1;
        var v0 = -1;
        for(i=j;i!==m;++i) { k = abs(A[i][j]); if(k>v0) { i0 = i; v0 = k; } }
        Aj = A[i0]; A[i0] = A[j]; A[j] = Aj;
        Ij = I[i0]; I[i0] = I[j]; I[j] = Ij;
        x = Aj[j];
        for(k=j;k!==n;++k)    Aj[k] /= x;
        for(k=n-1;k!==-1;--k) Ij[k] /= x;
        for(i=m-1;i!==-1;--i) {
            if(i!==j) {
                Ai = A[i];
                Ii = I[i];
                x = Ai[j];
                for(k=j+1;k!==n;++k)  Ai[k] -= Aj[k]*x;
                for(k=n-1;k>0;--k) { Ii[k] -= Ij[k]*x; --k; Ii[k] -= Ij[k]*x; }
                if(k===0) Ii[0] -= Ij[0]*x;
            }
        }
    }
    return I;
}


numeric.dim = function dim(x) {
    var y,z;
    if(typeof x === "object") {
        y = x[0];
        if(typeof y === "object") {
            z = y[0];
            if(typeof z === "object") {
                return numeric._dim(x);
            }
            return [x.length,y.length];
        }
        return [x.length];
    }
    return [];
}


numeric._dim = function _dim(x) {
    var ret = [];
    while(typeof x === "object") { ret.push(x.length); x = x[0]; }
    return ret;
}


numeric.identity = function identity(n) { return numeric.diag(numeric.rep([n],1)); }


numeric.rep = function rep(s,v,k) {
    if(typeof k === "undefined") { k=0; }
    var n = s[k], ret = Array(n), i;
    if(k === s.length-1) {
        for(i=n-2;i>=0;i-=2) { ret[i+1] = v; ret[i] = v; }
        if(i===-1) { ret[0] = v; }
        return ret;
    }
    for(i=n-1;i>=0;i--) { ret[i] = numeric.rep(s,v,k+1); }
    return ret;
}

numeric.diag = function diag(d) {
    var i,i1,j,n = d.length, A = Array(n), Ai;
    for(i=n-1;i>=0;i--) {
        Ai = Array(n);
        i1 = i+2;
        for(j=n-1;j>=i1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j>i) { Ai[j] = 0; }
        Ai[i] = d[i];
        for(j=i-1;j>=1;j-=2) {
            Ai[j] = 0;
            Ai[j-1] = 0;
        }
        if(j===0) { Ai[0] = 0; }
        A[i] = Ai;
    }
    return A;
}
// Minimum supported browsers
var PAPAYA_BROWSER_MIN_FIREFOX = 7,
    PAPAYA_BROWSER_MIN_CHROME = 7,
    PAPAYA_BROWSER_MIN_SAFARI = 6,
    PAPAYA_BROWSER_MIN_IE = 10,
    PAPAYA_BROWSER_MIN_OPERA = 12;

var PAPAYA_SURFACE_BROWSER_MIN_FIREFOX = 7,
    PAPAYA_SURFACE_BROWSER_MIN_CHROME = 8,
    PAPAYA_SURFACE_BROWSER_MIN_SAFARI = 6,
    PAPAYA_SURFACE_BROWSER_MIN_IE = 11,
    PAPAYA_SURFACE_BROWSER_MIN_OPERA = 12;

// Base CSS classes
var PAPAYA_CONTAINER_CLASS_NAME = "papaya",
    PAPAYA_CONTAINER_COLLAPSABLE = "papaya-collapsable",
    PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT = "papaya-collapsable-exempt",
    PAPAYA_CONTAINER_FULLSCREEN = "papaya-fullscreen";


// Viewer CSS classes
var PAPAYA_VIEWER_CSS = "papaya-viewer";


// Toolbar CSS classes
var PAPAYA_TOOLBAR_CSS = "papaya-toolbar",
    PAPAYA_TITLEBAR_CSS = "papaya-titlebar",
    PAPAYA_SLIDER_CSS = "papaya-slider-slice",
    PAPAYA_KIOSK_CONTROLS_CSS = "papaya-kiosk-controls";


// Display CSS classes
var PAPAYA_DISPLAY_CSS = "papaya-display";


// Dialog CSS classes
var PAPAYA_DIALOG_CSS = "papaya-dialog",
    PAPAYA_DIALOG_CONTENT_CSS = "papaya-dialog-content",
    PAPAYA_DIALOG_CONTENT_NOWRAP_CSS = "papaya-dialog-content-nowrap",
    PAPAYA_DIALOG_CONTENT_LABEL_CSS = "papaya-dialog-content-label",
    PAPAYA_DIALOG_CONTENT_CONTROL_CSS = "papaya-dialog-content-control",
    PAPAYA_DIALOG_TITLE_CSS = "papaya-dialog-title",
    PAPAYA_DIALOG_BUTTON_CSS = "papaya-dialog-button",
    PAPAYA_DIALOG_BACKGROUND = "papaya-dialog-background",
    PAPAYA_DIALOG_STOPSCROLL = "papaya-dialog-stopscroll",
    PAPAYA_DIALOG_CONTENT_HELP = "papaya-dialog-content-help";


// Menu CSS classes
var PAPAYA_MENU_CSS = "papaya-menu",
    PAPAYA_MENU_LABEL_CSS = "papaya-menu-label",
    PAPAYA_MENU_TITLEBAR_CSS = "papaya-menu-titlebar",
    PAPAYA_MENU_ICON_CSS = "papaya-menu-icon",
    PAPAYA_MENU_HOVERING_CSS = "papaya-menu-hovering",
    PAPAYA_MENU_SPACER_CSS = "papaya-menu-spacer",
    PAPAYA_MENU_UNSELECTABLE = "papaya-menu-unselectable",
    PAPAYA_MENU_FILECHOOSER = "papaya-menu-filechooser",
    PAPAYA_MENU_BUTTON_CSS = "papaya-menu-button",
    PAPAYA_MENU_BUTTON_HOVERING_CSS = "papaya-menu-button-hovering",
    PAPAYA_MENU_COLORTABLE_CSS = "papaya-menu-colortable",
    PAPAYA_MENU_INPUT_FIELD = "papaya-menu-input",
    PAPAYA_MENU_SLIDER = "papaya-menu-slider";


// Control CSS classes
var PAPAYA_CONTROL_INCREMENT_BUTTON_CSS = "papaya-control-increment",
    PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS = "papaya-control-goto-center",
    PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS = "papaya-control-goto-origin",
    PAPAYA_CONTROL_SWAP_BUTTON_CSS = "papaya-control-swap",
    PAPAYA_CONTROL_DIRECTION_SLIDER = "papaya-direction-slider",
    PAPAYA_CONTROL_MAIN_SLIDER = "papaya-main-slider",
    PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS = "papaya-main-increment",
    PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS = "papaya-main-decrement",
    PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS = "papaya-main-swap",
    PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS = "papaya-main-goto-center",
    PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS = "papaya-main-goto-origin",
    PAPAYA_CONTROL_BAR_LABELS_CSS = "papaya-controlbar-label";



// Utils CSS classes
var PAPAYA_UTILS_CHECKFORJS_CSS = "checkForJS",
    PAPAYA_UTILS_UNSUPPORTED_CSS = "papaya-utils-unsupported",
    PAPAYA_UTILS_UNSUPPORTED_MESSAGE_CSS = "papaya-utils-unsupported-message";


// Deprecated IDs
var PAPAYA_DEFAULT_VIEWER_ID  = "papayaViewer",
    PAPAYA_DEFAULT_DISPLAY_ID = "papayaDisplay",
    PAPAYA_DEFAULT_TOOLBAR_ID = "papayaToolbar",
    PAPAYA_DEFAULT_CONTAINER_ID = "papayaContainer",
    PAPAYA_DEFAULT_SLIDER_ID = "papayaSliceSlider";


// Misc constants
var PAPAYA_SPACING = 3,
    PAPAYA_PADDING = 0,
    PAPAYA_CONTAINER_PADDING = 20,
    PAPAYA_CONTAINER_PADDING_TOP = PAPAYA_CONTAINER_PADDING,
    PAPAYA_MANGO_INSTALLED = "mangoinstalled",
    PAPAYA_CUSTOM_PROTOCOL = "mango";

// GZIP constants
var GUNZIP_MAGIC_COOKIE1 = 31,
    GUNZIP_MAGIC_COOKIE2 = 139;
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.ArrayUtils = papaya.utilities.ArrayUtils || {};


/*** Static Methods ***/

// http://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript
papaya.utilities.ArrayUtils.createArray = function (length) {
    var arr = new Array(length || 0),
        ctr;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        for (ctr = 0; ctr < length; ctr += 1) {
            arr[ctr] = papaya.utilities.ArrayUtils.createArray.apply(this, args);
        }
    }

    return arr;
};


papaya.utilities.ArrayUtils.contains = function (a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};


/*** Array (Prototype Methods) ***/

// http://stackoverflow.com/questions/2294703/multidimensional-array-cloning-using-javascript
Array.prototype.clone = function () {
    var arr, i;

    arr = this.slice(0);
    for (i = 0; i < this.length; i += 1) {
        if (this[i].clone) {
            //recursion
            arr[i] = this[i].clone();
        }
    }

    return arr;
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.MathUtils = papaya.utilities.MathUtils || {};


/*** Static Pseudo-constants ***/

papaya.utilities.MathUtils.EPSILON = 0.00000001;



/*** Static Methods ***/

papaya.utilities.MathUtils.signum = function (val) {
    return val ? val < 0 ? -1 : 1 : 0;
};



papaya.utilities.MathUtils.lineDistance = function (point1x, point1y, point2x, point2y) {
    var xs, ys;

    xs = point2x - point1x;
    xs = xs * xs;

    ys = point2y - point1y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
};



papaya.utilities.MathUtils.lineDistance3d = function (point1x, point1y, point1z, point2x, point2y, point2z) {
    var xs, ys, zs;

    xs = point2x - point1x;
    xs = xs * xs;

    ys = point2y - point1y;
    ys = ys * ys;

    zs = point2z - point1z;
    zs = zs * zs;

    return Math.sqrt(xs + ys + zs);
};



papaya.utilities.MathUtils.essentiallyEqual = function (a, b) {
    return (a === b) || (Math.abs(a - b) <= ((Math.abs(a) > Math.abs(b) ? Math.abs(b) : Math.abs(a)) *
        papaya.utilities.MathUtils.EPSILON));
};



papaya.utilities.MathUtils.getPowerOfTwo = function (value, pow) {
    var pow = pow || 1;

    while (pow < value) {
        pow *= 2;
    }

    return pow;
};



function papayaRoundFast(val) {
    /*jslint bitwise: true */
    return (0.5 + val) | 0;
}



function papayaFloorFast(val) {
    /*jslint bitwise: true */
    return val | 0;
}

/*jslint browser: true, node: true */
/*global Ext */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.ObjectUtils = papaya.utilities.ObjectUtils || {};


/*** Static Methods ***/

papaya.utilities.ObjectUtils.bind = function (scope, fn, args, appendArgs) {
    if (arguments.length === 2) {
        return function () {
            return fn.apply(scope, arguments);
        };
    }

    var method = fn,
        slice = Array.prototype.slice;

    return function () {
        var callArgs = args || arguments;

        if (appendArgs === true) {
            callArgs = slice.call(arguments, 0);
            callArgs = callArgs.concat(args);
        } else if (typeof appendArgs === 'number') {
            callArgs = slice.call(arguments, 0); // copy arguments first
            Ext.Array.insert(callArgs, appendArgs, args);
        }

        return method.apply(scope || window, callArgs);
    };
};



papaya.utilities.ObjectUtils.isString = function (obj) {
    return (typeof obj === "string" || obj instanceof String);
};



// adapted from: http://stackoverflow.com/questions/724857/how-to-find-javascript-variable-by-its-name
papaya.utilities.ObjectUtils.dereference = function (name) {
    return papaya.utilities.ObjectUtils.dereferenceIn(window, name);
};



papaya.utilities.ObjectUtils.dereferenceIn = function (parent, name) {
    var obj, M;

    if (!papaya.utilities.ObjectUtils.isString(name)) {
        return null;
    }

    M = name.replace(/(^[' "]+|[" ']+$)/g, '').match(/(^[\w\$]+(\.[\w\$]+)*)/);

    if (M) {
        M = M[1].split('.');
        obj = parent[M.shift()];
        while (obj && M.length) {
            obj = obj[M.shift()];
        }
    }

    return obj || null;
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_BROWSER_MIN_FIREFOX, PAPAYA_BROWSER_MIN_CHROME, PAPAYA_BROWSER_MIN_IE, PAPAYA_BROWSER_MIN_SAFARI,
PAPAYA_BROWSER_MIN_OPERA, bowser, File, PAPAYA_MANGO_INSTALLED, confirm */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.PlatformUtils = papaya.utilities.PlatformUtils || {};

var console = console || {};
console.log = console.log || function () {};
console.warn = console.warn || function () {};
console.error = console.error || function () {};
console.info = console.info || function () {};


/*** Static Fields ***/

papaya.utilities.PlatformUtils.os = null;
papaya.utilities.PlatformUtils.browser = bowser.name;
papaya.utilities.PlatformUtils.browserVersion = bowser.version;
papaya.utilities.PlatformUtils.ios = bowser.ios;
papaya.utilities.PlatformUtils.mobile = bowser.mobile;
papaya.utilities.PlatformUtils.lastScrollEventTimestamp = 0;
papaya.utilities.PlatformUtils.smallScreen = window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches;

/*** Static Methods ***/

papaya.utilities.PlatformUtils.detectOs = function () {
    if (navigator.appVersion.indexOf("Win") !== -1) {
        return "Windows";
    } else if (navigator.appVersion.indexOf("Mac") !== -1) {
        return "MacOS";
    } else if ((navigator.appVersion.indexOf("X11") !== -1) || (navigator.appVersion.indexOf("Linux") !== -1)) {
        return "Linux";
    } else {
        return "Unknown";
    }
};
papaya.utilities.PlatformUtils.os = papaya.utilities.PlatformUtils.detectOs();



papaya.utilities.PlatformUtils.checkForBrowserCompatibility = function () {
    if (papaya.utilities.PlatformUtils.browser === "Firefox") {
        if (papaya.utilities.PlatformUtils.browserVersion < PAPAYA_BROWSER_MIN_FIREFOX) {
            return ("Papaya requires Firefox version " + PAPAYA_BROWSER_MIN_FIREFOX + " or higher.");
        }
    } else if (papaya.utilities.PlatformUtils.browser === "Chrome") {
        if (papaya.utilities.PlatformUtils.browserVersion < PAPAYA_BROWSER_MIN_CHROME) {
            return ("Papaya requires Chrome version " + PAPAYA_BROWSER_MIN_CHROME + " or higher.");
        }
    } else if (papaya.utilities.PlatformUtils.browser === "Internet Explorer") {
        if (papaya.utilities.PlatformUtils.browserVersion < PAPAYA_BROWSER_MIN_IE) {
            return ("Papaya requires Internet Explorer version " + PAPAYA_BROWSER_MIN_IE + " or higher.");
        }
    } else if (papaya.utilities.PlatformUtils.browser === "Safari") {
        if (papaya.utilities.PlatformUtils.browserVersion < PAPAYA_BROWSER_MIN_SAFARI) {
            return ("Papaya requires Safari version " + PAPAYA_BROWSER_MIN_SAFARI + " or higher.");
        }
    } else if (papaya.utilities.PlatformUtils.browser === "Opera") {
        if (papaya.utilities.PlatformUtils.browserVersion < PAPAYA_BROWSER_MIN_OPERA) {
            return ("Papaya requires Opera version " + PAPAYA_BROWSER_MIN_OPERA + " or higher.");
        }
    }

    return null;
};



papaya.utilities.PlatformUtils.isWebGLSupported = function () {
    var canvas;
    var ctx;
    var ext;

    try {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        ext = ctx.getExtension('OES_element_index_uint');
        if (!ext) {
            return false;
        }
    } catch (e) {
        console.log("There was a problem detecting WebGL! " + e);
        return false;
    }

    canvas = null;
    ctx = null;
    ext = null;

    return true;
};



papaya.utilities.PlatformUtils.getMousePositionX = function (ev) {
    var touch;

    if (ev.originalEvent) {
        ev = ev.originalEvent;
    }

    if (ev.targetTouches) {
        if (ev.targetTouches.length === 1) {
            touch = ev.targetTouches[0];
            if (touch) {
                return touch.pageX;
            }
        }
    } else if (ev.changedTouches) {
        if (ev.changedTouches.length === 1) {
            touch = ev.changedTouches[0];
            if (touch) {
                return touch.pageX;
            }
        }
    }

    return ev.pageX;
};



papaya.utilities.PlatformUtils.getMousePositionY = function (ev) {
    var touch;

    if (ev.targetTouches) {
        if (ev.targetTouches.length === 1) {
            touch = ev.targetTouches[0];
            if (touch) {
                return touch.pageY;
            }
        }
    } else if (ev.changedTouches) {
        if (ev.changedTouches.length === 1) {
            touch = ev.changedTouches[0];
            if (touch) {
                return touch.pageY;
            }
        }
    }

    return ev.pageY;
};



// a somewhat more consistent scroll across platforms
papaya.utilities.PlatformUtils.getScrollSign = function (ev, slow) {
    var wait, sign, rawValue, value;

    if (slow) {
        wait = 75;
    } else if (papaya.utilities.PlatformUtils.browser === "Firefox") {
        wait = 10;
    } else if (papaya.utilities.PlatformUtils.browser === "Chrome") {
        wait = 50;
    } else if (papaya.utilities.PlatformUtils.browser === "Internet Explorer") {
        wait = 0;
    } else if (papaya.utilities.PlatformUtils.browser === "Safari") {
        wait = 50;
    } else {
        wait = 10;
    }

    var now = Date.now();

    if ((now - papaya.utilities.PlatformUtils.lastScrollEventTimestamp) > wait) {
        papaya.utilities.PlatformUtils.lastScrollEventTimestamp = now;
        rawValue = papaya.utilities.PlatformUtils.normalizeWheel(ev).spinY;
        sign = (-1 * papaya.utilities.PlatformUtils.normalizeWheel(ev).spinY) > 0 ? 1 : -1;
        value = Math.ceil(Math.abs(rawValue / 10.0)) * sign;
        return value;
    }

    return 0;
};



// Cross-browser slice method.
papaya.utilities.PlatformUtils.makeSlice = function (file, start, length) {
    var fileType = (typeof File);

    if (fileType === 'undefined') {
        return function () {};
    }

    if (File.prototype.slice) {
        return file.slice(start, start + length);
    }

    if (File.prototype.mozSlice) {
        return file.mozSlice(start, length);
    }

    if (File.prototype.webkitSlice) {
        return file.webkitSlice(start, length);
    }

    return null;
};



papaya.utilities.PlatformUtils.isPlatformLittleEndian = function () {
    var buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    return new Int16Array(buffer)[0] === 256;
};



papaya.utilities.PlatformUtils.isInputRangeSupported = function () {
    var test = document.createElement("input");
    test.setAttribute("type", "range");
    return (test.type === "range");
};



// adapted from: http://www.rajeshsegu.com/2012/09/browser-detect-custom-protocols/comment-page-1/
papaya.utilities.PlatformUtils.launchCustomProtocol = function (container, url, callback) {
    var iframe, myWindow, cookie, success = false;

    if (papaya.utilities.PlatformUtils.browser === "Internet Explorer") {
        myWindow = window.open('', '', 'width=0,height=0');
        myWindow.document.write("<iframe src='" + url + "'></iframe>");

        setTimeout(function () {
            try {
                myWindow.location.href;
                success = true;
            } catch (ex) {
                console.log(ex);
            }

            if (success) {
                myWindow.setTimeout('window.close()', 100);
            } else {
                myWindow.close();
            }

            callback(success);
        }, 100);
    } else if (papaya.utilities.PlatformUtils.browser === "Firefox") {
        try {
            iframe = $("<iframe />");
            iframe.css({"display": "none"});
            iframe.appendTo("body");
            iframe[0].contentWindow.location.href = url;

            success = true;
        } catch (ex) {
            success = false;
        }

        iframe.remove();

        callback(success);
    } else if (papaya.utilities.PlatformUtils.browser === "Chrome") {
        container.viewerHtml.css({"outline": 0});
        container.viewerHtml.attr("tabindex", "1");
        container.viewerHtml.focus();

        container.viewerHtml.blur(function () {
            success = true;
            callback(true);  // true
        });

        location.href = url;

        setTimeout(function () {
            container.viewerHtml.off('blur');
            container.viewerHtml.removeAttr("tabindex");

            if (!success) {
                callback(false);  // false
            }
        }, 2000);
    } else {
        cookie = papaya.utilities.UrlUtils.readCookie(papaya.viewer.Preferences.COOKIE_PREFIX + PAPAYA_MANGO_INSTALLED);

        if (cookie || papaya.mangoinstalled) {
            success = true;
        } else {
            if (confirm("This feature requires that " + (papaya.utilities.PlatformUtils.ios ? "iMango" : "Mango") + " is installed.  Continue?")) {
                papaya.utilities.UrlUtils.createCookie(papaya.viewer.Preferences.COOKIE_PREFIX + PAPAYA_MANGO_INSTALLED, true, papaya.viewer.Preferences.COOKIE_EXPIRY_DAYS);
                success = true;
            }
        }

        if (success) {
            location.href = url;
        }

        callback(success);
    }
};


papaya.utilities.PlatformUtils.getSupportedScrollEvent = function() {
    var support;
    if (papaya.utilities.PlatformUtils.browser === "Firefox") {
        support = "DOMMouseScroll";
    } else {
        // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
            document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
                "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox
    }

    return support;
};



// Reasonable defaults
var PIXEL_STEP  = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;


/**
 * Copyright (c) 2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule normalizeWheel
 * @typechecks
 */
// https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
// http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
papaya.utilities.PlatformUtils.normalizeWheel = function(/*object*/ event) /*object*/ {
    var sX = 0, sY = 0,       // spinX, spinY
        pX = 0, pY = 0;       // pixelX, pixelY

    // Legacy
    if ('detail'      in event) { sY = event.detail; }
    if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

    // side scrolling on FF with DOMMouseScroll
    if ( 'axis' in event && event.axis === event.HORIZONTAL_AXIS ) {
        sX = sY;
        sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }

    if ((pX || pY) && event.deltaMode) {
        if (event.deltaMode == 1) {          // delta in LINE units
            pX *= LINE_HEIGHT;
            pY *= LINE_HEIGHT;
        } else {                             // delta in PAGE units
            pX *= PAGE_HEIGHT;
            pY *= PAGE_HEIGHT;
        }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    return { spinX  : sX,
        spinY  : sY,
        pixelX : pX,
        pixelY : pY };
};
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.StringUtils = papaya.utilities.StringUtils || {};


/*** Static Methods ***/

papaya.utilities.StringUtils.isStringBlank = function (str) {
    if (str && (typeof str).toLowerCase() == 'string') {
        return (str.trim().length === 0);
    }

    return true;
};



papaya.utilities.StringUtils.formatNumber = function (num, shortFormat) {
    var val = 0;

    if (papaya.utilities.ObjectUtils.isString(num)) {
        val = Number(num);
    } else {
        val = num;
    }

    if (shortFormat) {
        val = val.toPrecision(5);
    } else {
        val = val.toPrecision(7);
    }

    return parseFloat(val);
};



papaya.utilities.StringUtils.getSizeString = function (imageFileSize) {
    var imageFileSizeString = null;

    if (imageFileSize > 1048576) {
        imageFileSizeString = papaya.utilities.StringUtils.formatNumber(imageFileSize / 1048576, true) + " Mb";
    } else if (imageFileSize > 1024) {
        imageFileSizeString = papaya.utilities.StringUtils.formatNumber(imageFileSize / 1024, true) + " Kb";
    } else {
        imageFileSizeString = imageFileSize + " Bytes";
    }

    return imageFileSizeString;
};



// http://james.padolsey.com/javascript/wordwrap-for-javascript/
papaya.utilities.StringUtils.wordwrap = function (str, width, brk, cut) {
    brk = brk || '\n';
    width = width || 75;
    cut = cut || false;

    if (!str) { return str; }

    var regex = '.{1,' + width + '}(\\s|$)' + (cut ? '|.{' + width + '}|.+$' : '|\\S+?(\\s|$)');

    return str.match(new RegExp(regex, 'g')).join(brk);
};



papaya.utilities.StringUtils.truncateMiddleString = function (fullStr, strLen) {
    if (fullStr.length <= strLen) {
        return fullStr;
    }

    var separator = '...',
        sepLen = separator.length,
        charsToShow = strLen - sepLen,
        frontChars = Math.ceil(charsToShow/2),
        backChars = Math.floor(charsToShow/2);

    return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
};


papaya.utilities.StringUtils.pad = function (num, size) {
    return ('000000000' + num).substr(-size);
};


/*** String (Prototype Methods) ***/

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');};
}

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.utilities = papaya.utilities || {};
papaya.utilities.UrlUtils = papaya.utilities.UrlUtils || {};


/*** Static Methods ***/

// http://www.quirksmode.org/js/cookies.html
papaya.utilities.UrlUtils.createCookie = function (name, value, days) {
    var date, expires;

    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }

    document.cookie = name + "=" + value + expires + "; path=/";
};



papaya.utilities.UrlUtils.readCookie = function (name) {
    var nameEQ, ca, i, c;

    nameEQ = name + "=";
    ca = document.cookie.split(';');

    for (i = 0; i < ca.length; i += 1) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1, c.length);
        }

        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }

    return null;
};



papaya.utilities.UrlUtils.eraseCookie = function (name) {
    papaya.utilities.UrlUtils.createCookie(name, "", -1);
};



// adapted from: http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
papaya.utilities.UrlUtils.getQueryParams = function (params) {
    /*jslint regexp: true */
    var tokens, qs, re = /[?&]?([^=]+)=([^&]*)/g;

    if (document.location.href.indexOf("?") !== -1) {
        qs = document.location.href.substring(document.location.href.indexOf("?") + 1);
        qs = qs.split("+").join(" ");

        tokens = re.exec(qs);
        while (tokens) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
            tokens = re.exec(qs);
        }
    }
};



papaya.utilities.UrlUtils.getAbsoluteUrl = function (protocol, relative) {
    var base, link, host, path;

    base = window.location.href;
    base = base.substring(0, base.lastIndexOf("/"));
    link = document.createElement("a");
    link.href = base + "/" +  relative;

    host = link.host;
    path = link.pathname;

    if (path.charAt(0) !== '/') {
        path = "/" + path;
    }


    return (protocol + "://" + host + path);
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.core = papaya.core || {};


/*** Constructor ***/
papaya.core.Coordinate = papaya.core.Coordinate || function (xLoc, yLoc, zLoc) {
    this.x = xLoc;
    this.y = yLoc;
    this.z = zLoc;
};


/*** Prototype Methods ***/

papaya.core.Coordinate.prototype.setCoordinate = function (xLoc, yLoc, zLoc, round) {
    if (round) {
        this.x = Math.round(xLoc);
        this.y = Math.round(yLoc);
        this.z = Math.round(zLoc);
    } else {
        this.x = xLoc;
        this.y = yLoc;
        this.z = zLoc;
    }
};


papaya.core.Coordinate.prototype.toString = function () {
    return '(' + this.x + ',' + this.y + ',' + this.z + ')';
}


papaya.core.Coordinate.prototype.isAllZeros = function () {
    return ((this.x === 0) && (this.y === 0) && (this.z === 0));
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.core = papaya.core || {};


/*** Constructor ***/
papaya.core.Point = papaya.core.Point || function (xLoc, yLoc) {
    this.x = xLoc;
    this.y = yLoc;
};

/*jslint browser: true, node: true */
/*global numeric, nifti */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};
papaya.volume.nifti = papaya.volume.nifti || {};


/*** Constructor ***/
papaya.volume.nifti.HeaderNIFTI = papaya.volume.nifti.HeaderNIFTI || function () {
    this.nifti = null;
    this.isNIFTI2 = false;
    this.compressed = false;
    this.imageData = null;
};


/*** Static Pseudo-constants ***/

papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT = "XYZ-++";
papaya.volume.nifti.HeaderNIFTI.SPATIAL_UNITS_MASK = 0x07;
papaya.volume.nifti.HeaderNIFTI.TEMPORAL_UNITS_MASK = 0x38;


/*** Static Methods ***/

papaya.volume.nifti.HeaderNIFTI.isThisFormat = function (filename, data) {
    if (filename.indexOf(".nii") !== -1) {
        return true;
    }

    return nifti.isNIFTI(data[0]);
};


/*** Prototype Methods ***/

papaya.volume.nifti.HeaderNIFTI.prototype.readHeaderData = function (data, progressMeter, dialogHandler,
                                                                     onFinishedHeaderRead) {
    this.nifti = nifti.readHeader(data[0]);
    this.isNIFTI2 = nifti.isNIFTI2(data[0]);
    this.imageData = nifti.readImage(this.nifti, data[0]);
    onFinishedHeaderRead();
};



papaya.volume.nifti.HeaderNIFTI.prototype.readImageData = function (progressMeter, onFinishedImageRead) {
    onFinishedImageRead(this.imageData);
    this.imageData = null;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getImageDimensions = function () {
    var id = new papaya.volume.ImageDimensions(this.nifti.dims[1], this.nifti.dims[2], this.nifti.dims[3],
        this.nifti.dims[4]);
    id.dataOffsets[0] = this.nifti.vox_offset;
    id.dataLengths[0] = (id.getNumVoxelsSeries() * (this.nifti.numBitsPerVoxel / 8));

    return id;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getName = function () {
    return null;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getVoxelDimensions = function () {
    /*jslint bitwise: true */
    var vd;

    vd = new papaya.volume.VoxelDimensions(this.nifti.pixDims[1], this.nifti.pixDims[2], this.nifti.pixDims[3],
        this.nifti.pixDims[4]);

    vd.spatialUnit = (this.nifti.xyzt_units & papaya.volume.nifti.HeaderNIFTI.SPATIAL_UNITS_MASK);
    vd.temporalUnit = (this.nifti.xyzt_units & papaya.volume.nifti.HeaderNIFTI.TEMPORAL_UNITS_MASK);

    return vd;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getImageType = function () {
    var datatype = papaya.volume.ImageType.DATATYPE_UNKNOWN;

    if ((this.nifti.datatypeCode === nifti.NIFTI1.TYPE_UINT8) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_UINT16) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_UINT32) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_UINT64)) {
        datatype = papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED;
    } else if ((this.nifti.datatypeCode === nifti.NIFTI1.TYPE_INT8) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_INT16) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_INT32) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_INT64)) {
        datatype = papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED;
    } else if ((this.nifti.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) ||
        (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64)) {
        datatype = papaya.volume.ImageType.DATATYPE_FLOAT;
    } else if (this.nifti.datatypeCode === nifti.NIFTI1.TYPE_RGB24) {
        datatype = papaya.volume.ImageType.DATATYPE_RGB;
    }

    return new papaya.volume.ImageType(datatype, this.nifti.numBitsPerVoxel / 8, this.nifti.littleEndian,
        this.compressed);
};



papaya.volume.nifti.HeaderNIFTI.prototype.getOrientation = function () {
    var orientation = null;

    if ((this.nifti.qform_code > 0) && !this.qFormHasRotations()) {
        orientation = this.getOrientationQform();
    }

    if ((this.nifti.sform_code > this.nifti.qform_code) && !this.sFormHasRotations()) {
        orientation = this.getOrientationSform();
    }

    if (orientation === null) {
        orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
    }

    return new papaya.volume.Orientation(orientation);
};



papaya.volume.nifti.HeaderNIFTI.prototype.getOrientationQform = function () {
    var orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT,
        qFormMatParams = this.nifti.convertNiftiQFormToNiftiSForm(this.nifti.quatern_b, this.nifti.quatern_c,
            this.nifti.quatern_d, this.nifti.qoffset_x, this.nifti.qoffset_y, this.nifti.qoffset_z,
            this.nifti.pixDims[1], this.nifti.pixDims[2], this.nifti.pixDims[3], this.nifti.pixDims[0]);

    if (this.nifti.qform_code > 0) {
        orientation = this.nifti.convertNiftiSFormToNEMA(qFormMatParams);

        if (!papaya.volume.Orientation.isValidOrientationString(orientation)) {
            orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
        }
    } else {
        orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
    }

    return orientation;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getOrientationSform = function () {
    var orientation = this.nifti.convertNiftiSFormToNEMA(this.nifti.affine);

    if (!papaya.volume.Orientation.isValidOrientationString(orientation)) {
        orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
    }

    return orientation;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getQformMatCopy = function () {
    return this.nifti.getQformMat().clone();
};



papaya.volume.nifti.HeaderNIFTI.prototype.getSformMatCopy = function () {
    return this.nifti.affine.clone();
};



papaya.volume.nifti.HeaderNIFTI.prototype.getOrigin = function (forceQ, forceS) {
    var origin = new papaya.core.Coordinate(0, 0, 0),
        qFormMatParams,
        affineQform,
        affineQformInverse,
        affineSformInverse,
        orientation,
        someOffsets,
        xyz, sense,
        xIndex, yIndex, zIndex,
        xFlip, yFlip, zFlip;

    if ((this.nifti.qform_code > 0) && !forceS) {
        if (this.qFormHasRotations()) {
            affineQform = this.nifti.getQformMat();
            affineQformInverse = numeric.inv(affineQform);
            origin.setCoordinate(affineQformInverse[0][3], affineQformInverse[1][3], affineQformInverse[2][3]);
        } else {
            qFormMatParams = this.nifti.convertNiftiQFormToNiftiSForm(this.nifti.quatern_b, this.nifti.quatern_c,
                this.nifti.quatern_d, this.nifti.qoffset_x, this.nifti.qoffset_y, this.nifti.qoffset_z,
                this.nifti.pixDims[1], this.nifti.pixDims[2], this.nifti.pixDims[3], this.nifti.pixDims[0]);

            orientation = this.nifti.convertNiftiSFormToNEMA(qFormMatParams);

            if (!papaya.volume.Orientation.isValidOrientationString(orientation)) {
                orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
            }

            xyz = orientation.substring(0, 3).toUpperCase();
            sense = orientation.substring(3);
            xIndex = xyz.indexOf('X');
            yIndex = xyz.indexOf('Y');
            zIndex = xyz.indexOf('Z');
            xFlip = (sense.charAt(xIndex) === '+');
            yFlip = (sense.charAt(yIndex) === '+');
            zFlip = (sense.charAt(zIndex) === '+');

            someOffsets = new Array(3);
            someOffsets[0] = ((this.nifti.qoffset_x / this.nifti.pixDims[xIndex + 1])) * (xFlip ? -1 : 1);
            someOffsets[1] = ((this.nifti.qoffset_y / this.nifti.pixDims[yIndex + 1])) * (yFlip ? -1 : 1);
            someOffsets[2] = ((this.nifti.qoffset_z / this.nifti.pixDims[zIndex + 1])) * (zFlip ? -1 : 1);

            origin.setCoordinate(someOffsets[0], someOffsets[1], someOffsets[2], true);
        }
    } else if ((this.nifti.sform_code > 0) && !forceQ) {
        if (this.sFormHasRotations()) {
            affineSformInverse = numeric.inv(this.nifti.affine);
            origin.setCoordinate(affineSformInverse[0][3], affineSformInverse[1][3], affineSformInverse[2][3]);
        } else {
            orientation = this.nifti.convertNiftiSFormToNEMA(this.nifti.affine);

            if (!papaya.volume.Orientation.isValidOrientationString(orientation)) {
                orientation = papaya.volume.nifti.HeaderNIFTI.ORIENTATION_DEFAULT;
            }

            xyz = orientation.substring(0, 3).toUpperCase();
            sense = orientation.substring(3);
            xIndex = xyz.indexOf('X');
            yIndex = xyz.indexOf('Y');
            zIndex = xyz.indexOf('Z');
            xFlip = (sense.charAt(xIndex) === '+');
            yFlip = (sense.charAt(yIndex) === '+');
            zFlip = (sense.charAt(zIndex) === '+');

            someOffsets = new Array(3);
            someOffsets[0] = ((this.nifti.affine[0][3] / this.nifti.pixDims[xIndex + 1])) * (xFlip ? -1 : 1);
            someOffsets[1] = ((this.nifti.affine[1][3] / this.nifti.pixDims[yIndex + 1])) * (yFlip ? -1 : 1);
            someOffsets[2] = ((this.nifti.affine[2][3] / this.nifti.pixDims[zIndex + 1])) * (zFlip ? -1 : 1);

            origin.setCoordinate(someOffsets[0], someOffsets[1], someOffsets[2], true);
        }
    }

    if (origin.isAllZeros()) {
        origin.setCoordinate(this.nifti.dims[1] / 2.0, this.nifti.dims[2] / 2.0, this.nifti.dims[3] / 2.0);
    }

    return origin;
};



papaya.volume.nifti.HeaderNIFTI.prototype.qFormHasRotations = function () {
    return papaya.volume.Transform.hasRotations(this.getQformMatCopy());
};



papaya.volume.nifti.HeaderNIFTI.prototype.sFormHasRotations = function () {
    return papaya.volume.Transform.hasRotations(this.getSformMatCopy());
};



papaya.volume.nifti.HeaderNIFTI.prototype.getImageRange = function () {
    var ir = new papaya.volume.ImageRange(this.nifti.cal_min, this.nifti.cal_max),
        slope = this.nifti.scl_slope,
        imageDimensions = this.getImageDimensions();

    if (slope === 0) {
        slope = 1;
    }

    ir.setGlobalDataScale(slope, this.nifti.scl_inter, imageDimensions.slices * imageDimensions.timepoints);
    ir.validateDataScale();

    return ir;
};



papaya.volume.nifti.HeaderNIFTI.prototype.hasError = function () {
    return false;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getImageDescription = function () {
    return new papaya.volume.ImageDescription(this.nifti.description);
};



papaya.volume.nifti.HeaderNIFTI.prototype.getOrientationCertainty = function () {
    var certainty, origin;

    certainty = papaya.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;

    if ((this.nifti.qform_code > 0) || (this.nifti.sform_code > 0)) {
        certainty = papaya.volume.Header.ORIENTATION_CERTAINTY_LOW;

        origin = this.getOrigin();
        if ((origin !== null) && !origin.isAllZeros()) {
            certainty = papaya.volume.Header.ORIENTATION_CERTAINTY_HIGH;
        }
    }

    return certainty;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getBestTransform = function () {
    if ((this.nifti.qform_code > 0) && (this.nifti.qform_code > this.nifti.sform_code) && this.qFormHasRotations()) {
        return this.getQformMatCopy();
    }

    if ((this.nifti.sform_code > 0) && (this.nifti.sform_code >= this.nifti.qform_code) && this.sFormHasRotations()) {
        return this.getSformMatCopy();
    }

    return null;
};



papaya.volume.nifti.HeaderNIFTI.prototype.getBestTransformOrigin = function () {
    if ((this.nifti.qform_code > 0) && (this.nifti.qform_code > this.nifti.sform_code) && this.qFormHasRotations()) {
        return this.getOrigin(true, false);
    }

    if ((this.nifti.sform_code > 0) && (this.nifti.sform_code >= this.nifti.qform_code) && this.sFormHasRotations()) {
        return this.getOrigin(false, true);
    }

    return null;
};



papaya.volume.nifti.HeaderNIFTI.prototype.toString = function () {
    var fmt = papaya.utilities.StringUtils.formatNumber,
        string = "";

    if (this.isNIFTI2) {
        string += ("<span style='color:#B5CBD3'>Datatype</span>" + "<span style='color:gray'> = </span>" +  this.nifti.datatypeCode + " (" + this.nifti.getDatatypeCodeString(this.nifti.datatypeCode) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Bits Per Voxel</span>" + "<span style='color:gray'> = </span>" + this.nifti.numBitsPerVoxel + "<br />");
        string += ("<span style='color:#B5CBD3'>Image Dimensions</span>" + " (1-8): " +
        this.nifti.dims[0] + ", " +
        this.nifti.dims[1] + ", " +
        this.nifti.dims[2] + ", " +
        this.nifti.dims[3] + ", " +
        this.nifti.dims[4] + ", " +
        this.nifti.dims[5] + ", " +
        this.nifti.dims[6] + ", " +
        this.nifti.dims[7] + "<br />");

        string += ("<span style='color:#B5CBD3'>Intent Parameters</span> (1-3): " +
            this.nifti.intent_p1 + ", " +
            this.nifti.intent_p2 + ", " +
            this.nifti.intent_p3) + "<br />";

        string += ("<span style='color:#B5CBD3'>Voxel Dimensions</span> (1-8): " +
        fmt(this.nifti.pixDims[0]) + ", " +
        fmt(this.nifti.pixDims[1]) + ", " +
        fmt(this.nifti.pixDims[2]) + ", " +
        fmt(this.nifti.pixDims[3]) + ", " +
        fmt(this.nifti.pixDims[4]) + ", " +
        fmt(this.nifti.pixDims[5]) + ", " +
        fmt(this.nifti.pixDims[6]) + ", " +
        fmt(this.nifti.pixDims[7]) + "<br />");

        string += ("<span style='color:#B5CBD3'>Image Offset</span>" + "<span style='color:gray'> = </span>" + this.nifti.vox_offset + "<br />");
        string += ("<span style='color:#B5CBD3'>Data Scale:  Slope</span>" + "<span style='color:gray'> = </span>" + this.nifti.scl_slope + "  <span style='color:#B5CBD3'>Intercept</span>" + "<span style='color:gray'> = </span>" + this.nifti.scl_inter+ "<br />");
        string += ("<span style='color:#B5CBD3'>Display Range:  Max</span>" + "<span style='color:gray'> = </span>" + this.nifti.cal_max + "  <span style='color:#B5CBD3'>Min</span>" + "<span style='color:gray'> = </span>" + this.nifti.cal_min + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice Duration</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_duration + "<br />");
        string += ("<span style='color:#B5CBD3'>Time Axis Shift</span>" + "<span style='color:gray'> = </span>" + this.nifti.toffset + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice Start</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_start + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice End</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_end + "<br />");
        string += ("<span style='color:#B5CBD3'>Description</span>: \"" + this.nifti.description + "\"<br />");
        string += ("<span style='color:#B5CBD3'>Auxiliary File</span>: \"" + this.nifti.aux_file + "\"<br />");
        string += ("<span style='color:#B5CBD3'>Q-Form Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.qform_code + " (" + this.nifti.getTransformCodeString(this.nifti.qform_code) + ")<br />");
        string += ("<span style='color:#B5CBD3'>S-Form Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.sform_code + " (" + this.nifti.getTransformCodeString(this.nifti.sform_code) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Quaternion Parameters</span>:  " +
        "<span style='color:#B5CBD3'>b</span> <span style='color:gray'>=</span> " + fmt(this.nifti.quatern_b) + "  " +
        "<span style='color:#B5CBD3'>c</span> <span style='color:gray'>=</span> " + fmt(this.nifti.quatern_c) + "  " +
        "<span style='color:#B5CBD3'>d</span> <span style='color:gray'>=</span> " + fmt(this.nifti.quatern_d) + "<br />");

        string += ("<span style='color:#B5CBD3'>Quaternion Offsets</span>:  " +
        "<span style='color:#B5CBD3'>x</span> <span style='color:gray'>=</span> " + this.nifti.qoffset_x + "  " +
        "<span style='color:#B5CBD3'>y</span> <span style='color:gray'>=</span> " + this.nifti.qoffset_y + "  " +
        "<span style='color:#B5CBD3'>z</span> <span style='color:gray'>=</span> " + this.nifti.qoffset_z + "<br />");

        string += ("<span style='color:#B5CBD3'>S-Form Parameters X</span>: " +
        fmt(this.nifti.affine[0][0]) + ", " +
        fmt(this.nifti.affine[0][1]) + ", " +
        fmt(this.nifti.affine[0][2]) + ", " +
        fmt(this.nifti.affine[0][3]) + "<br />");

        string += ("<span style='color:#B5CBD3'>S-Form Parameters Y</span>: " +
        fmt(this.nifti.affine[1][0]) + ", " +
        fmt(this.nifti.affine[1][1]) + ", " +
        fmt(this.nifti.affine[1][2]) + ", " +
        fmt(this.nifti.affine[1][3]) + "<br />");

        string += ("<span style='color:#B5CBD3'>S-Form Parameters Z</span>: " +
        fmt(this.nifti.affine[2][0]) + ", " +
        fmt(this.nifti.affine[2][1]) + ", " +
        fmt(this.nifti.affine[2][2]) + ", " +
        fmt(this.nifti.affine[2][3]) + "<br />");

        string += ("<span style='color:#B5CBD3'>Slice Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_code + "<br />");
        string += ("<span style='color:#B5CBD3'>Units Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.xyzt_units + " (" + this.nifti.getUnitsCodeString(nifti.NIFTI1.SPATIAL_UNITS_MASK & this.nifti.xyzt_units) + ", " + this.nifti.getUnitsCodeString(nifti.NIFTI1.TEMPORAL_UNITS_MASK & this.nifti.xyzt_units) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Intent Code </span>" + "<span style='color:gray'> = </span>" + this.nifti.intent_code + "<br />");
        string += ("<span style='color:#B5CBD3'>Intent Name</span>: \"" + this.nifti.intent_name + "\"<br />");

        string += ("<span style='color:#B5CBD3'>Dim Info </span>" + "<span style='color:gray'> = </span>" + this.nifti.dim_info + "<br />");
    } else {
        string += ("<span style='color:#B5CBD3'>Dim Info</span>" + "<span style='color:gray'> = </span>" + this.nifti.dim_info + "<br />");

        string += ("<span style='color:#B5CBD3'>Image Dimensions</span>" + " (1-8): " + this.nifti.dims[0] + ", " + this.nifti.dims[1] + ", " +
        this.nifti.dims[2] + ", " + this.nifti.dims[3] + ", " + this.nifti.dims[4] + ", " + this.nifti.dims[5] + ", " +
        this.nifti.dims[6] + ", " + this.nifti.dims[7] + "<br />");
        string += ("<span style='color:#B5CBD3'>Intent Parameters</span>" + " (1-3): " + this.nifti.intent_p1 + ", " + this.nifti.intent_p2 + ", " +
            this.nifti.intent_p3) + "<br />";
        string += ("<span style='color:#B5CBD3'>Intent Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.intent_code + "<br />");
        string += ("<span style='color:#B5CBD3'>Datatype</span>" + "<span style='color:gray'> = </span>" + this.nifti.datatypeCode + " (" + this.nifti.getDatatypeCodeString(this.nifti.datatypeCode) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Bits Per Voxel</span>" + "<span style='color:gray'> = </span>" + this.nifti.numBitsPerVoxel + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice Start</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_start + "<br />");
        string += ("<span style='color:#B5CBD3'>Voxel Dimensions</span>" + " (1-8): " + fmt(this.nifti.pixDims[0]) + ", " + fmt(this.nifti.pixDims[1]) + ", " +
        fmt(this.nifti.pixDims[2]) + ", " + fmt(this.nifti.pixDims[3]) + ", " + fmt(this.nifti.pixDims[4]) + ", " +
        fmt(this.nifti.pixDims[5]) + ", " + fmt(this.nifti.pixDims[6]) + ", " + fmt(this.nifti.pixDims[7]) + "<br />");
        string += ("<span style='color:#B5CBD3'>Image Offset</span>" + "<span style='color:gray'> = </span>" + this.nifti.vox_offset + "<br />");
        string += ("<span style='color:#B5CBD3'>Data Scale</span>" + ":  <span style='color:#B5CBD3'>Slope</span> = " + this.nifti.scl_slope + "  <span style='color:#B5CBD3'>Intercept</span> = " + this.nifti.scl_inter + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice End</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_end + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_code + "<br />");
        string += ("<span style='color:#B5CBD3'>Units Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.xyzt_units + " (" + this.nifti.getUnitsCodeString(nifti.NIFTI1.SPATIAL_UNITS_MASK & this.nifti.xyzt_units) + ", " + this.nifti.getUnitsCodeString(nifti.NIFTI1.TEMPORAL_UNITS_MASK & this.nifti.xyzt_units) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Display Range</span>" + ":  <span style='color:#B5CBD3'>Max</span>" + "<span style='color:gray'> = </span>" + this.nifti.cal_max + "  <span style='color:#B5CBD3'>Min</span>" + "<span style='color:gray'> = </span>" + this.nifti.cal_min + "<br />");
        string += ("<span style='color:#B5CBD3'>Slice Duration</span>" + "<span style='color:gray'> = </span>" + this.nifti.slice_duration + "<br />");
        string += ("<span style='color:#B5CBD3'>Time Axis Shift</span>" + "<span style='color:gray'> = </span>" + this.nifti.toffset + "<br />");
        string += ("<span style='color:#B5CBD3'>Description</span>" + ": \"" + this.nifti.description + "\"<br />");
        string += ("<span style='color:#B5CBD3'>Auxiliary File</span>" + ": \"" + this.nifti.aux_file + "\"<br />");
        string += ("<span style='color:#B5CBD3'>Q-Form Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.qform_code + " (" + this.nifti.getTransformCodeString(this.nifti.qform_code) + ")<br />");
        string += ("<span style='color:#B5CBD3'>S-Form Code</span>" + "<span style='color:gray'> = </span>" + this.nifti.sform_code + " (" + this.nifti.getTransformCodeString(this.nifti.sform_code) + ")<br />");
        string += ("<span style='color:#B5CBD3'>Quaternion Parameters</span>" + ":  <span style='color:#B5CBD3'>b</span>" + "<span style='color:gray'> = </span>" + fmt(this.nifti.quatern_b) +
        "  <span style='color:#B5CBD3'>c</span>" + "<span style='color:gray'> = </span>" +
        fmt(this.nifti.quatern_c) +
        "  <span style='color:#B5CBD3'>d</span>" + "<span style='color:gray'> = </span>" + fmt(this.nifti.quatern_d) + "<br />");
        string += ("<span style='color:#B5CBD3'>Quaternion Offsets</span>" + ":  <span style='color:#B5CBD3'>x</span>" + "<span style='color:gray'> = </span>" + this.nifti.qoffset_x + "  <span style='color:#B5CBD3'>y</span>" + "<span style='color:gray'> = </span>" +
        this.nifti.qoffset_y + "  <span style='color:#B5CBD3'>z</span>" + "<span style='color:gray'> = </span>" +
        this.nifti.qoffset_z + "<br />");
        string += ("<span style='color:#B5CBD3'>S-Form Parameters X</span>" + ": " + fmt(this.nifti.affine[0][0]) + ", " + fmt(this.nifti.affine[0][1]) + ", " +
        fmt(this.nifti.affine[0][2]) + ", " + fmt(this.nifti.affine[0][3]) + "<br />");
        string += ("<span style='color:#B5CBD3'>S-Form Parameters Y</span>" + ": " + fmt(this.nifti.affine[1][0]) + ", " + fmt(this.nifti.affine[1][1]) + ", " +
        fmt(this.nifti.affine[1][2]) + ", " + fmt(this.nifti.affine[1][3]) + "<br />");
        string += ("<span style='color:#B5CBD3'>S-Form Parameters Z</span>" + ": " + fmt(this.nifti.affine[2][0]) + ", " + fmt(this.nifti.affine[2][1]) + ", " +
        fmt(this.nifti.affine[2][2]) + ", " + fmt(this.nifti.affine[2][3]) + "<br />");
        string += ("<span style='color:#B5CBD3'>Intent Name</span>" + ": \"" + this.nifti.intent_name + "\"<br />");
    }

    return string;
};
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.Header = papaya.volume.Header || function (pad) {
    this.fileFormat = null;
    this.imageDimensions = null;
    this.voxelDimensions = null;
    this.imageDescription = null;
    this.imageType = null;
    this.orientation = null;
    this.imageRange = null;
    this.error = null;
    this.origin = null;
    this.pad = pad;
    this.orientationCertainty = papaya.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;
    this.onFinishedFileFormatRead = null;
};


/*** Static Pseudo-constants ***/

papaya.volume.Header.HEADER_TYPE_UNKNOWN = 0;
papaya.volume.Header.HEADER_TYPE_NIFTI = 1;
papaya.volume.Header.HEADER_TYPE_DICOM = 2;
papaya.volume.Header.ERROR_UNRECOGNIZED_FORMAT = "This format is not recognized!";
papaya.volume.Header.INVALID_IMAGE_DIMENSIONS = "Image dimensions are not valid!";
papaya.volume.Header.INVALID_VOXEL_DIMENSIONS = "Voxel dimensions are not valid!";
papaya.volume.Header.INVALID_DATATYPE = "Datatype is not valid or not supported!";
papaya.volume.Header.INVALID_IMAGE_RANGE = "Image range is not valid!";
papaya.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN = 0;
papaya.volume.Header.ORIENTATION_CERTAINTY_LOW = 1;
papaya.volume.Header.ORIENTATION_CERTAINTY_HIGH = 2;


/*** Prototype Methods ***/

papaya.volume.Header.prototype.findHeaderType = function (filename, data) {
    if (papaya.volume.nifti.HeaderNIFTI.isThisFormat(filename, data)) {
        return papaya.volume.Header.HEADER_TYPE_NIFTI;
    } else if (papaya.Container.DICOM_SUPPORT && papaya.volume.dicom.HeaderDICOM.isThisFormat(filename, data)) {
        return papaya.volume.Header.HEADER_TYPE_DICOM;
    }

    return papaya.volume.Header.HEADER_TYPE_UNKNOWN;
};



papaya.volume.Header.prototype.readHeaderData = function (filename, data, progressMeter, dialogHandler,
                                                          onFinishedFileFormatRead) {
    var headerType = this.findHeaderType(filename, data);

    this.onFinishedFileFormatRead = onFinishedFileFormatRead;

    if (headerType === papaya.volume.Header.HEADER_TYPE_NIFTI) {
        this.fileFormat = new papaya.volume.nifti.HeaderNIFTI();
        this.fileFormat.readHeaderData(data, progressMeter, dialogHandler, papaya.utilities.ObjectUtils.bind(this, this.onFinishedHeaderRead));
    } else if (headerType === papaya.volume.Header.HEADER_TYPE_DICOM) {
        this.fileFormat = new papaya.volume.dicom.HeaderDICOM();
        this.fileFormat.readHeaderData(data, progressMeter, dialogHandler, papaya.utilities.ObjectUtils.bind(this, this.onFinishedHeaderRead));
    } else {
        this.error = new Error(papaya.volume.Header.ERROR_UNRECOGNIZED_FORMAT);
        this.onFinishedFileFormatRead();
    }
};



papaya.volume.Header.prototype.onFinishedHeaderRead = function () {
    if (this.fileFormat.hasError()) {
        this.error = this.fileFormat.error;
    } else {
        this.imageType = this.fileFormat.getImageType();
        if (!this.imageType.isValid()) {
            this.error = new Error(papaya.volume.Header.INVALID_DATATYPE);
        }

        this.imageDimensions = this.fileFormat.getImageDimensions();
        if (!this.imageDimensions.isValid()) {
            this.error = new Error(papaya.volume.Header.INVALID_IMAGE_DIMENSIONS);
        }


        this.voxelDimensions = this.fileFormat.getVoxelDimensions();
        if (!this.voxelDimensions.isValid()) {
            this.error = new Error(papaya.volume.Header.INVALID_VOXEL_DIMENSIONS);
        }

        if (this.pad) {
            this.imageDimensions.padIsometric(this.voxelDimensions);
        }

        this.orientation = this.fileFormat.getOrientation();
        if (!this.orientation.isValid()) {
            this.orientation = new papaya.volume.Orientation(papaya.volume.Orientation.DEFAULT);
            this.orientationCertainty = papaya.volume.Header.ORIENTATION_CERTAINTY_UNKNOWN;
        } else {
            this.orientationCertainty = this.fileFormat.getOrientationCertainty();
        }

        this.orientation.createInfo(this.imageDimensions, this.voxelDimensions);

        this.origin = this.orientation.convertCoordinate(this.fileFormat.getOrigin(),
            new papaya.core.Coordinate(0, 0, 0));

        this.imageRange = this.fileFormat.getImageRange();
        if (!this.imageRange.isValid()) {
            this.error = new Error(papaya.volume.Header.INVALID_IMAGE_RANGE);
        }

        this.imageDescription = this.fileFormat.getImageDescription();
    }

    this.onFinishedFileFormatRead();
};



papaya.volume.Header.prototype.getName = function () {
    return this.fileFormat.getName();
};



papaya.volume.Header.prototype.readImageData = function (progressMeter, onFinishedImageRead) {
    this.fileFormat.readImageData(progressMeter, onFinishedImageRead);
};



papaya.volume.Header.prototype.hasError = function () {
    return (this.error !== null);
};



papaya.volume.Header.prototype.getBestTransform = function () {
    return this.fileFormat.getBestTransform();
};



papaya.volume.Header.prototype.getBestTransformOrigin = function () {
    return this.fileFormat.getBestTransformOrigin();
};



papaya.volume.Header.prototype.toString = function () {
    return this.fileFormat.toString();
}
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.ImageData = papaya.volume.ImageData || function (pad) {
    this.data = null;
    this.pad = pad;
};


/*** Prototype Methods ***/

papaya.volume.ImageData.prototype.readFileData = function (header, buffer, onReadFinish) {
    var numVoxels, dv, ctr, numVoxels2, rgbBySample;

    if (this.pad) {
        buffer = this.padIsometric(header, buffer);
    }

    // create typed array
    if (header.imageType.datatype === papaya.volume.ImageType.DATATYPE_RGB) {
        /*jslint bitwise: true */

        numVoxels = buffer.byteLength / 3;
        numVoxels2 = 2 * numVoxels;
        rgbBySample = header.imageType.rgbBySample;
        dv = new DataView(buffer, 0);
        this.data = new Uint32Array(numVoxels);

        if (rgbBySample) {
            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr) << 16));
            }

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr + numVoxels) << 8));
            }

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] |= ((dv.getUint8(ctr + numVoxels2)));
            }
        } else {
            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = ((dv.getUint8(ctr * 3) << 16) | (dv.getUint8(ctr * 3 + 1) << 8) | dv.getUint8(ctr * 3 + 2));
            }
        }
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 1)) {
        this.data = new Int8Array(buffer, 0, buffer.byteLength);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 1)) {
        this.data = new Uint8Array(buffer, 0, buffer.byteLength);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 2)) {
        this.data = new Int16Array(buffer, 0, buffer.byteLength / 2);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 2)) {
        this.data = new Uint16Array(buffer, 0, buffer.byteLength / 2);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED) &&
        (header.imageType.numBytes === 4)) {
        this.data = new Int32Array(buffer, 0, buffer.byteLength / 4);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) &&
        (header.imageType.numBytes === 4)) {
        this.data = new Uint32Array(buffer, 0, buffer.byteLength / 4);
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_FLOAT) && (header.imageType.numBytes === 4)) {
        if (header.imageType.swapped) {
            numVoxels = buffer.byteLength / Float32Array.BYTES_PER_ELEMENT;
            dv = new DataView(buffer, 0);
            this.data = new Float32Array(numVoxels);

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = dv.getFloat32(ctr * Float32Array.BYTES_PER_ELEMENT);
            }
        } else {
            this.data = new Float32Array(buffer, 0, buffer.byteLength / 4);
        }
    } else if ((header.imageType.datatype === papaya.volume.ImageType.DATATYPE_FLOAT) && (header.imageType.numBytes === 8)) {
        if (header.imageType.swapped) {
            numVoxels = buffer.byteLength / Float64Array.BYTES_PER_ELEMENT;
            dv = new DataView(buffer, 0);
            this.data = new Float64Array(numVoxels);

            for (ctr = 0; ctr < numVoxels; ctr += 1) {
                this.data[ctr] = dv.getFloat64(ctr * Float64Array.BYTES_PER_ELEMENT);
            }
        } else {
            this.data = new Float64Array(buffer, 0, buffer.byteLength / 8);
        }
    }

    onReadFinish();
};



papaya.volume.ImageData.prototype.padIsometric = function (header, data) {
    var id = header.imageDimensions,
        vd = header.voxelDimensions,
        numBytes = header.imageType.numBytes,
        buf = new Uint8Array(data, 0, data.byteLength),
        cols = id.colsOrig,
        rows = id.rowsOrig,
        slices = id.slicesOrig,
        colExt = (cols * vd.colSize),
        rowExt = (rows * vd.rowSize),
        sliceExt = (slices * vd.sliceSize),
        largestDim = Math.max(Math.max(colExt, rowExt), sliceExt),
        colDiff = parseInt((largestDim - colExt) / vd.colSize / 2, 10),
        rowDiff = parseInt((largestDim - rowExt) / vd.rowSize / 2, 10),
        sliceDiff = parseInt((largestDim - sliceExt) / vd.sliceSize / 2, 10),
        colsNew = (cols+2*colDiff),
        rowsNew = (rows+2*rowDiff),
        slicesNew = (slices+2*sliceDiff),
        colsBytes = cols * numBytes,
        colDiffBytes = colDiff * numBytes,
        rowDiffBytes = rowDiff * colsNew * numBytes,
        sliceDiffBytes = sliceDiff * (colsNew * rowsNew) * numBytes,
        indexPadded = 0,
        index = 0;

    var dataPaddedBuffer = new ArrayBuffer(colsNew * rowsNew * slicesNew * numBytes);
    var dataPadded = new Uint8Array(dataPaddedBuffer, 0, dataPaddedBuffer.byteLength);

    indexPadded += sliceDiffBytes;
    for (var ctrS = 0; ctrS < slices; ctrS += 1) {
        indexPadded += rowDiffBytes;

        for (var ctrR = 0; ctrR < rows; ctrR += 1) {
            indexPadded += colDiffBytes;

            for (var ctrC = 0; ctrC < colsBytes; ctrC += 1, index++, indexPadded++) {
                dataPadded[indexPadded] = buf[index];
            }

            indexPadded += colDiffBytes;
        }

        indexPadded += rowDiffBytes;
    }

    return dataPaddedBuffer;
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.ImageDescription = papaya.volume.ImageDescription || function (notes) {
    this.notes = "(none)";

    if (!papaya.utilities.StringUtils.isStringBlank(notes)) {
        this.notes = notes;
    }
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.ImageDimensions = papaya.volume.ImageDimensions || function (cols, rows, slices, timepoints) {
    this.cols = cols;
    this.rows = rows;
    this.slices = slices;

    this.colsOrig = cols;
    this.rowsOrig = rows;
    this.slicesOrig = slices;

    this.xDim = -1;
    this.yDim = -1;
    this.zDim = -1;
    this.timepoints = timepoints || 1;
    this.dataOffsets = [];  // offset of image data from start of file
    this.dataLengths = [];  // length of image data
};


/*** Prototype Methods ***/

papaya.volume.ImageDimensions.prototype.padIsometric = function (vd) {
    var id = this,
        cols = id.cols,
        rows = id.rows,
        slices = id.slices,
        colExt = (cols * vd.colSize),
        rowExt = (rows * vd.rowSize),
        sliceExt = (slices * vd.sliceSize),
        largestDim = Math.max(Math.max(colExt, rowExt), sliceExt),
        colDiff = parseInt((largestDim - colExt) / vd.colSize / 2, 10),
        rowDiff = parseInt((largestDim - rowExt) / vd.rowSize / 2, 10),
        sliceDiff = parseInt((largestDim - sliceExt) / vd.sliceSize / 2, 10);

    this.cols = (cols+2*colDiff);
    this.rows = (rows+2*rowDiff);
    this.slices = (slices+2*sliceDiff);
};



papaya.volume.ImageDimensions.prototype.getNumVoxelsSeries = function () {
    return this.cols * this.rows * this.slices * this.timepoints;
};



papaya.volume.ImageDimensions.prototype.getNumVoxelsSlice = function () {
    return this.rows * this.cols;
};



papaya.volume.ImageDimensions.prototype.getNumVoxelsVolume = function () {
    return this.rows * this.cols * this.slices;
};



papaya.volume.ImageDimensions.prototype.isValid = function () {
    return ((this.cols > 0) && (this.rows > 0) && (this.slices > 0) && (this.timepoints > 0) &&
        (this.dataOffsets[0] >= 0) && (this.dataLengths[0] >= 0));
};


/*** Exports ***/
var moduleType = typeof module;
if ((moduleType !== 'undefined') && module.exports) {
    module.exports.ImageDimensions = papaya.volume.ImageDimensions;
}

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.ImageRange = papaya.volume.ImageRange || function (min, max) {
    this.displayMin = min;
    this.displayMax = max;
    this.imageMin = 0;
    this.imageMax = 0;
    this.dataScaleSlopes = [];
    this.dataScaleIntercepts = [];
    this.globalDataScaleSlope = 1;
    this.globalDataScaleIntercept = 0;
    this.usesGlobalDataScale = false;
};


/*** Static Pseudo-constants ***/

papaya.volume.ImageRange.DEFAULT_SCALE = 1.0;
papaya.volume.ImageRange.DEFAULT_INTERCEPT = 0.0;


/*** Prototype Methods ***/

papaya.volume.ImageRange.prototype.isValid = function () {
    return true;
};



papaya.volume.ImageRange.prototype.setGlobalDataScale = function (scale, intercept) {
    this.globalDataScaleSlope = scale;
    this.globalDataScaleIntercept = intercept;
    this.usesGlobalDataScale = true;
    this.dataScaleSlopes = [];
    this.dataScaleIntercepts = [];
};



papaya.volume.ImageRange.prototype.validateDataScale = function () {
    var ctr, previous, foundSliceWiseDataScale = false;

    if ((this.globalDataScaleSlope !== 1) || (this.globalDataScaleIntercept !== 0)) {
        this.dataScaleSlopes = [];
        this.dataScaleIntercepts = [];
        this.usesGlobalDataScale = true;
    } else if ((this.dataScaleSlopes.length > 0) && (this.dataScaleIntercepts.length > 0)) {
        previous = this.dataScaleSlopes[0];

        for (ctr = 1; ctr < this.dataScaleSlopes.length; ctr += 1) {
            if (previous !== this.dataScaleSlopes[ctr]) {
                foundSliceWiseDataScale = true;
                break;
            }
        }

        previous = this.dataScaleIntercepts[0];

        for (ctr = 1; ctr < this.dataScaleIntercepts.length; ctr += 1) {
            if (previous !== this.dataScaleIntercepts[ctr]) {
                foundSliceWiseDataScale = true;
                break;
            }
        }

        if (foundSliceWiseDataScale) {
            this.usesGlobalDataScale = false;
        } else {
            this.setGlobalDataScale(this.dataScaleSlopes[0], this.dataScaleIntercepts[0]);
        }
    } else {
        this.setGlobalDataScale(1, 0);
    }
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.ImageType = papaya.volume.ImageType || function (datatype, numBytes, littleEndian, compressed) {
    this.datatype = datatype;
    this.numBytes = numBytes;
    this.littleEndian = littleEndian;
    this.swapped = false;
    this.compressed = compressed;
    this.rgbBySample = false;
};


/*** Static Pseudo-constants ***/

papaya.volume.ImageType.DATATYPE_UNKNOWN = 0;
papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED = 1;
papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED = 2;
papaya.volume.ImageType.DATATYPE_FLOAT = 3;
papaya.volume.ImageType.DATATYPE_RGB = 4;
papaya.volume.ImageType.MAX_SUPPORTED_BYTES_FLOAT = 8;
papaya.volume.ImageType.MAX_SUPPORTED_BYTES_INTEGER = 4;


/*** Prototype Methods ***/

papaya.volume.ImageType.prototype.isValid = function () {
    return (
    (this.datatype <= papaya.volume.ImageType.DATATYPE_RGB) &&
    (this.datatype > papaya.volume.ImageType.DATATYPE_UNKNOWN) &&
    (this.numBytes > 0) &&
    (((this.datatype === papaya.volume.ImageType.DATATYPE_FLOAT) && (this.numBytes <= papaya.volume.ImageType.MAX_SUPPORTED_BYTES_FLOAT)) ||
    ((this.datatype !== papaya.volume.ImageType.DATATYPE_FLOAT) && (this.numBytes <= papaya.volume.ImageType.MAX_SUPPORTED_BYTES_INTEGER)))
    );
};



papaya.volume.ImageType.prototype.getTypeDescription = function () {
    if (this.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_SIGNED) {
        return "Signed Integer";
    }

    if (this.datatype === papaya.volume.ImageType.DATATYPE_INTEGER_UNSIGNED) {
        return "Unsigned Integer";
    }

    if (this.datatype === papaya.volume.ImageType.DATATYPE_FLOAT) {
        return "Float";
    }

    if (this.datatype === papaya.volume.ImageType.DATATYPE_RGB) {
        return "RGB";
    }

    return "Unknown";
};



papaya.volume.ImageType.prototype.getOrderDescription = function () {
    if (this.numBytes > 1) {
        if (this.littleEndian) {
            return "Little Endian";
        }

        return "Big Endian";
    }

    return null;
};

/*jslint browser: true, node: true */
/*global papayaRoundFast */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.Orientation = papaya.volume.Orientation || function (str) {
    this.orientation = str;
    this.orientMat = null;
    this.xIncrement = -1;
    this.yIncrement = -1;
    this.zIncrement = -1;
};


/*** Static Pseudo-constants ***/

papaya.volume.Orientation.DEFAULT = "XYZ+--";


/*** Static Methods ***/

papaya.volume.Orientation.isValidOrientationString = function (orientationStr) {
    var temp, valid = true;

    if (orientationStr === null || (orientationStr.length !== 6)) {
        valid = false;
    }

    temp = orientationStr.toUpperCase().indexOf("X");
    if (temp === -1 || temp > 2 || (orientationStr.toUpperCase().lastIndexOf("X") !== temp)) {
        valid = false;
    }

    temp = orientationStr.toUpperCase().indexOf("Y");
    if (temp === -1 || temp > 2 || (orientationStr.toUpperCase().lastIndexOf("Y") !== temp)) {
        valid = false;
    }

    temp = orientationStr.toUpperCase().indexOf("Z");
    if (temp === -1 || temp > 2 || (orientationStr.toUpperCase().lastIndexOf("Z") !== temp)) {
        valid = false;
    }

    if ((orientationStr.charAt(3) !== '+') && (orientationStr.charAt(3) !== '-')) {
        valid = false;
    }

    if ((orientationStr.charAt(4) !== '+') && (orientationStr.charAt(4) !== '-')) {
        valid = false;
    }

    if ((orientationStr.charAt(5) !== '+') && (orientationStr.charAt(5) !== '-')) {
        valid = false;
    }

    return valid;
};


/*** Prototype Methods ***/

papaya.volume.Orientation.prototype.convertIndexToOffsetNative = function (xLoc, yLoc, zLoc) {
    return (xLoc * this.xIncrement) + (yLoc * this.yIncrement) + (zLoc * this.zIncrement);
};



papaya.volume.Orientation.prototype.convertIndexToOffset = function (xLoc, yLoc, zLoc) {
    var xLoc2, yLoc2, zLoc2;

    xLoc2 = papayaFloorFast((xLoc * this.orientMat[0][0]) + (yLoc * this.orientMat[0][1]) + (zLoc * this.orientMat[0][2]) + (this.orientMat[0][3]));
    yLoc2 = papayaFloorFast((xLoc * this.orientMat[1][0]) + (yLoc * this.orientMat[1][1]) + (zLoc * this.orientMat[1][2]) + (this.orientMat[1][3]));
    zLoc2 = papayaFloorFast((xLoc * this.orientMat[2][0]) + (yLoc * this.orientMat[2][1]) + (zLoc * this.orientMat[2][2]) + (this.orientMat[2][3]));

    return (xLoc2 * this.xIncrement) + (yLoc2 * this.yIncrement) + (zLoc2 * this.zIncrement);
}


papaya.volume.Orientation.prototype.convertCoordinate = function (coord, coordConverted) {
    coordConverted.x = papayaRoundFast((coord.x * this.orientMat[0][0]) + (coord.y * this.orientMat[0][1]) +
        (coord.z * this.orientMat[0][2]) + (this.orientMat[0][3]));
    coordConverted.y = papayaRoundFast((coord.x * this.orientMat[1][0]) + (coord.y * this.orientMat[1][1]) +
        (coord.z * this.orientMat[1][2]) + (this.orientMat[1][3]));
    coordConverted.z = papayaRoundFast((coord.x * this.orientMat[2][0]) + (coord.y * this.orientMat[2][1]) +
        (coord.z * this.orientMat[2][2]) + (this.orientMat[2][3]));
    return coordConverted;
};



papaya.volume.Orientation.prototype.createInfo = function (imageDimensions, voxelDimensions) {
    var xMultiply, yMultiply, zMultiply, xSubtract, ySubtract, zSubtract, colOrientation, rowOrientation,
        sliceOrientation, numCols, numRows, numSlices, numVoxelsInSlice, colSize, rowSize, sliceSize;

    numCols = imageDimensions.cols;
    numRows = imageDimensions.rows;
    numSlices = imageDimensions.slices;
    numVoxelsInSlice = imageDimensions.getNumVoxelsSlice();

    colSize = voxelDimensions.colSize;
    rowSize = voxelDimensions.rowSize;
    sliceSize = voxelDimensions.sliceSize;

    colOrientation = (this.orientation.charAt(3) === '+');
    rowOrientation = (this.orientation.charAt(4) === '+');
    sliceOrientation = (this.orientation.charAt(5) === '+');

    if (this.orientation.toUpperCase().indexOf("XYZ") !== -1) {
        imageDimensions.xDim = numCols;
        imageDimensions.yDim = numRows;
        imageDimensions.zDim = numSlices;
        voxelDimensions.xSize = colSize;
        voxelDimensions.ySize = rowSize;
        voxelDimensions.zSize = sliceSize;

        this.xIncrement = 1;
        this.yIncrement = numCols;
        this.zIncrement = numVoxelsInSlice;

        if (colOrientation) {
            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numCols - 1;
        }

        if (rowOrientation) {
            yMultiply = -1;
            ySubtract = numRows - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }

        if (sliceOrientation) {
            zMultiply = -1;
            zSubtract = numSlices - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }
    } else if (this.orientation.toUpperCase().indexOf("XZY") !== -1) {
        imageDimensions.xDim = numCols;
        imageDimensions.yDim = numSlices;
        imageDimensions.zDim = numRows;
        voxelDimensions.xSize = colSize;
        voxelDimensions.ySize = sliceSize;
        voxelDimensions.zSize = rowSize;

        this.xIncrement = 1;
        this.yIncrement = numVoxelsInSlice;
        this.zIncrement = numCols;

        if (colOrientation) {

            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numCols - 1;
        }

        if (rowOrientation) {

            zMultiply = -1;
            zSubtract = numRows - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }

        if (sliceOrientation) {
            yMultiply = -1;
            ySubtract = numSlices - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }
    } else if (this.orientation.toUpperCase().indexOf("YXZ") !== -1) {
        imageDimensions.xDim = numRows;
        imageDimensions.yDim = numCols;
        imageDimensions.zDim = numSlices;
        voxelDimensions.xSize = rowSize;
        voxelDimensions.ySize = colSize;
        voxelDimensions.zSize = sliceSize;

        this.xIncrement = numCols;
        this.yIncrement = 1;
        this.zIncrement = numVoxelsInSlice;

        if (colOrientation) {
            yMultiply = -1;
            ySubtract = numCols - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }

        if (rowOrientation) {
            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numRows - 1;
        }

        if (sliceOrientation) {
            zMultiply = -1;
            zSubtract = numSlices - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }
    } else if (this.orientation.toUpperCase().indexOf("YZX") !== -1) {
        imageDimensions.xDim = numSlices;
        imageDimensions.yDim = numCols;
        imageDimensions.zDim = numRows;
        voxelDimensions.xSize = sliceSize;
        voxelDimensions.ySize = colSize;
        voxelDimensions.zSize = rowSize;

        this.xIncrement = numVoxelsInSlice;
        this.yIncrement = 1;
        this.zIncrement = numCols;

        if (colOrientation) {
            yMultiply = -1;
            ySubtract = numCols - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }

        if (rowOrientation) {
            zMultiply = -1;
            zSubtract = numRows - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }

        if (sliceOrientation) {
            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numSlices - 1;
        }
    } else if (this.orientation.toUpperCase().indexOf("ZXY") !== -1) {
        imageDimensions.xDim = numRows;
        imageDimensions.yDim = numSlices;
        imageDimensions.zDim = numCols;
        voxelDimensions.xSize = rowSize;
        voxelDimensions.ySize = sliceSize;
        voxelDimensions.zSize = colSize;

        this.xIncrement = numCols;
        this.yIncrement = numVoxelsInSlice;
        this.zIncrement = 1;

        if (colOrientation) {
            zMultiply = -1;
            zSubtract = numCols - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }

        if (rowOrientation) {
            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numRows - 1;
        }

        if (sliceOrientation) {
            yMultiply = -1;
            ySubtract = numSlices - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }
    } else if (this.orientation.toUpperCase().indexOf("ZYX") !== -1) {
        imageDimensions.xDim = numSlices;
        imageDimensions.yDim = numRows;
        imageDimensions.zDim = numCols;
        voxelDimensions.xSize = sliceSize;
        voxelDimensions.ySize = rowSize;
        voxelDimensions.zSize = colSize;

        this.xIncrement = numVoxelsInSlice;
        this.yIncrement = numCols;
        this.zIncrement = 1;

        if (colOrientation) {
            zMultiply = -1;
            zSubtract = numCols - 1;
        } else {
            zMultiply = 1;
            zSubtract = 0;
        }

        if (rowOrientation) {
            yMultiply = -1;
            ySubtract = numRows - 1;
        } else {
            yMultiply = 1;
            ySubtract = 0;
        }

        if (sliceOrientation) {
            xMultiply = 1;
            xSubtract = 0;
        } else {
            xMultiply = -1;
            xSubtract = numSlices - 1;
        }
    }

    this.orientMat = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];

    this.orientMat[0][0] = xMultiply;
    this.orientMat[0][1] = 0;
    this.orientMat[0][2] = 0;
    this.orientMat[0][3] = xSubtract;

    this.orientMat[1][0] = 0;
    this.orientMat[1][1] = yMultiply;
    this.orientMat[1][2] = 0;
    this.orientMat[1][3] = ySubtract;

    this.orientMat[2][0] = 0;
    this.orientMat[2][1] = 0;
    this.orientMat[2][2] = zMultiply;
    this.orientMat[2][3] = zSubtract;

    this.orientMat[3][0] = 0;
    this.orientMat[3][1] = 0;
    this.orientMat[3][2] = 0;
    this.orientMat[3][3] = 1;
};



papaya.volume.Orientation.prototype.isValid = function () {
    return papaya.volume.Orientation.isValidOrientationString(this.orientation);
};



papaya.volume.Orientation.prototype.getOrientationDescription = function () {
    var ornt = this.orientation;
    return ("Cols (" + ornt.charAt(0) + ornt.charAt(3) + "), Rows (" + ornt.charAt(1) + ornt.charAt(4) + "), Slices (" +
        ornt.charAt(2) + ornt.charAt(5) + ")");
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.Transform = papaya.volume.Transform || function (mat, volume) {
    this.voxelValue = new papaya.volume.VoxelValue(volume.imageData, volume.header.imageType,
        volume.header.imageDimensions, volume.header.imageRange, volume.header.orientation);
    this.voxelDimensions = volume.header.voxelDimensions;
    this.imageDimensions = volume.header.imageDimensions;
    this.volume = volume;
    this.mat = papaya.volume.Transform.IDENTITY.clone();
    this.indexMat = papaya.volume.Transform.IDENTITY.clone();
    this.sizeMat = papaya.volume.Transform.IDENTITY.clone();
    this.sizeMatInverse = papaya.volume.Transform.IDENTITY.clone();
    this.mmMat = papaya.volume.Transform.IDENTITY.clone();
    this.worldMat = papaya.volume.Transform.IDENTITY.clone();
    this.worldMatNifti = null;
    this.originMat = papaya.volume.Transform.IDENTITY.clone();
    this.tempMat = papaya.volume.Transform.IDENTITY.clone();
    this.tempMat2 = papaya.volume.Transform.IDENTITY.clone();
    this.orientMat = papaya.volume.Transform.IDENTITY.clone();
    this.centerMat = papaya.volume.Transform.IDENTITY.clone();
    this.centerMatInverse = papaya.volume.Transform.IDENTITY.clone();
    this.rotMatX = papaya.volume.Transform.IDENTITY.clone();
    this.rotMatY = papaya.volume.Transform.IDENTITY.clone();
    this.rotMatZ = papaya.volume.Transform.IDENTITY.clone();
    this.rotMat = papaya.volume.Transform.IDENTITY.clone();

    this.updateTransforms(mat);
};


/*** Static Pseudo-constants ***/

papaya.volume.Transform.IDENTITY = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
papaya.volume.Transform.EPSILON = 0.00001;


/*** Static Methods ***/

papaya.volume.Transform.printTransform = function (mat) {
    console.log(mat[0][0] + " " + mat[0][1] + " " + mat[0][2] + " " + mat[0][3]);
    console.log(mat[1][0] + " " + mat[1][1] + " " + mat[1][2] + " " + mat[1][3]);
    console.log(mat[2][0] + " " + mat[2][1] + " " + mat[2][2] + " " + mat[2][3]);
    console.log(mat[3][0] + " " + mat[3][1] + " " + mat[3][2] + " " + mat[3][3]);
};



papaya.volume.Transform.decompose = function (mat) {
    var xTrans, yTrans, zTrans, xRot, yRot, zRot, xScale, yScale, zScale, tempK1, tempK2, tempK3, tempK4, tempK5,
        tempK6, tempM1, tempM2, tempM3, tempM4, tempM5, tempM6, tempM7, tempM8, tempM9, tempN1, tempN2, tempN3, tempN4,
        tempN5, tempN6, xSkew, ySkew, zSkew, decomposedParams;

    decomposedParams = [];

    xTrans = papaya.volume.Transform.validateNum(mat[0][3]); // xTrans
    yTrans = papaya.volume.Transform.validateNum(mat[1][3]); // yTrans
    zTrans = papaya.volume.Transform.validateNum(mat[2][3]); // zTrans

    xRot = papaya.volume.Transform.validateNum(Math.atan(mat[2][1] / mat[2][2])); // xRot

    yRot = 0;

    if (xRot === 0) {
        yRot = papaya.volume.Transform.validateNum(Math.atan(-1 * Math.cos(xRot) * (mat[2][0] / mat[2][2])));
    } else {
        yRot = papaya.volume.Transform.validateNum(Math.atan(-1 * Math.sin(xRot) * (mat[2][0] / mat[2][1])));
    }

    if (yRot === 0) {
        yRot = papaya.volume.Transform.EPSILON;
    }

    zScale = papaya.volume.Transform.validateScale(mat[2][2] / (Math.cos(yRot) * Math.cos(xRot))); // zScale

    tempK1 = Math.cos(xRot);
    tempK2 = (Math.sin(xRot) * Math.sin(yRot)) + (Math.sin(xRot) * (Math.cos(yRot) / Math.tan(yRot)));
    tempK3 = (mat[1][0] * (Math.sin(xRot) / Math.tan(yRot))) + mat[1][1];
    tempK4 = -1 * Math.sin(xRot);
    tempK5 = (Math.cos(xRot) * Math.sin(yRot)) + (Math.cos(xRot) * (Math.cos(yRot) / Math.tan(yRot)));
    tempK6 = (mat[1][0] * (Math.cos(xRot) / Math.tan(yRot))) + mat[1][2];

    zRot = papaya.volume.Transform.validateNum(Math.atan((((tempK1 * tempK6) - (tempK3 * tempK4)) / ((tempK3 * tempK5) -
        (tempK2 * tempK6))))); // zRot

    yScale = papaya.volume.Transform.validateScale((tempK3 / ((Math.cos(zRot) * tempK1) +
        (Math.sin(zRot) * tempK2)))); // yScale
    xSkew = papaya.volume.Transform.validateNum((((yScale * Math.sin(zRot) * Math.cos(yRot)) - mat[1][0]) /
        (zScale * Math.sin(yRot)))); // xSkew

    tempM1 = Math.cos(yRot) * Math.cos(zRot);
    tempM2 = yScale * Math.cos(yRot) * Math.sin(zRot);
    tempM3 = -1 * zScale * Math.sin(yRot);
    tempM4 = (Math.sin(xRot) * Math.sin(yRot) * Math.cos(zRot)) - (Math.cos(xRot) * Math.sin(zRot));
    tempM5 = (Math.sin(xRot) * Math.sin(yRot) * Math.sin(zRot)) + (Math.cos(xRot) * Math.cos(zRot));
    tempM6 = zScale * Math.sin(xRot) * Math.cos(yRot);
    tempM7 = (Math.cos(xRot) * Math.sin(yRot) * Math.cos(zRot)) + (Math.sin(xRot) * Math.sin(zRot));
    tempM8 = (Math.cos(xRot) * Math.sin(yRot) * Math.sin(zRot)) - (Math.sin(xRot) * Math.cos(zRot));
    tempM9 = zScale * Math.cos(xRot) * Math.cos(yRot);
    tempN1 = (tempM2 * tempM4) - (tempM1 * tempM5);
    tempN2 = (tempM3 * tempM4) - (tempM1 * tempM6);
    tempN3 = (tempM4 * mat[0][0]) - (tempM1 * mat[0][1]);
    tempN4 = (tempM2 * tempM7) - (tempM1 * tempM8);
    tempN5 = (tempM3 * tempM7) - (tempM1 * tempM9);
    tempN6 = (tempM7 * mat[0][0]) - (tempM1 * mat[0][2]);

    ySkew = papaya.volume.Transform.validateNum((((tempN4 * tempN3) - (tempN6 * tempN1)) / ((tempN2 * tempN4) -
        (tempN1 * tempN5)))); // ySkew
    zSkew = papaya.volume.Transform.validateNum((((tempN3 * tempN5) - (tempN2 * tempN6)) / ((tempN1 * tempN5) -
        (tempN2 * tempN4)))); // zSkew
    xScale = papaya.volume.Transform.validateScale(((mat[0][0] - (zSkew * tempM2) - (ySkew * tempM3)) /
        tempM1)); // xScale

    if (yRot === papaya.volume.Transform.EPSILON) {
        yRot = 0;
    }

    xRot *= (180 / Math.PI);
    yRot *= (180 / Math.PI);
    zRot *= (180 / Math.PI);

    decomposedParams[0] = papaya.volume.Transform.validateZero(xTrans);
    decomposedParams[1] = papaya.volume.Transform.validateZero(yTrans);
    decomposedParams[2] = papaya.volume.Transform.validateZero(zTrans);

    decomposedParams[3] = papaya.volume.Transform.validateZero(xRot);
    decomposedParams[4] = papaya.volume.Transform.validateZero(yRot);
    decomposedParams[5] = papaya.volume.Transform.validateZero(zRot);

    decomposedParams[6] = xScale;
    decomposedParams[7] = yScale;
    decomposedParams[8] = zScale;

    decomposedParams[9] = papaya.volume.Transform.validateZero(xSkew);
    decomposedParams[10] = papaya.volume.Transform.validateZero(ySkew);
    decomposedParams[11] = papaya.volume.Transform.validateZero(zSkew);

    return decomposedParams;
};



papaya.volume.Transform.hasRotations = function (mat) {
    var decomp, epsilon, rotX, rotY, rotZ;

    if (mat !== null) {
        decomp = papaya.volume.Transform.decompose(mat);
        epsilon = 0.01;

        rotX = (Math.abs(1 - (Math.abs(decomp[3]) / 90.0)) % 1);
        rotY = (Math.abs(1 - (Math.abs(decomp[4]) / 90.0)) % 1);
        rotZ = (Math.abs(1 - (Math.abs(decomp[5]) / 90.0)) % 1);

        return ((rotX > epsilon) || (rotY > epsilon) || (rotZ > epsilon));
    }

    return false;
};



papaya.volume.Transform.validateNum = function (num) {
    if ((num === Number.POSITIVE_INFINITY) || (num === Number.NEGATIVE_INFINITY)) {
        return 0;
    }

    if (isNaN(num)) {
        return 0;
    }

    if (num === 0) {  // catch negative zeros
        return 0;
    }

    return num;
};



papaya.volume.Transform.validateScale = function (num) {
    if ((num === Number.POSITIVE_INFINITY) || (num === Number.NEGATIVE_INFINITY)) {
        return 1;
    }

    if (isNaN(num)) {
        return 1;
    }

    return num;
};



papaya.volume.Transform.validateZero = function (num) {
    if (Math.abs(num) < papaya.volume.Transform.EPSILON) {
        return 0;
    }

    return num;
};


/*** Prototype Methods ***/

papaya.volume.Transform.prototype.updateSizeMat = function () {
    this.sizeMat[0][0] = this.voxelDimensions.xSize;
    this.sizeMat[1][1] = this.voxelDimensions.ySize;
    this.sizeMat[2][2] = this.voxelDimensions.zSize;
    this.sizeMat[3][3] = 1;

    this.sizeMatInverse[0][0] = 1 / this.voxelDimensions.xSize;
    this.sizeMatInverse[1][1] = 1 / this.voxelDimensions.ySize;
    this.sizeMatInverse[2][2] = 1 / this.voxelDimensions.zSize;
    this.sizeMatInverse[3][3] = 1;
};



papaya.volume.Transform.prototype.updateOrientMat = function () {
    this.orientMat = this.volume.header.orientation.orientMat;
};



papaya.volume.Transform.prototype.updateIndexTransform = function () {
    var ctrOut, ctrIn;
    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.indexMat[ctrOut][ctrIn] = (this.orientMat[ctrOut][0] * this.mat[0][ctrIn]) +
            (this.orientMat[ctrOut][1] * this.mat[1][ctrIn]) +
            (this.orientMat[ctrOut][2] * this.mat[2][ctrIn]) +
            (this.orientMat[ctrOut][3] * this.mat[3][ctrIn]);
        }
    }
};



papaya.volume.Transform.prototype.updateMmTransform = function () {
    var ctrOut, ctrIn;
    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.mmMat[ctrOut][ctrIn] = (this.indexMat[ctrOut][0] * this.sizeMatInverse[0][ctrIn]) +
            (this.indexMat[ctrOut][1] * this.sizeMatInverse[1][ctrIn]) +
            (this.indexMat[ctrOut][2] * this.sizeMatInverse[2][ctrIn]) +
            (this.indexMat[ctrOut][3] * this.sizeMatInverse[3][ctrIn]);
        }
    }
};



papaya.volume.Transform.prototype.updateOriginMat = function () {
    this.originMat[0][0] = 1;
    this.originMat[1][1] = -1;
    this.originMat[2][2] = -1;
    this.originMat[3][3] = 1;
    this.originMat[0][3] = this.volume.header.origin.x;
    this.originMat[1][3] = this.volume.header.origin.y;
    this.originMat[2][3] = this.volume.header.origin.z;
};



papaya.volume.Transform.prototype.updateImageMat = function (centerX, centerY, centerZ, rotX, rotY, rotZ) {
    var theta, cosTheta, sinTheta, ctrOut, ctrIn;
    this.updateCenterMat(centerX, centerY, centerZ);


    theta = (rotX * Math.PI) / 180.0;
    cosTheta = Math.cos(theta);
    sinTheta = Math.sin(theta);
    this.rotMatX[1][1] = cosTheta;
    this.rotMatX[1][2] = sinTheta;
    this.rotMatX[2][1] = -1 * sinTheta;
    this.rotMatX[2][2] = cosTheta;

    theta = (rotY * Math.PI) / 180.0;
    cosTheta = Math.cos(theta);
    sinTheta = Math.sin(theta);
    this.rotMatY[0][0] = cosTheta;
    this.rotMatY[0][2] = -1 * sinTheta;
    this.rotMatY[2][0] = sinTheta;
    this.rotMatY[2][2] = cosTheta;

    theta = (rotZ * Math.PI) / 180.0;
    cosTheta = Math.cos(theta);
    sinTheta = Math.sin(theta);
    this.rotMatZ[0][0] = cosTheta;
    this.rotMatZ[0][1] = sinTheta;
    this.rotMatZ[1][0] = -1 * sinTheta;
    this.rotMatZ[1][1] = cosTheta;

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.tempMat[ctrOut][ctrIn] =
                (this.rotMatX[ctrOut][0] * this.rotMatY[0][ctrIn]) +
                (this.rotMatX[ctrOut][1] * this.rotMatY[1][ctrIn]) +
                (this.rotMatX[ctrOut][2] * this.rotMatY[2][ctrIn]) +
                (this.rotMatX[ctrOut][3] * this.rotMatY[3][ctrIn]);
        }
    }

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.rotMat[ctrOut][ctrIn] =
                (this.tempMat[ctrOut][0] * this.rotMatZ[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * this.rotMatZ[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * this.rotMatZ[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * this.rotMatZ[3][ctrIn]);
        }
    }

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.tempMat[ctrOut][ctrIn] =
                (this.sizeMatInverse[ctrOut][0] * this.centerMatInverse[0][ctrIn]) +
                (this.sizeMatInverse[ctrOut][1] * this.centerMatInverse[1][ctrIn]) +
                (this.sizeMatInverse[ctrOut][2] * this.centerMatInverse[2][ctrIn]) +
                (this.sizeMatInverse[ctrOut][3] * this.centerMatInverse[3][ctrIn]);
        }
    }

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.tempMat2[ctrOut][ctrIn] =
                (this.tempMat[ctrOut][0] * this.rotMat[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * this.rotMat[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * this.rotMat[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * this.rotMat[3][ctrIn]);
        }
    }

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.tempMat[ctrOut][ctrIn] =
                (this.tempMat2[ctrOut][0] * this.centerMat[0][ctrIn]) +
                (this.tempMat2[ctrOut][1] * this.centerMat[1][ctrIn]) +
                (this.tempMat2[ctrOut][2] * this.centerMat[2][ctrIn]) +
                (this.tempMat2[ctrOut][3] * this.centerMat[3][ctrIn]);
        }
    }

    for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
        for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
            this.tempMat2[ctrOut][ctrIn] =
                (this.tempMat[ctrOut][0] * this.sizeMat[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * this.sizeMat[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * this.sizeMat[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * this.sizeMat[3][ctrIn]);
        }
    }

    this.volume.transform.updateTransforms(this.tempMat2);
};



papaya.volume.Transform.prototype.updateCenterMat = function (x, y, z) {
    this.centerMat[0][0] = 1;
    this.centerMat[1][1] = 1;
    this.centerMat[2][2] = 1;
    this.centerMat[3][3] = 1;
    this.centerMat[0][3] = -1 * x;
    this.centerMat[1][3] = -1 * y;
    this.centerMat[2][3] = -1 * z;

    this.centerMatInverse[0][0] = 1;
    this.centerMatInverse[1][1] = 1;
    this.centerMatInverse[2][2] = 1;
    this.centerMatInverse[3][3] = 1;
    this.centerMatInverse[0][3] = x;
    this.centerMatInverse[1][3] = y;
    this.centerMatInverse[2][3] = z;
};



papaya.volume.Transform.prototype.updateWorldMat = function () {
    var ctrOut, ctrIn, flipMat, originNiftiMat;

    if (this.worldMatNifti) {
        flipMat = [[ -1, 0, 0, this.imageDimensions.xDim - 1 ], [ 0, 1, 0, 0 ], [ 0, 0, 1, 0 ], [ 0, 0, 0, 1 ]];

        originNiftiMat = papaya.volume.Transform.IDENTITY.clone();
        originNiftiMat[0][0] = -1;
        originNiftiMat[1][1] = -1;
        originNiftiMat[2][2] = -1;
        originNiftiMat[3][3] = 1;
        originNiftiMat[0][3] = this.volume.header.origin.x;
        originNiftiMat[1][3] = this.volume.header.origin.y;
        originNiftiMat[2][3] = this.volume.header.origin.z;

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat[ctrOut][ctrIn] = (this.sizeMat[ctrOut][0] * originNiftiMat[0][ctrIn]) +
                (this.sizeMat[ctrOut][1] * originNiftiMat[1][ctrIn]) +
                (this.sizeMat[ctrOut][2] * originNiftiMat[2][ctrIn]) +
                (this.sizeMat[ctrOut][3] * originNiftiMat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat2[ctrOut][ctrIn] = (this.tempMat[ctrOut][0] * flipMat[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * flipMat[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * flipMat[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * flipMat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat[ctrOut][ctrIn] = (this.tempMat2[ctrOut][0] * this.mat[0][ctrIn]) +
                (this.tempMat2[ctrOut][1] * this.mat[1][ctrIn]) +
                (this.tempMat2[ctrOut][2] * this.mat[2][ctrIn]) +
                (this.tempMat2[ctrOut][3] * this.mat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat2[ctrOut][ctrIn] = (this.tempMat[ctrOut][0] * flipMat[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * flipMat[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * flipMat[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * flipMat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat[ctrOut][ctrIn] = (this.tempMat2[ctrOut][0] * originNiftiMat[0][ctrIn]) +
                (this.tempMat2[ctrOut][1] * originNiftiMat[1][ctrIn]) +
                (this.tempMat2[ctrOut][2] * originNiftiMat[2][ctrIn]) +
                (this.tempMat2[ctrOut][3] * originNiftiMat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat2[ctrOut][ctrIn] = (this.tempMat[ctrOut][0] * this.sizeMatInverse[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * this.sizeMatInverse[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * this.sizeMatInverse[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * this.sizeMatInverse[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.worldMat[ctrOut][ctrIn] = (this.worldMatNifti[ctrOut][0] * this.tempMat2[0][ctrIn]) +
                (this.worldMatNifti[ctrOut][1] * this.tempMat2[1][ctrIn]) +
                (this.worldMatNifti[ctrOut][2] * this.tempMat2[2][ctrIn]) +
                (this.worldMatNifti[ctrOut][3] * this.tempMat2[3][ctrIn]);
            }
        }
    } else {
        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.tempMat[ctrOut][ctrIn] = (this.indexMat[ctrOut][0] * this.originMat[0][ctrIn]) +
                (this.indexMat[ctrOut][1] * this.originMat[1][ctrIn]) +
                (this.indexMat[ctrOut][2] * this.originMat[2][ctrIn]) +
                (this.indexMat[ctrOut][3] * this.originMat[3][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                this.worldMat[ctrOut][ctrIn] = (this.tempMat[ctrOut][0] * this.sizeMatInverse[0][ctrIn]) +
                (this.tempMat[ctrOut][1] * this.sizeMatInverse[1][ctrIn]) +
                (this.tempMat[ctrOut][2] * this.sizeMatInverse[2][ctrIn]) +
                (this.tempMat[ctrOut][3] * this.sizeMatInverse[3][ctrIn]);
            }
        }
    }
};



papaya.volume.Transform.prototype.updateTransforms = function (mat) {
    this.mat = mat;

    this.updateSizeMat();
    this.updateOrientMat();
    this.updateOriginMat();
    this.updateIndexTransform();
    this.updateMmTransform();
    this.updateWorldMat();
};



papaya.volume.Transform.prototype.getVoxelAtIndexNative = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.voxelValue.getVoxelAtIndexNative(ctrX, ctrY, ctrZ, timepoint, useNN);
};



papaya.volume.Transform.prototype.getVoxelAtIndex = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.voxelValue.getVoxelAtIndex(ctrX, ctrY, ctrZ, timepoint, useNN);
};



papaya.volume.Transform.prototype.getVoxelAtCoordinate = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    var xTrans, yTrans, zTrans;
    xTrans = ((xLoc * this.worldMat[0][0]) + (yLoc * this.worldMat[0][1]) + (zLoc * this.worldMat[0][2]) +
        (this.worldMat[0][3]));
    yTrans = ((xLoc * this.worldMat[1][0]) + (yLoc * this.worldMat[1][1]) + (zLoc * this.worldMat[1][2]) +
        (this.worldMat[1][3]));
    zTrans = ((xLoc * this.worldMat[2][0]) + (yLoc * this.worldMat[2][1]) + (zLoc * this.worldMat[2][2]) +
        (this.worldMat[2][3]));

    return this.voxelValue.getVoxelAtIndexNative(xTrans, yTrans, zTrans, timepoint, useNN);
};



papaya.volume.Transform.prototype.getVoxelAtMM = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    var xTrans, yTrans, zTrans;
    xTrans = ((xLoc * this.mmMat[0][0]) + (yLoc * this.mmMat[0][1]) + (zLoc * this.mmMat[0][2]) + (this.mmMat[0][3]));
    yTrans = ((xLoc * this.mmMat[1][0]) + (yLoc * this.mmMat[1][1]) + (zLoc * this.mmMat[1][2]) + (this.mmMat[1][3]));
    zTrans = ((xLoc * this.mmMat[2][0]) + (yLoc * this.mmMat[2][1]) + (zLoc * this.mmMat[2][2]) + (this.mmMat[2][3]));

    return this.voxelValue.getVoxelAtIndexNative(xTrans, yTrans, zTrans, timepoint, useNN);
};

/*jslint browser: true, node: true */
/*global GUNZIP_MAGIC_COOKIE1, GUNZIP_MAGIC_COOKIE2, Base64Binary, pako, numeric */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.Volume = papaya.volume.Volume || function (progressMeter, dialogHandler, params) {
    this.progressMeter = progressMeter;
    this.dialogHandler = dialogHandler;
    this.files = [];
    this.rawData = [];
    this.fileLength = 0;
    this.urls = null;
    this.fileName = null;
    this.compressed = false;
    this.transform = null;
    this.numTimepoints = 0;
    this.onFinishedRead = null;
    this.error = null;
    this.transform = null;
    this.isLoaded = false;
    this.numTimepoints = 1;
    this.loaded = false;
    this.params = params;

    this.header = new papaya.volume.Header((this.params !== undefined) && this.params.padAllImages);
    this.imageData = new papaya.volume.ImageData((this.params !== undefined) && this.params.padAllImages);
};


/*** Static Pseudo-constants ***/

papaya.volume.Volume.PROGRESS_LABEL_LOADING = "Loading";


/*** Prototype Methods ***/

papaya.volume.Volume.prototype.fileIsCompressed = function (filename, data) {
    var buf, magicCookie1, magicCookie2;

    if (filename.indexOf(".gz") !== -1) {
        return true;
    }

    if (data) {
        buf = new DataView(data);

        magicCookie1 = buf.getUint8(0);
        magicCookie2 = buf.getUint8(1);

        if (magicCookie1 === GUNZIP_MAGIC_COOKIE1) {
            return true;
        }

        if (magicCookie2 === GUNZIP_MAGIC_COOKIE2) {
            return true;
        }
    }

    return false;
};



papaya.volume.Volume.prototype.readFiles = function (files, callback) {
    this.files = files;
    this.fileName = files[0].name;
    this.onFinishedRead = callback;
    this.compressed = this.fileIsCompressed(this.fileName);
    this.fileLength = this.files[0].size;
    this.readNextFile(this, 0);
};



papaya.volume.Volume.prototype.readNextFile = function (vol, index) {
    var blob;

    if (index < this.files.length) {
        blob = papaya.utilities.PlatformUtils.makeSlice(this.files[index], 0, this.files[index].size);

        try {
            var reader = new FileReader();

            reader.onloadend = papaya.utilities.ObjectUtils.bind(vol, function (evt) {
                if (evt.target.readyState === FileReader.DONE) {
                    vol.rawData[index] = evt.target.result;
                    setTimeout(function () {vol.readNextFile(vol, index + 1); }, 0);
                }
            });

            reader.onerror = papaya.utilities.ObjectUtils.bind(vol, function (evt) {
                vol.error = new Error("There was a problem reading that file:\n\n" + evt.getMessage());
                vol.finishedLoad();
            });

            reader.readAsArrayBuffer(blob);
        } catch (err) {
            vol.error = new Error("There was a problem reading that file:\n\n" + err.message);
            vol.finishedLoad();
        }
    } else {
        setTimeout(function () {vol.decompress(vol); }, 0);
    }
};



papaya.volume.Volume.prototype.readURLs = function (urls, callback) {
    var self = this;
    this.urls = urls;
    this.fileName = urls[0].substr(urls[0].lastIndexOf("/") + 1, urls[0].length);
    this.onFinishedRead = callback;
    this.compressed = this.fileIsCompressed(this.fileName);

    this.rawData = [];
    this.loadedFileCount = 0;
    this.readEachURL(this)
        .done(function () {
            // recieves `arguments` which are results off xhr requests
            setTimeout(function () {self.decompress(self); }, 0);
        })
        .fail(function (vol, err, xhr) {

            var message = err.message || '';
            // if error came from ajax request
            if ( typeof xhr !== "undefined" ) {
                message = "Response status = " + xhr.status;
            }

            vol.error = new Error("There was a problem reading that file (" +
                vol.fileName + "):\n\n" + message);
            vol.finishedLoad();
        });

};



papaya.volume.Volume.prototype.loadURL = function (url, vol) {
    var supported, deferredLoading, xhr, progPerc, progressText;

    deferredLoading = jQuery.Deferred();

    supported = typeof new XMLHttpRequest().responseType === 'string';
    if (supported) {
        xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    vol.fileLength = vol.rawData.byteLength;
                    deferredLoading.resolve( xhr.response );
                } else {
                    deferredLoading.reject(vol,false,xhr);
                }
            }
        };

        xhr.onprogress = function (evt) {
            if(evt.lengthComputable) {
                deferredLoading.notify(evt.loaded, evt.total);
            }
        };

        xhr.send(null);
    } else {
        vol.error = new Error("There was a problem reading that file (" + vol.fileName +
            "):\n\nResponse type is not supported.");
        vol.finishedLoad();
    }

    var promise = deferredLoading
        .promise()
        .done(function (file) {
            vol.loadedFileCount++;
            vol.rawData.push(file);
        })
        .fail(function (vol, err, xhr) {
            console.error(vol, err, xhr);
        })
        .progress(function (loaded,total) {
            progPerc = parseInt(100 * (vol.loadedFileCount) / vol.urls.length, 10);
            progressText = papaya.volume.Volume.PROGRESS_LABEL_LOADING +
                ' image ' + (vol.loadedFileCount + 1) + ' of ' + vol.urls.length + ' (' + progPerc + '%)';
            vol.progressMeter.drawProgress(loaded / total, progressText);
        });

    return promise;
};



papaya.volume.Volume.prototype.readEachURL = function (vol, index) {
    var deferredLoads = [];
    for (var i = 0; i < vol.urls.length; i++) {
        var getFileDeferred = vol.loadURL( vol.urls[i], vol );
        deferredLoads.push(
            getFileDeferred
        );
    }
    return $.when.apply($, deferredLoads);
};



papaya.volume.Volume.prototype.readEncodedData = function (names, callback) {
    var vol = null;

    try {
        this.fileName = names[0];
        this.onFinishedRead = callback;
        vol = this;
        this.fileLength = 0;
        vol.readNextEncodedData(vol, 0, names);
    } catch (err) {
        if (vol) {
            vol.error = new Error("There was a problem reading that file:\n\n" + err.message);
            vol.finishedLoad();
        }
    }
};



papaya.volume.Volume.prototype.readNextEncodedData = function (vol, index, names) {
    if (index < names.length) {
        try {
            vol.rawData[index] = Base64Binary.decodeArrayBuffer(papaya.utilities.ObjectUtils.dereference(names[index]));
            vol.compressed = this.fileIsCompressed(this.fileName, vol.rawData[index]);
            setTimeout(function () {vol.readNextEncodedData(vol, index + 1, names); }, 0);
        } catch (err) {
            if (vol) {
                vol.error = new Error("There was a problem reading that file:\n\n" + err.message);
                vol.finishedLoad();
            }
        }
    } else {
        vol.decompress(vol);
    }
};



papaya.volume.Volume.prototype.getVoxelAtIndexNative = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.transform.getVoxelAtIndexNative(ctrX, ctrY, ctrZ, 0, useNN);
};



papaya.volume.Volume.prototype.getVoxelAtIndex = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    return this.transform.getVoxelAtIndex(ctrX, ctrY, ctrZ, timepoint, useNN);
};



papaya.volume.Volume.prototype.getVoxelAtCoordinate = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    return this.transform.getVoxelAtCoordinate(xLoc, yLoc, zLoc, timepoint, useNN);
};



papaya.volume.Volume.prototype.getVoxelAtMM = function (xLoc, yLoc, zLoc, timepoint, useNN) {
    return this.transform.getVoxelAtMM(xLoc, yLoc, zLoc, timepoint, useNN);
};



papaya.volume.Volume.prototype.hasError = function () {
    return (this.error !== null);
};



papaya.volume.Volume.prototype.getXDim = function () {
    return this.header.imageDimensions.xDim;
};



papaya.volume.Volume.prototype.getYDim = function () {
    return this.header.imageDimensions.yDim;
};



papaya.volume.Volume.prototype.getZDim = function () {
    return this.header.imageDimensions.zDim;
};



papaya.volume.Volume.prototype.getXSize = function () {
    return this.header.voxelDimensions.xSize;
};



papaya.volume.Volume.prototype.getYSize = function () {
    return this.header.voxelDimensions.ySize;
};



papaya.volume.Volume.prototype.getZSize = function () {
    return this.header.voxelDimensions.zSize;
};



papaya.volume.Volume.prototype.decompress = function (vol) {
    if (vol.compressed) {
        try {
            pako.inflate(new Uint8Array(vol.rawData[0]), null, this.progressMeter,
                function (data) {vol.finishedDecompress(vol, data.buffer); });
        } catch (err) {
            console.log(err);
        }
    } else {
        setTimeout(function () {vol.finishedReadData(vol); }, 0);
    }
};



papaya.volume.Volume.prototype.finishedDecompress = function (vol, data) {
    vol.rawData[0] = data;
    setTimeout(function () {vol.finishedReadData(vol); }, 0);
};



papaya.volume.Volume.prototype.finishedReadData = function (vol) {
    vol.header.readHeaderData(vol.fileName, vol.rawData, this.progressMeter, this.dialogHandler,
        papaya.utilities.ObjectUtils.bind(this, this.finishedReadHeaderData));
};



papaya.volume.Volume.prototype.finishedReadHeaderData = function () {
    this.rawData = null;

    if (this.header.hasError()) {
        this.error = this.header.error;
        console.error(this.error.stack);
        this.onFinishedRead(this);
        return;
    }

    this.header.imageType.swapped = (this.header.imageType.littleEndian !== papaya.utilities.PlatformUtils.isPlatformLittleEndian());

    var name = this.header.getName();

    if (name) {
        this.fileName = this.header.getName();
    }

    this.header.readImageData(this.progressMeter, papaya.utilities.ObjectUtils.bind(this, this.finishedReadImageData));
};



papaya.volume.Volume.prototype.finishedReadImageData = function (imageData) {
    this.imageData.readFileData(this.header, imageData, papaya.utilities.ObjectUtils.bind(this, this.finishedLoad));
};



papaya.volume.Volume.prototype.finishedLoad = function () {
    if (!this.loaded) {
        this.loaded = true;
        if (this.onFinishedRead) {
            if (!this.hasError()) {
                this.transform = new papaya.volume.Transform(papaya.volume.Transform.IDENTITY.clone(), this);
                this.numTimepoints = this.header.imageDimensions.timepoints || 1;
                this.applyBestTransform();
            } else {
                console.log(this.error);
            }

            this.isLoaded = true;
            this.rawData = null;
            this.onFinishedRead(this);
        }
    }
};



papaya.volume.Volume.prototype.setOrigin = function (coord) {
    var coordNew = this.header.orientation.convertCoordinate(coord, new papaya.core.Coordinate(0, 0, 0));
    this.header.origin.setCoordinate(coordNew.x, coordNew.y, coordNew.z);
};



papaya.volume.Volume.prototype.getOrigin = function () {
    return this.header.orientation.convertCoordinate(this.header.origin, new papaya.core.Coordinate(0, 0, 0));
};



papaya.volume.Volume.prototype.applyBestTransform = function () {
    var bestXform = this.header.getBestTransform();

    if (bestXform !== null) {
        this.transform.worldMatNifti = numeric.inv(bestXform);
        this.setOrigin(this.header.getBestTransformOrigin());
        this.transform.updateWorldMat();
    }
};



papaya.volume.Volume.prototype.isWorldSpaceOnly = function () {
    /*jslint bitwise: true */

    var nifti, foundDataOrderTransform = false;

    if (this.header.fileFormat instanceof papaya.volume.nifti.HeaderNIFTI) {
        nifti = this.header.fileFormat;

        if (nifti.nifti.qform_code > 0) {
            foundDataOrderTransform |= !nifti.qFormHasRotations();
        }

        if (nifti.nifti.sform_code > 0) {
            foundDataOrderTransform |= !nifti.sFormHasRotations();
        }

        return !foundDataOrderTransform;
    }

    return false;
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.VoxelDimensions = papaya.volume.VoxelDimensions || function (colSize, rowSize, sliceSize, timeSize) {
    this.colSize = Math.abs(colSize);
    this.rowSize = Math.abs(rowSize);
    this.sliceSize = Math.abs(sliceSize);
    this.xSize = 0;
    this.ySize = 0;
    this.zSize = 0;
    this.timeSize = timeSize;
    this.spatialUnit = papaya.volume.VoxelDimensions.UNITS_UNKNOWN;
    this.temporalUnit = papaya.volume.VoxelDimensions.UNITS_UNKNOWN;
};

/*** Static Pseudo-constants ***/

papaya.volume.VoxelDimensions.UNITS_UNKNOWN = 0;
papaya.volume.VoxelDimensions.UNITS_METER = 1;
papaya.volume.VoxelDimensions.UNITS_MM = 2;
papaya.volume.VoxelDimensions.UNITS_MICRON = 3;
papaya.volume.VoxelDimensions.UNITS_SEC = 8;
papaya.volume.VoxelDimensions.UNITS_MSEC = 16;
papaya.volume.VoxelDimensions.UNITS_USEC = 24;
papaya.volume.VoxelDimensions.UNITS_HZ = 32;
papaya.volume.VoxelDimensions.UNITS_PPM = 40;
papaya.volume.VoxelDimensions.UNITS_RADS = 48;

papaya.volume.VoxelDimensions.UNIT_STRINGS = [];
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_UNKNOWN] = "Unknown Unit";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_METER] = "Meters";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_MM] = "Millimeters";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_MICRON] = "Microns";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_SEC] = "Seconds";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_MSEC] = "Milliseconds";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_USEC] = "Microseconds";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_HZ] = "Hertz";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_PPM] = "Parts-per-million";
papaya.volume.VoxelDimensions.UNIT_STRINGS[papaya.volume.VoxelDimensions.UNITS_RADS] = "Radians-per-second";


/*** Prototype Methods ***/

papaya.volume.VoxelDimensions.prototype.isValid = function () {
    return ((this.colSize > 0) && (this.rowSize > 0) && (this.sliceSize > 0) && (this.timeSize >= 0));
};



papaya.volume.VoxelDimensions.prototype.getSpatialUnitString = function () {
    return papaya.volume.VoxelDimensions.UNIT_STRINGS[this.spatialUnit];
};



papaya.volume.VoxelDimensions.prototype.getTemporalUnitString = function () {
    return papaya.volume.VoxelDimensions.UNIT_STRINGS[this.temporalUnit];
};


papaya.volume.VoxelDimensions.prototype.getTemporalUnitMultiplier = function () {
    if (this.temporalUnit === papaya.volume.VoxelDimensions.UNITS_MSEC) {
        return 0.001;
    }

    if (this.temporalUnit === papaya.volume.VoxelDimensions.UNITS_USEC) {
        return 0.000001;
    }

    return 1;
};

/*jslint browser: true, node: true */
/*global papayaRoundFast */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.volume.VoxelValue = papaya.volume.VoxelValue || function (imageData, imageType, imageDimensions, imageRange,
                                                                 orientation) {
    this.imageData = imageData;
    this.imageType = imageType;
    this.imageRange = imageRange;
    this.orientation = orientation;
    this.swap16 = ((this.imageType.numBytes === 2) && this.imageType.swapped) &&
        (this.imageType.datatype !== papaya.volume.ImageType.DATATYPE_FLOAT);
    this.swap32 = ((this.imageType.numBytes === 4) && this.imageType.swapped) &&
        (this.imageType.datatype !== papaya.volume.ImageType.DATATYPE_FLOAT);
    this.xIncrement = orientation.xIncrement;
    this.yIncrement = orientation.yIncrement;
    this.zIncrement = orientation.zIncrement;
    this.xDim = imageDimensions.xDim;
    this.yDim = imageDimensions.yDim;
    this.zDim = imageDimensions.zDim;
    this.sliceSize = imageDimensions.getNumVoxelsSlice();
    this.volSize = imageDimensions.getNumVoxelsVolume();
    this.dataScaleSlopes = imageRange.dataScaleSlopes;
    this.dataScaleIntercepts = imageRange.dataScaleIntercepts;
    this.globalDataScaleSlope = imageRange.globalDataScaleSlope;
    this.globalDataScaleIntercept = imageRange.globalDataScaleIntercept;
    this.usesGlobalDataScale = imageRange.usesGlobalDataScale;
    this.interpFirstPass = [[0, 0], [0, 0]];
    this.interpSecondPass = [0, 0];
    this.forceABS = false;
};


/*** Prototype Methods ***/

papaya.volume.VoxelValue.prototype.getVoxelAtIndexNative = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    if (useNN) {
        ctrX = papayaRoundFast(ctrX);
        ctrY = papayaRoundFast(ctrY);
        ctrZ = papayaRoundFast(ctrZ);

        return this.getVoxelAtOffset(this.orientation.convertIndexToOffsetNative(ctrX, ctrY, ctrZ), timepoint, ctrX, ctrY, ctrZ);
    }

    return this.getVoxelAtIndexLinear(ctrX, ctrY, ctrZ, timepoint);
};



papaya.volume.VoxelValue.prototype.getVoxelAtIndex = function (ctrX, ctrY, ctrZ, timepoint, useNN) {
    if (useNN) {
        ctrX = papayaRoundFast(ctrX);
        ctrY = papayaRoundFast(ctrY);
        ctrZ = papayaRoundFast(ctrZ);

        return this.getVoxelAtOffset(this.orientation.convertIndexToOffset(ctrX, ctrY, ctrZ), timepoint, ctrX, ctrY, ctrZ);
    }

    return this.getVoxelAtIndexLinear(ctrX, ctrY, ctrZ, timepoint);
};



papaya.volume.VoxelValue.prototype.getVoxelAtOffset = function (volOffset, timepoint, xLoc, yLoc, zLoc) {
    var dataScaleIndex,
        offset = volOffset + (this.volSize * timepoint), value;

    if ((xLoc < 0) || (xLoc >= this.xDim) || (yLoc < 0) || (yLoc >= this.yDim) || (zLoc < 0) || (zLoc >= this.zDim)) {
        return 0;
    }

    if (this.usesGlobalDataScale) {
        value = (this.checkSwap(this.imageData.data[offset]) * this.globalDataScaleSlope) +
            this.globalDataScaleIntercept;
    } else {
        dataScaleIndex = parseInt(offset / this.sliceSize);
        value = (this.checkSwap(this.imageData.data[offset]) * this.dataScaleSlopes[dataScaleIndex]) +
            this.dataScaleIntercepts[dataScaleIndex];
    }

    if (this.forceABS) {
        return Math.abs(value);
    } else {
        return value;
    }
};



papaya.volume.VoxelValue.prototype.getVoxelAtIndexLinear = function (xLoc, yLoc, zLoc, timepoint) {
    var value, fracX, fracY, fracZ, tempVal1, tempVal2, offset, xInt, yInt, zInt, interpolateX, interpolateY,
        interpolateZ, ctrX, ctrY;
    value = tempVal1 = tempVal2 = 0;

    xInt = Math.floor(xLoc);
    yInt = Math.floor(yLoc);
    zInt = Math.floor(zLoc);

    fracX = xLoc - xInt;
    fracY = yLoc - yInt;
    fracZ = zLoc - zInt;

    interpolateX = (fracX !== 0);
    interpolateY = (fracY !== 0);
    interpolateZ = (fracZ !== 0);

    if (interpolateX && interpolateY && interpolateZ) {
        for (ctrX = 0; ctrX < 2; ctrX +=  1) {
            for (ctrY = 0; ctrY < 2; ctrY += 1) {
                offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt + ctrY, zInt);
                tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt + ctrY, zInt) * (1 - fracZ);
                offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt + ctrY, zInt + 1);
                tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt + ctrY, zInt + 1) * fracZ;
                this.interpFirstPass[ctrX][ctrY] = tempVal1 + tempVal2;
            }
        }

        this.interpSecondPass[0] = (this.interpFirstPass[0][0] * (1 - fracY)) + (this.interpFirstPass[0][1] * fracY);
        this.interpSecondPass[1] = (this.interpFirstPass[1][0] * (1 - fracY)) + (this.interpFirstPass[1][1] * fracY);

        value = (this.interpSecondPass[0] * (1 - fracX)) + (this.interpSecondPass[1] * fracX);
    } else if (interpolateX && interpolateY && !interpolateZ) {
        for (ctrX = 0; ctrX < 2; ctrX += 1) {
            offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt, zInt);
            tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt, zInt) * (1 - fracY);
            offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt + 1, zInt);
            tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt + 1, zInt) * fracY;
            this.interpSecondPass[ctrX] = tempVal1 + tempVal2;
        }

        value = (this.interpSecondPass[0] * (1 - fracX)) + (this.interpSecondPass[1] * fracX);
    } else if (interpolateX && !interpolateY && interpolateZ) {
        for (ctrX = 0; ctrX < 2; ctrX += 1) {
            offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt, zInt);
            tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt, zInt) * (1 - fracZ);
            offset = this.orientation.convertIndexToOffsetNative(xInt + ctrX, yInt, zInt + 1);
            tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt + ctrX, yInt, zInt + 1) * fracZ;
            this.interpSecondPass[ctrX] = tempVal1 + tempVal2;
        }

        value = (this.interpSecondPass[0] * (1 - fracX)) + (this.interpSecondPass[1] * fracX);
    } else if (!interpolateX && interpolateY && interpolateZ) {
        for (ctrY = 0; ctrY < 2; ctrY += 1) {
            offset = this.orientation.convertIndexToOffsetNative(xInt, yInt + ctrY, zInt);
            tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt + ctrY, zInt) * (1 - fracZ);
            offset = this.orientation.convertIndexToOffsetNative(xInt, yInt + ctrY, zInt + 1);
            tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt + ctrY, zInt + 1) * fracZ;
            this.interpSecondPass[ctrY] = tempVal1 + tempVal2;
        }

        value = (this.interpSecondPass[0] * (1 - fracY)) + (this.interpSecondPass[1] * fracY);
    } else if (!interpolateX && !interpolateY && interpolateZ) {
        offset = this.orientation.convertIndexToOffsetNative(xInt, yInt, zInt);
        tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt, zInt)* (1 - fracZ);
        offset = this.orientation.convertIndexToOffsetNative(xInt, yInt, zInt + 1);
        tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt, zInt + 1) * fracZ;
        value = tempVal1 + tempVal2;
    } else if (!interpolateX && interpolateY && !interpolateZ) {
        offset = this.orientation.convertIndexToOffsetNative(xInt, yInt, zInt);
        tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt, zInt) * (1 - fracY);
        offset = this.orientation.convertIndexToOffsetNative(xInt, yInt + 1, zInt);
        tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt + 1, zInt) * fracY;
        value = tempVal1 + tempVal2;
    } else if (interpolateX && !interpolateY && !interpolateZ) {
        offset = this.orientation.convertIndexToOffsetNative(xInt, yInt, zInt);
        tempVal1 = this.getVoxelAtOffset(offset, timepoint, xInt, yInt, zInt) * (1 - fracX);
        offset = this.orientation.convertIndexToOffsetNative(xInt + 1, yInt, zInt);
        tempVal2 = this.getVoxelAtOffset(offset, timepoint, xInt + 1, yInt, zInt)* fracX;
        value = tempVal1 + tempVal2;
    } else { // if(!interpolateX && !interpolateY && !interpolateZ)
        value = this.getVoxelAtOffset(this.orientation.convertIndexToOffsetNative(xLoc, yLoc, zLoc), timepoint, xLoc, yLoc, zLoc);
    }

    return value;
};



papaya.volume.VoxelValue.prototype.checkSwap = function (val) {
    /*jslint bitwise: true */

    if (this.swap16) {
        return ((((val & 0xFF) << 8) | ((val >> 8) & 0xFF)) << 16) >> 16;  // since JS uses 32-bit  when bit shifting
    }

    if (this.swap32) {
        return ((val & 0xFF) << 24) | ((val & 0xFF00) << 8) | ((val >> 8) & 0xFF00) | ((val >> 24) & 0xFF);
    }

    return val;
};

/*jslint browser: true, node: true */
/*global  */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.surface = papaya.surface || {};


/*** Constructor ***/
papaya.surface.SurfaceGIFTI = papaya.surface.SurfaceGIFTI || function () {
    this.gii = null;
    this.error = null;
    this.pointData = null;
    this.triangleData = null;
    this.normalsData = null;
    this.colorsData = null;
    this.onFinishedRead = null;
};


/*** Prototype Methods ***/

papaya.surface.SurfaceGIFTI.prototype.isSurfaceDataBinary = function () {
    return false;
};



papaya.surface.SurfaceGIFTI.prototype.readData = function (data, progress, onFinishedRead) {
    var surf = this;

    progress(0);
    this.onFinishedRead = onFinishedRead;
    this.gii = gifti.parse(data);

    setTimeout(function() { surf.readDataPoints(surf, progress); }, 0);
};



papaya.surface.SurfaceGIFTI.prototype.readDataPoints = function (surf, progress) {
    progress(0.2);

    if (surf.gii.getPointsDataArray() != null) {
        surf.pointData = surf.gii.getPointsDataArray().getData();
    } else {
        surf.error = new Error("Surface is missing point information!");
    }

    setTimeout(function() { surf.readDataNormals(surf, progress); }, 0);
};



papaya.surface.SurfaceGIFTI.prototype.readDataNormals = function (surf, progress) {
    progress(0.4);

    if (surf.gii.getNormalsDataArray() != null) {
        surf.normalsData = surf.gii.getNormalsDataArray().getData();
    }

    setTimeout(function() { surf.readDataTriangles(surf, progress); }, 0);
};



papaya.surface.SurfaceGIFTI.prototype.readDataTriangles = function (surf, progress) {
    progress(0.6);

    if (surf.gii.getTrianglesDataArray() != null) {
        surf.triangleData = surf.gii.getTrianglesDataArray().getData();
    } else {
        surf.error = Error("Surface is missing triangle information!");
    }

    setTimeout(function() { surf.readDataColors(surf, progress); }, 0);
};



papaya.surface.SurfaceGIFTI.prototype.readDataColors = function (surf, progress) {
    progress(0.8);

    if (surf.gii.getColorsDataArray() != null) {
        surf.colorsData = surf.gii.getColorsDataArray().getData();
    }

    setTimeout(function() { surf.onFinishedRead(); }, 0);
};



papaya.surface.SurfaceGIFTI.prototype.getNumSurfaces = function () {
    return 1;
};



papaya.surface.SurfaceGIFTI.prototype.getNumPoints = function () {
    return this.gii.getNumPoints();
};



papaya.surface.SurfaceGIFTI.prototype.getNumTriangles = function () {
    return this.gii.getNumTriangles();
};



papaya.surface.SurfaceGIFTI.prototype.getPointData = function () {
    return this.pointData;
};



papaya.surface.SurfaceGIFTI.prototype.getNormalsData = function () {
    return this.normalsData;
};



papaya.surface.SurfaceGIFTI.prototype.getTriangleData = function () {
    return this.triangleData;
};



papaya.surface.SurfaceGIFTI.prototype.getColorsData = function () {
    return this.colorsData;
};



papaya.surface.SurfaceGIFTI.prototype.getSolidColor = function () {
    return this.solidColor;
};

/*jslint browser: true, node: true */
/*global  */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.surface = papaya.surface || {};


/*** Constructor ***/
papaya.surface.SurfaceMango = papaya.surface.SurfaceMango || function () {
        this.error = null;
        this.onFinishedRead = null;
        this.origin = [];
        this.imageDims = [];
        this.voxelDims = [];
        this.center = [];
        this.diffs = [];
        this.dv = null;
        this.index = 0;
        this.surfaceIndex = 0;
        this.dataLength = 0;
        this.numSurfaces = 0;
        this.littleEndian = false;
        this.surfaces = [];
        this.v14 = false;
        this.v15 = false;
    };



papaya.surface.SurfaceMangoData = papaya.surface.SurfaceMangoData || function () {
        this.pointData = null;
        this.triangleData = null;
        this.normalsData = null;
        this.colorsData = null;
        this.solidColor = [];
    };


/*** Constants ***/

papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5 = [ 'm', 'a', 'n', 'g', 'o', 'l', '1', '5' ];
papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_5 = [ 'm', 'a', 'n', 'g', 'o', 'b', '1', '5' ];
papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_4 = [ 'm', 'a', 'n', 'g', 'o', 'l', '1', '4' ];
papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_4 = [ 'm', 'a', 'n', 'g', 'o', 'b', '1', '4' ];
papaya.surface.SurfaceMango.SURFACE_OVERLAY_MAGIC_NUMBER = [ 0, 0, 0, 0, 's', 'c', 'a', 'l' ];
papaya.surface.SurfaceMango.NAME_SIZE = 64;



/*** Static Methods ***/

papaya.surface.SurfaceMango.isThisFormat = function (filename) {
    return filename.endsWith(".surf");
};



/*** Prototype Methods ***/

papaya.surface.SurfaceMango.prototype.isSurfaceDataBinary = function () {
    return true;
};



papaya.surface.SurfaceMango.prototype.isLittleEndian15 = function (data) {
    var data2 = new Uint8Array(data), ctr;

    for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5.length; ctr += 1) {
        if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5[ctr].charCodeAt(0)) {
            return false;
        }
    }

    return true;
};



papaya.surface.SurfaceMango.prototype.isLittleEndian14 = function (data) {
    var data2 = new Uint8Array(data), ctr;

    for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_4.length; ctr += 1) {
        if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_4[ctr].charCodeAt(0)) {
            return false;
        }
    }

    return true;
};


papaya.surface.SurfaceMango.prototype.isVersion15 = function (data) {
    var data2 = new Uint8Array(data), ctr, match = true;

    for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5.length; ctr += 1) {
        if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5[ctr].charCodeAt(0)) {
            match = false;
            break;
        }
    }

    if (!match) {
        match = true;

        for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_5.length; ctr += 1) {
            if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_5[ctr].charCodeAt(0)) {
                match = false;
                break;
            }
        }
    }

    return match;
};



papaya.surface.SurfaceMango.prototype.isVersion14 = function (data) {
    var data2 = new Uint8Array(data), ctr, match = true;

    for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_4.length; ctr += 1) {
        if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_4[ctr].charCodeAt(0)) {
            match = false;
            break;
        }
    }

    if (!match) {
        match = true;

        for (ctr = 0; ctr < papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_4.length; ctr += 1) {
            if (data2[ctr] !== papaya.surface.SurfaceMango.MAGIC_NUMBER_BIG_1_4[ctr].charCodeAt(0)) {
                match = false;
                break;
            }
        }
    }

    return match;
};


papaya.surface.SurfaceMango.prototype.isLittleEndian = function (data) {
    return this.isLittleEndian15(data) || this.isLittleEndian14(data);
};



papaya.surface.SurfaceMango.prototype.hasOverlay = function () {
    var ctr, val;

    for (ctr = 0; ctr < papaya.surface.SurfaceMango.SURFACE_OVERLAY_MAGIC_NUMBER.length; ctr += 1) {
        val = papaya.surface.SurfaceMango.SURFACE_OVERLAY_MAGIC_NUMBER[ctr];

        if (val) {
            val = papaya.surface.SurfaceMango.SURFACE_OVERLAY_MAGIC_NUMBER[ctr].charCodeAt(0);
        }

        if (this.dv.getUint8(this.index + ctr) !== val) {
            return false;
        }
    }

    return true;
};



papaya.surface.SurfaceMango.prototype.getString = function (length) {
    var ctr, array = [];

    for (ctr = 0; ctr < length; ctr += 1) {
        array[ctr] = this.dv.getUint8(this.index + ctr);
    }

    return String.fromCharCode.apply(null, array)
};



papaya.surface.SurfaceMango.prototype.readData = function (data, progress, onFinishedRead) {
    var previewLength;

    progress(0.2);

    this.littleEndian = this.isLittleEndian(data);
    this.dataLength = data.byteLength;
    this.v14 = this.isVersion14(data);
    this.v15 = this.isVersion15(data);
    this.index = papaya.surface.SurfaceMango.MAGIC_NUMBER_LITTLE_1_5.length;
    this.dv = new DataView(data);

    if (!(this.v14 || this.v15)) {
        throw new Error("Only Mango surface format version 1.4 and 1.5 are supported!");
    }

    this.onFinishedRead = onFinishedRead;

    previewLength = this.dv.getUint32(this.index, this.littleEndian); this.index += 4;
    this.numSurfaces = this.dv.getUint32(this.index, this.littleEndian); this.index += 4;
    this.index += (16 * 8); // angle state

    this.imageDims[0] = this.dv.getUint32(this.index, this.littleEndian); this.index += 4;
    this.imageDims[1] = this.dv.getUint32(this.index, this.littleEndian); this.index += 4;
    this.imageDims[2] = this.dv.getUint32(this.index, this.littleEndian); this.index += 4;

    this.voxelDims[0] = this.dv.getFloat32(this.index, this.littleEndian); this.index += 4;
    this.voxelDims[1] = this.dv.getFloat32(this.index, this.littleEndian); this.index += 4;
    this.voxelDims[2] = this.dv.getFloat32(this.index, this.littleEndian); this.index += 4;

    this.origin[0] = this.dv.getFloat32(this.index, this.littleEndian) * this.voxelDims[0]; this.index += 4;
    this.origin[1] = this.dv.getFloat32(this.index, this.littleEndian) * this.voxelDims[1]; this.index += 4;
    this.origin[2] = this.dv.getFloat32(this.index, this.littleEndian) * this.voxelDims[2]; this.index += 4;

    this.center[0] = ((this.imageDims[0] * this.voxelDims[0]) / 2.0);
    this.center[1] = ((this.imageDims[1] * this.voxelDims[1]) / 2.0);
    this.center[2] = ((this.imageDims[2] * this.voxelDims[2]) / 2.0);

    if (this.v14) {
        this.diffs[0] = this.center[0] - this.origin[0];
        this.diffs[1] = this.center[1] - this.origin[1];
        this.diffs[2] = this.origin[2] - this.center[2];
    } else {
        this.diffs[0] = this.center[0] - this.origin[0];
        this.diffs[1] = this.center[1] - this.origin[1];
        this.diffs[2] = this.center[2] - this.origin[2];
    }

    this.index += 4; // threshold
    this.index += previewLength;

    this.readNextSurface(this, progress);
};



papaya.surface.SurfaceMango.prototype.readNextSurface = function (surf, progress) {
    var surfData = new papaya.surface.SurfaceMangoData();

    surf.index += papaya.surface.SurfaceMango.NAME_SIZE;
    surf.surfaces[surf.surfaceIndex] = surfData;

    surf.surfaces[surf.surfaceIndex].solidColor[0] = surf.dv.getFloat32(surf.index, surf.littleEndian);  surf.index += 4;
    surf.surfaces[surf.surfaceIndex].solidColor[1] = surf.dv.getFloat32(surf.index, surf.littleEndian);  surf.index += 4;
    surf.surfaces[surf.surfaceIndex].solidColor[2] = surf.dv.getFloat32(surf.index, surf.littleEndian);  surf.index += 4;

    setTimeout(function() { surf.readDataPoints(surf, progress); }, 0);
};



papaya.surface.SurfaceMango.prototype.readDataPoints = function (surf, progress) {
    var numPointVals, ctr;

    progress(0.4);

    surf.index += 4; // num parts (should always be 1)
    numPointVals = surf.dv.getInt32(surf.index, surf.littleEndian); surf.index += 4;
    surf.surfaces[surf.surfaceIndex].pointData = new Float32Array(numPointVals);

    if (surf.v14) {
        for (ctr = 0; ctr < numPointVals; ctr += 1, surf.index += 4) {
            surf.surfaces[surf.surfaceIndex].pointData[ctr] = (((ctr % 3) !== 2) ? -1 : 1) *
                (surf.dv.getFloat32(surf.index, surf.littleEndian) +
                (surf.diffs[ctr % 3]));
        }
    } else {
        for (ctr = 0; ctr < numPointVals; ctr += 1, surf.index += 4) {
            surf.surfaces[surf.surfaceIndex].pointData[ctr] = (((ctr % 3) !== 0) ? -1 : 1) *
                (surf.dv.getFloat32(surf.index, surf.littleEndian) +
                (surf.diffs[ctr % 3]));
        }
    }

    setTimeout(function() { surf.readDataNormals(surf, progress); }, 0);
};



papaya.surface.SurfaceMango.prototype.readDataNormals = function (surf, progress) {
    var numNormalVals, ctr;

    progress(0.6);

    surf.index += 4; // num parts (should always be 1)
    numNormalVals = surf.dv.getInt32(surf.index, surf.littleEndian); surf.index += 4;
    surf.surfaces[surf.surfaceIndex].normalsData = new Float32Array(numNormalVals);

    if (surf.v14) {
        for (ctr = 0; ctr < numNormalVals; ctr += 1, surf.index += 4) {
            surf.surfaces[surf.surfaceIndex].normalsData[ctr] = (((ctr % 3) !== 2) ? -1 : 1) *
                surf.dv.getFloat32(surf.index, surf.littleEndian);
        }
    } else {
        for (ctr = 0; ctr < numNormalVals; ctr += 1, surf.index += 4) {
            surf.surfaces[surf.surfaceIndex].normalsData[ctr] = (((ctr % 3) !== 0) ? -1 : 1) *
                surf.dv.getFloat32(surf.index, surf.littleEndian);
        }
    }

    setTimeout(function() { surf.readDataTriangles(surf, progress); }, 0);
};



papaya.surface.SurfaceMango.prototype.readDataTriangles = function (surf, progress) {
    var numIndexVals, ctr;

    progress(0.8);

    surf.index += 4; // num parts (should always be 1)
    numIndexVals = surf.dv.getInt32(surf.index, surf.littleEndian); surf.index += 4;
    surf.surfaces[surf.surfaceIndex].triangleData = new Uint32Array(numIndexVals);
    for (ctr = 0; ctr < numIndexVals; ctr += 1, surf.index += 4) {
        surf.surfaces[surf.surfaceIndex].triangleData[ctr] = surf.dv.getUint32(surf.index, surf.littleEndian);
    }

    setTimeout(function() { surf.readDataColors(surf, progress); }, 0);
};



papaya.surface.SurfaceMango.prototype.readDataColors = function (surf, progress) {
    var min, max, ratio, numScalars, length, scalars, val, scalar, colorTableName, ctr, colorTable, hasOverlay = false;

    while (surf.index < surf.dataLength) {
        if (surf.hasOverlay()) {
            hasOverlay = true;
            surf.index += papaya.surface.SurfaceMango.SURFACE_OVERLAY_MAGIC_NUMBER.length;
            surf.index += papaya.surface.SurfaceMango.NAME_SIZE;
            colorTableName = surf.getString(papaya.surface.SurfaceMango.NAME_SIZE); surf.index += papaya.surface.SurfaceMango.NAME_SIZE;
            colorTableName = colorTableName.replace(/\0/g, '');

            surf.index += 4; // alpha (ignore)
            min = surf.dv.getFloat32(this.index, this.littleEndian); surf.index += 4;
            max = surf.dv.getFloat32(this.index, this.littleEndian); surf.index += 4;
            ratio = 255.0 / (max - min);
            surf.index += 4; // brightness (ignore)
            surf.index += 4; // num parts (should always be 1)
            numScalars = surf.dv.getUint32(this.index, this.littleEndian); surf.index += 4;
            scalars = new Float32Array(numScalars);

            for (ctr = 0; ctr < numScalars; ctr += 1, surf.index += 4) {
                scalars[ctr] = surf.dv.getFloat32(surf.index, surf.littleEndian);
            }

            if (papaya.viewer.ColorTable.findLUT(colorTableName) !== papaya.viewer.ColorTable.TABLE_GRAYSCALE) {
                colorTable = new papaya.viewer.ColorTable(colorTableName, false);
            } else {
                colorTable = new papaya.viewer.ColorTable("Spectrum", false);
            }

            colorTable.updateLUT(0, 255);
            length = surf.surfaces[surf.surfaceIndex].pointData.length / 3;

            if (surf.surfaces[surf.surfaceIndex].colorsData === null) {
                surf.surfaces[surf.surfaceIndex].colorsData = new Float32Array(length * 4);
            }

            for (ctr = 0; ctr < length; ctr += 1) {
                scalar = scalars[ctr];

                if (scalar <= min) {
                    if (surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 3] === 0) {
                        surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4)] = surf.surfaces[surf.surfaceIndex].solidColor[0];
                        surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 1] = surf.surfaces[surf.surfaceIndex].solidColor[1];
                        surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 2] = surf.surfaces[surf.surfaceIndex].solidColor[2];
                        surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 3] = 1;
                    }
                } else if (scalar > max) {
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4)] = colorTable.lookupRed(255) / 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 1] = colorTable.lookupGreen(255)/ 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 2] = colorTable.lookupBlue(255) / 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 3] = 1;
                } else {
                    val = Math.floor(((scalar - min) * ratio) + .5);
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4)] = colorTable.lookupRed(val) / 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 1] = colorTable.lookupGreen(val)/ 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 2] = colorTable.lookupBlue(val) / 255.0;
                    surf.surfaces[surf.surfaceIndex].colorsData[(ctr * 4) + 3] = 1;
                }
            }
        } else {
            break;
        }
    }

    surf.surfaceIndex++;

    if (surf.surfaceIndex === surf.numSurfaces) {
        setTimeout(function() { surf.onFinishedRead(); }, 0);
    } else {
        setTimeout(function() { surf.readNextSurface(surf, progress); }, 0);
    }
};



papaya.surface.SurfaceMango.prototype.getNumSurfaces = function () {
    return this.numSurfaces;
};



papaya.surface.SurfaceMango.prototype.getNumPoints = function (index) {
    return this.surfaces[index].pointData.length / 3;
};



papaya.surface.SurfaceMango.prototype.getNumTriangles = function (index) {
    return this.surfaces[index].triangleData.length / 3;
};



papaya.surface.SurfaceMango.prototype.getSolidColor = function (index) {
    return this.surfaces[index].solidColor;
};



papaya.surface.SurfaceMango.prototype.getPointData = function (index) {
    return this.surfaces[index].pointData;
};



papaya.surface.SurfaceMango.prototype.getNormalsData = function (index) {
    return this.surfaces[index].normalsData;
};



papaya.surface.SurfaceMango.prototype.getTriangleData = function (index) {
    return this.surfaces[index].triangleData;
};



papaya.surface.SurfaceMango.prototype.getColorsData = function (index) {
    return this.surfaces[index].colorsData;
};

/*jslint browser: true, node: true */
/*global  */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.surface = papaya.surface || {};


/*** Constructor ***/
papaya.surface.Surface = papaya.surface.Surface || function (progressMeter, params) {
    this.progressMeter = progressMeter;
    this.error = null;
    this.filename = null;
    this.rawData = null;
    this.onFinishedRead = null;
    this.pointData = null;
    this.triangleData = null;
    this.normalsData = null;
    this.colorsData = null;
    this.numPoints = 0;
    this.numTriangles = 0;
    this.pointsBuffer = null;
    this.trianglesBuffer = null;
    this.normalsBuffer = null;
    this.colorsBuffer = null;
    this.solidColor = null;
    this.surfaceType = papaya.surface.Surface.SURFACE_TYPE_UNKNOWN;
    this.fileFormat = null;
    this.params = params;
    this.nextSurface = null;
    this.alpha = 1;
};

/*** Static Pseudo-constants ***/

papaya.surface.Surface.SURFACE_TYPE_UNKNOWN = 0;
papaya.surface.Surface.SURFACE_TYPE_GIFTI = 1;
papaya.surface.Surface.SURFACE_TYPE_MANGO = 2;



/*** Static Methods ***/

papaya.surface.Surface.findSurfaceType = function (filename) {
    if (gifti.isThisFormat(filename)) {
        return papaya.surface.Surface.SURFACE_TYPE_GIFTI;
    } else if (papaya.surface.SurfaceMango.isThisFormat(filename)) {
        return papaya.surface.Surface.SURFACE_TYPE_MANGO;
    }

    return papaya.surface.Surface.SURFACE_TYPE_UNKNOWN;
};




/*** Prototype Methods ***/

papaya.surface.Surface.prototype.makeFileFormat = function (filename) {
    this.surfaceType = papaya.surface.Surface.findSurfaceType(filename);

    if (this.surfaceType === papaya.surface.Surface.SURFACE_TYPE_GIFTI) {
        this.fileFormat = new papaya.surface.SurfaceGIFTI();
    } else if (this.surfaceType === papaya.surface.Surface.SURFACE_TYPE_MANGO) {
        this.fileFormat = new papaya.surface.SurfaceMango();
    }
};



papaya.surface.Surface.prototype.readURL = function (url, callback) {
    var xhr, surface = this;

    this.filename = url.substr(url.lastIndexOf("/") + 1, url.length);
    this.onFinishedRead = callback;
    this.processParams(this.filename);
    this.makeFileFormat(this.filename);

    if (this.surfaceType === papaya.surface.Surface.SURFACE_TYPE_UNKNOWN) {
        this.error = new Error("This surface format is not supported!");
        this.finishedLoading();
        return;
    }

    try {
        if (typeof new XMLHttpRequest().responseType === 'string') {
            xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            if (this.fileFormat.isSurfaceDataBinary()) {
                xhr.responseType = 'arraybuffer';
            }

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        surface.rawData = xhr.response;
                        surface.finishedLoading();
                    } else {
                        surface.error = new Error("There was a problem reading that file (" + surface.filename + "):\n\nResponse status = " + xhr.status);
                        surface.finishedLoading();
                    }
                }
            };

            xhr.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    surface.progressMeter.drawProgress(evt.loaded / evt.total, papaya.volume.Volume.PROGRESS_LABEL_LOADING);
                }
            };

            xhr.send(null);
        } else {
            surface.error = new Error("There was a problem reading that file (" + surface.filename + "):\n\nResponse type is not supported.");
            surface.finishedLoading();
        }
    } catch (err) {
        if (surface !== null) {
            surface.error = new Error("There was a problem reading that file (" + surface.filename + "):\n\n" + err.message);
            surface.finishedLoading();
        }
    }
};



papaya.surface.Surface.prototype.readFile = function (file, callback) {
    var blob = papaya.utilities.PlatformUtils.makeSlice(file, 0, file.size),
        surface = this;

    this.filename = file.name;
    this.onFinishedRead = callback;
    this.processParams(this.filename);
    this.makeFileFormat(this.filename);

    if (this.surfaceType === papaya.surface.Surface.SURFACE_TYPE_UNKNOWN) {
        this.error = new Error("This surface format is not supported!");
        this.finishedLoading();
        return;
    }

    try {
        var reader = new FileReader();

        reader.onloadend = function (evt) {
            if (evt.target.readyState === FileReader.DONE) {
                surface.rawData = evt.target.result;
                surface.finishedLoading();
            }
        };

        reader.onerror = function (evt) {
            surface.error = new Error("There was a problem reading that file:\n\n" + evt.getMessage());
            surface.finishedLoading();
        };

        if (this.fileFormat.isSurfaceDataBinary()) {
            reader.readAsArrayBuffer(blob);
        } else {
            reader.readAsText(blob);
        }
    } catch (err) {
        surface.error = new Error("There was a problem reading that file:\n\n" + err.message);
        surface.finishedLoading();
    }
};



papaya.surface.Surface.prototype.readEncodedData = function (name, callback) {
    this.filename = (name + ".surf.gii");
    this.onFinishedRead = callback;
    this.processParams(name);
    this.makeFileFormat(this.filename);

    if (this.surfaceType === papaya.surface.Surface.SURFACE_TYPE_UNKNOWN) {
        this.error = new Error("This surface format is not supported!");
        this.finishedLoading();
        return;
    }

    try {
        if (this.fileFormat.isSurfaceDataBinary()) {
            this.rawData = Base64Binary.decodeArrayBuffer(papaya.utilities.ObjectUtils.dereference(name));
        } else {
            this.rawData = atob(papaya.utilities.ObjectUtils.dereference(name));
        }
    } catch (err) {
        this.error = new Error("There was a problem reading that file:\n\n" + err.message);
    }

    this.finishedLoading();
};



papaya.surface.Surface.prototype.processParams = function (name) {
    var screenParams = params[name];
    if (screenParams) {
        if (screenParams.color !== undefined) {
            this.solidColor = screenParams.color;
        }

        if (screenParams.alpha !== undefined) {
            this.alpha = screenParams.alpha;
        }
    }
};



papaya.surface.Surface.prototype.finishedLoading = function () {
    this.readData();
};



papaya.surface.Surface.prototype.readData = function () {
    if (this.error) {
        console.log(this.error);
        this.onFinishedRead(this);
        return;
    }

    var progMeter = this.progressMeter;
    var prog = function(val) {
        progMeter.drawProgress(val, "Loading surface...");
    };

    try {
        this.fileFormat.readData(this.rawData, prog, papaya.utilities.ObjectUtils.bind(this, this.finishedReading));
    } catch (err) {
        console.log(err.stack);
        this.error = err;
        this.onFinishedRead(this);
    }
};



papaya.surface.Surface.prototype.finishedReading = function () {
    var numSurfaces = this.fileFormat.getNumSurfaces(), currentSurface = this, ctr;

    if (this.fileFormat.error) {
        this.error = this.fileFormat.error;
    } else {
        for (ctr = 0; ctr < numSurfaces; ctr += 1) {
            if (ctr > 0) {
                currentSurface.nextSurface = new papaya.surface.Surface();
                currentSurface = currentSurface.nextSurface;
            }

            currentSurface.numPoints = this.fileFormat.getNumPoints(ctr);
            currentSurface.numTriangles = this.fileFormat.getNumTriangles(ctr);
            currentSurface.pointData = this.fileFormat.getPointData(ctr);
            currentSurface.normalsData = this.fileFormat.getNormalsData(ctr);
            currentSurface.triangleData = this.fileFormat.getTriangleData(ctr);
            currentSurface.colorsData = this.fileFormat.getColorsData(ctr);

            if (currentSurface.normalsData === null) {
                this.generateNormals();
            }

            if (this.fileFormat.getSolidColor(ctr)) {
                currentSurface.solidColor = this.fileFormat.getSolidColor(ctr);
            }
        }
    }

    this.progressMeter.drawProgress(1, "Loading surface...");
    this.onFinishedRead(this);
};



papaya.surface.Surface.prototype.generateNormals = function () {
    var p1 = [], p2 = [], p3 = [], normal = [], nn = [], ctr,
        normalsDataLength = this.pointData.length, numIndices,
        qx, qy, qz, px, py, pz, index1, index2, index3;

    this.normalsData = new Float32Array(normalsDataLength);

    numIndices = this.numTriangles * 3;
    for (ctr = 0; ctr < numIndices; ctr += 3) {
        index1 = this.triangleData[ctr] * 3;
        index2 = this.triangleData[ctr + 1] * 3;
        index3 = this.triangleData[ctr + 2] * 3;

        p1.x = this.pointData[index1];
        p1.y = this.pointData[index1 + 1];
        p1.z = this.pointData[index1 + 2];

        p2.x = this.pointData[index2];
        p2.y = this.pointData[index2 + 1];
        p2.z = this.pointData[index2 + 2];

        p3.x = this.pointData[index3];
        p3.y = this.pointData[index3 + 1];
        p3.z = this.pointData[index3 + 2];

        qx = p2.x - p1.x;
        qy = p2.y - p1.y;
        qz = p2.z - p1.z;
        px = p3.x - p1.x;
        py = p3.y - p1.y;
        pz = p3.z - p1.z;

        normal[0] = (py * qz) - (pz * qy);
        normal[1] = (pz * qx) - (px * qz);
        normal[2] = (px * qy) - (py * qx);

        this.normalsData[index1] += normal[0];
        this.normalsData[index1 + 1] += normal[1];
        this.normalsData[index1 + 2] += normal[2];

        this.normalsData[index2] += normal[0];
        this.normalsData[index2 + 1] += normal[1];
        this.normalsData[index2 + 2] += normal[2];

        this.normalsData[index3] += normal[0];
        this.normalsData[index3 + 1] += normal[1];
        this.normalsData[index3 + 2] += normal[2];
    }

    for (ctr = 0; ctr < normalsDataLength; ctr += 3) {
        normal[0] = -1 * this.normalsData[ctr];
        normal[1] = -1 * this.normalsData[ctr + 1];
        normal[2] = -1 * this.normalsData[ctr + 2];

        vec3.normalize(normal, nn);

        this.normalsData[ctr] = nn[0];
        this.normalsData[ctr + 1] = nn[1];
        this.normalsData[ctr + 2] = nn[2];
    }
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_DIALOG_CSS, PAPAYA_DIALOG_CONTENT_CSS, PAPAYA_DIALOG_CONTENT_LABEL_CSS, PAPAYA_DIALOG_BACKGROUND,
 PAPAYA_DIALOG_CONTENT_CONTROL_CSS, PAPAYA_DIALOG_TITLE_CSS, PAPAYA_DIALOG_STOPSCROLL, PAPAYA_DIALOG_BUTTON_CSS,
 PAPAYA_DIALOG_CONTENT_NOWRAP_CSS, PAPAYA_DIALOG_CONTENT_HELP */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.Dialog = papaya.ui.Dialog || function (container, title, content, dataSource, callback, callbackOk, modifier,
                                                 wrap) {
    this.container = container;
    this.viewer = container.viewer;
    this.title = title;
    this.modifier = "";
    if (!papaya.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = modifier;
    }
    this.id = this.title.replace(/ /g, "_");
    this.content = content;
    this.dataSource = dataSource;
    this.callback = callback;
    this.callbackOk = callbackOk;
    this.doWrap = wrap;
    this.scrollBehavior1 = null;
    this.scrollBehavior2 = null;
};


/*** Static Methods ***/

papaya.ui.Dialog.showModalDialog = function (dialog, viewer, dialogHtml) {
    var viewerWidth, viewerHeight, dialogWidth, dialogHeight, left, top;

    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop;

    viewerWidth = $(window).outerWidth();
    viewerHeight = $(window).outerHeight();

    dialogWidth = $(dialogHtml).outerWidth();
    dialogHeight = $(dialogHtml).outerHeight();

    left = (viewerWidth / 2) - (dialogWidth / 2) + "px";
    top = scrollTop + (viewerHeight / 2) - (dialogHeight / 2) + "px";

    $(dialogHtml).css({
        position: 'absolute',
        zIndex: 100,
        left: left,
        top: top
    });

    viewer.removeScroll();

    $(dialogHtml).hide().fadeIn(200);
};


/*** Prototype Methods ***/

papaya.ui.Dialog.prototype.showDialog = function () {
    var ctr, ctrOpt, html, val, itemsHtml, thisHtml, thisHtmlId, disabled, bodyHtml;

    thisHtmlId = "#" + this.id;
    thisHtml = $(thisHtmlId);
    thisHtml.remove();

    bodyHtml = $("body");

    html = "<div id='" + this.id + "' class='" + PAPAYA_DIALOG_CSS + "'><span class='" +
        PAPAYA_DIALOG_TITLE_CSS + "'>" + this.title + "</span>";

    if (this.content) {
        html += "<div class='" + PAPAYA_DIALOG_CONTENT_CSS + "'><table>";

        for (ctr = 0; ctr < this.content.items.length; ctr += 1) {
            if (this.content.items[ctr].spacer) {
                html += "<tr><td class='" + PAPAYA_DIALOG_CONTENT_LABEL_CSS + "'>&nbsp;</td><td class='" +
                    PAPAYA_DIALOG_CONTENT_CONTROL_CSS + "'>&nbsp;</td></tr>";
            } else if (this.content.items[ctr].readonly) {
                html += "<tr><td class='" + PAPAYA_DIALOG_CONTENT_LABEL_CSS + "'>" + this.content.items[ctr].label +
                    "</td><td class='" + PAPAYA_DIALOG_CONTENT_CONTROL_CSS + "' id='" + this.content.items[ctr].field +
                    "'></td></tr>";
            } else {
                if (this.content.items[ctr].disabled && (papaya.utilities.ObjectUtils.bind(this.container,
                        papaya.utilities.ObjectUtils.dereferenceIn(this, this.content.items[ctr].disabled)))() === true) {
                    disabled = "disabled='disabled'";
                } else {
                    disabled = "";
                }

                html += "<tr><td class='" + PAPAYA_DIALOG_CONTENT_LABEL_CSS + "'>" + this.content.items[ctr].label +
                    "</td><td class='" + PAPAYA_DIALOG_CONTENT_CONTROL_CSS + "'><select " + disabled +
                    " id='" + this.content.items[ctr].field + "'>";
                for (ctrOpt = 0; ctrOpt < this.content.items[ctr].options.length; ctrOpt += 1) {
                    html += "<option value='" + this.content.items[ctr].options[ctrOpt] + "'>" +
                        papaya.utilities.StringUtils.truncateMiddleString(this.content.items[ctr].options[ctrOpt].toString(), 40) + "</option>";
                }

                html += "</select></td></tr>";

                if (this.content.items[ctr].help) {
                    html += "<tr><td colspan='2' class='" + PAPAYA_DIALOG_CONTENT_HELP + "'>" + this.content.items[ctr].help + "</td></tr>";
                }
            }
        }

        html += "</table></div>";
    }

    html += "<div class='" + PAPAYA_DIALOG_BUTTON_CSS + "'><button type='button' id='" + this.id + "-Ok" +
        "'>Ok</button></div></div>";

    bodyHtml.append('<div class="' + PAPAYA_DIALOG_BACKGROUND + '"></div>');
    bodyHtml.append(html);

    for (ctr = 0; ctr < this.content.items.length; ctr += 1) {
        if (this.content.items[ctr].readonly) {
            val = this.dataSource[this.content.items[ctr].field](this.modifier);
            if (val !== null) {
                $("#" + this.content.items[ctr].field).html(val);
            } else {
                $("#" + this.content.items[ctr].field).parent().remove();
            }
        } else if (!this.content.items[ctr].spacer) {
            itemsHtml = $("#" + this.content.items[ctr].field);
            itemsHtml.val(this.dataSource[this.content.items[ctr].field]);
            itemsHtml.change(papaya.utilities.ObjectUtils.bind(this, this.doAction, [this.content.items[ctr].field]));
        }
    }

    if (!this.doWrap) {
        $("." + PAPAYA_DIALOG_CONTENT_CSS).addClass(PAPAYA_DIALOG_CONTENT_NOWRAP_CSS);
    }

    $("#" + this.id + "-Ok").click(papaya.utilities.ObjectUtils.bind(this, this.doOk));

    thisHtml = $(thisHtmlId);
    bodyHtml.addClass(PAPAYA_DIALOG_STOPSCROLL);
    papaya.ui.Dialog.showModalDialog(this, this.viewer, thisHtml[0]);
};



papaya.ui.Dialog.prototype.doOk = function () {
    var modalDialogHtml, modelDialogBackgroundHtml;

    modalDialogHtml = $("." + PAPAYA_DIALOG_CSS);
    modelDialogBackgroundHtml = $("." + PAPAYA_DIALOG_BACKGROUND);

    modalDialogHtml.hide(100);
    modelDialogBackgroundHtml.hide(100);

    modalDialogHtml.remove();
    modelDialogBackgroundHtml.remove();

    window.onmousewheel = this.scrollBehavior1;
    document.onmousewheel = this.scrollBehavior2;

    if (this.callbackOk) {
        this.callbackOk();
    }

    $("body").removeClass(PAPAYA_DIALOG_STOPSCROLL);
    this.container.viewer.addScroll();
};



papaya.ui.Dialog.prototype.doAction = function (action) {
    this.callback(action, $("#" + action).val());
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_ICON_CSS, PAPAYA_MENU_BUTTON_CSS, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_TITLEBAR_CSS,
 PAPAYA_TITLEBAR_CSS, PAPAYA_MENU_LABEL_CSS, PAPAYA_MENU_CSS, PAPAYA_MENU_BUTTON_HOVERING_CSS, PAPAYA_SPACING */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.Menu = papaya.ui.Menu || function (viewer, menuData, callback, dataSource, modifier) {
    this.viewer = viewer;
    this.method = menuData.method;
    this.isTitleBar = menuData.titleBar;
    this.label = menuData.label;
    this.icons = menuData.icons;
    this.callback = callback;
    this.dataSource = dataSource;
    this.items = [];
    this.rangeItem = null;
    this.menuOnHover = menuData.menuOnHover;
    this.contextMenu = false;

    if ((modifier === undefined) || (modifier === null)) {
        this.imageIndex = -1;
        this.modifier = this.viewer.container.containerIndex;
    } else {
        this.imageIndex = modifier;
        this.modifier = modifier + this.viewer.container.containerIndex;
    }

    this.buttonId = this.label.replace(/ /g, "_").replace("...", "_") + (this.modifier || "");
    this.menuId = (this.label + "Menu").replace(/ /g, "_").replace("...", "_") + (this.modifier || "");
    this.isRight = (menuData.icons !== null);
    this.isImageButton = menuData.imageButton;
    this.isSurfaceButton = menuData.surfaceButton;
    this.htmlParent = ((this.viewer.container.showControlBar && this.viewer.container.kioskMode && this.viewer.container.showImageButtons) ?
        this.viewer.container.sliderControlHtml : this.viewer.container.toolbarHtml);
};


/*** Static Methods ***/
// adapted from: http://stackoverflow.com/questions/158070/jquery-how-to-position-one-element-relative-to-another
papaya.ui.Menu.doShowMenu = function (viewer, el, menu, right) {
    var posV, pos, eWidth, mWidth, mHeight, left, top, dHeight;

    //get the position of the placeholder element
    posV = $(viewer.canvas).offset();
    dHeight = $(viewer.container.display.canvas).outerHeight();
    pos = $(el).offset();
    eWidth = $(el).outerWidth();
    mWidth = $(menu).outerWidth();
    mHeight = $(menu).outerHeight();
    left = pos.left + (right ? ((-1 * mWidth) + eWidth) : 5) + "px";

    if (viewer.container.showControlBar && viewer.container.kioskMode && viewer.container.showImageButtons) {
        top = ((posV.top) + $(viewer.canvas).outerHeight() + PAPAYA_SPACING + dHeight - mHeight) + "px";
    } else {
        top = (posV.top) + "px";
    }

    //show the menu directly over the placeholder
    $(menu).css({
        position: 'absolute',
        zIndex: 100,
        left: left,
        top: top
    });

    $(menu).hide().fadeIn(200);
};



papaya.ui.Menu.getColorComponents = function (rgbStr) {
    if (rgbStr) {
        return rgbStr.match(/\d+/g);
    }

    return [0, 0, 0, 255];
};



papaya.ui.Menu.getNiceForegroundColor = function (rgbStr) {
    var colors = papaya.ui.Menu.getColorComponents(rgbStr);

    var avg = (parseInt(colors[0]) + parseInt(colors[1]) + parseInt(colors[2])) / 3;

    if (avg > 127) {
        colors[0] = colors[1] = colors[2] = 0;
    } else {
        colors[0] = colors[1] = colors[2] = 255;
    }

    return ("rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")");
};


/*** Prototype Methods ***/

papaya.ui.Menu.prototype.buildMenuButton = function () {
    var html, menu, buttonHtml, buttonHtmlId, buttonImgHtml, buttonImgHtmlId;

    buttonHtmlId = "#" + this.buttonId;
    buttonHtml = $(buttonHtmlId);
    buttonHtml.remove();

    html = null;

    if (this.icons) {
        html = "<span id='" + this.buttonId + "' class='" + PAPAYA_MENU_UNSELECTABLE + " " + PAPAYA_MENU_ICON_CSS +
            " " + (this.isImageButton ? PAPAYA_MENU_BUTTON_CSS : "") + "'" +
            (this.isRight ? " style='float:right'" : "") + ">" + "<img class='" + PAPAYA_MENU_UNSELECTABLE +
            "' style='width:" + papaya.viewer.ColorTable.ICON_SIZE + "px; height:" +
            papaya.viewer.ColorTable.ICON_SIZE + "px; vertical-align:bottom; ";

        if (!this.isSurfaceButton && this.dataSource.isSelected(parseInt(this.imageIndex, 10))) {
            html += "border:2px solid #FF5A3D;background-color:#eeeeee;padding:1px;";
        } else {
            html += "border:2px outset lightgray;background-color:#eeeeee;padding:1px;";
        }

        if (this.method) {
            html += ("' src='" + this.icons[papaya.utilities.ObjectUtils.bind(this.viewer, papaya.utilities.ObjectUtils.dereferenceIn(this.viewer, this.method))() ? 1 : 0] +
                "' /></span>");
        } else {
            html += ("' src='" + this.icons[0] + "' /></span>");
        }
    } else if (this.isTitleBar) {
        html = "<div class='" + PAPAYA_MENU_UNSELECTABLE + " " + PAPAYA_MENU_TITLEBAR_CSS + " " + PAPAYA_TITLEBAR_CSS +
            "' style='z-index:-1;position:absolute;top:" +
            (this.viewer.container.viewerHtml.position().top - 1.25 * papaya.ui.Toolbar.SIZE) + "px;width:" +
            this.htmlParent.width() + "px;text-align:center;color:" + papaya.ui.Menu.getNiceForegroundColor(this.viewer.bgColor) + "'>" +
            this.label + "</div>";
    } else {
        html = "<span id='" + this.buttonId + "' class='" + PAPAYA_MENU_UNSELECTABLE + " " +
            PAPAYA_MENU_LABEL_CSS + "'>" + this.label + "</span>";
    }

    this.htmlParent.append(html);

    if (!this.isTitleBar) {
        buttonHtml = $(buttonHtmlId);
        buttonImgHtmlId = "#" + this.buttonId + " > img";
        buttonImgHtml = $(buttonImgHtmlId);

        menu = this;

        if (this.menuOnHover) {
            buttonImgHtml.mouseenter(function () { menu.showHoverMenuTimeout = setTimeout(papaya.utilities.ObjectUtils.bind(menu, menu.showMenu),
                500); });
            buttonImgHtml.mouseleave(function () { clearTimeout(menu.showHoverMenuTimeout);
                menu.showHoverMenuTimeout = null; });
        }

        buttonHtml.click(papaya.utilities.ObjectUtils.bind(this, this.doClick));

        if (this.icons) {
            buttonImgHtml.hover(
                function () {
                    if (menu.icons.length > 1) {
                        $(this).css({"border-color": "gray"});
                    } else {
                        $(this).css({"border-color": "#FF5A3D"});
                    }
                },
                papaya.utilities.ObjectUtils.bind(menu, function () {
                    if (menu.dataSource.isSelected(parseInt(menu.imageIndex, 10)) && menu.dataSource.isSelectable()) {
                        $("#" + menu.buttonId + " > img").css({"border": "2px solid #FF5A3D"});
                    } else {
                        $("#" + menu.buttonId + " > img").css({"border": "2px outset lightgray"});
                    }
                })
            );

            buttonImgHtml.mousedown(function () {
                $(this).css({ 'border': '2px inset lightgray' });
            });

            buttonImgHtml.mouseup(function () {
                $(this).css({ 'border': '2px outset lightgray' });
            });
        } else if (!this.isTitleBar) {
            buttonHtml.hover(function () {$(this).toggleClass(PAPAYA_MENU_BUTTON_HOVERING_CSS); });
        }
    }

    return this.buttonId;
};



papaya.ui.Menu.prototype.setMenuButton = function (buttonId) {
    this.buttonId = buttonId;
};



papaya.ui.Menu.prototype.buildMenu = function () {
    var ctr, html, buttonHtml;

    html = "<ul id='" + this.menuId + "' class='" + PAPAYA_MENU_CSS + "'></ul>";
    this.htmlParent.append(html);

    if (this.viewer.container.contextManager && papaya.utilities.PlatformUtils.smallScreen) {
        $('#' + this.menuId)[0].style.width = (this.viewer.viewerDim - 10) + 'px';
    }

    for (ctr = 0; ctr < this.items.length; ctr += 1) {
        if (!this.items[ctr].hide) {
            buttonHtml = this.items[ctr].buildHTML(this.menuId);
        }
    }
};



papaya.ui.Menu.prototype.addMenuItem = function (menuitem) {
    if (menuitem instanceof papaya.ui.MenuItemRange) {
        this.rangeItem = menuitem;
    }

    this.items.push(menuitem);
};



papaya.ui.Menu.prototype.showContextMenu = function () {
    var isShowing, menuHtml, menuHtmlId, mHeight, offset = 0, posV, dHeight;

    if (this.items.length > 0) {
        menuHtmlId = "#" + this.menuId;
        menuHtml = $(menuHtmlId);
        isShowing = menuHtml.is(":visible");
        menuHtml.remove();

        if (!isShowing) {
            this.htmlParent = this.viewer.container.viewerHtml;
            this.buildMenu();

            menuHtml = $(menuHtmlId);
            menuHtml.hide();

            mHeight = menuHtml.outerHeight();
            posV = $(this.viewer.canvas).offset();
            dHeight = $(this.viewer.container.display.canvas).outerHeight();

            if ((this.viewer.contextMenuMousePositionY + mHeight) > (posV.top + dHeight + $(this.viewer.canvas).outerHeight() + PAPAYA_SPACING)) {
                offset = (this.viewer.contextMenuMousePositionY + mHeight) - (posV.top + dHeight + $(this.viewer.canvas).outerHeight() + PAPAYA_SPACING) - 1;
            }

            if (this.viewer.container.contextManager && papaya.utilities.PlatformUtils.smallScreen) {
                menuHtml.css({
                    position: 'absolute',
                    zIndex: 100,
                    left: this.viewer.canvasRect.left,
                    top: this.viewer.canvasRect.top - offset
                });
            } else {
                menuHtml.css({
                    position: 'absolute',
                    zIndex: 100,
                    left: this.viewer.contextMenuMousePositionX + this.viewer.canvasRect.left,
                    top: this.viewer.contextMenuMousePositionY + this.viewer.canvasRect.top - offset
                });
            }

            menuHtml.hide().fadeIn(200);
        }
    }
};



papaya.ui.Menu.prototype.showMenu = function () {
    var isShowing, button, menuHtml, menuHtmlId;

    this.viewer.container.toolbar.closeAllMenus();

    if (this.contextMenu) {
        this.showContextMenu();
        return;
    }

    if (this.items.length > 0) {
        menuHtmlId = "#" + this.menuId;
        menuHtml = $(menuHtmlId);

        isShowing = menuHtml.is(":visible");

        menuHtml.remove();

        if (!isShowing) {
            button = $("#" + this.buttonId);
            this.buildMenu();
            menuHtml = $(menuHtmlId);
            menuHtml.hide();
            papaya.ui.Menu.doShowMenu(this.viewer, button[0], menuHtml[0], this.isRight);
        }
    }
};



papaya.ui.Menu.prototype.doClick = function () {
    var isShowing, menuHtml, menuHtmlId;
    menuHtmlId = "#" + this.menuId;
    menuHtml = $(menuHtmlId);
    isShowing = menuHtml.is(":visible");

    this.callback(this.buttonId);

    if (this.icons) {
        if (this.method) {
            $("#" + this.buttonId + " > img").attr("src", this.icons[papaya.utilities.ObjectUtils.bind(this.viewer,
                papaya.utilities.ObjectUtils.dereferenceIn(this.viewer, this.method))() ? 1 : 0]);
        } else {
            $("#" + this.buttonId + " > img").attr("src", this.icons[0]);
        }
    }

    if (!this.menuOnHover && !isShowing) {
        this.showMenu();
    }
};



papaya.ui.Menu.prototype.updateRangeItem = function (min, max) {
    if (this.rangeItem) {
        $("#" + this.rangeItem.minId).val(min);
        $("#" + this.rangeItem.maxId).val(max);
    }
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItem = papaya.ui.MenuItem || function (viewer, label, action, callback, dataSource, method, modifier) {
    this.viewer = viewer;

    this.modifier = "";
    if (!papaya.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;

    if (this.dataSource && this.method) {
        this.label = this.dataSource[this.method]();
    } else {
        this.label = label;
    }

    this.action = action + this.modifier;
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex;
    this.callback = callback;
    this.menu = null;
    this.isContext = false;
};


/*** Prototype Methods ***/

papaya.ui.MenuItem.prototype.buildHTML = function (parentId) {
    var html, thisHtml, label;

    if (this.dataSource && this.method) {
        label = this.dataSource[this.method]();
    } else {
        label = this.label;
    }

    html = "<li id='" + this.id + "'><span class='" + PAPAYA_MENU_UNSELECTABLE + "'>" + label + "</span>" + (this.menu ? "<span style='float:right'>&nbsp;&#x25B6;</span>" : "") + "</li>";
    $("#" + parentId).append(html);

    thisHtml = $("#" + this.id);

    if (this.viewer.container.contextManager && papaya.utilities.PlatformUtils.smallScreen) {
        thisHtml[0].style.width = (this.viewer.viewerDim - 10) + 'px';
        thisHtml[0].style.fontSize = 18 + 'px';
    }

    thisHtml.click(papaya.utilities.ObjectUtils.bind(this,
        function (e) {
            this.doAction(this.isContext && e.shiftKey);
        }));

    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
};



papaya.ui.MenuItem.prototype.doAction = function (keepOpen) {
    if (!keepOpen && !this.menu) {
        this.viewer.showingContextMenu = false;
    }

    this.callback(this.action, null, keepOpen);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_HOVERING_CSS, PAPAYA_MENU_COLORTABLE_CSS, PAPAYA_MENU_UNSELECTABLE */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemCheckBox = papaya.ui.MenuItemCheckBox || function (viewer, label, action, callback, dataSource,
                                                                           method, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.method = method;
    this.id = this.action.replace(/ /g, "_").replace(/\(/g, "").replace(/\)/g, "") +
    this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
};


/*** Prototype Methods ***/

papaya.ui.MenuItemCheckBox.prototype.buildHTML = function (parentId) {
    var selected, checked, html, thisHtml;

    selected = this.dataSource[this.method](this.label);
    checked = "";

    if (selected) {
        checked = "checked='checked'";
    }

    html = "<li id='" + this.id + "'><input type='checkbox' class='" + PAPAYA_MENU_COLORTABLE_CSS + "' name='" +
    PAPAYA_MENU_COLORTABLE_CSS + "' id='" + this.id + "' value='" + this.id  + "' " + checked + "><span class='" +
    PAPAYA_MENU_UNSELECTABLE + "'>&nbsp;" + this.label + "</span></li>";
    $("#" + parentId).append(html);
    thisHtml = $("#" + this.id);
    thisHtml.click(papaya.utilities.ObjectUtils.bind(this, this.doAction));
    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
};



papaya.ui.MenuItemCheckBox.prototype.doAction = function () {
    $("." + PAPAYA_MENU_COLORTABLE_CSS).removeAttr('checked');
    $("#" + this.id + " > input")[0].checked = true;
    this.callback(this.action, null, true);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_FILECHOOSER, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemFileChooser = papaya.ui.MenuItemFileChooser || function (viewer, label, action, callback, folder, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex;
    this.fileChooserId = "fileChooser" + this.label.replace(/ /g, "_").replace(/\./g, "") + this.viewer.container.containerIndex + (folder ? "folder" : "");
    this.callback = callback;
    this.folder = folder;
};


/*** Prototype Methods ***/

papaya.ui.MenuItemFileChooser.prototype.buildHTML = function (parentId) {
    var filechooser, html;

    filechooser = this;

    html = "<li id='" + this.id + "'><span class='" + PAPAYA_MENU_UNSELECTABLE + "'><label class='" +
        PAPAYA_MENU_FILECHOOSER + "' for='" + this.fileChooserId + "'>" + this.label;

    if (this.folder) {
        html += "</label><input type='file' id='" + this.fileChooserId +
            "' multiple='multiple' webkitdirectory directory name='files' /></span></li>";
    } else {
        html += "</label><input type='file' id='" + this.fileChooserId +
            "' multiple='multiple' name='files' /></span></li>";
    }

    $("#" + parentId).append(html);

    $("#" + this.fileChooserId)[0].onchange = papaya.utilities.ObjectUtils.bind(filechooser, function () {
        filechooser.callback(filechooser.action, document.getElementById(filechooser.fileChooserId).files);
    });

    $("#" + this.id).hover(function () {$(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_HOVERING_CSS, PAPAYA_MENU_COLORTABLE_CSS, PAPAYA_MENU_UNSELECTABLE */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemRadioButton = papaya.ui.MenuItemRadioButton || function (viewer, label, action, callback, dataSource,
                                                                     method, modifier) {
    this.viewer = viewer;
    this.label = label;

    this.modifier = "";
    if ((modifier !== undefined) && (modifier !== null)) {
        this.modifier = "-" + modifier;
    }

        this.methodParam =
    this.action = action + this.modifier;
    this.method = method;
    this.id = this.action.replace(/ /g, "_").replace(/\(/g, "").replace(/\)/g, "") +
        this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
};


/*** Prototype Methods ***/

papaya.ui.MenuItemRadioButton.prototype.buildHTML = function (parentId) {
    var selected, checked, html, thisHtml;

    selected = this.dataSource[this.method](this.label);
    checked = "";

    if (selected) {
        checked = "checked='checked'";
    }

    html = "<li id='" + this.id + "'><input type='radio' class='" + PAPAYA_MENU_COLORTABLE_CSS + "' name='" +
        PAPAYA_MENU_COLORTABLE_CSS + "' id='" + this.id + "' value='" + this.id  + "' " + checked + "><span class='" +
        PAPAYA_MENU_UNSELECTABLE + "'>&nbsp;" + this.label + "</span></li>";
    $("#" + parentId).append(html);
    thisHtml = $("#" + this.id);
    thisHtml.click(papaya.utilities.ObjectUtils.bind(this, this.doAction));
    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
};



papaya.ui.MenuItemRadioButton.prototype.doAction = function () {
    $("." + PAPAYA_MENU_COLORTABLE_CSS).removeAttr('checked');
    $("#" + this.id + " > input")[0].checked = true;
    this.callback(this.action, null, true);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_INPUT_FIELD, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemRange = papaya.ui.MenuItemRange || function (viewer, label, action, callback, dataSource, method,
                                                               modifier) {
    if (action === "ChangeRangeNeg") {
        this.negatives = true;
        modifier = viewer.getScreenVolumeIndex(viewer.screenVolumes[parseInt(modifier)].negativeScreenVol).toString();
    }

    this.viewer = viewer;
    this.label = label;

    this.index = modifier;
    this.modifier = "";
    if (modifier !== undefined) {
        this.modifier = "-" + modifier;
    }

    this.action = action + this.modifier;
    this.minId = this.action.replace(/ /g, "_") + "Min" + this.viewer.container.containerIndex;
    this.maxId = this.action.replace(/ /g, "_") + "Max" + this.viewer.container.containerIndex;
    this.callback = callback;
    this.dataSource = dataSource;
    this.method = method;
    this.id = label + this.modifier + this.viewer.container.containerIndex;

    this.grabOffset = 0;
    this.screenVol = this.viewer.screenVolumes[this.index];
};


/*** Static Methods ***/

papaya.ui.MenuItemRange.getRelativeMousePositionFromParentX = function (elem, ev) {
    var parentOffset = elem.parent().offset();
    return papaya.utilities.PlatformUtils.getMousePositionX(ev) - parentOffset.left;
};



papaya.ui.MenuItemRange.getRelativeMousePositionX = function (elem, ev) {
    var parentOffset = elem.offset();
    return papaya.utilities.PlatformUtils.getMousePositionX(ev) - parentOffset.left;
};


/*** Prototype Methods ***/

papaya.ui.MenuItemRange.prototype.buildHTML = function (parentId) {
    var range, html, menuItemRange, minHtml, maxHtml, minSliderId, minSliderHtml, maxSliderId, maxSliderHtml, sliderId,
        sliderHtml;

    minSliderId = this.id + "SliderMin";
    maxSliderId = this.id + "SliderMax";
    sliderId = this.id + "Slider";
    range = this.dataSource[this.method]();

    menuItemRange = this;

    html = "<li id='" + this.id + "'>" +
                "<span class='" + PAPAYA_MENU_UNSELECTABLE + "' style=''>" +
                    "<input class='" + PAPAYA_MENU_INPUT_FIELD + "' type='text' size='4' id='" + this.minId +
                        "' value='" + range[0] + "' />" +
                    "<div style='display:inline-block;position:relative;width:" +
                            (papaya.viewer.ColorTable.COLOR_BAR_WIDTH + papaya.viewer.ColorTable.ARROW_ICON_WIDTH) +
                            "px;top:-12px;'>" +
                        "<img id='" + minSliderId + "' class='" + PAPAYA_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:5px;left:" +
                            (menuItemRange.screenVol.colorTable.minLUT / papaya.viewer.ColorTable.LUT_MAX) *
                            (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px;z-index:99' src='" +
                            papaya.viewer.ColorTable.ARROW_ICON + "' />" +
                        "<img id='" + maxSliderId + "' class='" + PAPAYA_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:5px;left:" +
                            (menuItemRange.screenVol.colorTable.maxLUT / papaya.viewer.ColorTable.LUT_MAX) *
                            (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px;z-index:99' src='" +
                            papaya.viewer.ColorTable.ARROW_ICON + "' />" +
                        "<img id='" + sliderId + "' class='" + PAPAYA_MENU_UNSELECTABLE +
                            "' style='position:absolute;top:0;left:" +
                            (parseInt(papaya.viewer.ColorTable.ARROW_ICON_WIDTH / 2, 10)) + "px;' src='" +
                            this.viewer.screenVolumes[parseInt(this.index, 10)].colorBar + "' />" +
                    "</div>" +
                    "<input class='" + PAPAYA_MENU_INPUT_FIELD + "' type='text' size='4' id='" + this.maxId +
                        "' value='" + range[1] + "' />" +
                "</span>" +
           "</li>";

    $("#" + parentId).append(html);

    minHtml = $("#" + this.minId);
    maxHtml = $("#" + this.maxId);
    minSliderHtml = $("#" + minSliderId);
    maxSliderHtml = $("#" + maxSliderId);
    sliderHtml = $("#" + sliderId);

    if (papaya.utilities.PlatformUtils.ios) {
        minHtml[0].style.width = 35 + 'px';
        minHtml[0].style.marginRight = 4 + 'px';
        maxHtml[0].style.width = 35 + 'px';
        maxHtml[0].style.marginRight = 4 + 'px';
    }

    minSliderHtml.bind(papaya.utilities.PlatformUtils.ios ? 'touchstart' : 'mousedown', function (ev) {
        menuItemRange.grabOffset = papaya.ui.MenuItemRange.getRelativeMousePositionX(minSliderHtml, ev);

        $(window).bind(papaya.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove', function (ev) {
            var val, maxVal;

            maxVal = (menuItemRange.screenVol.colorTable.maxLUT / papaya.viewer.ColorTable.LUT_MAX) *
                (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            val = (papaya.ui.MenuItemRange.getRelativeMousePositionFromParentX(minSliderHtml, ev) - menuItemRange.grabOffset);

            if (val < 0) {
                val = 0;
            } else if (val >= papaya.viewer.ColorTable.COLOR_BAR_WIDTH) {
                val = (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            } else if (val > maxVal) {
                val = maxVal;
            }

            menuItemRange.screenVol.updateMinLUT(Math.round((val / (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1)) *
                papaya.viewer.ColorTable.LUT_MAX));
            minSliderHtml.css({"left": val + "px"});
            menuItemRange.viewer.drawViewer(false, true);
            minHtml.val(menuItemRange.dataSource[menuItemRange.method]()[0]);
            menuItemRange.screenVol.updateColorBar();
            sliderHtml.attr("src", menuItemRange.screenVol.colorBar);
        });

        return false;  // disable img drag
    });

    maxSliderHtml.bind(papaya.utilities.PlatformUtils.ios ? 'touchstart' : 'mousedown', function (ev) {
        menuItemRange.grabOffset = papaya.ui.MenuItemRange.getRelativeMousePositionX(maxSliderHtml, ev);
        $(window).bind(papaya.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove', function (ev) {
            var val, minVal;

            minVal = (menuItemRange.screenVol.colorTable.minLUT / papaya.viewer.ColorTable.LUT_MAX) *
                (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            val = (papaya.ui.MenuItemRange.getRelativeMousePositionFromParentX(maxSliderHtml, ev) - menuItemRange.grabOffset);

            if (val < 0) {
                val = 0;
            } else if (val >= papaya.viewer.ColorTable.COLOR_BAR_WIDTH) {
                val = (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1);
            } else if (val < minVal) {
                val = minVal;
            }

            menuItemRange.screenVol.updateMaxLUT(Math.round((val / (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1)) *
                papaya.viewer.ColorTable.LUT_MAX));
            maxSliderHtml.css({"left": val + "px"});
            menuItemRange.viewer.drawViewer(false, true);
            maxHtml.val(menuItemRange.dataSource[menuItemRange.method]()[1]);
            menuItemRange.screenVol.updateColorBar();
            sliderHtml.attr("src", menuItemRange.screenVol.colorBar);
        });

        return false;  // disable img drag
    });

    $(window).bind(papaya.utilities.PlatformUtils.ios ? 'touchend' : 'mouseup', function () {
        $(window).unbind(papaya.utilities.PlatformUtils.ios ? 'touchmove' : 'mousemove');
    });

    $("#" + this.id).hover(function () {$(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });

    minHtml.change(papaya.utilities.ObjectUtils.bind(this, function () {
        menuItemRange.rangeChanged(true);
    }));

    maxHtml.change(papaya.utilities.ObjectUtils.bind(this, function () {
        menuItemRange.rangeChanged(false);
    }));

    minHtml.keyup(papaya.utilities.ObjectUtils.bind(this, function (e) {
        if (e.keyCode === 13) {
            menuItemRange.rangeChanged(false);
            menuItemRange.viewer.container.toolbar.closeAllMenus();
        }
    }));

    maxHtml.keyup(papaya.utilities.ObjectUtils.bind(this, function (e) {
        if (e.keyCode === 13) {
            menuItemRange.rangeChanged(false);
            menuItemRange.viewer.container.toolbar.closeAllMenus();
        }
    }));

    if (!papaya.utilities.PlatformUtils.ios) {
        setTimeout(function () {  // IE wasn't picking up on the focus
            minHtml.focus();
            minHtml.select();
        }, 10);
    }
};



papaya.ui.MenuItemRange.prototype.rangeChanged = function (focusMax) {
    this.updateDataSource(focusMax);
    this.viewer.drawViewer(true);
    this.resetSlider();
};



papaya.ui.MenuItemRange.prototype.updateDataSource = function (focusMax) {
    var max, min, maxHtml, minHtml;

    minHtml = $("#" + this.minId);
    maxHtml = $("#" + this.maxId);

    min = parseFloat(minHtml.val());
    if (isNaN(min)) {
        min = this.dataSource.screenMin;
    }

    max = parseFloat(maxHtml.val());
    if (isNaN(max)) {
        max = this.dataSource.screenMax;
    }

    minHtml.val(min);
    maxHtml.val(max);

    if (this.negatives) {
        this.dataSource.setScreenRangeNegatives(min, max);
    } else {
        this.dataSource.setScreenRange(min, max);
    }

    if (focusMax) {
        maxHtml.focus();
        maxHtml.select();
    }
};



papaya.ui.MenuItemRange.prototype.resetSlider = function () {
    var minSliderId, minSliderHtml, maxSliderId, maxSliderHtml, sliderId, sliderHtml;

    minSliderId = this.id + "SliderMin";
    maxSliderId = this.id + "SliderMax";
    sliderId = this.id + "Slider";
    minSliderHtml = $("#" + minSliderId);
    maxSliderHtml = $("#" + maxSliderId);
    sliderHtml = $("#" + sliderId);

    minSliderHtml.css({"left": 0});
    maxSliderHtml.css({"left": (papaya.viewer.ColorTable.COLOR_BAR_WIDTH - 1) + "px"});

    this.screenVol.resetDynamicRange();
    sliderHtml.attr("src", this.screenVol.colorBar);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_SLIDER, PAPAYA_MENU_HOVERING_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemSlider = papaya.ui.MenuItemSlider || function (viewer, label, action, callback, dataSource, method,
                                                                 modifier) {
    if (action === "alphaneg") {
        action = "alpha";
        modifier = viewer.getScreenVolumeIndex(viewer.screenVolumes[parseInt(modifier)].negativeScreenVol).toString();
    }

    this.viewer = viewer;
    this.label = label;
    this.index = modifier;
    this.modifier = "";
    if (!papaya.utilities.StringUtils.isStringBlank(modifier)) {
        this.modifier = "-" + modifier;
    }

    this.dataSource = dataSource;
    this.method = method;
    this.action = action;
    this.event = ((this.action.toLowerCase().indexOf("alpha") != -1) || this.viewer.screenVolumes[0].isHighResSlice) ?
        "change" : "input change";
    this.id = this.action.replace(/ /g, "_") + this.viewer.container.containerIndex + "_" + this.index;
    this.callback = callback;
    this.screenVol = dataSource;//this.viewer.screenVolumes[this.index];
};


/*** Prototype Methods ***/

papaya.ui.MenuItemSlider.prototype.buildHTML = function (parentId) {
    var html, thisHtml, sliderId, sliderHtml, menuItem, event;

    event = this.event;
    sliderId = this.id + "Slider";

    html = "<li id='" + this.id + "'><span style='padding-right:5px;' class='" + PAPAYA_MENU_UNSELECTABLE + "'>" +
        this.label + ":</span><input min='0' max='100' value='" + parseInt((1.0 - this.screenVol[this.action]) * 100,
            10) + "' id='" + sliderId + "' class='" + PAPAYA_MENU_SLIDER + "' type='range' /></li>";
    $("#" + parentId).append(html);

    thisHtml = $("#" + this.id);
    thisHtml.hover(function () { $(this).toggleClass(PAPAYA_MENU_HOVERING_CSS); });
    sliderHtml = $("#" + sliderId);

    menuItem = this;

    $("#" + this.id + "Slider").on(event, function () {
        menuItem.screenVol[menuItem.action] = 1.0 - (sliderHtml.val() / 100.0);
        menuItem.doAction();
        menuItem.viewer.drawViewer(true, false);
    });
};



papaya.ui.MenuItemSlider.prototype.doAction = function () {
    this.callback(this.action, null, true);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_UNSELECTABLE, PAPAYA_MENU_SPACER_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.ui = papaya.ui || {};


/*** Constructor ***/
papaya.ui.MenuItemSpacer = papaya.ui.MenuItemSpacer || function () {};


/*** Prototype Methods ***/

papaya.ui.MenuItemSpacer.prototype.buildHTML = function (parentId) {
    var html;

    html = "<div class='" + PAPAYA_MENU_SPACER_CSS + " " + PAPAYA_MENU_UNSELECTABLE + "'></div>";
    $("#" + parentId).append(html);
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_MENU_ICON_CSS, PAPAYA_MENU_LABEL_CSS, PAPAYA_TITLEBAR_CSS, PAPAYA_MENU_BUTTON_CSS, PAPAYA_MENU_CSS,
 PAPAYA_CUSTOM_PROTOCOL, PAPAYA_DIALOG_CSS, PAPAYA_DIALOG_BACKGROUND, alert, confirm */

"use strict";

var papaya = papaya || {};
papaya.ui = papaya.ui || {};

var papayaLoadableImages = papayaLoadableImages || [];

papaya.ui.Toolbar = papaya.ui.Toolbar || function (container) {
    this.container = container;
    this.viewer = container.viewer;
    this.imageMenus = null;
    this.surfaceMenus = null;
    this.spaceMenu = null;
};


/*** Static Fields ***/

papaya.ui.Toolbar.SIZE = 22;


// http://dataurl.net/#dataurlmaker
papaya.ui.Toolbar.ICON_IMAGESPACE = "data:image/gif;base64,R0lGODlhFAAUAPcAMf//////GP////////////////////////////////" +
    "////////////////////////////////////////////////////////////////////////////////////////////////////////////////" +
    "///////////////2f/ZNbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1t" +
    "bW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1qWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpa" +
    "WlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpa" +
    "WlpaWlpaWlpaWlpaWlpVpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWl" +
    "paWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWlpaWkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk" +
    "JCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQk" +
    "JCQkJCQkJCQkJCQkJCQkJCQgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAACoALAAAAAAUABQAAA" +
    "ipAFUIHEiwoMB/A1coXLiwisOHVf4hVLFCosWLGC9SzMgR48Z/VEJSUVjFj0mTESdWBCmS5EmU/6oIXCly5IqSLx/OlFjT5Us/DneybIkzp8yPDE" +
    "lChCjwj8Q/UKOqmkqVatOnUaGqmsaVq1UVTv+lGjv2z9SuXlVdFUs2ldmtaKeubev2bFy1YCXSfYt2mty8/6CS5XtXRcasVRMftJj1beK/hicanK" +
    "wiIAA7";

papaya.ui.Toolbar.ICON_WORLDSPACE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAGXRFWHRTb2" +
    "Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAplJREFUeNqM1H1ozVEcx/Hr3p+7O08jQzbzMErznEItK0+Fv0Ye/tki20ia//wn+YMSaXkoEi" +
    "KkkCVKZhOipsnDstnFagzlrmGMNfeO6/Nd71unu2s59bq7O517ft/z/X7Pz+dLPUbLJrkqX+SbdEubfJZK2cC6PiOQYm61HJcpkintEpcmCcpryZ" +
    "V5spaHhvvbdJ9slsPyU67wgPlEli0X5aiMkMeyXSbKnVRRVxDRRtkm5czbZrv5vkgu8z1P9stWfleRHGkhT3xCLu1YzZIjpfKWnA6VEn43mwcWEa" +
    "Wlo1Ve2YZj5Jms53iP5BjFsFz9lg/yDj0U7JbslFpZQyBP2a83khoiLiWPA/h/OVGOk+GwnJ5y1iyRS5Im1VLm18cKOc+CYrlGjnxUuZPIOlAn0y" +
    "WdNXdlrMyRE7LM00eBjBT7niFVTvHsKJ8k6sw1yC4ZIl0EUMOcRT/X44v14xEZSBWfk+d8NpzKujgPGiYrOXI+XTGeGtjpewtjm16Qh3JT3sgvic" +
    "kfNo4yF6V4PVyE2wQUZvP7FmmIa/iDIpwkHRPkrC2iEIlhEZ2mtarIsz3sOoX0PPrP7nAWPRYjj51E85JiJEYO0VsfR5hL5wZal3T7aZl10kLiEy" +
    "NEHtOSbt4g/gaduRjzC+S9RwtZ332XBxQpzGZ+p72SR5BumUYHLaaDSiySUXKPig6Wj+SmjX5s4BQB0pFBQVo4dhenspfKC1kaYLKVa9pOAW5Q2W" +
    "w2qeU92kHbzZRDvK2sBSfLDLtNUp/82rOj7nDm9tJi7lhoeWNzG7Pkqxz8R5p8ByhcGVd0CzkOOWv28KBJvNGa+V2/Y5U08vQm8mgvmTNyjpxHSF" +
    "Uj6/9rZPKerGSTuCPCi7qIdX3GXwEGAPFYt+/OgAXDAAAAAElFTkSuQmCC";

papaya.ui.Toolbar.ICON_EXPAND =   "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAE00lEQVR42u2d" +
    "jW3UQBCFJx3QAemAdJBQAVABTgekAqCC0EGOCoAKWDqADkIHKQGPfKdEh3Nr7493Z977pJWQwtk7+77ETs6zdyYEmrPWEyBtoQDgUABwKAA4FAAc" +
    "CgAOBQCHAoBDAcChAOBQAHAoADgUABwKAE6uALfjuGg094dx7Mbxo9H5D7wZxzCOF43O/3scN6kvzhXg5ziuGhV+4K20k0DD/964/jCO16kv9iCA" +
    "BvCu0bm/ySRgS4KAC7Abx3Wjc9/J9OO/JUGABXjYn/9Po/O/kimAVtd/EQMC6E1Krevkbhx/Kx17KSpBrcuAHjd2kx2kcwGUYRxfy60LBO9lEjxG" +
    "EAMCKINQgqUsDV8JYkQAZRBKEGNN+EqQzgTQa/6p69YglOA5YuHPrW2QzgT4NI77SCGDUIJjYuEP4ziXaX2fEqRDAT4vLIgSTCxdq49iSIA1hSGz" +
    "Zo3MCbC2QDTWro1JAVIKRSBlTcwKkFqwV1LXwrQAOYV7ImcNzAuQuwDWya3dhQAlFsIiJWp2I0CpBbFCqVpdCVByYXqmZI3uBCi9QL1RujaXAige" +
    "JahRk1sBFE8S1KrFtQCKBwlq1uBeAMWyBLXnDiGAYlGCLeYMI4BiSYKt5golgGJBgi3nCCeA0rMEW88NUgClRwlazKk7AeaaI3WCpQVQepKg1Vzm" +
    "BMhqjs0V4Lg9unavXg8StJzDS5keDX/ai5jVHl9ih5DDBgka/hep36jZMoAeBNRexA8ySaBzydobweoWMS2C6CH84lgVQNkyEJfhK5YFULYIxm34" +
    "inUBlFhA55K+h8DcTddTBjEcvuJBAOWUBIOkh3Qp0+/ZpY/bDV4EUJ6T4GocvxKP+ZwAgzgIX/EkgKIS6K+ihx/ZQTL+Srbn+K+dgzgJX/EmgKLX" +
    "7fP9v1O/84+53B8zSPs9iYriUQCyAgoADgUAhwKAQwHAoQDgUABwKAA4FAAcCgAOBQCHAoBDAcChAOB4FEDfDr6Sacfykm8Hy/6YfDu4Y46fCgpS" +
    "9oEQ7X3QZ/L5QEiH8JGwBLwIcOqh0CtJF6DWw6bd4EGAUyHpj2z9iJWcx8LvT3x9EOMSWBeAjSGZWBaArWEFsCoAm0MLwfZwO+c+0FV7+NwGETk3" +
    "XTF6CKDlHOY+rLrpBhHcImbbuXS3RQw3idp2Tt1tEsVt4rhNHDeK3HCOUAJYCH/rucIIYCn8LecMIYDF8Leau3sBLIe/RQ2uBfAQfu1a3ArgKfya" +
    "NbkUwGP4tWpzJ4Dn8GvU6EoAhPBL1+pGAKTwS9bsQgDE8EvVbl4A5PBLrIFpARj+I6lrYVYAhv8/KWtiUgCG/zxr18acAAw/zpo1MiUAw1/O0rUy" +
    "I8D9woLII0skOBcDAuhHrFxECmH488QkmFvbIJ0JcIpBGH6MmATHBDEiwCAMfylrJAhiQIBBGP5alkoQpHMB9Lr1PX6oJPS4tXsRY+geAkOlY2vX" +
    "1UXk/wTpXICa1P6w6hhzvXpbo+eHFUDZjeO60bnvpN53/1KCgAuQ1RyZyVxz7NYEARcgqz06k+P2+BYEaSjArcRvUmqh1/+dtAv/wGGDjFb3AXqT" +
    "fZP6YqtbxJBCUABwKAA4FAAcCgAOBQCHAoBDAcChAOBQAHAoADgUABwKAA4FAIcCgPMPvdAfn3qMP2kAAAAASUVORK5CYII=";

papaya.ui.Toolbar.ICON_COLLAPSE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAEJGlDQ1BJQ0Mg" +
    "UHJvZmlsZQAAOBGFVd9v21QUPolvUqQWPyBYR4eKxa9VU1u5GxqtxgZJk6XtShal6dgqJOQ6N4mpGwfb6baqT3uBNwb8AUDZAw9IPCENBmJ72fbA" +
    "tElThyqqSUh76MQPISbtBVXhu3ZiJ1PEXPX6yznfOec7517bRD1fabWaGVWIlquunc8klZOnFpSeTYrSs9RLA9Sr6U4tkcvNEi7BFffO6+EdigjL" +
    "7ZHu/k72I796i9zRiSJPwG4VHX0Z+AxRzNRrtksUvwf7+Gm3BtzzHPDTNgQCqwKXfZwSeNHHJz1OIT8JjtAq6xWtCLwGPLzYZi+3YV8DGMiT4VVu" +
    "G7oiZpGzrZJhcs/hL49xtzH/Dy6bdfTsXYNY+5yluWO4D4neK/ZUvok/17X0HPBLsF+vuUlhfwX4j/rSfAJ4H1H0qZJ9dN7nR19frRTeBt4Fe9Fw" +
    "pwtN+2p1MXscGLHR9SXrmMgjONd1ZxKzpBeA71b4tNhj6JGoyFNp4GHgwUp9qplfmnFW5oTdy7NamcwCI49kv6fN5IAHgD+0rbyoBc3SOjczohby" +
    "S1drbq6pQdqumllRC/0ymTtej8gpbbuVwpQfyw66dqEZyxZKxtHpJn+tZnpnEdrYBbueF9qQn93S7HQGGHnYP7w6L+YGHNtd1FJitqPAR+hERCNO" +
    "Fi1i1alKO6RQnjKUxL1GNjwlMsiEhcPLYTEiT9ISbN15OY/jx4SMshe9LaJRpTvHr3C/ybFYP1PZAfwfYrPsMBtnE6SwN9ib7AhLwTrBDgUKcm06" +
    "FSrTfSj187xPdVQWOk5Q8vxAfSiIUc7Z7xr6zY/+hpqwSyv0I0/QMTRb7RMgBxNodTfSPqdraz/sDjzKBrv4zu2+a2t0/HHzjd2Lbcc2sG7GtsL4" +
    "2K+xLfxtUgI7YHqKlqHK8HbCCXgjHT1cAdMlDetv4FnQ2lLasaOl6vmB0CMmwT/IPszSueHQqv6i/qluqF+oF9TfO2qEGTumJH0qfSv9KH0nfS/9" +
    "TIp0Wboi/SRdlb6RLgU5u++9nyXYe69fYRPdil1o1WufNSdTTsp75BfllPy8/LI8G7AUuV8ek6fkvfDsCfbNDP0dvRh0CrNqTbV7LfEEGDQPJQad" +
    "BtfGVMWEq3QWWdufk6ZSNsjG2PQjp3ZcnOWWing6noonSInvi0/Ex+IzAreevPhe+CawpgP1/pMTMDo64G0sTCXIM+KdOnFWRfQKdJvQzV1+Bt8O" +
    "okmrdtY2yhVX2a+qrykJfMq4Ml3VR4cVzTQVz+UoNne4vcKLoyS+gyKO6EHe+75Fdt0Mbe5bRIf/wjvrVmhbqBN97RD1vxrahvBOfOYzoosH9bq9" +
    "4uejSOQGkVM6sN/7HelL4t10t9F4gPdVzydEOx83Gv+uNxo7XyL/FtFl8z9ZAHF4bBsrEwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAeJJREFUOBG1" +
    "lU1KA0EQhTP5c5MggkvFvQfQjS4iIcled3qBrDyCHsFsvEBcegBBkEBA0VuIW0UFBX8w4/c6VUMbAhoYG16qquvVm05Nd0+SpmlBI0mSogzxV5iY" +
    "8Yf6EiWUp6NQasJFWfPL7lucQIzzvoDAn6xxrsRDEXYVrE0S44dM86kJC1GtNKxeDy+ULFDiAbQsrpqtMFeXb3GNuDLBaVmtL6zkZH+qCPegGQm1" +
    "iftR3CduR3HTanxBY62I4OIiPoGOcoxdMIh4A81ZroMvblgINmiEnBcY0f++Cl6B2rMBzp0n3+aUE8cXEGqdVyaRDSY/FGDP2D4N3B64Bs/Ah/wd" +
    "sA4acG+U8Fr5GuHtIaItpb1cAW2gv18FEt0HC8CHfM0pVxXXavSSpRG0fMUK1NA5sAeWwSfQ6i7AEPhwf4mJAyDBO3AJVBO0dNLw8x+hFfnLsj0k" +
    "Slt0+kbYOuExiFuhng7JH2LFld0Ej2AeeCu6cF5cy3vs/XiDeAIWwS3Q298G8ZDoFuiBI7ACdKjegcZYSz2eBgjap1dAxafOkW9zyoUj7LnY/hCF" +
    "mNsByYQRzf9IR6L5XUKI/uXarHn/4Gvn/H5tQvqfi14rcXHzs6vPYh3RmT9N2ZHWxkYgt4/pN/LAOfka/AG9AAAAAElFTkSuQmCC";

papaya.ui.Toolbar.FILE_MENU_DATA = {"label": "File", "icons": null,
    "items": [
        {"label": "Add Image...", "action": "OpenImage", "type": "file", "hide": papaya.utilities.PlatformUtils.ios},
        {"label": "Add Surface...", "action": "OpenSurface", "type": "file", "hide": papaya.utilities.PlatformUtils.ios},
        {"label": "Add DICOM Folder...", "action": "OpenFolder", "type": "folder",
            "hide": ((papaya.utilities.PlatformUtils.browser !== "Chrome") || ((typeof(daikon) === "undefined"))) },
        {"label": "Add DTI Vector Series...", "action": "OpenDTI", "type": "file"},
        {"type": "spacer"},
        {"label": "Close All", "action": "CloseAllImages"}
    ]
};

papaya.ui.Toolbar.RGB_FILE_MENU_DATA = {"label": "File", "icons": null,
    "items": [
        {"label": "Close All", "action": "CloseAllImages"}
    ]
};

papaya.ui.Toolbar.MENU_DATA = {
    "menus": [
        papaya.ui.Toolbar.FILE_MENU_DATA,
        {"label": "View", "icons": null,
            "items": [
                {"label": "Orientation", "action": "ShowOrientation", "type": "checkbox", "method": "isShowingOrientation"},
                {"label": "Crosshairs", "action": "ShowCrosshairs", "type": "checkbox", "method": "isShowingCrosshairs"},
                {"label": "Ruler", "action": "ShowRuler", "type": "checkbox", "method": "isShowingRuler"},
                {"type": "spacer", "required": "hasSurface"},
                {"label": "Surface Planes", "action": "ShowSurfacePlanes", "type": "checkbox", "method": "isShowingSurfacePlanes", "required" : "hasSurface"}
            ]
        },
        {"label": "Settings", "icons": null,
            "items": [
                {"label": "Viewer Preferences", "action": "Preferences"},
                {"label": "Surface Preferences", "action": "SurfacePreferences", "required" : "hasSurface"}
            ]
        },
        {"label": "Help", "icons": null,
            "items": [
                {"label": "Show Keyboard Reference", "action": "KeyboardRef"},
                {"label": "Show Mouse Reference", "action": "MouseRef"},
                {"label": "Show License", "action": "License"}
            ]
        },
        {"label": "", "icons": null, "titleBar": "true" },
        {"label": "EXPAND", "icons": [papaya.ui.Toolbar.ICON_EXPAND, papaya.ui.Toolbar.ICON_COLLAPSE], "items": [],
            "method": "isCollapsable", "required": "isExpandable" },
        {"label": "SPACE", "icons": [papaya.ui.Toolbar.ICON_IMAGESPACE, papaya.ui.Toolbar.ICON_WORLDSPACE],
            "items": [], "method": "isWorldMode", "menuOnHover": true }
    ]
};

papaya.ui.Toolbar.MENU_DATA_KIOSK = {
    "menus": [
        {"label": "EXPAND", "icons": [papaya.ui.Toolbar.ICON_EXPAND, papaya.ui.Toolbar.ICON_COLLAPSE], "items": [],
            "method": "isCollapsable", "required": "isExpandable" }
    ]
};

papaya.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA = {
    "items": [
        {"label": "Show Header", "action": "ShowHeader"},
        {"label": "Show Image Info", "action": "ImageInfo"},
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "DisplayRange", "action": "ChangeRange", "type": "displayrange", "method": "getRange"},
        {"label": "Load Negatives", "action": "LoadNegatives", "required" : "canCurrentOverlayLoadNegatives" },
        {"label": "Transparency", "action": "alpha", "type": "range", "method": "getAlpha"},
        {"label": "Color Table", "action": "ColorTable", "items": [], "required": "isNonParametricCombined" },
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "DisplayRange", "action": "ChangeRangeNeg", "type": "displayrange", "method": "getRangeNegative", "required": "isParametricCombined"},
        {"label": "Transparency", "action": "alphaneg", "type": "range", "method": "getAlpha", "required": "isParametricCombined"},
        {"type": "spacer", "required": "isParametricCombined"},
        {"label": "Hide Overlay", "action": "ToggleOverlay", "method": "getHiddenLabel" },
        {"label": "Close Overlay", "action": "CloseOverlay", "required": "isDesktopMode" },
        {"label": "Open in Mango", "action": "OpenInMango", "required" : "canOpenInMango" }
    ]
};

papaya.ui.Toolbar.BASE_IMAGE_MENU_DATA = {
    "items": [
        {"label": "Show Header", "action": "ShowHeader"},
        {"label": "Show Image Info", "action": "ImageInfo"},
        {"label": "DisplayRange", "action": "ChangeRange", "type": "displayrange", "method": "getRange"},
            papaya.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items[6],
        {"label": "Rotation", "action": "Rotation", "items": [
            {"label": "About X Axis", "action": "rotationX", "type": "range", "method": "getRotationX"},
            {"label": "About Y Axis", "action": "rotationY", "type": "range", "method": "getRotationY"},
            {"label": "About Z Axis", "action": "rotationZ", "type": "range", "method": "getRotationZ"},
            {"label": "Reset Transform", "action": "ResetTransform"},
            {"label": "Rotate About Center", "action": "Rotate About Center", "type": "radiobutton", "method": "isRotatingAbout"},
            {"label": "Rotate About Origin", "action": "Rotate About Origin", "type": "radiobutton", "method": "isRotatingAbout"},
            {"label": "Rotate About Crosshairs", "action": "Rotate About Crosshairs", "type": "radiobutton", "method": "isRotatingAbout"}
        ]},
        {"label": "Open in Mango", "action": "OpenInMango", "required" : "canOpenInMango"  }
    ]
};

papaya.ui.Toolbar.RGB_IMAGE_MENU_DATA = {
    "items": [
        {"label": "Show Header", "action": "ShowHeader"},
        {"label": "Show Image Info", "action": "ImageInfo"},
        {"label": "Open in Mango", "action": "OpenInMango", "required" : "canOpenInMango"  }
    ]
};

papaya.ui.Toolbar.SURFACE_MENU_DATA = {
    "items": [
        {"label": "Show Surface Info", "action": "SurfaceInfo"},
        {"label": "Transparency", "action": "alpha", "type": "range", "method": "getAlpha"}
    ]
};

papaya.ui.Toolbar.DTI_IMAGE_MENU_DATA = {
    "items": [
        {"label": "Show Header", "action": "ShowHeader"},
        {"label": "Show Image Info", "action": "ImageInfo"},
        {"label": "Display Colors", "action": "DTI-RGB", "type": "checkbox", "method": "isDTIRGB"},
        {"label": "Display Lines", "action": "DTI-Lines", "type": "checkbox", "method": "isDTILines"},
        {"label": "Display Lines &amp; Colors", "action": "DTI-LinesColors", "type": "checkbox", "method": "isDTILinesAndRGB"},
        {"label": "Transparency", "action": "alpha", "type": "range", "method": "getAlpha", "required": "canCurrentOverlayLoadMod"},
        {"label": "Modulate with...", "action": "DTI-Mod", "type": "file", "hide": papaya.utilities.PlatformUtils.ios, "required": "canCurrentOverlayLoadMod"},
        {"label": "Modulation", "action": "dtiAlphaFactor", "type": "range", "method": "getDtiAlphaFactor", "required": "canCurrentOverlayModulate"},
        {"label": "Open in Mango", "action": "OpenInMango", "required" : "canOpenInMango"}
    ]
};

papaya.ui.Toolbar.PREFERENCES_DATA = {
    "items": [
        {"label": "Coordinate display of:", "field": "atlasLocks", "options": ["Mouse", "Crosshairs"]},
        {"label": "Scroll wheel behavior:", "field": "scrollBehavior", "options": ["Zoom", "Increment Slice"],
            "disabled": "container.disableScrollWheel"},
        {"spacer": "true"},
        {"label": "Smooth display:", "field": "smoothDisplay", "options": ["Yes", "No"]},
        {"label": "Radiological display:", "field": "radiological", "options": ["Yes", "No"]}
    ]
};

papaya.ui.Toolbar.PREFERENCES_SURFACE_DATA = {
    "items": [
        {"label": "Background color:", "field": "surfaceBackgroundColor", "options": ["Black", "Dark Gray", "Gray", "Light Gray", "White"]}
    ]
};

papaya.ui.Toolbar.IMAGE_INFO_DATA = {
    "items": [
        {"label": "Filename:", "field": "getFilename", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Image Dims:", "field": "getImageDimensionsDescription", "readonly": "true"},
        {"label": "Voxel Dims:", "field": "getVoxelDimensionsDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Byte Type:", "field": "getByteTypeDescription", "readonly": "true"},
        {"label": "Byte Order:", "field": "getByteOrderDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Orientation:", "field": "getOrientationDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Notes:", "field": "getImageDescription", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.SERIES_INFO_DATA = {
    "items": [
        {"label": "Filename:", "field": "getFilename", "readonly": "true"},
        {"label": "File Length:", "field": "getFileLength", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Image Dims:", "field": "getImageDimensionsDescription", "readonly": "true"},
        {"label": "Voxel Dims:", "field": "getVoxelDimensionsDescription", "readonly": "true"},
        {"label": "Series Points:", "field": "getSeriesDimensionsDescription", "readonly": "true"},
        {"label": "Series Point Size:", "field": "getSeriesSizeDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Byte Type:", "field": "getByteTypeDescription", "readonly": "true"},
        {"label": "Byte Order:", "field": "getByteOrderDescription", "readonly": "true"},
        {"label": "Compressed:", "field": "getCompressedDescription", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Orientation:", "field": "getOrientationDescription", "readonly": "true"},
        {"label": "Notes:", "field": "getImageDescription", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.SURFACE_INFO_DATA = {
    "items": [
        {"label": "Filename:", "field": "getSurfaceFilename", "readonly": "true"},
        {"spacer": "true"},
        {"label": "Points:", "field": "getSurfaceNumPoints", "readonly": "true"},
        {"label": "Triangles:", "field": "getSurfaceNumTriangles", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.HEADER_DATA = {
    "items": [
        {"label": "", "field": "getHeaderDescription", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.LICENSE_DATA = {
    "items": [
        {"label": "", "field": "getLicense", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.KEYBOARD_REF_DATA = {
    "items": [
        {"label": "", "field": "getKeyboardReference", "readonly": "true"}
    ]
};

papaya.ui.Toolbar.MOUSE_REF_DATA = {
    "items": [
        {"label": "", "field": "getMouseReference", "readonly": "true"}
    ]
};


/*** Static Methods ***/

papaya.ui.Toolbar.applyContextState = function (menu) {
    var ctr;

    menu.contextMenu = true;

    if (menu.items) {
        for (ctr = 0; ctr < menu.items.length; ctr += 1) {
            if (menu.items[ctr].menu) {
                papaya.ui.Toolbar.applyContextState(menu.items[ctr].menu);
            } else {
                menu.items[ctr].isContext = true;
            }
        }
    }
};



/*** Prototype Methods ***/

papaya.ui.Toolbar.prototype.buildToolbar = function () {
    var ctr;

    this.imageMenus = null;
    this.surfaceMenus = null;
    this.spaceMenu = null;

    this.container.toolbarHtml.find("." + PAPAYA_MENU_ICON_CSS).remove();
    this.container.toolbarHtml.find("." + PAPAYA_MENU_LABEL_CSS).remove();
    this.container.toolbarHtml.find("." + PAPAYA_TITLEBAR_CSS).remove();

    if (this.container.kioskMode) {
        for (ctr = 0; ctr < papaya.ui.Toolbar.MENU_DATA_KIOSK.menus.length; ctr += 1) {
            this.buildMenu(papaya.ui.Toolbar.MENU_DATA_KIOSK.menus[ctr], null, this.viewer, null);
        }
    } else {
        if ((this.container.viewer.screenVolumes.length > 0) && this.container.viewer.screenVolumes[0].rgb) {
            papaya.ui.Toolbar.MENU_DATA.menus[0] = papaya.ui.Toolbar.RGB_FILE_MENU_DATA;
        } else {
            papaya.ui.Toolbar.MENU_DATA.menus[0] = papaya.ui.Toolbar.FILE_MENU_DATA;
            this.buildOpenMenuItems(papaya.ui.Toolbar.MENU_DATA);
        }

        for (ctr = 0; ctr < papaya.ui.Toolbar.MENU_DATA.menus.length; ctr += 1) {
            this.buildMenu(papaya.ui.Toolbar.MENU_DATA.menus[ctr], null, this.viewer, null);
        }

        this.buildAtlasMenu();
    }

    this.buildColorMenuItems();

    this.container.titlebarHtml = this.container.containerHtml.find("." + PAPAYA_TITLEBAR_CSS);
    if (this.container.getViewerDimensions()[0] < 600) {
        this.container.titlebarHtml.css({visibility: "hidden"});
    } else {
        this.container.titlebarHtml.css({visibility: "visible"});
    }
};



papaya.ui.Toolbar.prototype.buildAtlasMenu = function () {
    if (papaya.data) {
        if (papaya.data.Atlas) {
            var items = this.spaceMenu.items;

            items[0] = {"label": papaya.data.Atlas.labels.atlas.header.name, "action": "AtlasChanged-" +
                papaya.data.Atlas.labels.atlas.header.name, "type": "radiobutton", "method": "isUsingAtlas"};

            if (papaya.data.Atlas.labels.atlas.header.transformedname) {
                items[1] = {"label": papaya.data.Atlas.labels.atlas.header.transformedname, "action": "AtlasChanged-" +
                    papaya.data.Atlas.labels.atlas.header.transformedname, "type": "radiobutton",
                        "method": "isUsingAtlas"};
            }
        }
    }
};



papaya.ui.Toolbar.prototype.buildColorMenuItems = function () {
    var items, ctr, allColorTables, item, screenParams;

    screenParams = this.container.params.luts;
    if (screenParams) {
        for (ctr = 0; ctr < screenParams.length; ctr += 1) {
            papaya.viewer.ColorTable.addCustomLUT(screenParams[ctr]);
        }
    }

    allColorTables = papaya.viewer.ColorTable.TABLE_ALL;
    items = papaya.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items;

    for (ctr = 0; ctr < items.length; ctr += 1) {
        if (items[ctr].label === "Color Table") {
            items = items[ctr].items;
            break;
        }
    }

    for (ctr = 0; ctr < allColorTables.length; ctr += 1) {
        item = {"label": allColorTables[ctr].name, "action": "ColorTable-" + allColorTables[ctr].name,
            "type": "radiobutton", "method": "isUsingColorTable"};
        items[ctr] = item;
    }
};



papaya.ui.Toolbar.prototype.buildOpenMenuItems = function (menuData) {
    var ctr, items, menuItemName;

    for (ctr = 0; ctr < menuData.menus.length; ctr += 1) {
        if (menuData.menus[ctr].label === "File") {
            items = menuData.menus[ctr].items;
            break;
        }
    }

    if (items) {
        for (ctr = 0; ctr < papayaLoadableImages.length; ctr += 1) {
            if (!papayaLoadableImages[ctr].hide) {
                if (papayaLoadableImages[ctr].surface) {
                    menuItemName = "Add Surface " + papayaLoadableImages[ctr].nicename;
                    if (!this.menuContains(items, menuItemName)) {
                        items.splice(2, 0, {"label": menuItemName, "action": "OpenSurface-" + papayaLoadableImages[ctr].name});
                    }
                } else {
                    menuItemName = "Add " + papayaLoadableImages[ctr].nicename;
                    if (!this.menuContains(items, menuItemName)) {
                        items.splice(2, 0, {"label": menuItemName, "action": "Open-" + papayaLoadableImages[ctr].name});
                    }
                }
            }
        }
    }
};



papaya.ui.Toolbar.prototype.menuContains = function (menuItems, name) {
    var ctr;

    if (menuItems) {
        for (ctr = 0; ctr < menuItems.length; ctr += 1) {
            if (menuItems[ctr].label === name) {
                return true;
            }
        }
    }

    return false;
};



papaya.ui.Toolbar.prototype.buildMenu = function (menuData, topLevelButtonId, dataSource, modifier, context) {
    var menu = null, items;

    if (context === undefined) {
        context = false;
    }

    if (!menuData.required || ((papaya.utilities.ObjectUtils.bind(this.container, papaya.utilities.ObjectUtils.dereferenceIn(this.container, menuData.required)))() === true)) {
        menu = new papaya.ui.Menu(this.viewer, menuData, papaya.utilities.ObjectUtils.bind(this, this.doAction), this.viewer, modifier);

        if (menuData.label === "SPACE") {
            this.spaceMenu = menuData;
        }

        if (!context) {
            if (topLevelButtonId) {
                menu.setMenuButton(topLevelButtonId);
            } else {
                topLevelButtonId = menu.buildMenuButton();
            }
        }

        items = menuData.items;
        if (items) {
            this.buildMenuItems(menu, items, topLevelButtonId, dataSource, modifier);
        }
    }

    return menu;
};



papaya.ui.Toolbar.prototype.buildMenuItems = function (menu, itemData, topLevelButtonId, dataSource, modifier) {
    var ctrItems, item, menu2;

    if (modifier === undefined) {
        modifier = "";
    }

    for (ctrItems = 0; ctrItems < itemData.length; ctrItems += 1) {
        if (!itemData[ctrItems].required || ((papaya.utilities.ObjectUtils.bind(this.container,
                papaya.utilities.ObjectUtils.dereferenceIn(this.container,
                itemData[ctrItems].required)))(parseInt(modifier)) === true)) {
            if (itemData[ctrItems].type === "spacer") {
                item = new papaya.ui.MenuItemSpacer();
            } else if (itemData[ctrItems].type === "radiobutton") {
                item = new papaya.ui.MenuItemRadioButton(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    papaya.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            } else if (itemData[ctrItems].type === "checkbox") {
                item = new papaya.ui.MenuItemCheckBox(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    papaya.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            } else if (itemData[ctrItems].type === "file") {
                if ((!itemData[ctrItems].hide) && (!itemData[ctrItems].required || ((papaya.utilities.ObjectUtils.bind(this.container,
                    papaya.utilities.ObjectUtils.dereferenceIn(this.container,
                        itemData[ctrItems].required)))(parseInt(modifier)) === true))) {
                    item = new papaya.ui.MenuItemFileChooser(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, papaya.utilities.ObjectUtils.bind(this, this.doAction), false, modifier);
                }
            } else if (itemData[ctrItems].type === "folder") {
                if ((!itemData[ctrItems].hide) && (!itemData[ctrItems].required || ((papaya.utilities.ObjectUtils.bind(this.container,
                        papaya.utilities.ObjectUtils.dereferenceIn(this.container,
                            itemData[ctrItems].required)))(parseInt(modifier)) === true))) {
                    item = new papaya.ui.MenuItemFileChooser(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, papaya.utilities.ObjectUtils.bind(this, this.doAction), true, modifier);
                } else {
                    item = null;
                }
            } else if (itemData[ctrItems].type === "displayrange") {
                if (this.viewer.screenVolumes[modifier].supportsDynamicColorTable()) {
                    item = new papaya.ui.MenuItemRange(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                        papaya.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
                } else {
                    item = null;
                }
            } else if (itemData[ctrItems].type === "range") {
                if (papaya.utilities.PlatformUtils.isInputRangeSupported()) {
                    item = new papaya.ui.MenuItemSlider(this.viewer, itemData[ctrItems].label,
                        itemData[ctrItems].action, papaya.utilities.ObjectUtils.bind(this, this.doAction), dataSource,
                        itemData[ctrItems].method, modifier);
                }
            } else {
                item = new papaya.ui.MenuItem(this.viewer, itemData[ctrItems].label, itemData[ctrItems].action,
                    papaya.utilities.ObjectUtils.bind(this, this.doAction), dataSource, itemData[ctrItems].method, modifier);
            }
        } else {
            item = null;
        }

        if (item) {
            menu.addMenuItem(item);

            if (itemData[ctrItems].items) {
                menu2 = this.buildMenu(itemData[ctrItems], topLevelButtonId, dataSource, modifier);
                item.menu = menu2;
                item.callback = papaya.utilities.ObjectUtils.bind(menu2, menu2.showMenu);
            }
        }
    }
};



papaya.ui.Toolbar.prototype.updateImageButtons = function () {
    this.container.toolbarHtml.find("." + PAPAYA_MENU_BUTTON_CSS).remove();
    this.doUpdateImageButtons();
    this.updateSurfaceButtons();
};



papaya.ui.Toolbar.prototype.doUpdateImageButtons = function () {
    var ctr, screenVol, dataUrl, data;

    this.imageMenus = [];

    if (this.container.showImageButtons) {
        for (ctr = this.viewer.screenVolumes.length - 1; ctr >= 0; ctr -= 1) {
            screenVol = this.viewer.screenVolumes[ctr];
            dataUrl = screenVol.icon;

            data = {
                "menus" : [
                    {"label": "ImageButton", "icons": [dataUrl], "items": null, "imageButton": true}
                ]
            };

            if (ctr === 0) {
                if (screenVol.rgb) {
                    data.menus[0].items = papaya.ui.Toolbar.RGB_IMAGE_MENU_DATA.items;
                } else if (screenVol.dti) {
                    data.menus[0].items = papaya.ui.Toolbar.DTI_IMAGE_MENU_DATA.items;
                } else {
                    data.menus[0].items = papaya.ui.Toolbar.BASE_IMAGE_MENU_DATA.items;
                }
            } else {
                if (screenVol.dti) {
                    data.menus[0].items = papaya.ui.Toolbar.DTI_IMAGE_MENU_DATA.items;
                } else {
                    data.menus[0].items = papaya.ui.Toolbar.OVERLAY_IMAGE_MENU_DATA.items;
                }
            }

            if (!this.container.combineParametric || !screenVol.parametric) {
                this.imageMenus.push((this.buildMenu(data.menus[0], null, screenVol, ctr.toString())));
            }
        }
    }
};



papaya.ui.Toolbar.prototype.updateSurfaceButtons = function () {
    var ctr, dataUrl, data, solidColor;

    this.surfaceMenus = [];

    if (this.container.showImageButtons) {
        for (ctr = this.viewer.surfaces.length - 1; ctr >= 0; ctr -= 1) {
            solidColor = this.viewer.surfaces[ctr].solidColor;

            if (solidColor === null) {
                solidColor = [.5,.5,.5];
            }

            dataUrl = papaya.viewer.ScreenVolume.makeSolidIcon(solidColor[0], solidColor[1], solidColor[2]);

            data = {
                "menus" : [
                    {"label": "SurfaceButton", "icons": [dataUrl], "items": papaya.ui.Toolbar.SURFACE_MENU_DATA.items, "imageButton": true, "surfaceButton": true}
                ]
            };

            this.surfaceMenus.push((this.buildMenu(data.menus[0], null, this.viewer.surfaces[ctr], ctr.toString())));
        }
    }
};



papaya.ui.Toolbar.prototype.closeAllMenus = function (skipContext) {
    var menuHtml, modalDialogHtml, modalDialogBackgroundHtml, contextMenuHtml;

    menuHtml = this.container.toolbarHtml.find("." + PAPAYA_MENU_CSS);
    menuHtml.hide(100);
    menuHtml.remove();

    if (this.container.showControlBar) {
        menuHtml = this.container.sliderControlHtml.find("." + PAPAYA_MENU_CSS);
        menuHtml.hide(100);
        menuHtml.remove();
    }

    modalDialogHtml = this.container.toolbarHtml.find("." + PAPAYA_DIALOG_CSS);
    modalDialogHtml.hide(100);
    modalDialogHtml.remove();

    modalDialogBackgroundHtml = this.container.toolbarHtml.find("." + PAPAYA_DIALOG_BACKGROUND);
    modalDialogBackgroundHtml.hide(100);
    modalDialogBackgroundHtml.remove();

    // context menu
    if (!skipContext) {
        contextMenuHtml = this.container.viewerHtml.find("." + PAPAYA_MENU_CSS);
        if (contextMenuHtml) {
            contextMenuHtml.hide(100);
            contextMenuHtml.remove();
        }
    }
};



papaya.ui.Toolbar.prototype.isShowingMenus = function () {
    var menuVisible, dialogVisible;

    menuVisible = this.container.toolbarHtml.find("." + PAPAYA_MENU_CSS).is(":visible");
    dialogVisible = this.container.toolbarHtml.find("." + PAPAYA_DIALOG_CSS).is(":visible");

    return (menuVisible || dialogVisible);
};



papaya.ui.Toolbar.prototype.doAction = function (action, file, keepopen) {
    var imageIndex, colorTableName, dialog, atlasName, imageName, folder, ctr;

    if (!keepopen) {
        this.closeAllMenus();
    }

    if (action) {
        if (action.startsWith("ImageButton")) {
            imageIndex = parseInt(action.substr(action.length - 2, 1), 10);
            this.viewer.setCurrentScreenVol(imageIndex);
            this.updateImageButtons();
        } else if (action.startsWith("OpenSurface-")) {
            imageName = action.substring(action.indexOf("-") + 1);
            this.viewer.loadSurface(imageName);
        } else if (action.startsWith("Open-")) {
            imageName = action.substring(action.indexOf("-") + 1);
            this.viewer.loadImage(imageName);
        } else if (action === "OpenImage") {
            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadImage(file);
        } else if (action === "OpenDTI") {
            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadingDTI = true;
            this.viewer.loadImage(file);
        } else if (action === "OpenSurface") {
            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadSurface(file);
        } else if (action === "OpenFolder") {
            folder = [];
            for (ctr = 0; ctr < file.length; ctr += 1) {
                if (file[ctr].name.startsWith('.')) {
                    console.log("Ignoring file " + file[ctr].name);
                } else {
                    folder.push(file[ctr]);
                }
            }

            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadImage(folder);
        } else if (action.startsWith("ColorTable")) {
            colorTableName = action.substring(action.indexOf("-") + 1, action.lastIndexOf("-"));
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].changeColorTable(this.viewer, colorTableName);
            this.updateImageButtons();
        } else if (action.startsWith("CloseAllImages")) {
            papaya.Container.resetViewer(this.container.containerIndex, {});
        } else if (action === "Preferences") {
            dialog = new papaya.ui.Dialog(this.container, "Viewer Preferences", papaya.ui.Toolbar.PREFERENCES_DATA,
                this.container.preferences, papaya.utilities.ObjectUtils.bind(this.container.preferences,
                    this.container.preferences.updatePreference),
                    papaya.utilities.ObjectUtils.bind(this,
                        function() {
                            this.viewer.updateScreenSliceTransforms();
                            this.viewer.drawViewer(false, true);
                        }
                    )
            );
            dialog.showDialog();
        } else if (action === "SurfacePreferences") {
            dialog = new papaya.ui.Dialog(this.container, "Surface Preferences", papaya.ui.Toolbar.PREFERENCES_SURFACE_DATA,
                this.container.preferences, papaya.utilities.ObjectUtils.bind(this.container.preferences,
                    this.container.preferences.updatePreference),
                papaya.utilities.ObjectUtils.bind(this,
                    function() {
                        this.viewer.updateScreenSliceTransforms();
                        this.viewer.surfaceView.updatePreferences();
                        this.viewer.drawViewer(false, true);
                    }
                )
            );
            dialog.showDialog();
        } else if (action === "License") {
            dialog = new papaya.ui.Dialog(this.container, "License", papaya.ui.Toolbar.LICENSE_DATA,
                papaya.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action === "KeyboardRef") {
            dialog = new papaya.ui.Dialog(this.container, "Keyboard Reference", papaya.ui.Toolbar.KEYBOARD_REF_DATA,
                papaya.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action === "MouseRef") {
            dialog = new papaya.ui.Dialog(this.container, "Mouse Reference", papaya.ui.Toolbar.MOUSE_REF_DATA,
                papaya.Container, null, null, null, true);
            dialog.showDialog();
        } else if (action.startsWith("ImageInfo")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            if (this.viewer.screenVolumes[imageIndex].volume.numTimepoints > 1) {
                dialog = new papaya.ui.Dialog(this.container, "Image Info", papaya.ui.Toolbar.SERIES_INFO_DATA,
                    this.viewer, null, null, imageIndex.toString());
            } else {
                dialog = new papaya.ui.Dialog(this.container, "Image Info", papaya.ui.Toolbar.IMAGE_INFO_DATA,
                    this.viewer, null, null, imageIndex.toString());
            }

            dialog.showDialog();
        } else if (action.startsWith("SurfaceInfo")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            dialog = new papaya.ui.Dialog(this.container, "Surface Info", papaya.ui.Toolbar.SURFACE_INFO_DATA,
                this.viewer, null, null, imageIndex.toString());
            dialog.showDialog();
        } else if (action.startsWith("ShowHeader")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);

            dialog = new papaya.ui.Dialog(this.container, "Header", papaya.ui.Toolbar.HEADER_DATA,
                this.viewer, null, null, imageIndex.toString());

            dialog.showDialog();
        } else if (action.startsWith("SPACE")) {
            this.viewer.toggleWorldSpace();
            this.viewer.drawViewer(true);
        } else if (action.startsWith("AtlasChanged")) {
            atlasName = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.atlas.currentAtlas = atlasName;
            this.viewer.drawViewer(true);
        } else if (action.startsWith("ShowRuler")) {
            if (this.container.preferences.showRuler === "Yes") {
                this.container.preferences.updatePreference("showRuler", "No");
            } else {
                this.container.preferences.updatePreference("showRuler", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowOrientation")) {
            if (this.container.preferences.showOrientation === "Yes") {
                this.container.preferences.updatePreference("showOrientation", "No");
            } else {
                this.container.preferences.updatePreference("showOrientation", "Yes");
            }
            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("ShowCrosshairs")) {
            if (this.container.preferences.showCrosshairs === "Yes") {
                this.container.preferences.updatePreference("showCrosshairs", "No");
            } else {
                this.container.preferences.updatePreference("showCrosshairs", "Yes");
            }

            this.viewer.drawViewer();
            this.closeAllMenus();
        } else if (action.startsWith("EXPAND")) {
            if (this.container.collapsable) {
                this.container.collapseViewer();
            } else {
                this.container.expandViewer();
            }
        } else if (action.startsWith("OpenInMango")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);

            if (imageIndex === 0) {
                if (this.container.viewer.volume.urls[0]) {
                    papaya.utilities.PlatformUtils.launchCustomProtocol(this.container, papaya.utilities.UrlUtils.getAbsoluteUrl(PAPAYA_CUSTOM_PROTOCOL,
                        this.container.viewer.volume.urls[0]), this.customProtocolResult);
                }
            } else {
                if (this.container.viewer.screenVolumes[imageIndex].volume.urls[0]) {
                    papaya.utilities.PlatformUtils.launchCustomProtocol(this.container, papaya.utilities.UrlUtils.getAbsoluteUrl(PAPAYA_CUSTOM_PROTOCOL,
                        this.container.viewer.screenVolumes[imageIndex].volume.urls[0]) + "?" +
                    encodeURIComponent("baseimage=" + this.container.viewer.volume.fileName + "&params=o"),
                        this.customProtocolResult);
                }
            }
        } else if (action.startsWith("CloseOverlay")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);
            this.container.viewer.removeOverlay(imageIndex);
        } else if (action.startsWith("ToggleOverlay")) {
            imageIndex = parseInt(action.substring(action.lastIndexOf("-") + 1), 10);
            this.container.viewer.toggleOverlay(imageIndex);
        } else if (action.startsWith("Context-")) {
            this.container.contextManager.actionPerformed(action.substring(8));
        } else if (action.startsWith("DTI-RGB")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = false;
            this.viewer.screenVolumes[imageIndex].dtiColors = true;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-LinesColors")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = true;
            this.viewer.screenVolumes[imageIndex].dtiColors = true;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-Lines")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.screenVolumes[imageIndex].dtiLines = true;
            this.viewer.screenVolumes[imageIndex].dtiColors = false;
            this.viewer.screenVolumes[imageIndex].initDTI();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("DTI-Mod")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.container.display.drawProgress(0.1, "Loading");
            this.viewer.loadingDTIModRef = this.viewer.screenVolumes[imageIndex];
            this.viewer.loadImage(file);
        } else if (action.startsWith("LoadNegatives")) {
            imageIndex = action.substring(action.lastIndexOf("-") + 1);
            this.viewer.addParametric(imageIndex);
        } else if (action.startsWith("ShowSurfacePlanes")) {
            this.viewer.surfaceView.showSurfacePlanes = !this.viewer.surfaceView.showSurfacePlanes;
            this.viewer.surfaceView.updateActivePlanes();

            if (this.container.preferences.showSurfacePlanes === "Yes") {
                this.container.preferences.updatePreference("showSurfacePlanes", "No");
            } else {
                this.container.preferences.updatePreference("showSurfacePlanes", "Yes");
            }
            this.viewer.drawViewer(false, true);
            this.closeAllMenus();
        } else if (action.startsWith("ShowSurfaceCrosshairs")) {
            this.viewer.surfaceView.showSurfaceCrosshairs = !this.viewer.surfaceView.showSurfaceCrosshairs;
            this.viewer.surfaceView.updateActivePlanes();

            if (this.container.preferences.showSurfaceCrosshairs === "Yes") {
                this.container.preferences.updatePreference("showSurfaceCrosshairs", "No");
            } else {
                this.container.preferences.updatePreference("showSurfaceCrosshairs", "Yes");
            }
            this.viewer.drawViewer(false, true);
            this.closeAllMenus();
        } else if (action.startsWith("rotation")) {
            this.viewer.screenVolumes[0].updateTransform();
        } else if (action.startsWith("Rotate About")) {
            this.viewer.screenVolumes[0].rotationAbout = action.substring(0, action.indexOf("-"));
            this.viewer.screenVolumes[0].updateTransform();
            this.viewer.drawViewer(true, false);
        } else if (action.startsWith("ResetTransform")) {
            this.viewer.screenVolumes[0].resetTransform();
            this.viewer.screenVolumes[0].updateTransform();
            this.viewer.drawViewer(true, false);
        }
    }
};



papaya.ui.Toolbar.prototype.customProtocolResult = function (success) {
    if (success === false) { // initiated by a setTimeout, so popup blocker will interfere with window.open
        if ((papaya.utilities.PlatformUtils.browser === "Chrome") || (papaya.utilities.PlatformUtils.browser === "Internet Explorer")) {
            alert("Mango does not appear to be installed.  You can download Mango at:\n\nhttp://ric.uthscsa.edu/mango");
        } else {
            if (papaya.utilities.PlatformUtils.ios) {
                if (confirm("iMango does not appear to be installed.  Would you like to download it now?")) {
                    window.open("http://itunes.apple.com/us/app/imango/id423626092");
                }
            } else {
                if (confirm("Mango does not appear to be installed.  Would you like to download it now?")) {
                    window.open("http://ric.uthscsa.edu/mango/mango.html");
                }
            }
        }
    }
};



papaya.ui.Toolbar.prototype.updateTitleBar = function (title) {
    var elem = this.container.titlebarHtml[0];

    if (elem) {
        elem.innerHTML = title;
    }

    this.container.titlebarHtml.css({top: (this.container.viewerHtml.position().top - 1.25 * papaya.ui.Toolbar.SIZE)});
};



papaya.ui.Toolbar.prototype.showImageMenu = function (index) {
    this.viewer.screenVolumes[index].resetDynamicRange();
    this.imageMenus[index].showMenu();
};



papaya.ui.Toolbar.prototype.updateImageMenuRange = function (index, min, max) {
    this.imageMenus[index].updateRangeItem(min, max);
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.Atlas = papaya.viewer.Atlas || function (atlas, container, callback) {
    this.container = container;
    this.callback = callback;
    this.name = null;
    this.transformedname = null;
    this.labels = [];
    this.atlasLabelData = atlas.labels;
    this.volume = new papaya.volume.Volume(container.display, container.viewer);
    this.displayColumns = null;
    this.returnLabels = null;
    this.transform = null;
    this.currentAtlas = null;
    this.maxLabels = 0;
    this.probabilistic = false;

    var loadableImage = container.findLoadableImage(atlas.labels.atlas.header.images.summaryimagefile);

    if (container.params.atlasURL) {
        this.volume.readURLs([container.params.atlasURL], papaya.utilities.ObjectUtils.bind(this, this.readFinished));
    } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
        this.volume.readEncodedData([loadableImage.encode], papaya.utilities.ObjectUtils.bind(this, this.readFinished));
    } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
        this.volume.readURLs([loadableImage.url], papaya.utilities.ObjectUtils.bind(this, this.readFinished));
    }
};


/*** Static Pseudo-constants ***/

papaya.viewer.Atlas.MAX_LABELS = 4;
papaya.viewer.Atlas.PROBABILISTIC = [ "probabalistic", "probabilistic", "statistic" ]; // typo is in FSL < 5.0.2
papaya.viewer.Atlas.LABEL_SPLIT_REGEX = /\.|:|,|\//;  // possible delimiters


/*** Prototype Methods ***/

papaya.viewer.Atlas.prototype.getLabelAtCoordinate = function (xLoc, yLoc, zLoc) {
    var xTrans, yTrans, zTrans, val;

    if (this.transform && (this.currentAtlas === this.transformedname)) {
        xTrans = ((xLoc * this.transform[0][0]) + (yLoc * this.transform[0][1]) + (zLoc * this.transform[0][2]) +
            (this.transform[0][3]));
        yTrans = ((xLoc * this.transform[1][0]) + (yLoc * this.transform[1][1]) + (zLoc * this.transform[1][2]) +
            (this.transform[1][3]));
        zTrans = ((xLoc * this.transform[2][0]) + (yLoc * this.transform[2][1]) + (zLoc * this.transform[2][2]) +
            (this.transform[2][3]));
    } else {
        xTrans = xLoc;
        yTrans = yLoc;
        zTrans = zLoc;
    }

    val = (this.volume.getVoxelAtCoordinate(xTrans, yTrans, zTrans, 0, true));

    if (this.probabilistic) {
        val -= 1;
    }

    return this.formatLabels(this.labels[val], this.returnLabels);
};



papaya.viewer.Atlas.prototype.readFinished = function () {
    this.parseTransform();
    this.parseLabels();
    this.parseDisplayColumns();
    this.maxLabels = this.findMaxLabelParts();
    this.probabilistic = this.atlasLabelData.atlas.header.type &&
    ((this.atlasLabelData.atlas.header.type.toLowerCase() === papaya.viewer.Atlas.PROBABILISTIC[0]) ||
    (this.atlasLabelData.atlas.header.type.toLowerCase() === papaya.viewer.Atlas.PROBABILISTIC[1]) ||
    (this.atlasLabelData.atlas.header.type.toLowerCase() === papaya.viewer.Atlas.PROBABILISTIC[2]));

    this.returnLabels = [];
    this.returnLabels.length = this.maxLabels;

    if (this.atlasLabelData.atlas.header.transformedname) {
        this.transformedname = this.atlasLabelData.atlas.header.transformedname;
    }

    this.name = this.atlasLabelData.atlas.header.name;
    this.currentAtlas = this.name;

    var params = this.container.params.atlas;
    if (params) {
        if (params === this.transformedname) {
            this.currentAtlas = this.transformedname;
        }
    }

    this.callback();
};



papaya.viewer.Atlas.prototype.parseDisplayColumns = function () {
    var index, columns, ctr;

    if (this.atlasLabelData.atlas.header.display) {  // uses "display" attribute
        this.displayColumns = [];
        index = 0;
        columns = this.atlasLabelData.atlas.header.display.split(papaya.viewer.Atlas.LABEL_SPLIT_REGEX);

        for (ctr = 0; ctr < columns.length; ctr += 1) {
            if (columns[ctr] === "*") {
                this.displayColumns[index] = ctr;
                index += 1;
            }
        }
    }
};



papaya.viewer.Atlas.prototype.parseTransform = function () {
    var parts, ctrOut, ctrIn;

    if (this.atlasLabelData.atlas.header.transform) {
        parts = this.atlasLabelData.atlas.header.transform.split(" ");
        this.transform = papaya.volume.Transform.IDENTITY.clone();

        if (parts.length === 16) {
            for (ctrOut = 0; ctrOut < 4; ctrOut += 1) {
                for (ctrIn = 0; ctrIn < 4; ctrIn += 1) {
                    this.transform[ctrOut][ctrIn] = parseFloat(parts[(ctrOut * 4) + ctrIn]);
                }
            }
        }
    }
};



papaya.viewer.Atlas.prototype.parseLabels = function () {
    var ctr, index, label;

    for (ctr = 0; ctr < this.atlasLabelData.atlas.data.label.length; ctr += 1) {
        label = this.atlasLabelData.atlas.data.label[ctr];

        if (label.index) {
            index = parseInt(label.index, 10);
        } else {
            index = ctr;
        }

        if (label.content) {
            this.labels[index] = label.content;
        } else {
            this.labels[index] = label;
        }
    }
};



papaya.viewer.Atlas.prototype.formatLabels = function (labelString, labelArray) {
    var ctr, start, labelParts, numLabels;

    if (labelString) {
        labelParts = labelString.split(papaya.viewer.Atlas.LABEL_SPLIT_REGEX);

        if (this.displayColumns) {
            for (ctr = 0; ctr < labelParts.length; ctr += 1) {
                if (ctr < this.displayColumns.length) {
                    labelArray[ctr] = labelParts[this.displayColumns[ctr]];
                }
            }
        } else {
            numLabels = labelParts.length;
            start = 0;

            if (numLabels > papaya.viewer.Atlas.MAX_LABELS) {
                start = (numLabels - papaya.viewer.Atlas.MAX_LABELS);
            }

            for (ctr = start; ctr < labelParts.length; ctr += 1) {
                labelArray[ctr] = labelParts[ctr].trim();
            }
        }
    } else {
        for (ctr = 0; ctr < labelArray.length; ctr += 1) {
            labelArray[ctr] = "";
        }
    }

    return labelArray;
};



papaya.viewer.Atlas.prototype.findMaxLabelParts = function () {
    var ctr, tempArray;

    if (this.displayColumns) {
        return this.displayColumns.length;
    }

    tempArray = [];

    for (ctr = 0; ctr < this.labels.length; ctr += 1) {
        this.formatLabels(this.labels[ctr], tempArray);
    }

    return tempArray.length;
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.ColorTable = papaya.viewer.ColorTable || function (lutName, baseImage, colorTable) {
    var lut = null;

    if (colorTable !== undefined) {
        lut = colorTable;
    } else {
        lut = papaya.viewer.ColorTable.findLUT(lutName);
    }

    this.lutData = lut.data;
    this.maxLUT = 0;
    this.minLUT = 0;
    this.knotThresholds = [];
    this.knotRangeRatios = [];

    this.LUTarrayG = new Array(256);
    this.LUTarrayR = new Array(256);
    this.LUTarrayB = new Array(256);
    this.isBaseImage = baseImage;

    this.knotMin = this.lutData[0];
    this.knotMax = this.lutData[this.lutData.length - 1];
    this.useGradation = (typeof lut.gradation === "undefined") || lut.gradation;

    this.updateLUT(papaya.viewer.ColorTable.LUT_MIN, papaya.viewer.ColorTable.LUT_MAX);
};


/*** Static Pseudo-constants ***/

papaya.viewer.ColorTable.TABLE_GRAYSCALE = {"name": "Grayscale", "data": [[0, 0, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_SPECTRUM = {"name": "Spectrum", "data": [[0, 0, 0, 0], [0.1, 0, 0, 1], [0.33, 0, 1, 1],
    [0.5, 0, 1, 0], [0.66, 1, 1, 0], [0.9, 1, 0, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2YELLOW = {"name": "Overlay (Positives)", "data": [[0, 1, 0, 0], [1, 1, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2GREEN = {"name": "Overlay (Negatives)", "data": [[0, 0, 0, 1], [1, 0, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_HOTANDCOLD = {"name": "Hot-and-Cold", "data": [[0, 0, 0, 1], [0.15, 0, 1, 1],
    [0.3, 0, 1, 0], [0.45, 0, 0, 0], [0.5, 0, 0, 0], [0.55, 0, 0, 0], [0.7, 1, 1, 0], [0.85, 1, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_GOLD = {"name": "Gold", "data": [[0, 0, 0, 0], [0.13, 0.19, 0.03, 0],
    [0.25, 0.39, 0.12, 0], [0.38, 0.59, 0.26, 0], [0.50, 0.80, 0.46, 0.08], [0.63, 0.99, 0.71, 0.21],
    [0.75, 0.99, 0.88, 0.34], [0.88, 0.99, 0.99, 0.48], [1, 0.90, 0.95, 0.61]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2WHITE = {"name": "Red Overlay", "data": [[0, 0.75, 0, 0], [0.5, 1, 0.5, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_GREEN2WHITE = {"name": "Green Overlay", "data": [[0, 0, 0.75, 0], [0.5, 0.5, 1, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2WHITE = {"name": "Blue Overlay", "data": [[0, 0, 0, 1], [0.5, 0, 0.5, 1],
    [0.95, 0, 1, 1], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_DTI_SPECTRUM = {"name": "Spectrum", "data": [[0, 1, 0, 0], [0.5, 0, 1, 0], [1, 0, 0, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_FIRE = {"name": "Fire", "data": [[0, 0, 0, 0], [0.06, 0, 0, 0.36], [0.16, 0.29, 0, 0.75],
    [0.22, 0.48, 0, 0.89], [0.31, 0.68, 0, 0.6], [0.37, 0.76, 0, 0.36], [0.5, 0.94, 0.31, 0], [0.56, 1, 0.45, 0],
    [0.81, 1, 0.91, 0], [0.88, 1, 1, 0.38], [1,1,1,1]], "gradation": true};


papaya.viewer.ColorTable.ARROW_ICON = "data:image/gif;base64,R0lGODlhCwARAPfGMf//////zP//mf//Zv//M///AP/M///MzP/Mmf/M" +
    "Zv/MM//MAP+Z//+ZzP+Zmf+ZZv+ZM/+ZAP9m//9mzP9mmf9mZv9mM/9mAP8z//8zzP8zmf8zZv8zM/8zAP8A//8AzP8Amf8AZv8AM/8AAMz//8z/" +
    "zMz/mcz/Zsz/M8z/AMzM/8zMzMzMmczMZszMM8zMAMyZ/8yZzMyZmcyZZsyZM8yZAMxm/8xmzMxmmcxmZsxmM8xmAMwz/8wzzMwzmcwzZswzM8wz" +
    "AMwA/8wAzMwAmcwAZswAM8wAAJn//5n/zJn/mZn/Zpn/M5n/AJnM/5nMzJnMmZnMZpnMM5nMAJmZ/5mZzJmZmZmZZpmZM5mZAJlm/5lmzJlmmZlm" +
    "ZplmM5lmAJkz/5kzzJkzmZkzZpkzM5kzAJkA/5kAzJkAmZkAZpkAM5kAAGb//2b/zGb/mWb/Zmb/M2b/AGbM/2bMzGbMmWbMZmbMM2bMAGaZ/2aZ" +
    "zGaZmWaZZmaZM2aZAGZm/2ZmzGZmmWZmZmZmM2ZmAGYz/2YzzGYzmWYzZmYzM2YzAGYA/2YAzGYAmWYAZmYAM2YAADP//zP/zDP/mTP/ZjP/MzP/" +
    "ADPM/zPMzDPMmTPMZjPMMzPMADOZ/zOZzDOZmTOZZjOZMzOZADNm/zNmzDNmmTNmZjNmMzNmADMz/zMzzDMzmTMzZjMzMzMzADMA/zMAzDMAmTMA" +
    "ZjMAMzMAAAD//wD/zAD/mQD/ZgD/MwD/AADM/wDMzADMmQDMZgDMMwDMAACZ/wCZzACZmQCZZgCZMwCZAABm/wBmzABmmQBmZgBmMwBmAAAz/wAz" +
    "zAAzmQAzZgAzMwAzAAAA/wAAzAAAmQAAZgAAM+4AAN0AALsAAKoAAIgAAHcAAFUAAEQAACIAABEAAADuAADdAAC7AACqAACIAAB3AABVAABEAAAi" +
    "AAARAAAA7gAA3QAAuwAAqgAAiAAAdwAAVQAARAAAIgAAEe7u7t3d3bu7u6qqqoiIiHd3d1VVVURERCIiIhEREQAAACH5BAEAAMYALAAAAAALABEA" +
    "AAg/AI0JFGhvoEGC+vodRKgv4UF7DSMqZBixoUKIFSv2w5jRIseOGztK/JgxpMiEJDWmHHkSZUuTIvvt60ezps2AADs=";
papaya.viewer.ColorTable.ARROW_ICON_WIDTH = 11;

papaya.viewer.ColorTable.DEFAULT_COLOR_TABLE = papaya.viewer.ColorTable.TABLE_GRAYSCALE;

papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES = [papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN];

papaya.viewer.ColorTable.OVERLAY_COLOR_TABLES = [
    papaya.viewer.ColorTable.TABLE_RED2WHITE,
    papaya.viewer.ColorTable.TABLE_GREEN2WHITE,
    papaya.viewer.ColorTable.TABLE_BLUE2WHITE
];

papaya.viewer.ColorTable.TABLE_ALL = [
    papaya.viewer.ColorTable.TABLE_GRAYSCALE,
    papaya.viewer.ColorTable.TABLE_SPECTRUM,
    papaya.viewer.ColorTable.TABLE_FIRE,
    papaya.viewer.ColorTable.TABLE_HOTANDCOLD,
    papaya.viewer.ColorTable.TABLE_GOLD,
    papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN,
    papaya.viewer.ColorTable.TABLE_RED2WHITE,
    papaya.viewer.ColorTable.TABLE_GREEN2WHITE,
    papaya.viewer.ColorTable.TABLE_BLUE2WHITE
];

papaya.viewer.ColorTable.LUT_MIN = 0;
papaya.viewer.ColorTable.LUT_MAX = 255;
papaya.viewer.ColorTable.ICON_SIZE = 18;
papaya.viewer.ColorTable.COLOR_BAR_WIDTH = 100;
papaya.viewer.ColorTable.COLOR_BAR_HEIGHT = 15;


/*** Static Methods ***/

papaya.viewer.ColorTable.findLUT = function (name) {
    var ctr;

    for (ctr = 0; ctr < papaya.viewer.ColorTable.TABLE_ALL.length; ctr += 1) {
        if (papaya.viewer.ColorTable.TABLE_ALL[ctr].name == name) {  // needs to be ==, not ===
            return papaya.viewer.ColorTable.TABLE_ALL[ctr];
        }
    }

    return papaya.viewer.ColorTable.TABLE_GRAYSCALE;
};



papaya.viewer.ColorTable.addCustomLUT = function (lut) {
    if (papaya.viewer.ColorTable.findLUT(lut.name).data === papaya.viewer.ColorTable.TABLE_GRAYSCALE.data) {
        papaya.viewer.ColorTable.TABLE_ALL.push(lut);
    }
};


/*** Prototype Methods ***/

papaya.viewer.ColorTable.prototype.updateMinLUT = function (minLUTnew) {
    this.updateLUT(minLUTnew, this.maxLUT);
};



papaya.viewer.ColorTable.prototype.updateMaxLUT = function (maxLUTnew) {
    this.updateLUT(this.minLUT, maxLUTnew);
};



papaya.viewer.ColorTable.prototype.updateLUT = function (minLUTnew, maxLUTnew) {
    var range, ctr, ctrKnot, value;

    this.maxLUT = maxLUTnew;
    this.minLUT = minLUTnew;
    range = this.maxLUT - this.minLUT;

    for (ctr = 0; ctr < this.lutData.length; ctr += 1) {
        this.knotThresholds[ctr] = (this.lutData[ctr][0] * range) + this.minLUT;
    }

    for (ctr = 0; ctr < (this.lutData.length - 1); ctr += 1) {
        this.knotRangeRatios[ctr] = papaya.viewer.ColorTable.LUT_MAX / (this.knotThresholds[ctr + 1] -
            this.knotThresholds[ctr]);
    }

    for (ctr = 0; ctr < 256; ctr += 1) {
        if (ctr <= this.minLUT) {
            this.LUTarrayR[ctr] = this.knotMin[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMin[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMin[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else if (ctr > this.maxLUT) {
            this.LUTarrayR[ctr] = this.knotMax[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMax[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMax[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else {
            for (ctrKnot = 0; ctrKnot < (this.lutData.length - 1); ctrKnot += 1) {
                if ((ctr > this.knotThresholds[ctrKnot]) && (ctr <= this.knotThresholds[ctrKnot + 1])) {
                    if (this.useGradation) {
                        value = (((ctr - this.knotThresholds[ctrKnot]) * this.knotRangeRatios[ctrKnot]) + 0.5) /
                            papaya.viewer.ColorTable.LUT_MAX;

                        this.LUTarrayR[ctr] = (((1 - value) * this.lutData[ctrKnot][1]) +
                            (value * this.lutData[ctrKnot + 1][1])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (((1 - value) * this.lutData[ctrKnot][2]) +
                            (value * this.lutData[ctrKnot + 1][2])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (((1 - value) * this.lutData[ctrKnot][3]) +
                            (value * this.lutData[ctrKnot + 1][3])) * papaya.viewer.ColorTable.LUT_MAX;
                    } else {
                        this.LUTarrayR[ctr] = (this.lutData[ctrKnot][1]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (this.lutData[ctrKnot][2]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (this.lutData[ctrKnot][3]) * papaya.viewer.ColorTable.LUT_MAX;
                    }
                }
            }
        }
    }
};



papaya.viewer.ColorTable.prototype.lookupRed = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayR[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupGreen = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayG[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupBlue = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayB[index] & 0xff);
    }

    return 0;
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.Display = papaya.viewer.Display || function (container, width) {
    this.container = container;
    this.viewer = container.viewer;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = papaya.viewer.Display.SIZE;
    this.context = this.canvas.getContext("2d");
    this.canvas.style.padding = 0;
    this.canvas.style.margin = 0;
    this.canvas.style.border = "none";
    this.canvas.style.cursor = "default";
    this.tempCoord = new papaya.core.Coordinate(0, 0, 0);
    this.drawingError = false;
    this.progress = 0;
    this.progressStartTime = 0;
    this.progressTimeout = null;
    this.drawingProgress = false;
    this.errorMessage = "";

    this.drawUninitializedDisplay();
};


/*** Static Pseudo-constants ***/

papaya.viewer.Display.SIZE = 50;

papaya.viewer.Display.MINI_LABELS_THRESH = 700;

papaya.viewer.Display.PADDING = 8;

papaya.viewer.Display.FONT_COLOR_WHITE = "white";
papaya.viewer.Display.FONT_COLOR_ORANGE = "rgb(182, 59, 0)";

papaya.viewer.Display.FONT_SIZE_COORDINATE_LABEL = 12;
papaya.viewer.Display.FONT_COLOR_COORDINATE_LABEL = papaya.viewer.Display.FONT_COLOR_WHITE;
papaya.viewer.Display.FONT_TYPE_COORDINATE_LABEL = "sans-serif";

papaya.viewer.Display.FONT_SIZE_COORDINATE_VALUE = 18;
papaya.viewer.Display.FONT_COLOR_COORDINATE_VALUE = papaya.viewer.Display.FONT_COLOR_ORANGE;
papaya.viewer.Display.FONT_TYPE_COORDINATE_VALUE = "sans-serif";
papaya.viewer.Display.PRECISION_COORDINATE_VALUE = 5;
papaya.viewer.Display.PRECISION_COORDINATE_MAX = 12;

papaya.viewer.Display.FONT_SIZE_IMAGE_VALUE = 20;
papaya.viewer.Display.FONT_COLOR_IMAGE_VALUE = papaya.viewer.Display.FONT_COLOR_WHITE;
papaya.viewer.Display.FONT_TYPE_IMAGE_VALUE = "sans-serif";
papaya.viewer.Display.PRECISION_IMAGE_VALUE = 9;
papaya.viewer.Display.PRECISION_IMAGE_MAX = 14;

papaya.viewer.Display.FONT_SIZE_ATLAS_MINI = 14;
papaya.viewer.Display.FONT_SIZE_ATLAS = 20;
papaya.viewer.Display.FONT_TYPE_ATLAS = "sans-serif";

papaya.viewer.Display.FONT_SIZE_MESSAGE_VALUE = 20;
papaya.viewer.Display.FONT_TYPE_MESSAGE_VALUE = "sans-serif";
papaya.viewer.Display.FONT_COLOR_MESSAGE = "rgb(200, 75, 25)";

papaya.viewer.Display.PROGRESS_LABEL_SUFFIX = ["...", "", ".", ".."];
papaya.viewer.Display.PROGRESS_LABEL_DEFAULT = "Loading";


/*** Prototype Methods ***/

papaya.viewer.Display.prototype.drawUninitializedDisplay = function () {
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
};



papaya.viewer.Display.prototype.canDraw = function () {
    return !(this.drawingError || this.drawingProgress);
};



papaya.viewer.Display.prototype.drawEmptyDisplay = function () {
    if (this.canDraw()) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (this.drawError) {
        this.drawError(this.errorMessage);
    }
};



papaya.viewer.Display.prototype.drawDisplay = function (xLoc, yLoc, zLoc) {
    var locY, val, viewerOrigin, height, atlasNumLabels, atlasLabelWidth, atlasLabel, ctr, metricsAtlas, sizeRatio,
        viewerVoxelDims, labelColorThresh, halfWidth, coordinateItemWidth, smallViewer, precision;

    if (this.canDraw()) {
        // initialize
        sizeRatio = this.viewer.canvas.width / 600.0;
        halfWidth = this.viewer.canvas.width / 2.0;
        coordinateItemWidth = halfWidth / 5.0;
        height = this.canvas.height;
        smallViewer = (halfWidth < 300);

        if (this.container.preferences.atlasLocks !== "Mouse") {
            xLoc = this.viewer.currentCoord.x;
            yLoc = this.viewer.currentCoord.y;
            zLoc = this.viewer.currentCoord.z;
        }

        // canvas background
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);


        // coordinate labels
        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_COORDINATE_LABEL;
        this.context.font = papaya.viewer.Display.FONT_SIZE_COORDINATE_LABEL + "px " +
            papaya.viewer.Display.FONT_TYPE_COORDINATE_LABEL;

        locY = papaya.viewer.Display.FONT_SIZE_COORDINATE_LABEL + papaya.viewer.Display.PADDING * 0.75;

        this.context.fillText("x", 1.5 * papaya.viewer.Display.PADDING, locY);
        this.context.fillText("y", 1.5 * papaya.viewer.Display.PADDING + coordinateItemWidth, locY);
        this.context.fillText("z", 1.5 * papaya.viewer.Display.PADDING + (2 * coordinateItemWidth), locY);


        // coordinate values
        locY += papaya.viewer.Display.FONT_SIZE_COORDINATE_VALUE + papaya.viewer.Display.PADDING / 2;

        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_COORDINATE_VALUE;
        this.context.font = (papaya.viewer.Display.FONT_SIZE_COORDINATE_VALUE - (smallViewer ? 2 : 0)) + "px " +
            papaya.viewer.Display.FONT_TYPE_COORDINATE_VALUE;

        if (this.viewer.worldSpace) {
            viewerOrigin = this.viewer.screenVolumes[0].volume.header.origin;  // base image origin
            viewerVoxelDims = this.viewer.screenVolumes[0].volume.header.voxelDimensions;
            precision = Math.min(papaya.viewer.Display.PRECISION_COORDINATE_MAX,
                (Math.round(papaya.viewer.Display.PRECISION_COORDINATE_VALUE * sizeRatio)));
            this.context.fillText(parseFloat(((xLoc - viewerOrigin.x) * viewerVoxelDims.xSize).toString().substr(0,
                precision)), 1.5 * papaya.viewer.Display.PADDING, locY);
            this.context.fillText(parseFloat(((viewerOrigin.y - yLoc) * viewerVoxelDims.ySize).toString().substr(0,
                precision)), 1.5 * papaya.viewer.Display.PADDING + coordinateItemWidth, locY);
            this.context.fillText(parseFloat(((viewerOrigin.z - zLoc) * viewerVoxelDims.zSize).toString().substr(0,
                precision)), 1.5 * papaya.viewer.Display.PADDING + (2 * coordinateItemWidth), locY);
        } else {
            this.context.fillText(Math.round(xLoc).toString(), 1.5 * papaya.viewer.Display.PADDING, locY);
            this.context.fillText(Math.round(yLoc).toString(), 1.5 * papaya.viewer.Display.PADDING +
                coordinateItemWidth, locY);
            this.context.fillText(Math.round(zLoc).toString(), 1.5 * papaya.viewer.Display.PADDING +
                (2 * coordinateItemWidth), locY);
        }


        // image value
        if (!this.viewer.currentScreenVolume.rgb && !this.viewer.currentScreenVolume.dti) {
            val = this.viewer.getCurrentValueAt(xLoc, yLoc, zLoc);
            this.canvas.currentval = val.toString();  // for unit testing

            locY = (height / 2.0) + (papaya.viewer.Display.FONT_SIZE_IMAGE_VALUE / 2.0) -
                (papaya.viewer.Display.PADDING / 2.0);
            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_IMAGE_VALUE;
            this.context.font = (papaya.viewer.Display.FONT_SIZE_IMAGE_VALUE - (smallViewer ? 2 : 0)) + "px " +
                papaya.viewer.Display.FONT_TYPE_IMAGE_VALUE;
            precision = Math.min(papaya.viewer.Display.PRECISION_IMAGE_MAX,
                Math.round(papaya.viewer.Display.PRECISION_IMAGE_VALUE * sizeRatio));
            this.context.fillText(parseFloat(val.toString().substr(0, precision)), (2 * papaya.viewer.Display.PADDING) +
                (3 * coordinateItemWidth), locY);
        }

        // atlas labels
        if (this.viewer.atlas && this.viewer.atlas.volume.isLoaded) {
            this.viewer.getWorldCoordinateAtIndex(xLoc, yLoc, zLoc, this.tempCoord);
            atlasLabel = this.viewer.atlas.getLabelAtCoordinate(this.tempCoord.x, this.tempCoord.y, this.tempCoord.z);
            atlasNumLabels = atlasLabel.length;
            labelColorThresh = Math.ceil(this.viewer.atlas.maxLabels / 2);

            if ((halfWidth < 300) && (atlasNumLabels >= 2)) {
                atlasLabelWidth = halfWidth * 0.75;

                for (ctr = atlasNumLabels - 1; ctr >= 0; ctr -= 1) {
                    if (ctr === (atlasNumLabels - 2)) {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_ORANGE;
                        this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    } else {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_WHITE;
                        this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    }

                    metricsAtlas = this.context.measureText(atlasLabel[ctr]);
                    if (metricsAtlas.width > (atlasLabelWidth - 2 * papaya.viewer.Display.PADDING)) {
                        atlasLabel[ctr] = (atlasLabel[ctr].substr(0, Math.round(atlasLabel[ctr].length / 3)) + " ... " +
                        atlasLabel[ctr].substr(atlasLabel[ctr].length - 3, 3));
                    }

                    if (ctr === (atlasNumLabels - 2)) {
                        this.context.fillText(atlasLabel[ctr], halfWidth + (halfWidth * 0.25),
                            papaya.viewer.Display.PADDING * 1.5  + (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    } else if (ctr === (atlasNumLabels - 1)) {
                        this.context.fillText(atlasLabel[ctr], halfWidth + (halfWidth * 0.25),
                            papaya.viewer.Display.PADDING + (height / 2.0) +
                            (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    }
                }
            } else if ((halfWidth < 600) && (atlasNumLabels > 2)) {
                atlasLabelWidth = halfWidth / 2;

                for (ctr = atlasNumLabels - 1; ctr >= 0; ctr -= 1) {
                    if (ctr < labelColorThresh) {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_ORANGE;
                        this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    } else {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_WHITE;
                        this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    }

                    metricsAtlas = this.context.measureText(atlasLabel[ctr]);
                    if (metricsAtlas.width > (atlasLabelWidth - papaya.viewer.Display.PADDING * 6)) {
                        atlasLabel[ctr] = (atlasLabel[ctr].substr(0, Math.round(atlasLabel[ctr].length / 3)) +
                            " ... " + atlasLabel[ctr].substr(atlasLabel[ctr].length - 3, 3));
                    }

                    if (ctr === 0) {
                        this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING * 5,
                            papaya.viewer.Display.PADDING * 1.5  + (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    } else if (ctr === 1) {
                        this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING * 5,
                            papaya.viewer.Display.PADDING + (height / 2.0) +
                            (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    } else if (ctr === 2) {
                        this.context.fillText(atlasLabel[ctr], halfWidth * 1.5 + papaya.viewer.Display.PADDING * 5,
                            papaya.viewer.Display.PADDING * 1.5  + (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    } else if (ctr === 3) {
                        this.context.fillText(atlasLabel[ctr], halfWidth * 1.5 + papaya.viewer.Display.PADDING * 5,
                            papaya.viewer.Display.PADDING + (height / 2.0) +
                            (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                    }
                }
            } else if ((halfWidth < 800) && (atlasNumLabels > 3)) {
                atlasLabelWidth = halfWidth / 3;

                for (ctr = 0; ctr < 4; ctr += 1) {
                    if (ctr < 2) {
                        if (ctr < labelColorThresh) {
                            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_ORANGE;
                            this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                                papaya.viewer.Display.FONT_TYPE_ATLAS;
                        } else {
                            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_WHITE;
                            this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS_MINI + "px " +
                                papaya.viewer.Display.FONT_TYPE_ATLAS;
                        }

                        metricsAtlas = this.context.measureText(atlasLabel[ctr]);
                        if (metricsAtlas.width > (atlasLabelWidth - papaya.viewer.Display.PADDING * 6)) {
                            atlasLabel[ctr] = (atlasLabel[ctr].substr(0, Math.round(atlasLabel[ctr].length / 3)) +
                                " ... " + atlasLabel[ctr].substr(atlasLabel[ctr].length - 3, 3));
                        }

                        if (ctr === 0) {
                            this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING * 5,
                                papaya.viewer.Display.PADDING * 1.5  +
                                (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                        } else if (ctr === 1) {
                            this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING * 5,
                                papaya.viewer.Display.PADDING + (height / 2.0) +
                                (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                        } else if (ctr === 2) {
                            this.context.fillText(atlasLabel[ctr], halfWidth * 1.5 + papaya.viewer.Display.PADDING * 5,
                                papaya.viewer.Display.PADDING * 1.5  +
                                (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                        } else if (ctr === 3) {
                            this.context.fillText(atlasLabel[ctr], halfWidth * 1.5 + papaya.viewer.Display.PADDING * 5,
                                papaya.viewer.Display.PADDING + (height / 2.0) +
                                (papaya.viewer.Display.FONT_SIZE_ATLAS_MINI / 2.0));
                        }
                    } else {
                        locY = (height / 2.0) + (papaya.viewer.Display.FONT_SIZE_ATLAS / 2.0) -
                            (papaya.viewer.Display.PADDING / 2.0);

                        if (ctr < labelColorThresh) {
                            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_ORANGE;
                            this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS + "px " +
                                papaya.viewer.Display.FONT_TYPE_ATLAS;
                        } else {
                            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_WHITE;
                            this.context.font = papaya.viewer.Display.FONT_SIZE_ATLAS + "px " +
                                papaya.viewer.Display.FONT_TYPE_ATLAS;
                        }

                        metricsAtlas = this.context.measureText(atlasLabel[ctr]);
                        if (metricsAtlas.width > (atlasLabelWidth - (2 * papaya.viewer.Display.PADDING))) {
                            atlasLabel[ctr] = (atlasLabel[ctr].substr(0, Math.round(atlasLabel[ctr].length / 3)) +
                                " ... " + atlasLabel[ctr].substr(atlasLabel[ctr].length - 3, 3));
                        }

                        if (ctr === 2) {
                            this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING +
                                atlasLabelWidth, locY);
                        } else if (ctr === 3) {
                            this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING +
                                (2 * atlasLabelWidth), locY);
                        }
                    }
                }
            } else {
                atlasLabelWidth = halfWidth / atlasNumLabels;
                locY = (height / 2.0) + (papaya.viewer.Display.FONT_SIZE_ATLAS / 2.0) -
                    (papaya.viewer.Display.PADDING / 2.0);

                for (ctr = 0; ctr < atlasNumLabels; ctr += 1) {
                    if (ctr < labelColorThresh) {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_ORANGE;
                        this.context.font = (papaya.viewer.Display.FONT_SIZE_ATLAS - (smallViewer ? 4 : 0)) + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    } else {
                        this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_WHITE;
                        this.context.font = (papaya.viewer.Display.FONT_SIZE_ATLAS - (smallViewer ? 4 : 0)) + "px " +
                            papaya.viewer.Display.FONT_TYPE_ATLAS;
                    }

                    metricsAtlas = this.context.measureText(atlasLabel[ctr]);
                    if (metricsAtlas.width > (atlasLabelWidth - (2 * papaya.viewer.Display.PADDING)) -
                            (halfWidth * 0.05 * Math.max(0, 3 - atlasNumLabels))) {
                        atlasLabel[ctr] = (atlasLabel[ctr].substr(0, Math.round(atlasLabel[ctr].length / 3)) + " ... " +
                            atlasLabel[ctr].substr(atlasLabel[ctr].length - 3, 3));
                    }

                    this.context.fillText(atlasLabel[ctr], halfWidth + papaya.viewer.Display.PADDING +
                        (halfWidth * 0.05 * Math.max(0, 3 - atlasNumLabels)) + (ctr * atlasLabelWidth), locY);
                }
            }
        }
    } else if (this.drawError) {
        this.drawError(this.errorMessage);
    }
};



papaya.viewer.Display.prototype.drawError = function (message) {
    var valueLoc, display;

    this.errorMessage = message;
    this.drawingError = true;
    display = this;
    window.setTimeout(papaya.utilities.ObjectUtils.bind(display, function () {display.drawingError = false; }), 3000);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "red";
    this.context.font = papaya.viewer.Display.FONT_SIZE_MESSAGE_VALUE + "px " +
        papaya.viewer.Display.FONT_TYPE_MESSAGE_VALUE;

    valueLoc = papaya.viewer.Display.FONT_SIZE_COORDINATE_LABEL + papaya.viewer.Display.PADDING + 1.5 *
        papaya.viewer.Display.PADDING;

    this.context.fillText(message, papaya.viewer.Display.PADDING, valueLoc);
};



papaya.viewer.Display.prototype.drawProgress = function (progress, label) {
    var prog, display, now, progressIndex, yLoc, progressLabel;
    prog = Math.round(progress * 1000);

    if (prog > this.progress) {
        this.progress = prog;

        if (label !== undefined) {
            progressLabel = label;
        } else {
            progressLabel = papaya.viewer.Display.PROGRESS_LABEL_DEFAULT;
        }

        if (this.progressStartTime === 0) {
            this.progressStartTime = new Date().getTime();
            now = this.progressStartTime;
        } else {
            now = new Date().getTime();
        }

        progressIndex = parseInt((now - this.progressStartTime) / 500, 10) % 4;

        if (this.progress >= 990) {
            if (this.progressTimeout) {
                window.clearTimeout(this.progressTimeout);
                this.progressTimeout = null;
            }

            this.drawingProgress = false;
            this.progress = 0;
            this.progressStartTime = 0;
            this.drawEmptyDisplay();
        } else {
            if (this.progressTimeout) {
                window.clearTimeout(this.progressTimeout);
            }

            display = this;
            this.progressTimeout = window.setTimeout(papaya.utilities.ObjectUtils.bind(display, function () {display.drawingProgress = false; }),
                3000);

            // clear background
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "#fff";
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // draw progress block
            this.context.fillStyle = "#000";
            this.context.fillRect(0, 0, this.canvas.width * progress, this.canvas.height);

            // draw progress label
            this.context.font = papaya.viewer.Display.FONT_SIZE_MESSAGE_VALUE + "px " +
                papaya.viewer.Display.FONT_TYPE_MESSAGE_VALUE;
            this.context.fillStyle = papaya.viewer.Display.FONT_COLOR_MESSAGE;
            yLoc = papaya.viewer.Display.FONT_SIZE_COORDINATE_LABEL + papaya.viewer.Display.PADDING + 1.5 *
                papaya.viewer.Display.PADDING;
            this.context.fillText(progressLabel + papaya.viewer.Display.PROGRESS_LABEL_SUFFIX[progressIndex],
                papaya.viewer.Display.PADDING * 2, yLoc);
        }
    }
};

/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.volume = papaya.volume || {};


/*** Constructor ***/
papaya.viewer.Preferences = papaya.viewer.Preferences || function () {
    this.viewer = null;
    this.showCrosshairs = papaya.viewer.Preferences.DEFAULT_SHOW_CROSSHAIRS;
    this.atlasLocks = papaya.viewer.Preferences.DEFAULT_ATLAS_LOCKS;
    this.showOrientation = papaya.viewer.Preferences.DEFAULT_SHOW_ORIENTATION;
    this.scrollBehavior = papaya.viewer.Preferences.DEFAULT_SCROLL;
    this.smoothDisplay = papaya.viewer.Preferences.DEFAULT_SMOOTH_DISPLAY;
    this.radiological = papaya.viewer.Preferences.DEFAULT_RADIOLOGICAL;
    this.showRuler = papaya.viewer.Preferences.DEFAULT_SHOW_RULER;
    this.surfaceBackgroundColor = papaya.viewer.Preferences.DEFAULT_SURFACE_BACKGROUND_COLOR;
    this.showSurfacePlanes = papaya.viewer.Preferences.DEFAULT_SHOW_SURFACE_PLANES;
    this.showSurfaceCrosshairs = papaya.viewer.Preferences.DEFAULT_SHOW_SURFACE_CROSSHAIRS;
};


/*** Static Pseudo-constants ***/

papaya.viewer.Preferences.ALL_PREFS = ["showCrosshairs", "atlasLocks", "showOrientation", "scrollBehavior",
    "smoothDisplay", "radiological", "showRuler", "surfaceBackgroundColor", "showSurfacePlanes"];
papaya.viewer.Preferences.COOKIE_PREFIX = "papaya-";
papaya.viewer.Preferences.COOKIE_EXPIRY_DAYS = 365;
papaya.viewer.Preferences.DEFAULT_SHOW_CROSSHAIRS = "Yes";
papaya.viewer.Preferences.DEFAULT_ATLAS_LOCKS = "Mouse";
papaya.viewer.Preferences.DEFAULT_SHOW_ORIENTATION = "No";
papaya.viewer.Preferences.DEFAULT_SCROLL = "Increment Slice";
papaya.viewer.Preferences.DEFAULT_SMOOTH_DISPLAY = "Yes";
papaya.viewer.Preferences.DEFAULT_RADIOLOGICAL = "No";
papaya.viewer.Preferences.DEFAULT_SHOW_RULER = "No";
papaya.viewer.Preferences.DEFAULT_SURFACE_BACKGROUND_COLOR = "Gray";
papaya.viewer.Preferences.DEFAULT_SHOW_SURFACE_PLANES = "Yes";


/*** Prototype Methods ***/

papaya.viewer.Preferences.prototype.updatePreference = function (field, value) {
    this[field] = value;
    this.viewer.drawViewer(true);
    papaya.utilities.UrlUtils.createCookie(papaya.viewer.Preferences.COOKIE_PREFIX + field, value, papaya.viewer.Preferences.COOKIE_EXPIRY_DAYS);
};



papaya.viewer.Preferences.prototype.readPreferences = function () {
    var ctr, value;

    for (ctr = 0; ctr < papaya.viewer.Preferences.ALL_PREFS.length; ctr += 1) {
        value = papaya.utilities.UrlUtils.readCookie(papaya.viewer.Preferences.COOKIE_PREFIX +
        papaya.viewer.Preferences.ALL_PREFS[ctr]);

        if (value) {
            this[papaya.viewer.Preferences.ALL_PREFS[ctr]] = value;
        }
    }
};

/*jslint browser: true, node: true */
/*global papayaRoundFast */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.ScreenSlice = papaya.viewer.ScreenSlice || function (vol, dir, width, height, widthSize, heightSize,
                                                                   screenVols, manager) {
        this.screenVolumes = screenVols;
        this.sliceDirection = dir;
        this.currentSlice = -1;
        this.xDim = width;
        this.yDim = height;
        this.xSize = widthSize;
        this.ySize = heightSize;
        this.canvasMain = document.createElement("canvas");
        this.canvasMain.width = this.xDim;
        this.canvasMain.height = this.yDim;
        this.contextMain = this.canvasMain.getContext("2d");
        this.imageDataDraw = this.contextMain.createImageData(this.xDim, this.yDim);
        this.screenOffsetX = 0;
        this.screenOffsetY = 0;
        this.screenDim = 0;
        this.screenTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.zoomTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.finalTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.radiologicalTransform = [[-1, 0, this.xDim], [0, 1, 0], [0, 0, 1]];
        this.tempTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.tempTransform2 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.screenTransform2 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.finalTransform2 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        this.imageData = [];
        this.imageData2 = [];
        this.manager = manager;
        this.rulerPoints = [new papaya.core.Point(parseInt(width * 0.25), parseInt(height * 0.25)),
            new papaya.core.Point(parseInt(width * 0.75), parseInt(height * 0.75))];
        this.tempPoint = new papaya.core.Point();
        this.canvasDTILines = null;
        this.contextDTILines = null;
    };


/*** Static Pseudo-constants ***/

papaya.viewer.ScreenSlice.DIRECTION_UNKNOWN = 0;
papaya.viewer.ScreenSlice.DIRECTION_AXIAL = 1;
papaya.viewer.ScreenSlice.DIRECTION_CORONAL = 2;
papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL = 3;
papaya.viewer.ScreenSlice.DIRECTION_TEMPORAL = 4;
papaya.viewer.ScreenSlice.DIRECTION_SURFACE = 5;
papaya.viewer.ScreenSlice.SCREEN_PIXEL_MAX = 255;
papaya.viewer.ScreenSlice.SCREEN_PIXEL_MIN = 0;
papaya.viewer.ScreenSlice.GRAB_RADIUS = 5;
papaya.viewer.ScreenSlice.DTI_COLORS = ['#ff0000', '#00ff00', '#0000ff'];


/*** Prototype Methods ***/

papaya.viewer.ScreenSlice.prototype.updateSlice = function (slice, force) {
    /*jslint bitwise: true */

    var origin, voxelDims, ctr, ctrY, ctrX, value, thresholdAlpha, index, layerAlpha, timepoint, rgb, dti, valueA,
        dtiLines, dtiX1, dtiY1, dtiX2, dtiY2, dtiX1T, dtiY1T, dtiX2T, dtiY2T, dtiXC, dtiYC, valueR, valueG, valueB,
        angle, s, c, dtiColors, dtiLocX, dtiLocY, dtiLocZ, dtiRGB, angle2, dtiAlphaFactor, readFirstRaster = false,
        radioFactor, dtiColorIndex = 0, interpolation, usedRaster = false, worldSpace = this.manager.isWorldMode(),
        originalVal;

    slice = Math.round(slice);

    if ((this.manager.isRadiologicalMode() && this.isRadiologicalSensitive())) {
        radioFactor = -1;
    } else {
        radioFactor = 1;
    }

    if (force || (this.currentSlice !== slice)) {
        this.currentSlice = slice;
        origin = this.screenVolumes[0].volume.header.origin;  // base image origin
        voxelDims = this.screenVolumes[0].volume.header.voxelDimensions;

        this.contextMain.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);

        if (this.contextDTILines) {
            this.contextDTILines.clearRect(0, 0, this.screenDim, this.screenDim);
        }

        if (this.imageData.length < this.screenVolumes.length) {
            this.imageData = papaya.utilities.ArrayUtils.createArray(this.screenVolumes.length, this.xDim * this.yDim);
            this.imageData2 = papaya.utilities.ArrayUtils.createArray(this.screenVolumes.length, 1);
        }

        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr].hidden) {
                continue;
            }

            timepoint = this.screenVolumes[ctr].currentTimepoint;
            rgb = this.screenVolumes[ctr].rgb;
            dti = this.screenVolumes[ctr].dti;
            dtiLines = this.screenVolumes[ctr].dtiLines;
            usedRaster |= !dtiLines;
            dtiColors = this.screenVolumes[ctr].dtiColors;
            dtiAlphaFactor = this.screenVolumes[ctr].dtiAlphaFactor;
            interpolation = ((ctr === 0) || this.screenVolumes[ctr].interpolation);
            interpolation &= (this.manager.container.preferences.smoothDisplay === "Yes");

            if (dtiLines) {
                this.updateDTILinesImage();
                this.contextDTILines.lineWidth = 1;

                if (!dtiColors) {
                    this.contextDTILines.strokeStyle = papaya.viewer.ScreenSlice.DTI_COLORS[dtiColorIndex];
                    dtiColorIndex += 1;
                    dtiColorIndex = dtiColorIndex % 3;
                    this.contextDTILines.beginPath();
                }
            }

            for (ctrY = 0; ctrY < this.yDim; ctrY += 1) {
                for (ctrX = 0; ctrX < this.xDim; ctrX += 1) {
                    value = 0;
                    thresholdAlpha = 255;
                    layerAlpha = this.screenVolumes[ctr].alpha;

                    if (rgb) {
                        if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                            value = this.screenVolumes[ctr].volume.getVoxelAtIndex(ctrX, ctrY, slice, timepoint, true);
                        } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                            value = this.screenVolumes[ctr].volume.getVoxelAtIndex(ctrX, slice, ctrY, timepoint, true);
                        } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                            value = this.screenVolumes[ctr].volume.getVoxelAtIndex(slice, ctrX, ctrY, timepoint, true);
                        }

                        index = ((ctrY * this.xDim) + ctrX) * 4;
                        this.imageData[ctr][index] = value;

                        this.imageDataDraw.data[index] = (value >> 16) & 0xff;
                        this.imageDataDraw.data[index + 1] = (value >> 8) & 0xff;
                        this.imageDataDraw.data[index + 2] = (value) & 0xff;
                        this.imageDataDraw.data[index + 3] = thresholdAlpha;
                    } else if (dti) {
                        if (worldSpace) {
                            if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                dtiLocX = (ctrX - origin.x) * voxelDims.xSize;
                                dtiLocY = (origin.y - ctrY) * voxelDims.ySize;
                                dtiLocZ = (origin.z - slice) * voxelDims.zSize;
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                dtiLocX = (ctrX - origin.x) * voxelDims.xSize;
                                dtiLocY = (origin.y - slice) * voxelDims.ySize;
                                dtiLocZ = (origin.z - ctrY) * voxelDims.zSize;
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                dtiLocX = (slice - origin.x) * voxelDims.xSize;
                                dtiLocY = (origin.y - ctrX) * voxelDims.ySize;
                                dtiLocZ = (origin.z - ctrY) * voxelDims.zSize;
                            }

                            valueR = this.screenVolumes[ctr].volume.getVoxelAtCoordinate(dtiLocX, dtiLocY, dtiLocZ, 0, !interpolation);
                            valueG = this.screenVolumes[ctr].volume.getVoxelAtCoordinate(dtiLocX, dtiLocY, dtiLocZ, 1, !interpolation);
                            valueB = this.screenVolumes[ctr].volume.getVoxelAtCoordinate(dtiLocX, dtiLocY, dtiLocZ, 2, !interpolation);

                            if (this.screenVolumes[ctr].dtiVolumeMod) {
                                layerAlpha = Math.min(1.0, this.screenVolumes[ctr].dtiVolumeMod.getVoxelAtCoordinate(dtiLocX, dtiLocY, dtiLocZ, 0, !interpolation));
                            }
                        } else {
                            if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                dtiLocX = ctrX * voxelDims.xSize;
                                dtiLocY = ctrY * voxelDims.ySize;
                                dtiLocZ = slice * voxelDims.zSize;
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                dtiLocX = ctrX * voxelDims.xSize;
                                dtiLocY = slice * voxelDims.ySize;
                                dtiLocZ = ctrY * voxelDims.zSize;
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                dtiLocX = slice * voxelDims.xSize;
                                dtiLocY = ctrX * voxelDims.ySize;
                                dtiLocZ = ctrY * voxelDims.zSize;
                            }

                            valueR = this.screenVolumes[ctr].volume.getVoxelAtMM(dtiLocX, dtiLocY, dtiLocZ, 0, !interpolation);
                            valueG = this.screenVolumes[ctr].volume.getVoxelAtMM(dtiLocX, dtiLocY, dtiLocZ, 1, !interpolation);
                            valueB = this.screenVolumes[ctr].volume.getVoxelAtMM(dtiLocX, dtiLocY, dtiLocZ, 2, !interpolation);

                            if (this.screenVolumes[ctr].dtiVolumeMod) {
                                layerAlpha = Math.min(1.0, this.screenVolumes[ctr].dtiVolumeMod.getVoxelAtMM(dtiLocX, dtiLocY, dtiLocZ, 0, !interpolation));
                            }
                        }

                        index = ((ctrY * this.xDim) + ctrX) * 4;

                        if (dtiLines) {
                            if ((valueR !== 0) || (valueG !== 0) || (valueB !== 0)) {
                                if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                    angle = Math.atan2(radioFactor * valueG, valueR);
                                    angle2 = Math.acos(Math.abs(valueB) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                    angle = Math.atan2(radioFactor * valueB, valueR);
                                    angle2 = Math.acos(Math.abs(valueG) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                    angle = Math.atan2(valueB, valueG);
                                    angle2 = Math.acos(Math.abs(valueR) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                }

                                angle2 = 1.0 - (angle2 / 1.5708);

                                valueR = papayaRoundFast(Math.abs((255 * valueR)));
                                valueG = papayaRoundFast(Math.abs((255 * valueG)));
                                valueB = papayaRoundFast(Math.abs((255 * valueB)));
                                valueA = papayaRoundFast(255 * layerAlpha);

                                value = (((valueA & 0xFF) << 24) | ((valueR & 0xFF) << 16) | ((valueG & 0xFF) << 8) | (valueB & 0xFF));

                                if (dtiColors) {
                                    this.contextDTILines.beginPath();
                                    dtiRGB = (value & 0x00FFFFFF);
                                    this.contextDTILines.strokeStyle = '#' + papaya.utilities.StringUtils.pad(dtiRGB.toString(16), 6);
                                }

                                this.imageData[ctr][index] = angle;
                                this.imageData2[ctr][index] = value;

                                s = Math.sin(angle);
                                c = Math.cos(angle);

                                dtiXC = (this.finalTransform2[0][2] + (ctrX + 0.5) * this.finalTransform2[0][0]);
                                dtiYC = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);

                                dtiX1 = (this.finalTransform2[0][2] + (ctrX + (0.5 * angle2)) * this.finalTransform2[0][0]);
                                dtiY1 = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);
                                dtiX1T = c * (dtiX1 - dtiXC) - s * (dtiY1 - dtiYC) + dtiXC;
                                dtiY1T = s * (dtiX1 - dtiXC) + c * (dtiY1 - dtiYC) + dtiYC;
                                this.contextDTILines.moveTo(dtiX1T, dtiY1T);

                                dtiX2 = (this.finalTransform2[0][2] + (ctrX + 1 - (0.5 * angle2)) * this.finalTransform2[0][0]);
                                dtiY2 = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);
                                dtiX2T = c * (dtiX2 - dtiXC) - s * (dtiY2 - dtiYC) + dtiXC;
                                dtiY2T = s * (dtiX2 - dtiXC) + c * (dtiY2 - dtiYC) + dtiYC;
                                this.contextDTILines.lineTo(dtiX2T, dtiY2T);

                                if (dtiColors) {
                                    this.contextDTILines.stroke();
                                }
                            } else {
                                this.imageData[ctr][index] = Number.NaN;
                            }
                        } else {
                            if ((valueR !== 0) || (valueG !== 0) || (valueB !== 0)) {
                                layerAlpha = (1 - (((1 - layerAlpha) * dtiAlphaFactor)));
                            } else {
                                layerAlpha = 0;
                            }

                            valueR = papayaRoundFast(Math.abs((255 * valueR)));
                            valueG = papayaRoundFast(Math.abs((255 * valueG)));
                            valueB = papayaRoundFast(Math.abs((255 * valueB)));
                            valueA = papayaRoundFast(255 * layerAlpha);

                            this.imageData[ctr][index] = (((valueA & 0xFF) << 24) | ((valueR & 0xFF) << 16) | ((valueG & 0xFF) << 8) | (valueB & 0xFF));

                            if (!readFirstRaster) {
                                this.imageDataDraw.data[index] = valueR & 0xff;
                                this.imageDataDraw.data[index + 1] = valueG & 0xff;
                                this.imageDataDraw.data[index + 2] = valueB & 0xff;
                                this.imageDataDraw.data[index + 3] = valueA & 0xff;
                            } else {
                                this.imageDataDraw.data[index] = (this.imageDataDraw.data[index] * (1 - layerAlpha) +
                                (valueR & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 1] = (this.imageDataDraw.data[index + 1] * (1 - layerAlpha) +
                                (valueG & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 2] = (this.imageDataDraw.data[index + 2] * (1 - layerAlpha) +
                                (valueB & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 3] = thresholdAlpha;
                            }
                        }
                    } else {
                        if (worldSpace) {
                            if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtCoordinate((ctrX - origin.x) *
                                    voxelDims.xSize, (origin.y - ctrY) * voxelDims.ySize, (origin.z - slice) *
                                    voxelDims.zSize, timepoint, !interpolation);
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtCoordinate((ctrX - origin.x) *
                                    voxelDims.xSize, (origin.y - slice) * voxelDims.ySize, (origin.z - ctrY) *
                                    voxelDims.zSize, timepoint, !interpolation);
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtCoordinate((slice - origin.x) *
                                    voxelDims.xSize, (origin.y - ctrX) * voxelDims.ySize, (origin.z - ctrY) *
                                    voxelDims.zSize, timepoint, !interpolation);
                            }
                        } else {
                            if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtMM(ctrX * voxelDims.xSize, ctrY *
                                    voxelDims.ySize, slice * voxelDims.zSize, timepoint, !interpolation);
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtMM(ctrX * voxelDims.xSize, slice *
                                    voxelDims.ySize, ctrY * voxelDims.zSize, timepoint, !interpolation);
                            } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                value = this.screenVolumes[ctr].volume.getVoxelAtMM(slice * voxelDims.xSize, ctrX *
                                    voxelDims.ySize, ctrY * voxelDims.zSize, timepoint, !interpolation);
                            }
                        }

                        index = ((ctrY * this.xDim) + ctrX) * 4;
                        originalVal = value;
                        this.imageData[ctr][index] = value;

                        if ((!this.screenVolumes[ctr].negative && (value <= this.screenVolumes[ctr].screenMin)) ||
                            (this.screenVolumes[ctr].negative && (value >= this.screenVolumes[ctr].screenMin)) ||
                            isNaN(value)) {
                            value = papaya.viewer.ScreenSlice.SCREEN_PIXEL_MIN;  // screen value
                            thresholdAlpha = this.screenVolumes[ctr].isOverlay() ? 0 : 255;
                        } else if ((!this.screenVolumes[ctr].negative && (value >= this.screenVolumes[ctr].screenMax)) ||
                            (this.screenVolumes[ctr].negative && (value <= this.screenVolumes[ctr].screenMax))) {
                            value = papaya.viewer.ScreenSlice.SCREEN_PIXEL_MAX;  // screen value
                        } else {
                            value = papayaRoundFast(((value - this.screenVolumes[ctr].screenMin) *
                            this.screenVolumes[ctr].screenRatio));  // screen value
                        }

                        if (!readFirstRaster) {
                            this.imageDataDraw.data[index] = this.screenVolumes[ctr].colorTable.lookupRed(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 1] = this.screenVolumes[ctr].colorTable.lookupGreen(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 2] = this.screenVolumes[ctr].colorTable.lookupBlue(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 3] = thresholdAlpha;
                        } else if (thresholdAlpha > 0) {
                            this.imageDataDraw.data[index] = (this.imageDataDraw.data[index] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupRed(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 1] = (this.imageDataDraw.data[index + 1] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupGreen(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 2] = (this.imageDataDraw.data[index + 2] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupBlue(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 3] = thresholdAlpha;
                        }
                    }
                }
            }

            if (!dtiColors) {
                this.contextDTILines.stroke();
            }

            if (!dtiLines) {
                readFirstRaster = true;
            }
        }

        if (usedRaster) {
            this.contextMain.putImageData(this.imageDataDraw, 0, 0);
        }
    }
};



papaya.viewer.ScreenSlice.prototype.repaint = function (slice, force, worldSpace) {
    /*jslint bitwise: true */

    var ctr, ctrY, ctrX, value, thresholdAlpha, index = 0, layerAlpha, rgb, dti, dtiLines, dtiRGB, angle2,
        dtiXC, dtiYC, dtiX1, dtiX2, dtiY1, dtiY2, dtiX1T, dtiX2T, dtiY1T, dtiY2T, angle, s, c, dtiColors,
        valueR, valueG, valueB, dtiColorIndex = 0, readFirstRaster = false, originalVal;

    slice = Math.round(slice);

    this.currentSlice = slice;

    this.contextMain.clearRect(0, 0, this.canvasMain.width, this.canvasMain.height);

    if (this.contextDTILines) {
        this.contextDTILines.clearRect(0, 0, this.screenDim, this.screenDim);
    }

    if (this.imageData.length === this.screenVolumes.length) {
        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr].hidden) {
                continue;
            }

            rgb = this.screenVolumes[ctr].rgb;
            dti = this.screenVolumes[ctr].dti;
            dtiLines = this.screenVolumes[ctr].dtiLines;
            dtiColors = this.screenVolumes[ctr].dtiColors;

            if (dtiLines) {
                this.contextDTILines.lineWidth = 1;

                if (!dtiColors) {
                    this.contextDTILines.strokeStyle = papaya.viewer.ScreenSlice.DTI_COLORS[dtiColorIndex];
                    dtiColorIndex += 1;
                    dtiColorIndex = dtiColorIndex % 3;
                    this.contextDTILines.beginPath();
                }
            }

            for (ctrY = 0; ctrY < this.yDim; ctrY += 1) {
                for (ctrX = 0; ctrX < this.xDim; ctrX += 1) {
                    value = this.imageData[ctr][index];
                    thresholdAlpha = 255;
                    layerAlpha = this.screenVolumes[ctr].alpha;

                    index = ((ctrY * this.xDim) + ctrX) * 4;

                    if (rgb) {
                        this.imageDataDraw.data[index] = (value >> 16) & 0xff;
                        this.imageDataDraw.data[index + 1] = (value >> 8) & 0xff;
                        this.imageDataDraw.data[index + 2] = (value) & 0xff;
                        this.imageDataDraw.data[index + 3] = thresholdAlpha;
                    } else if (dti) {
                        if (dtiLines) {
                            angle = this.imageData[ctr][index];

                            if (!isNaN(angle)) {
                                value = this.imageData2[ctr][index];
                                valueR = (value >> 16) & 0xFF;
                                valueG = (value >> 8) & 0xFF;
                                valueB = value & 0xFF;

                                dtiRGB = (value & 0x00FFFFFF);

                                if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                                    angle2 = Math.acos(Math.abs(valueB) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                                    angle2 = Math.acos(Math.abs(valueG) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                                    angle2 = Math.acos(Math.abs(valueR) / Math.sqrt(valueR * valueR + valueG * valueG + valueB * valueB));
                                }

                                angle2 = 1.0 - (angle2 / 1.5708);

                                if (dtiColors) {
                                    this.contextDTILines.beginPath();
                                    this.contextDTILines.strokeStyle = '#' + papaya.utilities.StringUtils.pad(dtiRGB.toString(16), 6);
                                }

                                s = Math.sin(angle);
                                c = Math.cos(angle);

                                dtiXC = (this.finalTransform2[0][2] + (ctrX + 0.5) * this.finalTransform2[0][0]);
                                dtiYC = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);

                                dtiX1 = (this.finalTransform2[0][2] + (ctrX + (0.5 * angle2)) * this.finalTransform2[0][0]);
                                dtiY1 = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);
                                dtiX1T = c * (dtiX1 - dtiXC) - s * (dtiY1 - dtiYC) + dtiXC;
                                dtiY1T = s * (dtiX1 - dtiXC) + c * (dtiY1 - dtiYC) + dtiYC;
                                this.contextDTILines.moveTo(dtiX1T, dtiY1T);

                                dtiX2 = (this.finalTransform2[0][2] + (ctrX + 1 - (0.5 * angle2)) * this.finalTransform2[0][0]);
                                dtiY2 = (this.finalTransform2[1][2] + (ctrY + 0.5) * this.finalTransform2[1][1]);
                                dtiX2T = c * (dtiX2 - dtiXC) - s * (dtiY2 - dtiYC) + dtiXC;
                                dtiY2T = s * (dtiX2 - dtiXC) + c * (dtiY2 - dtiYC) + dtiYC;
                                this.contextDTILines.lineTo(dtiX2T, dtiY2T);

                                if (dtiColors) {
                                    this.contextDTILines.stroke();
                                }
                            }
                        } else {
                            value = this.imageData[ctr][index];
                            dtiRGB = (value & 0x00FFFFFF);

                            if (dtiRGB !== 0) {
                                layerAlpha = (((value >> 24) & 0xff) / 255.0);
                            } else {
                                layerAlpha = 0;
                            }

                            if (!readFirstRaster) {
                                this.imageDataDraw.data[index] = (value >> 16) & 0xff;
                                this.imageDataDraw.data[index + 1] = (value >> 8) & 0xff;
                                this.imageDataDraw.data[index + 2] = (value) & 0xff;
                                this.imageDataDraw.data[index + 3] = (value >> 24) & 0xff;
                            } else {
                                this.imageDataDraw.data[index] = (this.imageDataDraw.data[index] * (1 - layerAlpha) +
                                ((value >> 16) & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 1] = (this.imageDataDraw.data[index + 1] * (1 - layerAlpha) +
                                ((value >> 8) & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 2] = (this.imageDataDraw.data[index + 2] * (1 - layerAlpha) +
                                ((value) & 0xff) * layerAlpha);
                                this.imageDataDraw.data[index + 3] = thresholdAlpha;
                            }
                        }
                    } else {
                        value = this.imageData[ctr][index];
                        originalVal = value;

                        if ((!this.screenVolumes[ctr].negative && (value <= this.screenVolumes[ctr].screenMin)) ||
                            (this.screenVolumes[ctr].negative && (value >= this.screenVolumes[ctr].screenMin)) ||
                            isNaN(value)) {
                            value = papaya.viewer.ScreenSlice.SCREEN_PIXEL_MIN;  // screen value
                            thresholdAlpha = this.screenVolumes[ctr].isOverlay() ? 0 : 255;
                        } else if ((!this.screenVolumes[ctr].negative && (value >= this.screenVolumes[ctr].screenMax)) ||
                            (this.screenVolumes[ctr].negative && (value <= this.screenVolumes[ctr].screenMax))) {
                            value = papaya.viewer.ScreenSlice.SCREEN_PIXEL_MAX;  // screen value
                        } else {
                            value = papayaRoundFast(((value - this.screenVolumes[ctr].screenMin) *
                            this.screenVolumes[ctr].screenRatio));  // screen value
                        }

                        if (!readFirstRaster) {
                            this.imageDataDraw.data[index] = this.screenVolumes[ctr].colorTable.lookupRed(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 1] = this.screenVolumes[ctr].colorTable.lookupGreen(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 2] = this.screenVolumes[ctr].colorTable.lookupBlue(value, originalVal) * layerAlpha;
                            this.imageDataDraw.data[index + 3] = thresholdAlpha;
                        } else if (thresholdAlpha > 0) {
                            this.imageDataDraw.data[index] = (this.imageDataDraw.data[index] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupRed(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 1] = (this.imageDataDraw.data[index + 1] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupGreen(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 2] = (this.imageDataDraw.data[index + 2] * (1 - layerAlpha) +
                            this.screenVolumes[ctr].colorTable.lookupBlue(value, originalVal) * layerAlpha);
                            this.imageDataDraw.data[index + 3] = thresholdAlpha;
                        }
                    }
                }
            }

            if (!dtiColors) {
                this.contextDTILines.stroke();
            }

            if (!dtiLines) {
                readFirstRaster = true;
            }
        }

        this.contextMain.putImageData(this.imageDataDraw, 0, 0);
    } else {
        this.updateSlice(slice, true);
    }
};



papaya.viewer.ScreenSlice.prototype.getRealWidth = function () {
    return this.xDim * this.xSize;
};



papaya.viewer.ScreenSlice.prototype.getRealHeight = function () {
    return this.yDim * this.ySize;
};



papaya.viewer.ScreenSlice.prototype.getXYratio = function () {
    return this.xSize / this.ySize;
};



papaya.viewer.ScreenSlice.prototype.getYXratio = function () {
    return this.ySize / this.xSize;
};



papaya.viewer.ScreenSlice.prototype.getXSize = function () {
    return this.xSize;
};



papaya.viewer.ScreenSlice.prototype.getYSize = function () {
    return this.ySize;
};



papaya.viewer.ScreenSlice.prototype.getXDim = function () {
    return this.xDim;
};



papaya.viewer.ScreenSlice.prototype.getYDim = function () {
    return this.yDim;
};



papaya.viewer.ScreenSlice.prototype.updateZoomTransform = function (zoomFactor, xZoomTrans, yZoomTrans, xPanTrans,
                                                                    yPanTrans, viewer) {
    var xTrans, yTrans, maxTranslateX, maxTranslateY;

    xZoomTrans = (xZoomTrans + 0.5) * (zoomFactor - 1) * -1;
    yZoomTrans = (yZoomTrans + 0.5) * (zoomFactor - 1) * -1;
    xPanTrans = xPanTrans * (zoomFactor - 1);
    yPanTrans = yPanTrans * (zoomFactor - 1);

    // limit pan translation such that it cannot pan out of bounds of image
    xTrans = xZoomTrans + xPanTrans;
    maxTranslateX = -1 * (zoomFactor - 1.0) * this.xDim;
    if (xTrans > 0) {
        xTrans = 0;
    } else if (xTrans < maxTranslateX) {
        xTrans = maxTranslateX;
    }

    yTrans = yZoomTrans + yPanTrans;
    maxTranslateY = -1 * (zoomFactor - 1.0) * this.yDim;
    if (yTrans > 0) {
        yTrans = 0;
    } else if (yTrans < maxTranslateY) {
        yTrans = maxTranslateY;
    }

    // update parent viewer with pan translation (may have been limited by step above)
    if (zoomFactor > 1) {
        if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            viewer.panAmountX = (Math.round((xTrans - xZoomTrans) / (zoomFactor - 1)));
            viewer.panAmountY = (Math.round((yTrans - yZoomTrans) / (zoomFactor - 1)));
        } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            viewer.panAmountX = (Math.round((xTrans - xZoomTrans) / (zoomFactor - 1)));
            viewer.panAmountZ = (Math.round((yTrans - yZoomTrans) / (zoomFactor - 1)));
        } else if (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            viewer.panAmountY = (Math.round((xTrans - xZoomTrans) / (zoomFactor - 1)));
            viewer.panAmountZ = (Math.round((yTrans - yZoomTrans) / (zoomFactor - 1)));
        }
    }

    // update transform
    this.zoomTransform[0][0] = zoomFactor;
    this.zoomTransform[0][1] = 0;
    this.zoomTransform[0][2] = xTrans;
    this.zoomTransform[1][0] = 0;
    this.zoomTransform[1][1] = zoomFactor;
    this.zoomTransform[1][2] = yTrans;

    this.updateFinalTransform();
};



papaya.viewer.ScreenSlice.prototype.updateFinalTransform = function () {
    var ctrOut, ctrIn;

    if (this.manager.isRadiologicalMode() && this.isRadiologicalSensitive()) {
        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.tempTransform[ctrOut][ctrIn] = this.screenTransform[ctrOut][ctrIn];
            }
        }

        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.tempTransform2[ctrOut][ctrIn] =
                    (this.tempTransform[ctrOut][0] * this.radiologicalTransform[0][ctrIn]) +
                    (this.tempTransform[ctrOut][1] * this.radiologicalTransform[1][ctrIn]) +
                    (this.tempTransform[ctrOut][2] * this.radiologicalTransform[2][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.finalTransform[ctrOut][ctrIn] =
                    (this.tempTransform2[ctrOut][0] * this.zoomTransform[0][ctrIn]) +
                    (this.tempTransform2[ctrOut][1] * this.zoomTransform[1][ctrIn]) +
                    (this.tempTransform2[ctrOut][2] * this.zoomTransform[2][ctrIn]);
            }
        }


        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.tempTransform[ctrOut][ctrIn] = this.screenTransform2[ctrOut][ctrIn];
            }
        }

        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.tempTransform2[ctrOut][ctrIn] =
                    (this.tempTransform[ctrOut][0] * this.radiologicalTransform[0][ctrIn]) +
                    (this.tempTransform[ctrOut][1] * this.radiologicalTransform[1][ctrIn]) +
                    (this.tempTransform[ctrOut][2] * this.radiologicalTransform[2][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.finalTransform2[ctrOut][ctrIn] =
                    (this.tempTransform2[ctrOut][0] * this.zoomTransform[0][ctrIn]) +
                    (this.tempTransform2[ctrOut][1] * this.zoomTransform[1][ctrIn]) +
                    (this.tempTransform2[ctrOut][2] * this.zoomTransform[2][ctrIn]);
            }
        }
    } else {
        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.finalTransform[ctrOut][ctrIn] =
                    (this.screenTransform[ctrOut][0] * this.zoomTransform[0][ctrIn]) +
                    (this.screenTransform[ctrOut][1] * this.zoomTransform[1][ctrIn]) +
                    (this.screenTransform[ctrOut][2] * this.zoomTransform[2][ctrIn]);
            }
        }

        for (ctrOut = 0; ctrOut < 3; ctrOut += 1) {
            for (ctrIn = 0; ctrIn < 3; ctrIn += 1) {
                this.finalTransform2[ctrOut][ctrIn] =
                    (this.screenTransform2[ctrOut][0] * this.zoomTransform[0][ctrIn]) +
                    (this.screenTransform2[ctrOut][1] * this.zoomTransform[1][ctrIn]) +
                    (this.screenTransform2[ctrOut][2] * this.zoomTransform[2][ctrIn]);
            }
        }
    }
};



papaya.viewer.ScreenSlice.prototype.isRadiologicalSensitive = function () {
    return ((this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) ||
    (this.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL));
};



papaya.viewer.ScreenSlice.prototype.findProximalRulerHandle = function (xLoc, yLoc) {
    this.tempPoint.x = xLoc;
    this.tempPoint.y = yLoc;

    if (papaya.utilities.MathUtils.lineDistance(this.tempPoint.x, this.tempPoint.y, this.rulerPoints[0].x, this.rulerPoints[0].y) < papaya.viewer.ScreenSlice.GRAB_RADIUS) {
        return this.rulerPoints[0];
    } else if (papaya.utilities.MathUtils.lineDistance(this.tempPoint.x, this.tempPoint.y, this.rulerPoints[1].x, this.rulerPoints[1].y) < papaya.viewer.ScreenSlice.GRAB_RADIUS) {
        return this.rulerPoints[1];
    }

    return null;
};



papaya.viewer.ScreenSlice.prototype.updateDTILinesImage = function () {
    if ((this.canvasDTILines === null) || (this.canvasDTILines.width !== this.screenDim)) {
        this.canvasDTILines = document.createElement("canvas");
        this.canvasDTILines.width = this.screenDim;
        this.canvasDTILines.height = this.screenDim;
        this.contextDTILines = this.canvasDTILines.getContext("2d");
    }
};



papaya.viewer.ScreenSlice.prototype.clearDTILinesImage = function () {
    this.canvasDTILines = null;
    this.contextDTILines = null;
};
/*jslint browser: true, node: true */
/*global papayaRoundFast */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Shaders ***/

var shaderVert = [
    "precision mediump float;",

    "attribute vec3 aVertexPosition;",
    "attribute vec3 aVertexNormal;",
    "attribute vec4 aVertexColor;",
    "attribute vec2 aTextureCoord;",

    "uniform mat4 uMVMatrix;",
    "uniform mat4 uPMatrix;",
    "uniform mat3 uNMatrix;",

    "uniform vec3 uAmbientColor;",
    "uniform vec3 uPointLightingLocation;",
    "uniform vec3 uPointLightingColor;",

    "uniform bool uActivePlane;",
    "uniform bool uActivePlaneEdge;",
    "uniform bool uCrosshairs;",
    "uniform bool uColors;",
    "uniform bool uColorPicking;",
    "uniform bool uTrianglePicking;",
    "uniform bool uColorSolid;",
    "uniform vec4 uSolidColor;",
    "uniform bool uOrientationText;",
    "uniform bool uRuler;",
    "uniform float uAlpha;",

    "varying vec3 vLightWeighting;",
    "varying lowp vec4 vColor;",
    "varying vec2 vTextureCoord;",

    "void main(void) {",
    "    vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);",
    "    gl_Position = uPMatrix * mvPosition;",
    "    if (!uActivePlane && !uActivePlaneEdge && !uCrosshairs && !uOrientationText && !uRuler) {",
    "       vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);",
    "       vec3 transformedNormal = uNMatrix * aVertexNormal;",
    "       float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);",
    "       vLightWeighting = uAmbientColor + uPointLightingColor * directionalLightWeighting;",
    "       if (uColors) {",
    "           vColor = aVertexColor;",
    "       }",
    "   }",

    "   if (uColorSolid) {",
    "       vColor = uSolidColor;",
    "   }",

    "   if (uOrientationText) {",
    "       vTextureCoord = aTextureCoord;",
    "   }",
    "}"
].join("\n");

var shaderFrag = [
    "precision mediump float;",

    "uniform bool uActivePlane;",
    "uniform bool uActivePlaneEdge;",
    "uniform bool uCrosshairs;",
    "uniform bool uColors;",
    "uniform bool uColorPicking;",
    "uniform bool uTrianglePicking;",
    "uniform bool uColorSolid;",
    "uniform vec4 uSolidColor;",
    "uniform bool uOrientationText;",
    "uniform bool uRuler;",
    "uniform sampler2D uSampler;",
    "uniform float uAlpha;",

    "varying vec3 vLightWeighting;",
    "varying lowp vec4 vColor;",
    "varying vec2 vTextureCoord;",

    "vec4 packFloatToVec4i(const float value) {",
    "   const vec4 bitSh = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);",
    "   const vec4 bitMsk = vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);",
    "   vec4 res = fract(value * bitSh);",
    "   res -= res.xxyz * bitMsk;",
    "   return res;",
    "}",

    "void main(void) {",
    "    vec4 fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);",

    "    if (uColors) {",
    "       fragmentColor = vColor;",
    "    } else if (uColorSolid) {",
    "       fragmentColor = vColor;",
    "    }",

    "    if (uActivePlane) {",
    "       gl_FragColor = vec4(0.10980392156863, 0.52549019607843, 0.93333333333333, 0.5);",
    "    } else if (uActivePlaneEdge) {",
    "       gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
    "    } else if (uRuler) {",
    "       gl_FragColor = vec4(1.0, 0.078, 0.576, 1.0);",
    "    } else if (uOrientationText) {",
    "        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));",
    "        if (textureColor.a > 0.0) {",
    "           gl_FragColor = vec4(textureColor.rgb, textureColor.a);",
    "        } else {",
    "           gl_FragColor = vec4(textureColor.rgb, 0);",
    "        }",
    "    } else if (uCrosshairs) {",
    "       gl_FragColor = vec4(0.10980392156863, 0.52549019607843, 0.93333333333333, 1.0);",
    "    } else if (uColorPicking) {",
    "       gl_FragColor = vec4(fragmentColor.r, fragmentColor.g, fragmentColor.b, 1);",
    "    } else if (uTrianglePicking) {",
    "       gl_FragColor = packFloatToVec4i(gl_FragCoord.z);",
    "    } else {",
    "       gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, uAlpha);",
    "    }",
    "}"
].join("\n");



/*** Constructor ***/

papaya.viewer.ScreenSurface = papaya.viewer.ScreenSurface || function (baseVolume, surfaces, viewer, params) {
    this.shaderProgram = null;
    this.mvMatrix = mat4.create();
    this.pMatrix = mat4.create();
    this.pMatrix1 = mat4.create();
    this.centerMat = mat4.create();
    this.centerMatInv = mat4.create();
    this.tempMat = mat4.create();
    this.tempMat2 = mat4.create();
    this.pickingBuffer = null;
    this.initialized = false;
    this.screenOffsetX = 0;
    this.screenOffsetY = 0;
    this.screenDim = 0;
    this.screenTransform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    this.volume = baseVolume;
    this.surfaces = surfaces;
    this.viewer = viewer;
    this.currentCoord = viewer.currentCoord;
    this.zoom = 0;
    this.sliceDirection = papaya.viewer.ScreenSlice.DIRECTION_SURFACE;
    this.dynamicStartX = -1;
    this.dynamicStartY = -1;
    this.activePlaneVertsAxial = new Float32Array(12);
    this.activePlaneVertsCoronal = new Float32Array(12);
    this.activePlaneVertsSagittal = new Float32Array(12);
    this.activePlaneVertsAxialEdges = new Float32Array(24);
    this.activePlaneVertsCoronalEdges = new Float32Array(24);
    this.activePlaneVertsSagittalEdges = new Float32Array(24);
    this.orientationVerts = new Float32Array(24);
    this.crosshairLineVertsX = new Float32Array(6);
    this.crosshairLineVertsY = new Float32Array(6);
    this.crosshairLineVertsZ = new Float32Array(6);
    this.mouseRotDragX = this.clearTransform([]);
    this.mouseRotDragY = this.clearTransform([]);
    this.mouseRotDrag = this.clearTransform([]);
    this.mouseTransDrag = this.clearTransform([]);
    this.mouseRotCurrent = this.clearTransform([]);
    this.mouseTransCurrent = this.clearTransform([]);
    this.mouseRotTemp = this.clearTransform([]);
    this.mouseTransTemp = this.clearTransform([]);
    this.activePlaneAxialBuffer = null;
    this.activePlaneCoronalBuffer = null;
    this.activePlaneSagittalBuffer = null;
    this.activePlaneAxialEdgesBuffer = null;
    this.activePlaneCoronalEdgesBuffer = null;
    this.activePlaneSagittalEdgesBuffer = null;
    this.orientationBuffer = null;
    this.crosshairLineXBuffer = null;
    this.crosshairLineYBuffer = null;
    this.crosshairLineZBuffer = null;
    this.crosshairLineZBuffer = null;
    this.xSize = this.volume.header.voxelDimensions.xSize;
    this.xDim = this.volume.header.imageDimensions.xDim;
    this.xHalf = (this.xDim * this.xSize) / 2.0;
    this.ySize = this.volume.header.voxelDimensions.ySize;
    this.yDim = this.volume.header.imageDimensions.yDim;
    this.yHalf = (this.yDim * this.ySize) / 2.0;
    this.zSize = this.volume.header.voxelDimensions.zSize;
    this.zDim = this.volume.header.imageDimensions.zDim;
    this.zHalf = (this.zDim * this.zSize) / 2.0;
    this.showSurfacePlanes = (viewer.container.preferences.showSurfacePlanes === "Yes");
    this.backgroundColor = papaya.viewer.ScreenSurface.DEFAULT_BACKGROUND;
    this.pickLocX = 0;
    this.pickLocY = 0;
    this.needsPickColor = false;
    this.pickedColor = null;
    this.needsPick = false;
    this.pickedCoordinate = null;
    this.scaleFactor = 1;
    this.orientationTexture = null;
    this.orientationTextureCoords = null;
    this.orientationTextureCoordBuffer = null;
    this.orientationCanvas = null;
    this.orientationContext = null;
    this.rulerPoints = null;
    this.grabbedRulerPoint = -1;

    this.processParams(params);
};



/*** Static Pseudo-constants ***/

papaya.viewer.ScreenSurface.DEFAULT_ORIENTATION = [ -0.015552218963737041, 0.09408106275544359, -0.9954430697501158, 0,
                                                    -0.9696501263313991, 0.24152923619118966, 0.03797658948646743, 0,
                                                    0.24400145970103732, 0.965822108594413, 0.0874693978960848, 0,
                                                    0, 0, 0, 1];
papaya.viewer.ScreenSurface.MOUSE_SENSITIVITY = 0.3;
papaya.viewer.ScreenSurface.DEFAULT_BACKGROUND = [0.5, 0.5, 0.5];
papaya.viewer.ScreenSurface.TEXT_SIZE = 50;
papaya.viewer.ScreenSurface.ORIENTATION_SIZE = 10;
papaya.viewer.ScreenSurface.RULER_COLOR = [1, 0.078, 0.576];
papaya.viewer.ScreenSurface.RULER_NUM_LINES = 25;
papaya.viewer.ScreenSurface.RULER_RADIUS = 1;


/*** Static Variables ***/

papaya.viewer.ScreenSurface.EXT_INT = null;



/*** Static Methods ***/

papaya.viewer.ScreenSurface.makeShader = function (gl, src, type) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};



papaya.viewer.ScreenSurface.initShaders = function (gl) {
    var fragmentShader = papaya.viewer.ScreenSurface.makeShader(gl, shaderVert, gl.VERTEX_SHADER);
    var vertexShader = papaya.viewer.ScreenSurface.makeShader(gl, shaderFrag, gl.FRAGMENT_SHADER);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
    shaderProgram.activePlane = gl.getUniformLocation(shaderProgram, "uActivePlane");
    shaderProgram.activePlaneEdge = gl.getUniformLocation(shaderProgram, "uActivePlaneEdge");
    shaderProgram.colorPicking = gl.getUniformLocation(shaderProgram, "uColorPicking");
    shaderProgram.trianglePicking = gl.getUniformLocation(shaderProgram, "uTrianglePicking");
    shaderProgram.crosshairs = gl.getUniformLocation(shaderProgram, "uCrosshairs");
    shaderProgram.hasColors = gl.getUniformLocation(shaderProgram, "uColors");
    shaderProgram.hasSolidColor = gl.getUniformLocation(shaderProgram, "uColorSolid");
    shaderProgram.solidColor = gl.getUniformLocation(shaderProgram, "uSolidColor");
    shaderProgram.orientationText = gl.getUniformLocation(shaderProgram, "uOrientationText");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.ruler = gl.getUniformLocation(shaderProgram, "uRuler");
    shaderProgram.alphaVal = gl.getUniformLocation(shaderProgram, "uAlpha");

    return shaderProgram;
};



/*** Prototype Methods ***/

papaya.viewer.ScreenSurface.prototype.initialize = function () {
    var ctr;

    this.initialized = true;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.screenDim;
    this.canvas.height = this.screenDim;
    this.context = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    this.context.viewportWidth = this.canvas.width;
    this.context.viewportHeight = this.canvas.height;

    this.zoom = this.volume.header.imageDimensions.yDim * this.volume.header.voxelDimensions.ySize * 1.5;
    this.initPerspective();

    this.shaderProgram = papaya.viewer.ScreenSurface.initShaders(this.context);

    for (ctr = 0; ctr < this.surfaces.length; ctr += 1) {
        this.initBuffers(this.context, this.surfaces[ctr]);
    }

    this.calculateScaleFactor();
    this.initActivePlaneBuffers(this.context);
    this.initRulerBuffers(this.context);

    mat4.multiply(this.centerMat, papaya.viewer.ScreenSurface.DEFAULT_ORIENTATION, this.tempMat);
    mat4.multiply(this.tempMat, this.centerMatInv, this.mouseRotCurrent);

    papaya.viewer.ScreenSurface.EXT_INT = this.context.getExtension('OES_element_index_uint');
    if (!papaya.viewer.ScreenSurface.EXT_INT) {
        console.log("This browser does not support OES_element_index_uint extension!");
    }

    this.updateBackgroundColor();
};



papaya.viewer.ScreenSurface.prototype.calculateScaleFactor = function () {
    var xRange = (this.xSize * this.xDim),
        yRange = (this.ySize * this.yDim),
        zRange = (this.zSize * this.zDim),
        longestRange = xRange;

    if (yRange > longestRange) {
        longestRange = yRange;
    }

    if (zRange > longestRange) {
        longestRange = zRange;
    }

    this.scaleFactor = (longestRange / 256.0);
};



papaya.viewer.ScreenSurface.prototype.resize = function (screenDim) {
    if (!this.initialized) {
        this.initialize();
    }

    this.screenDim = screenDim;
    this.canvas.width = this.screenDim;
    this.canvas.height = this.screenDim;
    this.context.viewportWidth = this.canvas.width;
    this.context.viewportHeight = this.canvas.height;
};



papaya.viewer.ScreenSurface.prototype.applyMatrixUniforms = function(gl) {
    gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
    gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(this.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(this.shaderProgram.nMatrixUniform, false, normalMatrix);
};



papaya.viewer.ScreenSurface.prototype.draw = function () {
    if (this.surfaces.length > 0) {
        if (!this.initialized) {
            this.initialize();
        }

        this.drawScene(this.context);
    }
};



papaya.viewer.ScreenSurface.prototype.initBuffers = function (gl, surface) {
    surface.pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, surface.pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, surface.pointData, gl.STATIC_DRAW);
    surface.pointsBuffer.itemSize = 3;
    surface.pointsBuffer.numItems = surface.numPoints;

    surface.normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, surface.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, surface.normalsData, gl.STATIC_DRAW);
    surface.normalsBuffer.itemSize = 3;
    surface.normalsBuffer.numItems = surface.numPoints;

    if (surface.colorsData) {
        surface.colorsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, surface.colorsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, surface.colorsData, gl.STATIC_DRAW);
        surface.colorsBuffer.itemSize = 4;
        surface.colorsBuffer.numItems = surface.numPoints;
    }

    surface.trianglesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surface.trianglesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, surface.triangleData, gl.STATIC_DRAW);
    surface.trianglesBuffer.itemSize = 1;
    surface.trianglesBuffer.numItems = surface.numTriangles * 3;
};



papaya.viewer.ScreenSurface.prototype.initOrientationBuffers = function (gl) {
    this.makeOrientedTextSquare();
    this.orientationBuffer = gl.createBuffer();
    this.orientationBuffer.itemSize = 3;
    this.orientationBuffer.numItems = 4;

    this.orientationTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.orientationTextureCoordBuffer);
    this.orientationTextureCoords = [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.orientationTextureCoords), gl.STATIC_DRAW);
    this.orientationTextureCoordBuffer.itemSize = 2;
    this.orientationTextureCoordBuffer.numItems = 4;
};



papaya.viewer.ScreenSurface.prototype.initActivePlaneBuffers = function (gl) {
    this.updateActivePlanes();

    this.activePlaneAxialBuffer = gl.createBuffer();
    this.activePlaneAxialBuffer.itemSize = 3;
    this.activePlaneAxialBuffer.numItems = 4;

    this.activePlaneCoronalBuffer = gl.createBuffer();
    this.activePlaneCoronalBuffer.itemSize = 3;
    this.activePlaneCoronalBuffer.numItems = 4;

    this.activePlaneSagittalBuffer = gl.createBuffer();
    this.activePlaneSagittalBuffer.itemSize = 3;
    this.activePlaneSagittalBuffer.numItems = 4;

    this.activePlaneAxialEdgesBuffer = gl.createBuffer();
    this.activePlaneAxialEdgesBuffer.itemSize = 3;
    this.activePlaneAxialEdgesBuffer.numItems = 8;

    this.activePlaneCoronalEdgesBuffer = gl.createBuffer();
    this.activePlaneCoronalEdgesBuffer.itemSize = 3;
    this.activePlaneCoronalEdgesBuffer.numItems = 8;

    this.activePlaneSagittalEdgesBuffer = gl.createBuffer();
    this.activePlaneSagittalEdgesBuffer.itemSize = 3;
    this.activePlaneSagittalEdgesBuffer.numItems = 8;

    this.crosshairLineXBuffer = gl.createBuffer();
    this.crosshairLineXBuffer.itemSize = 3;
    this.crosshairLineXBuffer.numItems = 2;

    this.crosshairLineYBuffer = gl.createBuffer();
    this.crosshairLineYBuffer.itemSize = 3;
    this.crosshairLineYBuffer.numItems = 2;

    this.crosshairLineZBuffer = gl.createBuffer();
    this.crosshairLineZBuffer.itemSize = 3;
    this.crosshairLineZBuffer.numItems = 2;
};



papaya.viewer.ScreenSurface.prototype.initRulerBuffers = function (gl) {
    this.rulerPointData = this.makeSphere(papaya.viewer.ScreenSurface.RULER_NUM_LINES,
        papaya.viewer.ScreenSurface.RULER_NUM_LINES, papaya.viewer.ScreenSurface.RULER_RADIUS * this.scaleFactor);

    this.sphereVertexPositionBuffer = gl.createBuffer();
    this.sphereVertexPositionBuffer.itemSize = 3;
    this.sphereVertexPositionBuffer.numItems = this.rulerPointData.vertices.length / 3;

    this.sphereNormalsPositionBuffer = gl.createBuffer();
    this.sphereNormalsPositionBuffer.itemSize = 3;
    this.sphereNormalsPositionBuffer.numItems = this.rulerPointData.normals.length / 3;

    this.sphereVertexIndexBuffer = gl.createBuffer();
    this.sphereVertexIndexBuffer.itemSize = 1;
    this.sphereVertexIndexBuffer.numItems = this.rulerPointData.indices.length;

    this.rulerLineBuffer = gl.createBuffer();
    this.rulerLineBuffer.itemSize = 3;
    this.rulerLineBuffer.numItems = 2;
};



papaya.viewer.ScreenSurface.prototype.initPerspective = function () {
    mat4.perspective(45, 1, 10, 100000, this.pMatrix1);

    this.eye = new vec3.create();
    this.eye[0] = 0;
    this.eye[1] = 0;

    this.center = new vec3.create();
    this.centerWorld = new papaya.core.Coordinate();
    this.viewer.getWorldCoordinateAtIndex(parseInt(this.xDim / 2, 10), parseInt(this.yDim / 2, 10), parseInt(this.zDim / 2, 10), this.centerWorld);
    this.center[0] = this.centerWorld.x;
    this.center[1] = this.centerWorld.y;
    this.center[2] = this.centerWorld.z;

    mat4.identity(this.centerMat);
    mat4.translate(this.centerMat, [this.center[0], this.center[1], this.center[2]]);

    mat4.identity(this.centerMatInv);
    mat4.translate(this.centerMatInv, [-this.center[0], -this.center[1], -this.center[2]]);

    this.up = new vec3.create();
    this.up[0] = 0;
    this.up[1] = 1;
    this.up[2] = 0;
};



papaya.viewer.ScreenSurface.prototype.updatePerspective = function () {
    var mat;

    this.eye[2] = this.zoom;
    mat = mat4.lookAt(this.eye, this.center, this.up);
    mat4.multiply(this.pMatrix1, mat, this.pMatrix);
};



papaya.viewer.ScreenSurface.prototype.unpackFloatFromVec4i = function (val) {
    var bitSh = [1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0];
    return ((val[0] * bitSh[0]) + (val[1] * bitSh[1]) + (val[2] * bitSh[2]) + (val[3] * bitSh[3]));
};




papaya.viewer.ScreenSurface.prototype.hasTranslucentSurfaces = function () {
    var ctr;
    for (ctr = 0; ctr < this.surfaces.length; ctr += 1) {
        if (this.surfaces[ctr].alpha < 1) {
            return true;
        }
    }

    return false;
};



papaya.viewer.ScreenSurface.prototype.drawScene = function (gl) {
    var ctr, xSlice, ySlice, zSlice, hasTranslucent = this.hasTranslucentSurfaces();

    // initialize
    gl.clearColor(this.backgroundColor[0], this.backgroundColor[1], this.backgroundColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    mat4.identity(this.mvMatrix);
    mat4.multiply(this.mouseRotDrag, this.mouseRotCurrent, this.mouseRotTemp);
    mat4.multiply(this.mouseTransDrag, this.mouseTransCurrent, this.mouseTransTemp);
    mat4.multiply(this.mouseTransTemp, this.mouseRotTemp, this.tempMat);
    mat4.set(this.tempMat, this.mvMatrix);
    this.updatePerspective();
    this.applyMatrixUniforms(gl);

    gl.uniform3f(this.shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
    gl.uniform3f(this.shaderProgram.pointLightingLocationUniform, 0, 0, 300 * this.scaleFactor);
    gl.uniform3f(this.shaderProgram.pointLightingColorUniform, 0.8, 0.8, 0.8);

    gl.uniform1i(this.shaderProgram.orientationText, 0);
    gl.uniform1i(this.shaderProgram.activePlane, 0);
    gl.uniform1i(this.shaderProgram.activePlaneEdge, 0);
    gl.uniform1i(this.shaderProgram.crosshairs, 0);
    gl.uniform1i(this.shaderProgram.hasColors, 0);
    gl.uniform1i(this.shaderProgram.colorPicking, 0);
    gl.uniform1i(this.shaderProgram.trianglePicking, 0);

    if (this.needsPick) {
        gl.uniform1i(this.shaderProgram.trianglePicking, 1);

        if ((this.pickingBuffer === null) || (this.pickingBuffer.length !== (gl.viewportWidth * gl.viewportHeight * 4))) {
            this.pickingBuffer = new Uint8Array(gl.viewportWidth * gl.viewportHeight * 4);
        }
    } else if (this.needsPickColor) {
        gl.uniform1i(this.shaderProgram.colorPicking, 1);

        if ((this.pickingBuffer === null) || (this.pickingBuffer.length !== (gl.viewportWidth * gl.viewportHeight * 4))) {
            this.pickingBuffer = new Uint8Array(gl.viewportWidth * gl.viewportHeight * 4);
        }
    }

    // draw surfaces (first pass)
    gl.enable(gl.DEPTH_TEST);

    for (ctr = 0; ctr < this.surfaces.length; ctr += 1) {
        this.renderSurface(gl, ctr, this.surfaces[ctr].alpha < 1, true, false);
    }

    gl.uniform1i(this.shaderProgram.hasSolidColor, 0);
    gl.uniform1i(this.shaderProgram.hasColors, 0);

    // do picking if necessary
    if (this.needsPick) {
        this.needsPick = false;
        this.pickedCoordinate = this.findPickedCoordinate(gl, this.pickLocX, this.pickLocY);
        gl.uniform1i(this.shaderProgram.trianglePicking, 0);
    } else if (this.needsPickColor) {
        this.needsPickColor = false;
        this.pickedColor = this.findPickedColor(gl);
        gl.uniform1i(this.shaderProgram.colorPicking, 0);
    } else {
        if (this.showSurfacePlanes) {
            // draw active planes
            if (this.needsUpdateActivePlanes) {
                this.needsUpdateActivePlanes = false;
                this.bindActivePlanes(gl);
            }

            gl.depthMask(false);
            gl.uniform1i(this.shaderProgram.activePlane, 1);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneAxialBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneAxialBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneCoronalBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneCoronalBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneSagittalBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneSagittalBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.depthMask(true);
            gl.disable(gl.BLEND);
            gl.uniform1i(this.shaderProgram.activePlane, 0);

            // draw active plane edges
            gl.uniform1i(this.shaderProgram.activePlaneEdge, 1);
            gl.lineWidth(this.isMainView() ? 3.0 : 2.0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneAxialEdgesBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneAxialEdgesBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 8);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneCoronalEdgesBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneCoronalEdgesBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 8);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneSagittalEdgesBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.activePlaneSagittalEdgesBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 8);

            gl.uniform1i(this.shaderProgram.activePlaneEdge, 0);
        }

        if (this.viewer.isShowingCrosshairs() && ((this.viewer.mainImage !== this) || this.viewer.toggleMainCrosshairs)) {
            if (this.needsUpdateActivePlanes) {
                this.needsUpdateActivePlanes = false;
                this.bindActivePlanes(gl);
            }

            // draw crosshairs
            gl.uniform1i(this.shaderProgram.crosshairs, 1);
            gl.lineWidth(this.isMainView() ? 3.0 : 2.0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineXBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.crosshairLineXBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineYBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.crosshairLineYBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineZBuffer);
            gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.crosshairLineZBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, 2);

            gl.uniform1i(this.shaderProgram.crosshairs, 0);
        }

        // draw surface (secondpass)
        gl.enable(gl.DEPTH_TEST);

        for (ctr = 0; ctr < this.surfaces.length; ctr += 1) {
            if (hasTranslucent) {
                this.renderSurface(gl, ctr, this.surfaces[ctr].alpha < 1, false, true);
            }
        }

        // draw orientation
        if ((this.viewer.mainImage === this.viewer.surfaceView) &&
            (this.viewer.container.preferences.showOrientation === "Yes")) {
            xSlice = this.currentCoord.x + ((this.xDim / 2) - this.volume.header.origin.x);
            ySlice = this.yDim - this.currentCoord.y - ((this.yDim / 2) - this.volume.header.origin.y);
            zSlice = this.zDim - this.currentCoord.z - ((this.zDim / 2) - this.volume.header.origin.z);

            this.drawOrientedText(gl, "S", papaya.viewer.ScreenSurface.TEXT_SIZE, [(xSlice * this.xSize) - this.xHalf, (ySlice * this.ySize) - this.yHalf,
                this.zHalf + papaya.viewer.ScreenSurface.ORIENTATION_SIZE * this.scaleFactor - ((this.zDim / 2) -
                this.volume.header.origin.z) * this.zSize]);
            this.drawOrientedText(gl, "I", papaya.viewer.ScreenSurface.TEXT_SIZE,[(xSlice * this.xSize) - this.xHalf, (ySlice * this.ySize) - this.yHalf,
                -this.zHalf - papaya.viewer.ScreenSurface.ORIENTATION_SIZE * this.scaleFactor - ((this.zDim / 2) -
                this.volume.header.origin.z) * this.zSize]);
            this.drawOrientedText(gl, "P", papaya.viewer.ScreenSurface.TEXT_SIZE, [(xSlice * this.xSize) - this.xHalf, -this.yHalf -
            papaya.viewer.ScreenSurface.ORIENTATION_SIZE * this.scaleFactor - ((this.yDim / 2) -
            this.volume.header.origin.y) * this.ySize, (zSlice * this.zSize) - this.zHalf]);
            this.drawOrientedText(gl, "A", papaya.viewer.ScreenSurface.TEXT_SIZE, [(xSlice * this.xSize) - this.xHalf, this.yHalf +
            papaya.viewer.ScreenSurface.ORIENTATION_SIZE * this.scaleFactor - ((this.yDim / 2) -
            this.volume.header.origin.y) * this.ySize, (zSlice * this.zSize) - this.zHalf]);
            this.drawOrientedText(gl, "L", papaya.viewer.ScreenSurface.TEXT_SIZE, [-this.xHalf - papaya.viewer.ScreenSurface.ORIENTATION_SIZE *
            this.scaleFactor + ((this.xDim / 2) - this.volume.header.origin.x) * this.xSize,
                (ySlice * this.ySize) - this.yHalf, (zSlice * this.zSize) - this.zHalf]);
            this.drawOrientedText(gl, "R", papaya.viewer.ScreenSurface.TEXT_SIZE, [this.xHalf + papaya.viewer.ScreenSurface.ORIENTATION_SIZE *
            this.scaleFactor + ((this.xDim / 2) - this.volume.header.origin.x) * this.xSize,
                (ySlice * this.ySize) - this.yHalf, (zSlice * this.zSize) - this.zHalf]);
        }

        if (this.viewer.container.preferences.showRuler === "Yes") {
            if (this.isMainView()) {
                this.drawRuler(gl);
            }
        } else {
            this.rulerPoints = null;
        }
    }

    // clean up
    gl.disable(gl.DEPTH_TEST);
};



papaya.viewer.ScreenSurface.prototype.renderSurface = function (gl, index, isTranslucent, translucentFirstPass, translucentSecondPass) {
    gl.uniform1f(this.shaderProgram.alphaVal, this.surfaces[index].alpha);

    if (isTranslucent) {
        if (translucentFirstPass) {
            gl.enable(gl.BLEND);
            gl.enable(gl.CULL_FACE);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.frontFace(gl.CCW);
            gl.cullFace(gl.FRONT);
            gl.uniform3f(this.shaderProgram.ambientColorUniform, 0, 0, 0);
            gl.uniform3f(this.shaderProgram.pointLightingLocationUniform, 0, 0, -300 * this.scaleFactor);
        } else if (translucentSecondPass) {
            gl.enable(gl.BLEND);
            gl.enable(gl.CULL_FACE);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.frontFace(gl.CCW);
            gl.cullFace(gl.BACK);
            gl.uniform3f(this.shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
            gl.uniform3f(this.shaderProgram.pointLightingLocationUniform, 0, 0, 300 * this.scaleFactor);
        }
    } else {
        gl.uniform3f(this.shaderProgram.ambientColorUniform, 0.2, 0.2, 0.2);
        gl.uniform3f(this.shaderProgram.pointLightingLocationUniform, 0, 0, 300 * this.scaleFactor);
    }

    gl.uniform1i(this.shaderProgram.hasSolidColor, 0);
    gl.uniform1i(this.shaderProgram.hasColors, 0);

    if (this.surfaces[index].solidColor) {
        gl.uniform1i(this.shaderProgram.hasSolidColor, 1);
        gl.uniform4f(this.shaderProgram.solidColor, this.surfaces[index].solidColor[0],
            this.surfaces[index].solidColor[1], this.surfaces[index].solidColor[2], 1.0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaces[index].pointsBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.surfaces[index].pointsBuffer.itemSize,
        gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaces[index].normalsBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.surfaces[index].normalsBuffer.itemSize,
        gl.FLOAT, false, 0, 0);

    if (this.surfaces[index].colorsData) {
        gl.uniform1i(this.shaderProgram.hasColors, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaces[index].colorsBuffer);
        gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
        gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, this.surfaces[index].colorsBuffer.itemSize,
            gl.FLOAT, false, 0, 0);
    } else {
        gl.disableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.surfaces[index].trianglesBuffer);
    gl.drawElements(gl.TRIANGLES, this.surfaces[index].trianglesBuffer.numItems, gl.UNSIGNED_INT, 0);

    if (isTranslucent && (translucentFirstPass || translucentSecondPass)) {
        gl.disable(gl.BLEND);
        gl.disable(gl.CULL_FACE);
    }
};



papaya.viewer.ScreenSurface.prototype.drawRuler = function (gl) {
    var found = true;

    if (this.rulerPoints === null) {
        this.rulerPoints = new Float32Array(6);
        found = this.findInitialRulerPoints(gl);
        this.drawScene(gl);  // need to redraw since pick
    }

    if (found) {
        gl.uniform1i(this.shaderProgram.ruler, 1);

        // draw endpoints
        this.drawRulerPoint(gl, this.rulerPoints[0], this.rulerPoints[1], this.rulerPoints[2]);
        this.drawRulerPoint(gl, this.rulerPoints[3], this.rulerPoints[4], this.rulerPoints[5]);

        // draw line
        gl.bindBuffer(gl.ARRAY_BUFFER, this.rulerLineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.rulerPoints, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.rulerLineBuffer);
        gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.rulerLineBuffer.itemSize, gl.FLOAT,
            false, 0, 0);
        gl.drawArrays(gl.LINES, 0, 2);
        gl.uniform1i(this.shaderProgram.ruler, 0);
    }
};



papaya.viewer.ScreenSurface.prototype.drawRulerPoint = function (gl, xLoc, yLoc, zLoc) {
    this.sphereVertexPositionBuffer.numItems = this.rulerPointData.vertices.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rulerPointData.vertices), gl.STATIC_DRAW);

    this.sphereNormalsPositionBuffer.numItems = this.rulerPointData.normals.length / 3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereNormalsPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.rulerPointData.normals), gl.STATIC_DRAW);

    this.sphereVertexIndexBuffer.numItems = this.rulerPointData.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.rulerPointData.indices), gl.STATIC_DRAW);

    gl.uniform1i(this.shaderProgram.hasSolidColor, 1);
    gl.uniform4f(this.shaderProgram.solidColor, papaya.viewer.ScreenSurface.RULER_COLOR[0],
        papaya.viewer.ScreenSurface.RULER_COLOR[1], papaya.viewer.ScreenSurface.RULER_COLOR[2], 1.0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereVertexPositionBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.sphereVertexPositionBuffer.itemSize,
        gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereNormalsPositionBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.sphereNormalsPositionBuffer.itemSize,
        gl.FLOAT, false, 0, 0);

    mat4.set(this.mvMatrix, this.tempMat);
    mat4.translate(this.mvMatrix, [xLoc, yLoc, zLoc]);
    this.applyMatrixUniforms(gl);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphereVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, this.sphereVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mat4.set(this.tempMat, this.mvMatrix);
    this.applyMatrixUniforms(gl);
};



papaya.viewer.ScreenSurface.prototype.drawOrientedText = function (gl, str, fontSize, coord) {
    if (this.orientationCanvas === null) {
        this.initOrientationBuffers(this.context);
    }

    this.updateOrientedTextSquare(fontSize, str);

    if (this.orientationTexture === null) {
        this.orientationTexture = gl.createTexture();
    }

    this.bindOrientation(gl);
    gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
    gl.uniform1i(this.shaderProgram.orientationText, 1);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.orientationContext.imageSmoothingEnabled = true;
    this.orientationContext.mozImageSmoothingEnabled = true;
    this.orientationContext.msImageSmoothingEnabled = true;
    this.orientationContext.textAlign = "center";
    this.orientationContext.textBaseline = "middle";
    this.orientationContext.font = fontSize + "px sans-serif";
    this.orientationContext.clearRect(0, 0, this.orientationCanvas.width, this.orientationCanvas.height);
    this.orientationContext.fillStyle = "#FFFFFF";
    this.orientationContext.fillText(str, this.orientationCanvas.width/2, this.orientationCanvas.height/2);

    mat4.set(this.mvMatrix, this.tempMat);
    mat4.multiplyVec3(this.mvMatrix, coord);
    mat4.identity(this.mvMatrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.orientationBuffer);
    gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.orientationBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.bindTexture(gl.TEXTURE_2D, this.orientationTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.orientationCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.orientationTextureCoordBuffer);
    gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.orientationTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.orientationTexture);
    gl.uniform1i(this.shaderProgram.samplerUniform, 0);

    mat4.translate(this.mvMatrix, coord);
    this.applyMatrixUniforms(gl);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    mat4.set(this.tempMat, this.mvMatrix);
    this.applyMatrixUniforms(gl);

    gl.disable(gl.BLEND);

    gl.uniform1i(this.shaderProgram.orientationText, 0);
    gl.disableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
};



papaya.viewer.ScreenSurface.prototype.bindOrientation = function (gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.orientationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.orientationVerts, gl.DYNAMIC_DRAW);
};



papaya.viewer.ScreenSurface.prototype.bindActivePlanes = function (gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneAxialBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsAxial, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneCoronalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsCoronal, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneSagittalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsSagittal, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneAxialEdgesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsAxialEdges, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneCoronalEdgesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsCoronalEdges, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.activePlaneSagittalEdgesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.activePlaneVertsSagittalEdges, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineXBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.crosshairLineVertsX, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineYBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.crosshairLineVertsY, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.crosshairLineZBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.crosshairLineVertsZ, gl.DYNAMIC_DRAW);
};



papaya.viewer.ScreenSurface.prototype.clearDTILinesImage = function () {
    // just here to satisfy interface
};



papaya.viewer.ScreenSurface.prototype.findProximalRulerHandle = function (xLoc, yLoc) {
    this.pick(xLoc, yLoc, true);
    this.grabbedRulerPoint = -1;

    if (this.pickedCoordinate && this.rulerPoints) {
        if (papaya.utilities.MathUtils.lineDistance3d(this.rulerPoints[0], this.rulerPoints[1],
                this.rulerPoints[2], this.pickedCoordinate.coordinate[0], this.pickedCoordinate.coordinate[1], this.pickedCoordinate.coordinate[2]) <
                (papaya.viewer.ScreenSlice.GRAB_RADIUS * this.scaleFactor)) {
            this.grabbedRulerPoint = 0;
        } else if (papaya.utilities.MathUtils.lineDistance3d(this.rulerPoints[3], this.rulerPoints[4],
                this.rulerPoints[5], this.pickedCoordinate.coordinate[0], this.pickedCoordinate.coordinate[1], this.pickedCoordinate.coordinate[2]) <
                (papaya.viewer.ScreenSlice.GRAB_RADIUS * this.scaleFactor)) {
            this.grabbedRulerPoint = 1;
        }
    }

    return (this.grabbedRulerPoint !== -1);
};



papaya.viewer.ScreenSurface.prototype.setStartDynamic = function (xLoc, yLoc) {
    this.dynamicStartX = xLoc;
    this.dynamicStartY = yLoc;
};



papaya.viewer.ScreenSurface.prototype.updateDynamic = function (xLoc, yLoc, factor) {
    var rotX = (yLoc - this.dynamicStartY) * papaya.viewer.ScreenSurface.MOUSE_SENSITIVITY * factor;
    var rotY = (xLoc - this.dynamicStartX) * papaya.viewer.ScreenSurface.MOUSE_SENSITIVITY * factor;

    var theta = (rotY * Math.PI) / 180.0;
    mat4.identity(this.mouseRotDragX);
    mat4.rotateY(this.mouseRotDragX, theta);

    theta = (rotX * Math.PI) / 180.0;
    mat4.identity(this.mouseRotDragY);
    mat4.rotateX(this.mouseRotDragY, theta);

    mat4.multiply(this.centerMat, this.mouseRotDragY, this.tempMat);
    mat4.multiply(this.tempMat, this.mouseRotDragX, this.tempMat2);
    mat4.multiply(this.tempMat2, this.centerMatInv, this.mouseRotDrag);
};



papaya.viewer.ScreenSurface.prototype.updateTranslateDynamic = function (xLoc, yLoc, factor) {
    var transX = (xLoc - this.dynamicStartX) * papaya.viewer.ScreenSurface.MOUSE_SENSITIVITY * factor;
    var transY = (yLoc - this.dynamicStartY) * papaya.viewer.ScreenSurface.MOUSE_SENSITIVITY * factor * -1;
    mat4.identity(this.mouseTransDrag);
    mat4.translate(this.mouseTransDrag, [transX, transY, 0]);
};



papaya.viewer.ScreenSurface.prototype.updateCurrent = function () {
    var temp = mat4.multiply(this.mouseRotDrag, this.mouseRotCurrent);
    mat4.set(temp, this.mouseRotCurrent);

    temp = mat4.multiply(this.mouseTransDrag, this.mouseTransCurrent);
    mat4.set(temp, this.mouseTransCurrent);

    mat4.identity(this.mouseTransDrag);
    mat4.identity(this.mouseRotDragX);
    mat4.identity(this.mouseRotDragY);
    mat4.identity(this.mouseRotDrag);
};



papaya.viewer.ScreenSurface.prototype.clearTransform = function (xform) {
    mat4.identity(xform);
    return xform;
};



papaya.viewer.ScreenSurface.prototype.makeOrientedTextSquare = function () {
    var half = papaya.viewer.ScreenSurface.ORIENTATION_SIZE * this.scaleFactor;

    this.orientationVerts[0] = -half;
    this.orientationVerts[1] = half;
    this.orientationVerts[2] = 0;

    this.orientationVerts[3] = -half;
    this.orientationVerts[4] = -half;
    this.orientationVerts[5] = 0;

    this.orientationVerts[6] = half;
    this.orientationVerts[7] = half;
    this.orientationVerts[8] = 0;

    this.orientationVerts[9] = half;
    this.orientationVerts[10] = -half;
    this.orientationVerts[11] = 0;

    this.orientationCanvas = document.createElement("canvas");
    this.orientationContext = this.orientationCanvas.getContext('2d');
    this.orientationContext.imageSmoothingEnabled = true;
    this.orientationContext.mozImageSmoothingEnabled = true;
    this.orientationContext.msImageSmoothingEnabled = true;
    this.orientationContext.fillStyle = "#FFFFFF";
    this.orientationContext.textAlign = "center";
    this.orientationContext.textBaseline = "middle";
};



papaya.viewer.ScreenSurface.prototype.updateOrientedTextSquare = function (fontSize, text) {
    var textWidth, textHeight, textSize;

    this.orientationContext.imageSmoothingEnabled = true;
    this.orientationContext.mozImageSmoothingEnabled = true;
    this.orientationContext.msImageSmoothingEnabled = true;
    this.orientationContext.fillStyle = "#FFFFFF";
    this.orientationContext.textAlign = "center";
    this.orientationContext.textBaseline = "middle";
    this.orientationContext.font = fontSize + "px sans-serif";
    textWidth = this.orientationContext.measureText(text).width;
    textHeight = fontSize;
    textSize = Math.max(textWidth, textHeight);

    this.orientationCanvas.width = papaya.utilities.MathUtils.getPowerOfTwo(textSize);
    this.orientationCanvas.height = papaya.utilities.MathUtils.getPowerOfTwo(textSize);
};



papaya.viewer.ScreenSurface.prototype.updateActivePlanes = function () {
    var xSlice, ySlice, zSlice;

    if (!this.showSurfacePlanes && !this.viewer.isShowingCrosshairs()) {
        return;
    }

    xSlice = this.currentCoord.x + ((this.xDim / 2) - this.volume.header.origin.x);
    ySlice = this.yDim - this.currentCoord.y - ((this.yDim / 2) - this.volume.header.origin.y);
    zSlice = this.zDim - this.currentCoord.z - ((this.zDim / 2) - this.volume.header.origin.z);

    // axial plane
    this.activePlaneVertsAxial[0] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxial[1] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxial[2] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxial[3] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxial[4] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxial[5] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxial[6] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxial[7] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxial[8] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxial[9] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxial[10] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxial[11] = (zSlice * this.zSize) - this.zHalf;

    // axial plane edges
    this.activePlaneVertsAxialEdges[0] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[1] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[2] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[3] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[4] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[5] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[6] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[7] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[8] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[9] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[10] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[11] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[12] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[13] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[14] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[15] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[16] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[17] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[18] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[19] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[20] = (zSlice * this.zSize) - this.zHalf;

    this.activePlaneVertsAxialEdges[21] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsAxialEdges[22] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsAxialEdges[23] = (zSlice * this.zSize) - this.zHalf;

    // coronal plane
    this.activePlaneVertsCoronal[0] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronal[1] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronal[2] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronal[3] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronal[4] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronal[5] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronal[6] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronal[7] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronal[8] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronal[9] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronal[10] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronal[11] = -this.zHalf + this.centerWorld.z;

    // coronal plane edges
    this.activePlaneVertsCoronalEdges[0] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[1] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[2] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[3] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[4] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[5] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[6] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[7] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[8] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[9] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[10] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[11] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[12] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[13] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[14] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[15] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[16] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[17] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[18] = this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[19] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[20] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsCoronalEdges[21] = -this.xHalf + this.centerWorld.x;
    this.activePlaneVertsCoronalEdges[22] = ((ySlice * this.ySize) - this.yHalf);
    this.activePlaneVertsCoronalEdges[23] = this.zHalf + this.centerWorld.z;

    // sagittal plane
    this.activePlaneVertsSagittal[0] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittal[1] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittal[2] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittal[3] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittal[4] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittal[5] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittal[6] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittal[7] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittal[8] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittal[9] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittal[10] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittal[11] = -this.zHalf + this.centerWorld.z;

    // sagittal plane edges
    this.activePlaneVertsSagittalEdges[0] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[1] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[2] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[3] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[4] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[5] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[6] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[7] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[8] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[9] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[10] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[11] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[12] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[13] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[14] = -this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[15] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[16] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[17] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[18] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[19] = this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[20] = this.zHalf + this.centerWorld.z;

    this.activePlaneVertsSagittalEdges[21] = (xSlice * this.xSize) - this.xHalf;
    this.activePlaneVertsSagittalEdges[22] = -this.yHalf + this.centerWorld.y;
    this.activePlaneVertsSagittalEdges[23] = this.zHalf + this.centerWorld.z;

    // crosshairs X
    this.crosshairLineVertsZ[0] = ((xSlice * this.xSize) - this.xHalf);
    this.crosshairLineVertsZ[1] = ((ySlice * this.ySize) - this.yHalf);
    this.crosshairLineVertsZ[2] = -this.zHalf + this.centerWorld.z;

    this.crosshairLineVertsZ[3] = ((xSlice * this.xSize) - this.xHalf);
    this.crosshairLineVertsZ[4] = ((ySlice * this.ySize) - this.yHalf);
    this.crosshairLineVertsZ[5] = this.zHalf + this.centerWorld.z;

    // crosshair Y
    this.crosshairLineVertsY[0] = ((xSlice * this.xSize) - this.xHalf);
    this.crosshairLineVertsY[1] = -this.yHalf + this.centerWorld.y;
    this.crosshairLineVertsY[2] = ((zSlice * this.zSize) - this.zHalf);

    this.crosshairLineVertsY[3] = ((xSlice * this.xSize) - this.xHalf);
    this.crosshairLineVertsY[4] = this.yHalf + this.centerWorld.y;
    this.crosshairLineVertsY[5] = ((zSlice * this.zSize) - this.zHalf);

    // crosshair X
    this.crosshairLineVertsX[0] = -this.xHalf + this.centerWorld.x;
    this.crosshairLineVertsX[1] = ((ySlice * this.ySize) - this.yHalf);
    this.crosshairLineVertsX[2] = ((zSlice * this.zSize) - this.zHalf);

    this.crosshairLineVertsX[3] = this.xHalf + this.centerWorld.x;
    this.crosshairLineVertsX[4] = ((ySlice * this.ySize) - this.yHalf);
    this.crosshairLineVertsX[5] = ((zSlice * this.zSize) - this.zHalf);

    this.needsUpdateActivePlanes = true;
};



papaya.viewer.ScreenSurface.prototype.pick = function (xLoc, yLoc, skipRedraw) {
    this.needsPick = true;
    this.pickLocX = xLoc;
    this.pickLocY = yLoc;
    this.draw(); // do picking

    if (skipRedraw) {
        return this.pickedCoordinate;
    }

    this.draw(); // redraw scene
    return this.pickedCoordinate;
};



papaya.viewer.ScreenSurface.prototype.pickRuler = function (xLoc, yLoc) {
    this.needsPick = true;
    this.pickLocX = xLoc;
    this.pickLocY = yLoc;
    this.draw(); // do picking

    if (this.pickedCoordinate) {
        this.rulerPoints[(this.grabbedRulerPoint * 3)] = this.pickedCoordinate.coordinate[0];
        this.rulerPoints[(this.grabbedRulerPoint * 3) + 1] = this.pickedCoordinate.coordinate[1];
        this.rulerPoints[(this.grabbedRulerPoint * 3) + 2] = this.pickedCoordinate.coordinate[2];

        this.draw(); // redraw scene
    }

    return this.pickedCoordinate;
};



papaya.viewer.ScreenSurface.prototype.pickColor = function (xLoc, yLoc) {
    this.needsPickColor = true;
    this.pickLocX = xLoc;
    this.pickLocY = yLoc;
    this.draw(); // do picking
    this.draw(); // redraw scene
    return this.pickedColor;
};



papaya.viewer.ScreenSurface.prototype.findPickedCoordinate = function (gl, xLoc, yLoc) {
    var winX = xLoc,
        winY = (gl.viewportHeight - 1 - yLoc),
        winZ, viewportArray, success, modelPointArrayResults = [];

    gl.readPixels(winX, winY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pickingBuffer);
    winZ = (this.unpackFloatFromVec4i(this.pickingBuffer) / 255.0);

    if (winZ >= 1) {
        return null;
    }

    viewportArray = [0, 0, gl.viewportWidth, gl.viewportHeight];

    success = GLU.unProject(
        winX, winY, winZ,
        this.mvMatrix, this.pMatrix,
        viewportArray, modelPointArrayResults);

    if (success) {
        return {coordinate: modelPointArrayResults, depth: winZ};
    }

    return null;
};



papaya.viewer.ScreenSurface.prototype.findInitialRulerPoints = function (gl) {
    var xDim = gl.viewportWidth,
        yDim = gl.viewportHeight,
        coord, points = [], finalPoints = [], xLoc, yLoc, ctr, index;

    for (ctr = 1; ctr < 5; ctr += 1) {
        xLoc = parseInt(xDim * .1 * ctr, 10);
        yLoc = parseInt(yDim * .1 * ctr, 10);
        coord = this.pick(xLoc, yLoc, true);
        if (coord) {
            points.push(coord);
        }

        xLoc = parseInt(xDim - (xDim * .1) * ctr, 10);
        yLoc = parseInt(yDim * .1 * ctr, 10);
        coord = this.pick(xLoc, yLoc, true);
        if (coord) {
            points.push(coord);
        }

        xLoc = parseInt(xDim - (xDim * .1) * ctr, 10);
        yLoc = parseInt(yDim - (yDim * .1) * ctr, 10);
        coord = this.pick(xLoc, yLoc, true);
        if (coord) {
            points.push(coord);
        }

        xLoc = parseInt(xDim * .1 * ctr, 10);
        yLoc = parseInt(yDim - (yDim * .1) * ctr, 10);
        coord = this.pick(xLoc, yLoc, true);
        if (coord) {
            points.push(coord);
        }
    }

    if (points < 2) {
        return false;
    }

    index = 0;
    for (ctr = 0; ctr < points.length; ctr += 1) {
        if (points[ctr].depth < points[index].depth) {
            index = ctr;
        }
    }

    finalPoints.push(points[index].coordinate);
    points.splice(index, 1);

    index = 0;
    for (ctr = 0; ctr < points.length; ctr += 1) {
        if (points[ctr].depth < points[index].depth) {
            index = ctr;
        }
    }

    finalPoints.push(points[index].coordinate);

    this.rulerPoints[0] = finalPoints[0][0];
    this.rulerPoints[1] = finalPoints[0][1];
    this.rulerPoints[2] = finalPoints[0][2];
    this.rulerPoints[3] = finalPoints[1][0];
    this.rulerPoints[4] = finalPoints[1][1];
    this.rulerPoints[5] = finalPoints[1][2];

    return true;
};



papaya.viewer.ScreenSurface.prototype.findPickedColor = function (gl) {
    var index;
    gl.readPixels(0, 0, gl.viewportWidth, gl.viewportHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.pickingBuffer);
    index = (gl.viewportHeight - 1 - this.pickLocY) * gl.viewportWidth * 4 + this.pickLocX * 4;
    return [this.pickingBuffer[index], this.pickingBuffer[index + 1], this.pickingBuffer[index + 2]];
};



papaya.viewer.ScreenSurface.prototype.getBackgroundColor = function () {
    return ("rgba(" + parseInt((this.backgroundColor[0] * 255) + 0.5) + ',' +
        parseInt((this.backgroundColor[1] * 255) + 0.5) + ',' +
        parseInt((this.backgroundColor[2] * 255) + 0.5) + ',255)');
};



papaya.viewer.ScreenSurface.prototype.updatePreferences = function () {
    this.updateBackgroundColor();
};



papaya.viewer.ScreenSurface.prototype.updateBackgroundColor = function () {
    var colorName = this.viewer.container.preferences.surfaceBackgroundColor;

    if (colorName === "Black") {
        this.backgroundColor = [0, 0, 0];
    } else if (colorName === "Dark Gray") {
        this.backgroundColor = [0.25, 0.25, 0.25];
    } else if (colorName === "Gray") {
        this.backgroundColor = [0.5, 0.5, 0.5];
    } else if (colorName === "Light Gray") {
        this.backgroundColor = [0.75, 0.75, 0.75];
    } else if (colorName === "White") {
        this.backgroundColor = [1, 1, 1];
    } else {
        this.backgroundColor = papaya.viewer.ScreenSurface.DEFAULT_BACKGROUND;
    }
};



papaya.viewer.ScreenSurface.prototype.isMainView = function () {
    return (this.viewer.mainImage === this.viewer.surfaceView);
};



papaya.viewer.ScreenSurface.prototype.processParams = function (params) {
    if (!this.viewer.container.isDesktopMode()) {
        if (params.surfaceBackground !== undefined) {
            this.viewer.container.preferences.surfaceBackgroundColor = params.surfaceBackground;
        }
    }
};



// adapted from: http://learningwebgl.com/blog/?p=1253
papaya.viewer.ScreenSurface.prototype.makeSphere = function (latitudeBands, longitudeBands, radius) {
    var latNumber, longNumber;
    var vertexPositionData = [];
    var normalData = [];

    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            //var u = 1 - (longNumber / longitudeBands);
            //var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }

    var indexData = [];
    for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    return {vertices:vertexPositionData, normals:normalData, indices:indexData};
};



papaya.viewer.ScreenSurface.prototype.getRulerLength = function () {
    return papaya.utilities.MathUtils.lineDistance3d(this.rulerPoints[0], this.rulerPoints[1],
        this.rulerPoints[2], this.rulerPoints[3], this.rulerPoints[4], this.rulerPoints[5]);
};

/*jslint browser: true, node: true */
/*global papayaRoundFast */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.ScreenVolume = papaya.viewer.ScreenVolume || function (vol, params, lutName, baseImage, parametric,
                                                                     currentCoord) {
    /*jslint sub: true */
    this.volume = vol;
    this.lutName = lutName;
    this.colorTable = new papaya.viewer.ColorTable(this.lutName, baseImage);
    this.screenMin = this.volume.header.imageRange.displayMin;
    this.screenMax = this.volume.header.imageRange.displayMax;
    this.imageMin = this.volume.header.imageRange.imageMin;
    this.imageMax = this.volume.header.imageRange.imageMax;
    this.alpha = 1.0;
    this.currentTimepoint = 0;
    this.parametric = (parametric !== undefined) && parametric;
    this.negativeScreenVol = null;
    this.dti = false;
    this.dtiLines = false;
    this.dtiColors = true;
    this.dtiVolumeMod = null;
    this.dtiAlphaFactor = 1.0;
    this.rgb = (this.volume.header.imageType.datatype === papaya.volume.ImageType.DATATYPE_RGB);
    this.hasCheckedImageRange = false;
    this.interpolation = true;
    this.error = null;
    this.hidden = false;
    this.rotationX = 0.5;
    this.rotationY = 0.5;
    this.rotationZ = 0.5;
    this.rotationAbout = "Rotate About Center";
    this.isHighResSlice = this.volume.header.imageDimensions.getNumVoxelsSlice() > (512 * 512);
    this.currentCoord = currentCoord;

    var screenParams = params[this.volume.fileName];
    if (screenParams) {
        if (screenParams.interpolation !== undefined) {
            this.interpolation = screenParams.interpolation;
        }

        if (screenParams.dti !== undefined) {
            this.dti = screenParams.dti;

            if (this.dti && (this.volume.numTimepoints !== 3)) {
                this.error = new Error("DTI vector series must have 3 series points!");
            }

            if (this.dti) {
                this.dtiLines = screenParams.dtiLines;
                this.dtiColors = screenParams.dtiColors;

                if (!this.dtiLines && !this.dtiColors) {
                    this.dtiColors = true;
                }

                this.initDTI();
            }
        }

        if ((screenParams.min !== undefined) && (screenParams.max !== undefined)) {
            if (parametric) {
                this.screenMin = -1 * Math.abs(screenParams.min);
                this.screenMax = -1 * Math.abs(screenParams.max);
            } else {
                this.screenMin = screenParams.min;
                this.screenMax = screenParams.max;
            }
        } else {
            this.findDisplayRange(parametric, screenParams);
        }

        if (parametric) {
            if (screenParams.negative_lut !== undefined) {
                this.lutName = screenParams.negative_lut;
                this.colorTable = new papaya.viewer.ColorTable(this.lutName, baseImage);
            }
        } else {
            if (screenParams.lut !== undefined) {
                if (typeof screenParams.lut === 'string' || screenParams.lut instanceof String) {
                    this.lutName = screenParams.lut;
                    this.colorTable = new papaya.viewer.ColorTable(this.lutName, baseImage);
                } else {
                    this.lutName = "Object";
                    this.colorTable = screenParams.lut;
                }
            }
        }

        if ((screenParams.alpha !== undefined) && !baseImage) {
            this.alpha = screenParams.alpha;
        }

        if (baseImage) {
            if ((screenParams.rotation !== undefined) && screenParams.rotation.length && (screenParams.rotation.length === 3)) {
                this.rotationX = (Math.min(Math.max(screenParams.rotation[0], -90), 90) + 90) / 180;
                this.rotationY = (Math.min(Math.max(screenParams.rotation[1], -90), 90) + 90) / 180;
                this.rotationZ = (Math.min(Math.max(screenParams.rotation[2], -90), 90) + 90) / 180;
            }

            if (screenParams.rotationPoint) {
                if (screenParams.rotationPoint.toLowerCase() === "origin") {
                    this.rotationAbout = "Rotate About Origin";
                } else if (screenParams.rotationPoint.toLowerCase() === "crosshairs") {
                    this.rotationAbout = "Rotate About Crosshairs";
                } else {
                    this.rotationAbout = "Rotate About Center";
                }
            }

            this.updateTransform();
        }
    } else {
        this.findDisplayRange(parametric, {});
    }

    this.negative = false;
    this.updateScreenRange();

    this.canvasIcon = document.createElement("canvas");
    this.canvasIcon.width = papaya.viewer.ColorTable.ICON_SIZE;
    this.canvasIcon.height = papaya.viewer.ColorTable.ICON_SIZE;
    this.contextIcon = this.canvasIcon.getContext("2d");
    this.imageDataIcon = this.contextIcon.createImageData(papaya.viewer.ColorTable.ICON_SIZE,
        papaya.viewer.ColorTable.ICON_SIZE);
    this.icon = null;

    this.canvasBar = document.createElement("canvas");
    this.canvasBar.width = papaya.viewer.ColorTable.COLOR_BAR_WIDTH;
    this.canvasBar.height = papaya.viewer.ColorTable.COLOR_BAR_HEIGHT;
    this.contextBar = this.canvasBar.getContext("2d");
    this.imageDataBar = this.contextBar.createImageData(papaya.viewer.ColorTable.COLOR_BAR_WIDTH,
        papaya.viewer.ColorTable.COLOR_BAR_HEIGHT);
    this.colorBar = null;

    this.updateIcon();
    this.updateColorBar();
};


/*** Static Methods ***/

papaya.viewer.ScreenVolume.makeSolidIcon = function (r, g, b) {
    var canvasIcon = document.createElement("canvas");
    canvasIcon.width = papaya.viewer.ColorTable.ICON_SIZE;
    canvasIcon.height = papaya.viewer.ColorTable.ICON_SIZE;
    var ctx = canvasIcon.getContext("2d");
    ctx.fillStyle = "rgb(" + parseInt(r * 255, 10) + "," + parseInt(g * 255, 10) + "," + parseInt(b * 255, 10) + ")";
    ctx.fillRect(0, 0, papaya.viewer.ColorTable.ICON_SIZE, papaya.viewer.ColorTable.ICON_SIZE);
    return canvasIcon.toDataURL();
};



/*** Prototype Methods ***/

papaya.viewer.ScreenVolume.prototype.setScreenRange = function (min, max) {
    this.screenMin = min;
    this.screenMax = max;
    this.updateScreenRange();
};



papaya.viewer.ScreenVolume.prototype.setScreenRangeNegatives = function (min, max) {
    this.negativeScreenVol.setScreenRange(min, max);
};



papaya.viewer.ScreenVolume.prototype.updateScreenRange = function () {
    this.screenRatio = (papaya.viewer.ScreenSlice.SCREEN_PIXEL_MAX / (this.screenMax - this.screenMin));
    this.negative = (this.screenMax < this.screenMin);
};



papaya.viewer.ScreenVolume.prototype.isOverlay = function () {
    return !this.colorTable.isBaseImage;
};



papaya.viewer.ScreenVolume.prototype.findImageRange = function () {
    var hasImageRange, min, max, xDim, yDim, zDim, ctrZ, ctrY, ctrX, value;

    hasImageRange = (this.volume.header.imageRange.imageMin !== this.volume.header.imageRange.imageMax);

    if (!hasImageRange && !this.hasCheckedImageRange) {
        this.hasCheckedImageRange = true;
        min = Number.MAX_VALUE;
        max = Number.MIN_VALUE;

        xDim = this.volume.header.imageDimensions.xDim;
        yDim = this.volume.header.imageDimensions.yDim;
        zDim = this.volume.header.imageDimensions.zDim;

        for (ctrZ = 0; ctrZ < zDim; ctrZ += 1) {
            for (ctrY = 0; ctrY < yDim; ctrY += 1) {
                for (ctrX = 0; ctrX < xDim; ctrX += 1) {
                    value = this.volume.getVoxelAtIndexNative(ctrX, ctrY, ctrZ, 0, true);

                    if (value > max) {
                        max = value;
                    }

                    if (value < min) {
                        min = value;
                    }
                }
            }
        }

        this.volume.header.imageRange.imageMin = this.imageMin = min;
        this.volume.header.imageRange.imageMax = this.imageMax = max;
    }
};



papaya.viewer.ScreenVolume.prototype.findDisplayRange = function (parametric, screenParams) {
    var hasImageRange, min, max, temp;

    hasImageRange = (this.volume.header.imageRange.imageMin !== this.volume.header.imageRange.imageMax);

    min = this.screenMin;
    max = this.screenMax;

    if (parametric) {
        if (Math.abs(min) > Math.abs(max)) {
            temp = max;
            max = min;
            min = temp;
        }
    }

    if (!parametric && ((screenParams.minPercent !== undefined) || (screenParams.maxPercent !== undefined))) {
        this.findImageRange();

        if (screenParams.minPercent !== undefined) {
            min = this.imageMax * screenParams.minPercent;
        } else {
            min = this.imageMin;
        }

        if (screenParams.maxPercent !== undefined) {
            max = this.imageMax * screenParams.maxPercent;
        } else {
            max = this.imageMax;
        }
    } else if (this.isOverlay()) {
        if ((min === max) || ((min < 0) && (max > 0)) || ((min > 0) && (max < 0)) || (parametric && ((min > 0) ||
            (max > 0))) || screenParams.symmetric) {  // if not set or crosses zero
            this.findImageRange();

            if (parametric) {
                if (screenParams.symmetric || (this.imageMin === 0)) {
                    min = -1 * (this.imageMax - (this.imageMax * 0.75));
                    max = -1 * (this.imageMax - (this.imageMax * 0.25));
                } else {
                    min = this.imageMin - (this.imageMin * 0.75);
                    max = this.imageMin - (this.imageMin * 0.25);
                }
            } else {
                min = this.imageMax - (this.imageMax * 0.75);
                max = this.imageMax - (this.imageMax * 0.25);
            }
        }

        if (!((min < 1) && (min > -1) && (max < 1) && (max > -1))) { // if not small numbers, round
            min = Math.round(min);
            max = Math.round(max);
        }
    } else {
        if (!((min < 1) && (min > -1) && (max < 1) && (max > -1))) {  // if not small numbers, round
            min = Math.round(min);
            max = Math.round(max);
        }

        if ((min === 0) && (max === 0)) { // if not found, for some reason
            this.findImageRange();
            min = this.imageMin;
            max = this.imageMax;
        }

        if (max <= min) { // sanity check
            this.findImageRange();
            min = this.imageMin;
            max = this.imageMax;
        }

        if (hasImageRange && (min < this.imageMin)) {
            this.findImageRange();
            min = this.imageMin;
        }

        if (hasImageRange && (max > this.imageMax)) {
            this.findImageRange();
            max = this.imageMax;
        }
    }

    this.screenMin = min;
    this.screenMax = max;
};



papaya.viewer.ScreenVolume.prototype.isUsingColorTable = function (lutName) {
    return (this.lutName === lutName);
};



papaya.viewer.ScreenVolume.prototype.isRotatingAbout = function (rotationAbout) {
    return (this.rotationAbout === rotationAbout);
};



papaya.viewer.ScreenVolume.prototype.changeColorTable = function (viewer, lutName) {
    this.colorTable = new papaya.viewer.ColorTable(lutName, !this.isOverlay());
    this.lutName = lutName;
    this.updateIcon();
    this.updateColorBar();
    viewer.drawViewer(true);
};



papaya.viewer.ScreenVolume.prototype.getRange = function () {
    var range = new Array(2);
    range[0] = ((this.colorTable.minLUT / (255.0 / (this.screenMax - this.screenMin))) + this.screenMin);
    range[1] = ((this.colorTable.maxLUT / (255.0 / (this.screenMax - this.screenMin))) + this.screenMin);
    return range;
};



papaya.viewer.ScreenVolume.prototype.getRangeNegative = function () {
    return this.negativeScreenVol.getRange();
};



papaya.viewer.ScreenVolume.prototype.getAlphaNegative = function () {
    return this.negativeScreenVol.alpha;
};



papaya.viewer.ScreenVolume.prototype.incrementTimepoint = function () {
    var numTimepoints = this.volume.numTimepoints;

    this.currentTimepoint += 1;
    if (this.currentTimepoint >= numTimepoints) {
        this.currentTimepoint = numTimepoints - 1;
    }
};



papaya.viewer.ScreenVolume.prototype.decrementTimepoint = function () {
    this.currentTimepoint -= 1;
    if (this.currentTimepoint < 0) {
        this.currentTimepoint = 0;
    }
};


papaya.viewer.ScreenVolume.prototype.setTimepoint = function (timepoint) {
    if (timepoint < 0) {
        this.currentTimepoint = 0;
    } else if (timepoint >= this.volume.numTimepoints) {
        this.currentTimepoint = (this.volume.numTimepoints - 1);
    } else {
        this.currentTimepoint = timepoint;
    }
};



papaya.viewer.ScreenVolume.prototype.updateMinLUT = function (minLUTnew) {
    this.colorTable.updateMinLUT(minLUTnew);
};



papaya.viewer.ScreenVolume.prototype.updateMaxLUT = function (maxLUTnew) {
    this.colorTable.updateMaxLUT(maxLUTnew);
};



papaya.viewer.ScreenVolume.prototype.updateLUT = function (minLUTnew, maxLUTnew) {
    this.colorTable.updateLUT(minLUTnew, maxLUTnew);
};



papaya.viewer.ScreenVolume.prototype.supportsDynamicColorTable = function () {
    return ((this.colorTable.updateMinLUT !== undefined) &&
        (this.colorTable.updateMaxLUT !== undefined) && (this.colorTable.updateLUT !== undefined));
};



papaya.viewer.ScreenVolume.prototype.resetDynamicRange = function () {
    this.colorTable.minLUT = 0;
    this.colorTable.maxLUT = papaya.viewer.ColorTable.LUT_MAX;
    this.updateLUT(this.colorTable.minLUT, this.colorTable.maxLUT);
    this.updateColorBar();
};



papaya.viewer.ScreenVolume.prototype.getCurrentTime = function () {
    return (this.currentTimepoint * (this.volume.header.voxelDimensions.timeSize *
        this.volume.header.voxelDimensions.getTemporalUnitMultiplier()));
};



papaya.viewer.ScreenVolume.prototype.setCurrentTime = function (seconds) {
    var secondsPerSeriesPoint = (this.volume.header.voxelDimensions.timeSize *
        this.volume.header.voxelDimensions.getTemporalUnitMultiplier());

    if (secondsPerSeriesPoint === 0) {
        this.setTimepoint(0);
    } else {
        this.setTimepoint(parseInt(Math.round(seconds / secondsPerSeriesPoint), 10));
    }
};



papaya.viewer.ScreenVolume.prototype.hasError = function () {
    return (this.error !== null);
};



papaya.viewer.ScreenVolume.prototype.initDTI = function () {
    this.volume.numTimepoints = 1;
    this.volume.header.imageDimensions.timepoints = 1;
    this.colorTable = new papaya.viewer.ColorTable(this.lutName, false, papaya.viewer.ColorTable.TABLE_DTI_SPECTRUM);
    this.volume.transform.voxelValue.forceABS = !this.dtiLines;
    this.updateIcon();
};



papaya.viewer.ScreenVolume.prototype.isDTILines = function () {
    return this.dtiLines && !this.dtiColors;
};



papaya.viewer.ScreenVolume.prototype.isDTIRGB = function () {
    return !this.dtiLines && this.dtiColors;
};



papaya.viewer.ScreenVolume.prototype.isDTILinesAndRGB = function () {
    return this.dtiLines && this.dtiColors;
};



papaya.viewer.ScreenVolume.prototype.getHiddenLabel = function () {
    if (this.hidden) {
        return "Show Overlay";
    } else {
        return "Hide Overlay";
    }
};



papaya.viewer.ScreenVolume.prototype.updateIcon = function () {
    var step, ctrY, ctrX, index, value;

    if (this.imageDataIcon) {
        step = papaya.viewer.ColorTable.LUT_MAX / papaya.viewer.ColorTable.ICON_SIZE;

        for (ctrY = 0; ctrY < papaya.viewer.ColorTable.ICON_SIZE; ctrY += 1) {
            for (ctrX = 0; ctrX < papaya.viewer.ColorTable.ICON_SIZE; ctrX += 1) {
                index = ((ctrY * papaya.viewer.ColorTable.ICON_SIZE) + ctrX) * 4;
                value = Math.round(ctrX * step);

                this.imageDataIcon.data[index] = this.colorTable.lookupRed(value);
                this.imageDataIcon.data[index + 1] = this.colorTable.lookupGreen(value);
                this.imageDataIcon.data[index + 2] = this.colorTable.lookupBlue(value);
                this.imageDataIcon.data[index + 3] = 255;
            }
        }

        this.contextIcon.putImageData(this.imageDataIcon, 0, 0);
        this.icon = this.canvasIcon.toDataURL();
    }
};



papaya.viewer.ScreenVolume.prototype.updateColorBar = function () {
    var step, ctrY, ctrX, index, value;

    if (this.imageDataBar) {
        step = papaya.viewer.ColorTable.LUT_MAX / papaya.viewer.ColorTable.COLOR_BAR_WIDTH;

        for (ctrY = 0; ctrY < papaya.viewer.ColorTable.COLOR_BAR_HEIGHT; ctrY += 1) {
            for (ctrX = 0; ctrX < papaya.viewer.ColorTable.COLOR_BAR_WIDTH; ctrX += 1) {
                index = ((ctrY * papaya.viewer.ColorTable.COLOR_BAR_WIDTH) + ctrX) * 4;
                value = Math.round(ctrX * step);

                this.imageDataBar.data[index] = this.colorTable.lookupRed(value);
                this.imageDataBar.data[index + 1] = this.colorTable.lookupGreen(value);
                this.imageDataBar.data[index + 2] = this.colorTable.lookupBlue(value);
                this.imageDataBar.data[index + 3] = 255;
            }
        }

        this.contextBar.putImageData(this.imageDataBar, 0, 0);
        this.colorBar = this.canvasBar.toDataURL();
    }
};



papaya.viewer.ScreenVolume.prototype.updateTransform = function () {
    var rotX = (this.rotationX - 0.5) * 180,
        rotY = (this.rotationY - 0.5) * 180,
        rotZ = (this.rotationZ - 0.5) * 180,
        centerX, centerY, centerZ;

    if (this.rotationAbout === "Rotate About Origin") {
        centerX = this.volume.header.origin.x * this.volume.header.voxelDimensions.xSize;
        centerY = this.volume.header.origin.y * this.volume.header.voxelDimensions.ySize;
        centerZ = this.volume.header.origin.z * this.volume.header.voxelDimensions.zSize;
    } else if (this.rotationAbout === "Rotate About Crosshairs") {
        centerX = this.currentCoord.x * this.volume.header.voxelDimensions.xSize;
        centerY = this.currentCoord.y * this.volume.header.voxelDimensions.ySize;
        centerZ = this.currentCoord.z * this.volume.header.voxelDimensions.zSize;
    } else {
        centerX = (this.volume.header.imageDimensions.xDim / 2) * this.volume.header.voxelDimensions.xSize;
        centerY = (this.volume.header.imageDimensions.yDim / 2) * this.volume.header.voxelDimensions.ySize;
        centerZ = (this.volume.header.imageDimensions.zDim / 2) * this.volume.header.voxelDimensions.zSize;
    }

    this.volume.transform.updateImageMat(centerX, centerY, centerZ, rotX, rotY, rotZ);
};



papaya.viewer.ScreenVolume.prototype.resetTransform = function () {
    this.rotationX = 0.5;
    this.rotationY = 0.5;
    this.rotationZ = 0.5;
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_SPACING, papayaContainers, papayaFloorFast, papayaRoundFast, PAPAYA_CONTROL_DIRECTION_SLIDER,
 PAPAYA_CONTROL_MAIN_SLIDER, PAPAYA_CONTROL_SWAP_BUTTON_CSS, PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS,
 PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS,  PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS, PAPAYA_PADDING,
 PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS, PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS, PAPAYA_CONTROL_INCREMENT_BUTTON_CSS,
 PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS, PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};
var PAPAYA_BUILD_NUM = PAPAYA_BUILD_NUM || "0";

/*** Constructor ***/
papaya.viewer.Viewer = papaya.viewer.Viewer || function (container, width, height, params) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext("2d");
    this.canvas.style.padding = 0;
    this.canvas.style.margin = 0;
    this.canvas.style.border = "none";
    this.atlas = null;
    this.initialized = false;
    this.pageLoaded = false;
    this.loadingVolume = null;
    this.volume = new papaya.volume.Volume(this.container.display, this);
    this.screenVolumes = [];
    this.surfaces = [];
    this.currentScreenVolume = null;
    this.axialSlice = null;
    this.coronalSlice = null;
    this.sagittalSlice = null;
    this.surfaceView = null;
    this.selectedSlice = null;
    this.mainImage = null;
    this.lowerImageBot2 = null;
    this.lowerImageBot = null;
    this.lowerImageTop = null;
    this.viewerDim = 0;
    this.worldSpace = false;
    this.currentCoord = new papaya.core.Coordinate(0, 0, 0);
    this.cursorPosition = new papaya.core.Coordinate(0, 0, 0);
    this.longestDim = 0;
    this.longestDimSize = 0;
    this.draggingSliceDir = 0;
    this.isDragging = false;
    this.isWindowControl = false;
    this.isZoomMode = false;
    this.isContextMode = false;
    this.isPanning = false;
    this.didLongTouch = false;
    this.isLongTouch = false;
    this.zoomFactor = papaya.viewer.Viewer.ZOOM_FACTOR_MIN;
    this.zoomFactorPrevious = papaya.viewer.Viewer.ZOOM_FACTOR_MIN;
    this.zoomLocX = 0;
    this.zoomLocY = 0;
    this.zoomLocZ = 0;
    this.panLocX = 0;
    this.panLocY = 0;
    this.panLocZ = 0;
    this.panAmountX = 0;
    this.panAmountY = 0;
    this.panAmountZ = 0;
    this.keyPressIgnored = false;
    this.previousMousePosition = new papaya.core.Point();
    this.isControlKeyDown = false;
    this.isAltKeyDown = false;
    this.isShiftKeyDown = false;
    this.toggleMainCrosshairs = true;
    this.bgColor = null;
    this.hasSeries = false;
    this.controlsHidden = false;
    this.loadingDTI = false;
    this.loadingDTIModRef = null;
    this.tempCoor = new papaya.core.Coordinate();

    this.listenerContextMenu = function (me) { me.preventDefault(); return false; };
    this.listenerMouseMove = papaya.utilities.ObjectUtils.bind(this, this.mouseMoveEvent);
    this.listenerMouseDown = papaya.utilities.ObjectUtils.bind(this, this.mouseDownEvent);
    this.listenerMouseOut = papaya.utilities.ObjectUtils.bind(this, this.mouseOutEvent);
    this.listenerMouseLeave = papaya.utilities.ObjectUtils.bind(this, this.mouseLeaveEvent);
    this.listenerMouseUp = papaya.utilities.ObjectUtils.bind(this, this.mouseUpEvent);
    this.listenerMouseDoubleClick = papaya.utilities.ObjectUtils.bind(this, this.mouseDoubleClickEvent);
    this.listenerKeyDown = papaya.utilities.ObjectUtils.bind(this, this.keyDownEvent);
    this.listenerKeyUp = papaya.utilities.ObjectUtils.bind(this, this.keyUpEvent);
    this.listenerTouchMove = papaya.utilities.ObjectUtils.bind(this, this.touchMoveEvent);
    this.listenerTouchStart = papaya.utilities.ObjectUtils.bind(this, this.touchStartEvent);
    this.listenerTouchEnd = papaya.utilities.ObjectUtils.bind(this, this.touchEndEvent);
    this.initialCoordinate = null;
    this.listenerScroll = papaya.utilities.ObjectUtils.bind(this, this.scrolled);
    this.longTouchTimer = null;
    this.updateTimer = null;
    this.updateTimerEvent = null;
    this.drawEmptyViewer();

    this.processParams(params);
};


/*** Static Pseudo-constants ***/

papaya.viewer.Viewer.GAP = PAPAYA_SPACING;  // padding between slice views
papaya.viewer.Viewer.BACKGROUND_COLOR = "rgba(0, 0, 0, 255)";
papaya.viewer.Viewer.CROSSHAIRS_COLOR = "rgba(28, 134, 238, 255)";
papaya.viewer.Viewer.KEYCODE_ROTATE_VIEWS = 32;
papaya.viewer.Viewer.KEYCODE_CENTER = 67;
papaya.viewer.Viewer.KEYCODE_ORIGIN = 79;
papaya.viewer.Viewer.KEYCODE_ARROW_UP = 38;
papaya.viewer.Viewer.KEYCODE_ARROW_DOWN = 40;
papaya.viewer.Viewer.KEYCODE_ARROW_RIGHT = 39;
papaya.viewer.Viewer.KEYCODE_ARROW_LEFT = 37;
papaya.viewer.Viewer.KEYCODE_PAGE_UP = 33;
papaya.viewer.Viewer.KEYCODE_PAGE_DOWN = 34;
papaya.viewer.Viewer.KEYCODE_SINGLE_QUOTE = 222;
papaya.viewer.Viewer.KEYCODE_FORWARD_SLASH = 191;
papaya.viewer.Viewer.KEYCODE_INCREMENT_MAIN = 71;
papaya.viewer.Viewer.KEYCODE_DECREMENT_MAIN = 86;
papaya.viewer.Viewer.KEYCODE_TOGGLE_CROSSHAIRS = 65;
papaya.viewer.Viewer.KEYCODE_SERIES_BACK = 188;  // , <
papaya.viewer.Viewer.KEYCODE_SERIES_FORWARD = 190;  // . >
papaya.viewer.Viewer.MAX_OVERLAYS = 8;
papaya.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR = "S";
papaya.viewer.Viewer.ORIENTATION_MARKER_INFERIOR = "I";
papaya.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR = "A";
papaya.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR = "P";
papaya.viewer.Viewer.ORIENTATION_MARKER_LEFT = "L";
papaya.viewer.Viewer.ORIENTATION_MARKER_RIGHT = "R";
papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE = 16;
papaya.viewer.Viewer.ORIENTATION_CERTAINTY_UNKNOWN_COLOR = "red";
papaya.viewer.Viewer.ORIENTATION_CERTAINTY_LOW_COLOR = "yellow";
papaya.viewer.Viewer.ORIENTATION_CERTAINTY_HIGH_COLOR = "white";
papaya.viewer.Viewer.UPDATE_TIMER_INTERVAL = 250;
papaya.viewer.Viewer.ZOOM_FACTOR_MAX = 10.0;
papaya.viewer.Viewer.ZOOM_FACTOR_MIN = 1.0;
papaya.viewer.Viewer.MOUSE_SCROLL_THRESHLD = 0.25;
papaya.viewer.Viewer.TITLE_MAX_LENGTH = 30;


/*** Static Methods ***/

papaya.viewer.Viewer.validDimBounds = function (val, dimBound) {
    return (val < dimBound) ? val : dimBound - 1;
};



papaya.viewer.Viewer.getKeyCode = function (ev) {
    return (ev.keyCode || ev.charCode);
};



papaya.viewer.Viewer.isControlKey = function (ke) {
    var keyCode = papaya.viewer.Viewer.getKeyCode(ke);

    if ((papaya.utilities.PlatformUtils.os === "MacOS") && (
        (keyCode === 91) || // left command key
        (keyCode === 93) || // right command key
        (keyCode === 224)
        )) { // FF command key code
        return true;
    }

    return ((papaya.utilities.PlatformUtils.os !== "MacOS") && (keyCode === 17));
};



papaya.viewer.Viewer.isAltKey = function (ke) {
    var keyCode = papaya.viewer.Viewer.getKeyCode(ke);
    return (keyCode === 18);
};



papaya.viewer.Viewer.isShiftKey = function (ke) {
    var isShift = !!ke.shiftKey;

    if (!isShift && window.event) {
        isShift = !!window.event.shiftKey;
    }

    return isShift;
};



papaya.viewer.Viewer.getOffsetRect = function (elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    // (2)
    var scrollTop = window.pageYOffset || docElem.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft;

    // (3)
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    // (4)
    var top  = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
};



// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
papaya.viewer.Viewer.drawRoundRect = function (ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined" ) {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
};



/*** Prototype Methods ***/

papaya.viewer.Viewer.prototype.loadImage = function (refs, forceUrl, forceEncode) {
    if (this.screenVolumes.length === 0) {
        this.loadBaseImage(refs, forceUrl, forceEncode);
    } else {
        this.loadOverlay(refs, forceUrl, forceEncode);
    }
};



papaya.viewer.Viewer.prototype.showDialog = function (title, data, datasource, callback, callbackOk) {
    var ctr, index = -1;

    for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
        if (papayaContainers[ctr] === this.container) {
            index = ctr;
            break;
        }
    }

    var dialog = new papaya.ui.Dialog(this.container, title, data, datasource, callback, callbackOk, index);
    dialog.showDialog();
};



papaya.viewer.Viewer.prototype.loadBaseImage = function (refs, forceUrl, forceEncode) {
    var imageRefs, loadableImage = this.container.findLoadableImage(refs);
    this.volume = new papaya.volume.Volume(this.container.display, this, this.container.params);

    if (forceEncode) {
        imageRefs = loadableImage.encode;
        if (!(imageRefs instanceof Array)) {
            imageRefs = [];
            imageRefs[0] = loadableImage.encode;
        }

        this.volume.readEncodedData(imageRefs, papaya.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
        imageRefs = loadableImage.encode;
        if (!(imageRefs instanceof Array)) {
            imageRefs = [];
            imageRefs[0] = loadableImage.encode;
        }

        this.volume.readEncodedData(imageRefs, papaya.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if (forceUrl) {
        this.volume.readURLs(refs, papaya.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
        this.volume.readURLs([loadableImage.url], papaya.utilities.ObjectUtils.bind(this, this.initializeViewer));
    } else {
        this.volume.readFiles(refs, papaya.utilities.ObjectUtils.bind(this, this.initializeViewer));
    }
};



papaya.viewer.Viewer.prototype.loadOverlay = function (refs, forceUrl, forceEncode) {
    var imageRefs, loadableImage = this.container.findLoadableImage(refs);
    this.loadingVolume = new papaya.volume.Volume(this.container.display, this, this.container.params);

    if (this.screenVolumes.length > papaya.viewer.Viewer.MAX_OVERLAYS) {
        this.loadingVolume.error = new Error("Maximum number of overlays (" + papaya.viewer.Viewer.MAX_OVERLAYS +
            ") has been reached!");
        this.initializeOverlay();
    } else {
        if (forceEncode) {
            imageRefs = loadableImage.encode;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadableImage.encode;
            }

            this.loadingVolume.readEncodedData(imageRefs, papaya.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
            imageRefs = loadableImage.encode;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadableImage.encode;
            }

            this.loadingVolume.readEncodedData(imageRefs, papaya.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if (forceUrl) {
            this.loadingVolume.readURLs(refs, papaya.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
            this.loadingVolume.readURLs([loadableImage.url], papaya.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        } else {
            this.loadingVolume.readFiles(refs, papaya.utilities.ObjectUtils.bind(this, this.initializeOverlay));
        }
    }
};



papaya.viewer.Viewer.prototype.loadSurface = function (ref, forceUrl, forceEncode) {
    var loadableImage = this.container.findLoadableImage(ref, true);

    if (this.screenVolumes.length == 0) {
        this.container.display.drawError("Load an image before loading a surface!");
        return;
    }

    var surface = new papaya.surface.Surface(this.container.display, this.container.params);

    if (forceEncode) {
        surface.readEncodedData(ref[0], papaya.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if ((loadableImage !== null) && (loadableImage.encode !== undefined)) {
        surface.readEncodedData(loadableImage.encode, papaya.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if (forceUrl) {
        surface.readURL(ref, papaya.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else if ((loadableImage !== null) && (loadableImage.url !== undefined)) {
        surface.readURL(loadableImage.url, papaya.utilities.ObjectUtils.bind(this, this.initializeSurface));
    } else {
        surface.readFile(ref[0], papaya.utilities.ObjectUtils.bind(this, this.initializeSurface));
    }
};




papaya.viewer.Viewer.prototype.initializeSurface = function (surface) {
    var currentSurface = surface;

    if (!surface.error) {
        while (currentSurface !== null) {
            this.surfaces.push(currentSurface);
            currentSurface = currentSurface.nextSurface;
        }

        if (this.surfaceView === null) {
            this.lowerImageBot2 = this.surfaceView = new papaya.viewer.ScreenSurface(this.volume, this.surfaces, this, this.container.params);
            this.container.resizeViewerComponents(true);
        } else {
            currentSurface = surface;

            while (currentSurface !== null) {
                this.surfaceView.initBuffers(this.surfaceView.context, currentSurface);
                currentSurface = currentSurface.nextSurface;
            }
        }

        if (this.container.params.mainView && (this.container.params.mainView.toLowerCase() === "surface")) {
            this.mainImage = this.surfaceView;
            this.lowerImageTop = this.axialSlice;
            this.lowerImageBot = this.sagittalSlice;
            this.lowerImageBot2 = this.coronalSlice;
            this.viewsChanged();
        }

        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();

        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    } else if (surface.error) {
        this.container.display.drawError(surface.error);
    }
};




papaya.viewer.Viewer.prototype.atlasLoaded = function () {
    this.finishedLoading();
};



papaya.viewer.Viewer.prototype.initializeViewer = function () {
    var message, viewer;

    viewer = this;

    if (this.volume.hasError()) {
        message = this.volume.error.message;
        this.resetViewer();
        this.container.clearParams();
        this.container.display.drawError(message);
    } else {
        this.screenVolumes[0] = new papaya.viewer.ScreenVolume(this.volume, this.container.params,
            papaya.viewer.ColorTable.DEFAULT_COLOR_TABLE.name, true, false, this.currentCoord);

        if (this.loadingDTI) {
            this.loadingDTI = false;

            this.screenVolumes[0].dti = true;

            if (this.screenVolumes[0].dti && (this.screenVolumes[0].volume.numTimepoints !== 3)) {
                this.screenVolumes[0].error = new Error("DTI vector series must have 3 series points!");
            }

            if (this.screenVolumes[0].dti) {
                this.screenVolumes[0].initDTI();
            }
        }

        if (this.screenVolumes[0].hasError()) {
            message = this.screenVolumes[0].error.message;
            this.resetViewer();
            this.container.clearParams();
            this.container.display.drawError(message);
            return;
        }

        this.setCurrentScreenVol(0);

        this.axialSlice = new papaya.viewer.ScreenSlice(this.volume, papaya.viewer.ScreenSlice.DIRECTION_AXIAL,
            this.volume.getXDim(), this.volume.getYDim(), this.volume.getXSize(), this.volume.getYSize(),
            this.screenVolumes, this);

        this.coronalSlice = new papaya.viewer.ScreenSlice(this.volume, papaya.viewer.ScreenSlice.DIRECTION_CORONAL,
            this.volume.getXDim(), this.volume.getZDim(), this.volume.getXSize(), this.volume.getZSize(),
            this.screenVolumes, this);

        this.sagittalSlice = new papaya.viewer.ScreenSlice(this.volume, papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL,
            this.volume.getYDim(), this.volume.getZDim(), this.volume.getYSize(), this.volume.getZSize(),
            this.screenVolumes, this);

        if ((this.container.params.mainView === undefined) ||
            (this.container.params.mainView.toLowerCase() === "axial")) {
            this.mainImage = this.axialSlice;
            this.lowerImageTop = this.sagittalSlice;
            this.lowerImageBot = this.coronalSlice;
        } else if (this.container.params.mainView.toLowerCase() === "coronal") {
            this.mainImage = this.coronalSlice;
            this.lowerImageTop = this.axialSlice;
            this.lowerImageBot = this.sagittalSlice;
        } else if (this.container.params.mainView.toLowerCase() === "sagittal") {
            this.mainImage = this.sagittalSlice;
            this.lowerImageTop = this.coronalSlice;
            this.lowerImageBot = this.axialSlice;
        } else {
            this.mainImage = this.axialSlice;
            this.lowerImageTop = this.sagittalSlice;
            this.lowerImageBot = this.coronalSlice;
        }

        this.canvas.addEventListener("mousemove", this.listenerMouseMove, false);
        this.canvas.addEventListener("mousedown", this.listenerMouseDown, false);
        this.canvas.addEventListener("mouseout", this.listenerMouseOut, false);
        this.canvas.addEventListener("mouseleave", this.listenerMouseLeave, false);
        this.canvas.addEventListener("mouseup", this.listenerMouseUp, false);
        document.addEventListener("keydown", this.listenerKeyDown, true);
        document.addEventListener("keyup", this.listenerKeyUp, true);
        this.canvas.addEventListener("touchmove", this.listenerTouchMove, false);
        this.canvas.addEventListener("touchstart", this.listenerTouchStart, false);
        this.canvas.addEventListener("touchend", this.listenerTouchEnd, false);
        this.canvas.addEventListener("dblclick", this.listenerMouseDoubleClick, false);
        document.addEventListener("contextmenu", this.listenerContextMenu, false);

        if (this.container.showControlBar) {
            // main slice
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_MAIN_SLIDER).find("button")).eq(0).click(function () {
                if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(false);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(false);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(true);
                }
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_MAIN_SLIDER).find("button")).eq(1).click(function () {
                if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(true);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(true);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(false);
                }
            });

            // axial slice
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(0).find("button").eq(0)).click(function () {
                viewer.incrementAxial(false);
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(0).find("button").eq(1)).click(function () {
                viewer.incrementAxial(true);
            });

            // coronal slice
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(1).find("button").eq(0)).click(function () {
                viewer.incrementCoronal(false);
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(1).find("button").eq(1)).click(function () {
                viewer.incrementCoronal(true);
            });

            // sagittal slice
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(2).find("button").eq(0)).click(function () {
                viewer.incrementSagittal(true);
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(2).find("button").eq(1)).click(function () {
                viewer.incrementSagittal(false);
            });

            // series
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(3).find("button").eq(0)).click(function () {
                viewer.decrementSeriesPoint();
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(3).find("button").eq(1)).click(function () {
                viewer.incrementSeriesPoint();
            });

            // buttons
            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS)).click(function () {
                viewer.rotateViews();
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS)).click(function () {
                var center = new papaya.core.Coordinate(Math.floor(viewer.volume.header.imageDimensions.xDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.yDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.zDim / 2));
                viewer.gotoCoordinate(center);
            });

            $(this.container.sliderControlHtml.find("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS)).click(function () {
                viewer.gotoCoordinate(viewer.volume.header.origin);
            });

            $("." + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', false);
            $("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS).prop('disabled', false);
            $("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', false);
            $("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', false);
        } else if (this.container.showControls) {
            $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});
            $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});
            $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).css({display: "inline"});

            $(this.container.containerHtml.find("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex)).click(function () {
                viewer.rotateViews();
            });

            $(this.container.containerHtml.find("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex)).click(function () {
                if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(false);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(false);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(true);
                }
            });

            $(this.container.containerHtml.find("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex)).click(function () {
                if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    viewer.incrementAxial(true);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    viewer.incrementCoronal(true);
                } else if (viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    viewer.incrementSagittal(false);
                }
            });

            $(this.container.containerHtml.find("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex)).click(function () {
                var center = new papaya.core.Coordinate(Math.floor(viewer.volume.header.imageDimensions.xDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.yDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.zDim / 2));
                viewer.gotoCoordinate(center);
            });

            $(this.container.containerHtml.find("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex)).click(function () {
                viewer.gotoCoordinate(viewer.volume.header.origin);
            });
        }

        this.hasSeries = (this.volume.header.imageDimensions.timepoints > 1);

        if (this.container.allowScroll) {
            this.addScroll();
        }

        this.setLongestDim(this.volume);
        this.calculateScreenSliceTransforms(this);
        this.currentCoord.setCoordinate(papayaFloorFast(this.volume.getXDim() / 2), papayaFloorFast(this.volume.getYDim() / 2),
            papayaFloorFast(this.volume.getZDim() / 2));

        this.updateOffsetRect();

        this.bgColor = $("body").css("background-color");

        if ((this.bgColor === "rgba(0, 0, 0, 0)") || ((this.bgColor === "transparent"))) {
            this.bgColor = "rgba(255, 255, 255, 255)";
        }

        if (this.volume.isWorldSpaceOnly()) {
            this.worldSpace = true;
        }

        this.initialized = true;
        this.container.resizeViewerComponents(true);
        this.drawViewer();

        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
        this.updateWindowTitle();

        this.container.loadingImageIndex = 1;
        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    }
};



papaya.viewer.Viewer.prototype.finishedLoading = function () {
    if (!this.pageLoaded) {
        this.goToInitialCoordinate();
        this.updateSliceSliderControl();
        this.pageLoaded = true;
    }

    if (this.container.loadingComplete) {
        this.container.loadingComplete();
        this.container.loadingComplete = null;
    }

    this.container.toolbar.buildToolbar();
    this.container.toolbar.updateImageButtons();
};



papaya.viewer.Viewer.prototype.addScroll = function () {
    if (!this.container.nestedViewer) {
        window.addEventListener(papaya.utilities.PlatformUtils.getSupportedScrollEvent(), this.listenerScroll, false);
    }
};



papaya.viewer.Viewer.prototype.removeScroll = function () {
    window.removeEventListener(papaya.utilities.PlatformUtils.getSupportedScrollEvent(), this.listenerScroll, false);
};



papaya.viewer.Viewer.prototype.updateOffsetRect = function () {
    this.canvasRect = papaya.viewer.Viewer.getOffsetRect(this.canvas);
};



papaya.viewer.Viewer.prototype.initializeOverlay = function () {
    var screenParams, parametric, ctr, overlay, overlayNeg, dti, screenVolV1;

    if (this.loadingVolume.hasError()) {
        this.container.display.drawError(this.loadingVolume.error.message);
        this.container.clearParams();
        this.loadingVolume = null;
    } else {
        screenParams = this.container.params[this.loadingVolume.fileName];
        parametric = (screenParams && screenParams.parametric);
        dti = (screenParams && screenParams.dtiMod);

        if (this.loadingDTIModRef) {
            this.loadingDTIModRef.dtiVolumeMod = this.loadingVolume;
            this.loadingDTIModRef = null;
        } else if (dti) {
            screenVolV1 = this.getScreenVolumeByName(screenParams.dtiRef);

            if (screenVolV1) {
                screenVolV1.dtiVolumeMod = this.loadingVolume;

                if (screenParams.dtiModAlphaFactor !== undefined) {
                    screenVolV1.dtiAlphaFactor = screenParams.dtiModAlphaFactor;
                } else {
                    screenVolV1.dtiAlphaFactor = 1.0;
                }
            }
        } else {
            overlay = new papaya.viewer.ScreenVolume(this.loadingVolume,
                this.container.params, (parametric ? papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[0].name :
                    this.getNextColorTable()), false, false, this.currentCoord);

            if (this.loadingDTI) {
                this.loadingDTI = false;

                overlay.dti = true;

                if (overlay.dti && (overlay.volume.numTimepoints !== 3)) {
                    overlay.error = new Error("DTI vector series must have 3 series points!");
                }

                if (overlay.dti) {
                    overlay.initDTI();
                }
            }

            if (overlay.hasError()) {
                this.container.display.drawError(overlay.error.message);
                this.container.clearParams();
                this.loadingVolume = null;
                return;
            }

            this.screenVolumes[this.screenVolumes.length] = overlay;
            this.setCurrentScreenVol(this.screenVolumes.length - 1);

            // even if "parametric" is set to true we should not add another screenVolume if the value range does not cross
            // zero
            if (parametric) {
                this.screenVolumes[this.screenVolumes.length - 1].findImageRange();
                if (this.screenVolumes[this.screenVolumes.length - 1].volume.header.imageRange.imageMin < 0) {
                    this.screenVolumes[this.screenVolumes.length] = overlayNeg = new papaya.viewer.ScreenVolume(this.loadingVolume,
                        this.container.params, papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[1].name, false, true, this.currentCoord);
                    overlay.negativeScreenVol = overlayNeg;

                    this.setCurrentScreenVol(this.screenVolumes.length - 1);
                }
            }
        }

        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
        this.drawViewer(true);

        this.hasSeries = false;
        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr].volume.header.imageDimensions.timepoints > 1) {
                this.hasSeries = true;
                break;
            }
        }

        this.container.resizeViewerComponents();

        this.updateWindowTitle();
        this.loadingVolume = null;

        if (this.container.hasMoreToLoad()) {
            this.container.loadNext();
        } else {
            this.finishedLoading();
        }
    }
};



papaya.viewer.Viewer.prototype.closeOverlayByRef = function (screenVol) {
    this.closeOverlay(this.getScreenVolumeIndex(screenVol));
};



papaya.viewer.Viewer.prototype.closeOverlay = function (index) {
    var ctr;

    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr].negativeScreenVol === this.screenVolumes[index]) {
            this.screenVolumes[ctr].negativeScreenVol = null;
        }
    }

    this.screenVolumes.splice(index, 1);
    this.setCurrentScreenVol(this.screenVolumes.length - 1);
    this.drawViewer(true);
    this.container.toolbar.buildToolbar();
    this.container.toolbar.updateImageButtons();
    this.updateWindowTitle();

    this.hasSeries = false;
    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr].volume.header.imageDimensions.timepoints > 1) {
            this.hasSeries = true;
            break;
        }
    }
    this.container.resizeViewerComponents();
};



papaya.viewer.Viewer.prototype.hasDefinedAtlas = function () {
    var papayaDataType, papayaDataTalairachAtlasType;

    papayaDataType = (typeof papaya.data);

    if (papayaDataType !== "undefined") {
        papayaDataTalairachAtlasType = (typeof papaya.data.Atlas);

        if (papayaDataTalairachAtlasType !== "undefined") {
            return true;
        }
    }

    return false;
};



papaya.viewer.Viewer.prototype.loadAtlas = function () {
    var viewer = this;

    if (this.atlas === null) {
        this.atlas = new papaya.viewer.Atlas(papaya.data.Atlas, this.container, papaya.utilities.ObjectUtils.bind(viewer,
            viewer.atlasLoaded));
    }
};



papaya.viewer.Viewer.prototype.isInsideMainSlice = function (xLoc, yLoc) {
    this.updateOffsetRect();
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;

    if (this.mainImage === this.axialSlice) {
        return this.insideScreenSlice(this.axialSlice, xLoc, yLoc, this.volume.getXDim(), this.volume.getYDim());
    } else if (this.mainImage === this.coronalSlice) {
        return this.insideScreenSlice(this.coronalSlice, xLoc, yLoc, this.volume.getXDim(), this.volume.getZDim());
    } else if (this.mainImage === this.sagittalSlice) {
        return this.insideScreenSlice(this.sagittalSlice, xLoc, yLoc, this.volume.getYDim(), this.volume.getZDim());
    }

    return false;
};



papaya.viewer.Viewer.prototype.updatePosition = function (viewer, xLoc, yLoc, crosshairsOnly) {
    var xImageLoc, yImageLoc, temp, originalX, originalY, surfaceCoord;

    viewer.updateOffsetRect();
    originalX = xLoc;
    originalY = yLoc;
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;

    if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
        if (!this.isDragging || (this.draggingSliceDir === papaya.viewer.ScreenSlice.DIRECTION_AXIAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.axialSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.axialSlice);

            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                viewer.currentCoord.x = xImageLoc;
                viewer.currentCoord.y = yImageLoc;
                this.draggingSliceDir = papaya.viewer.ScreenSlice.DIRECTION_AXIAL;
            }
        }
    } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(),
            viewer.volume.getZDim())) {
        if (!this.isDragging || (this.draggingSliceDir === papaya.viewer.ScreenSlice.DIRECTION_CORONAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.coronalSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.coronalSlice);

            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                viewer.currentCoord.x = xImageLoc;
                viewer.currentCoord.z = yImageLoc;
                this.draggingSliceDir = papaya.viewer.ScreenSlice.DIRECTION_CORONAL;
            }
        }
    } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        if (!this.isDragging || (this.draggingSliceDir === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL)) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.sagittalSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.sagittalSlice);

            if ((xImageLoc !== viewer.currentCoord.x) || (yImageLoc !== viewer.currentCoord.y)) {
                temp = xImageLoc;
                viewer.currentCoord.y = temp;
                viewer.currentCoord.z = yImageLoc;
                this.draggingSliceDir = papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL;
            }
        }
    } else if (viewer.surfaceView && this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc, viewer.surfaceView.screenDim,
            viewer.surfaceView.screenDim)) {
        viewer.surfaceView.updateDynamic(originalX, originalY, (this.selectedSlice === this.mainImage) ? 1 : 3);
    }

    this.container.coordinateChanged(this);
    viewer.drawViewer(false, crosshairsOnly);
};



papaya.viewer.Viewer.prototype.convertScreenToImageCoordinateX = function (xLoc, screenSlice) {
    return papaya.viewer.Viewer.validDimBounds(papayaFloorFast((xLoc - screenSlice.finalTransform[0][2]) / screenSlice.finalTransform[0][0]),
        screenSlice.xDim);
};



papaya.viewer.Viewer.prototype.convertScreenToImageCoordinateY = function (yLoc, screenSlice) {
    return papaya.viewer.Viewer.validDimBounds(papayaFloorFast((yLoc - screenSlice.finalTransform[1][2]) / screenSlice.finalTransform[1][1]),
        screenSlice.yDim);
};



papaya.viewer.Viewer.prototype.convertScreenToImageCoordinate = function (xLoc, yLoc, screenSlice) {
    var xImageLoc, yImageLoc, zImageLoc;

    if (screenSlice === undefined) {
        screenSlice = this.mainImage;
    }

    if (screenSlice.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        xImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        yImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        zImageLoc = this.axialSlice.currentSlice;
    } else if (screenSlice.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        xImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        zImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        yImageLoc = this.coronalSlice.currentSlice;
    } else if (screenSlice.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        yImageLoc = this.convertScreenToImageCoordinateX(xLoc, screenSlice);
        zImageLoc = this.convertScreenToImageCoordinateY(yLoc, screenSlice);
        xImageLoc = this.sagittalSlice.currentSlice;
    }

    return new papaya.core.Coordinate(xImageLoc, yImageLoc, zImageLoc);
};



papaya.viewer.Viewer.prototype.convertCurrentCoordinateToScreen = function (screenSlice) {
    return this.convertCoordinateToScreen(this.currentCoord, screenSlice);
};



papaya.viewer.Viewer.prototype.intersectsMainSlice = function (coord) {
    var sliceDirection = this.mainImage.sliceDirection;

    if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        return (coord.z === this.mainImage.currentSlice);
    } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        return (coord.y === this.mainImage.currentSlice);
    } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        return (coord.x === this.mainImage.currentSlice);
    }

    return false;
};



papaya.viewer.Viewer.prototype.convertCoordinateToScreen = function (coor, screenSlice) {
    var x, y, sliceDirection;

    if (screenSlice === undefined) {
        screenSlice = this.mainImage;
    }

    sliceDirection = screenSlice.sliceDirection;

    if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        x = papayaFloorFast(screenSlice.finalTransform[0][2] + (coor.x + 0.5) * screenSlice.finalTransform[0][0]);
        y = papayaFloorFast(screenSlice.finalTransform[1][2] + (coor.y + 0.5) * screenSlice.finalTransform[1][1]);
    } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        x = papayaFloorFast(screenSlice.finalTransform[0][2] + (coor.x + 0.5) * screenSlice.finalTransform[0][0]);
        y = papayaFloorFast(screenSlice.finalTransform[1][2] + (coor.z + 0.5) * screenSlice.finalTransform[1][1]);
    } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        x = papayaFloorFast(screenSlice.finalTransform[0][2] + (coor.y + 0.5) * screenSlice.finalTransform[0][0]);
        y = papayaFloorFast(screenSlice.finalTransform[1][2] + (coor.z + 0.5) * screenSlice.finalTransform[1][1]);
    }

    return new papaya.core.Point(x, y);
};



papaya.viewer.Viewer.prototype.updateCursorPosition = function (viewer, xLoc, yLoc) {
    var xImageLoc, yImageLoc, zImageLoc, surfaceCoord = null, found;

    if (this.container.display) {
        xLoc = xLoc - this.canvasRect.left;
        yLoc = yLoc - this.canvasRect.top;

        if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.axialSlice);
            yImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.axialSlice);
            zImageLoc = viewer.axialSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getZDim())) {
            xImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.coronalSlice);
            zImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.coronalSlice);
            yImageLoc = viewer.coronalSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(), viewer.volume.getZDim())) {
            yImageLoc = this.convertScreenToImageCoordinateX(xLoc, viewer.sagittalSlice);
            zImageLoc = this.convertScreenToImageCoordinateY(yLoc, viewer.sagittalSlice);
            xImageLoc = viewer.sagittalSlice.currentSlice;
            found = true;
        } else if (this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc)) {
            xLoc -= viewer.surfaceView.screenOffsetX;
            yLoc -= viewer.surfaceView.screenOffsetY;

            surfaceCoord = this.surfaceView.pick(xLoc, yLoc);

            if (surfaceCoord) {
                this.getIndexCoordinateAtWorld(surfaceCoord.coordinate[0], surfaceCoord.coordinate[1], surfaceCoord.coordinate[2], this.tempCoor);
                xImageLoc = this.tempCoor.x;
                yImageLoc = this.tempCoor.y;
                zImageLoc = this.tempCoor.z;
                found = true;
            }
        }

        if (found) {
            this.cursorPosition.x = xImageLoc;
            this.cursorPosition.y = yImageLoc;
            this.cursorPosition.z = zImageLoc;
            this.container.display.drawDisplay(xImageLoc, yImageLoc, zImageLoc);
        } else {
            this.container.display.drawEmptyDisplay();
        }
    }
};



papaya.viewer.Viewer.prototype.insideScreenSlice = function (screenSlice, xLoc, yLoc, xBound, yBound) {
    var xStart, xEnd, yStart, yEnd;

    if (!screenSlice) {
        return false;
    }

    if (screenSlice === this.surfaceView) {
        xStart = screenSlice.screenOffsetX;
        xEnd = screenSlice.screenOffsetX + screenSlice.screenDim;
        yStart = screenSlice.screenOffsetY;
        yEnd = screenSlice.screenOffsetY + screenSlice.screenDim;
    } else {
        xStart = papayaRoundFast(screenSlice.screenTransform[0][2]);
        xEnd = papayaRoundFast(screenSlice.screenTransform[0][2] + xBound * screenSlice.screenTransform[0][0]);
        yStart = papayaRoundFast(screenSlice.screenTransform[1][2]);
        yEnd = papayaRoundFast(screenSlice.screenTransform[1][2] + yBound * screenSlice.screenTransform[1][1]);
    }

    return ((xLoc >= xStart) && (xLoc < xEnd) && (yLoc >= yStart) && (yLoc < yEnd));
};



papaya.viewer.Viewer.prototype.drawEmptyViewer = function () {
    var locY, fontSize, text, metrics, textWidth;

    // clear area
    this.context.fillStyle = "#000000";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // draw drop text
    this.context.fillStyle = "#AAAAAA";

    if (this.container.readyForDnD()) {
        fontSize = 18;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 22;
        text = "Drop here or click the File menu";
        metrics = this.context.measureText(text);
        textWidth = metrics.width;
        this.context.fillText(text, (this.canvas.width / 2) - (textWidth / 2), locY);
    }

    if (this.canvas.width > 900) {
        // draw supported formats
        fontSize = 14;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 20;
        text = "Supported formats: NIFTI" + (papaya.Container.DICOM_SUPPORT ? ", DICOM" : "");
        this.context.fillText(text, 20, locY);

        // draw Papaya version info
        fontSize = 14;
        this.context.font = fontSize + "px sans-serif";
        locY = this.canvas.height - 20;

        text = "Papaya (Build " + PAPAYA_BUILD_NUM + ")";
        metrics = this.context.measureText(text);
        textWidth = metrics.width;
        this.context.fillText(text, this.canvas.width - textWidth - 20, locY);
    }
};



papaya.viewer.Viewer.prototype.drawViewer = function (force, skipUpdate) {
    var radiological = (this.container.preferences.radiological === "Yes"),
        showOrientation = (this.container.preferences.showOrientation === "Yes");

    if (!this.initialized) {
        this.drawEmptyViewer();
        return;
    }

    this.context.save();

    if (skipUpdate) {
        this.axialSlice.repaint(this.currentCoord.z, force, this.worldSpace);
        this.coronalSlice.repaint(this.currentCoord.y, force, this.worldSpace);
        this.sagittalSlice.repaint(this.currentCoord.x, force, this.worldSpace);
    } else {
        if (force || (this.draggingSliceDir !== papaya.viewer.ScreenSlice.DIRECTION_AXIAL)) {
            this.axialSlice.updateSlice(this.currentCoord.z, force, this.worldSpace);
        }

        if (force || (this.draggingSliceDir !== papaya.viewer.ScreenSlice.DIRECTION_CORONAL)) {
            this.coronalSlice.updateSlice(this.currentCoord.y, force, this.worldSpace);
        }

        if (force || (this.draggingSliceDir !== papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL)) {
            this.sagittalSlice.updateSlice(this.currentCoord.x, force, this.worldSpace);
        }
    }

    if (this.hasSurface() && (!papaya.utilities.PlatformUtils.smallScreen || force || (this.selectedSlice === this.surfaceView))) {
        this.surfaceView.draw();
    }

    // intialize screen slices
    if (this.container.preferences.smoothDisplay === "No") {
        this.context.imageSmoothingEnabled = false;
        this.context.mozImageSmoothingEnabled = false;
        this.context.msImageSmoothingEnabled = false;
    } else {
        this.context.imageSmoothingEnabled = true;
        this.context.mozImageSmoothingEnabled = true;
        this.context.msImageSmoothingEnabled = true;
    }

    // draw screen slices
    this.drawScreenSlice(this.mainImage);

    if (this.container.orthogonal) {
        this.drawScreenSlice(this.lowerImageTop);
        this.drawScreenSlice(this.lowerImageBot);

        if (this.hasSurface()) {
            this.drawScreenSlice(this.lowerImageBot2);
        }
    }

    if (showOrientation || radiological) {
        this.drawOrientation();
    }

    if (this.container.preferences.showCrosshairs === "Yes") {
        this.drawCrosshairs();
    }

    if (this.container.preferences.showRuler === "Yes") {
        this.drawRuler();
    }

    if (this.container.display) {
        this.container.display.drawDisplay(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z,
            this.getCurrentValueAt(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z));
    }

    if (this.container.contextManager && this.container.contextManager.drawToViewer) {
        this.container.contextManager.drawToViewer(this.context);
    }
};



papaya.viewer.Viewer.prototype.hasSurface = function () {
    return (this.container.hasSurface() && this.surfaceView && this.surfaceView.initialized);
};



papaya.viewer.Viewer.prototype.drawScreenSlice = function (slice) {
    var textWidth, textWidthExample, offset, padding = 5;

    if (slice === this.surfaceView) {
        this.context.fillStyle = this.surfaceView.getBackgroundColor();
        this.context.fillRect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.drawImage(slice.canvas, slice.screenOffsetX, slice.screenOffsetY);

        if (this.container.preferences.showRuler === "Yes") {
            if (this.surfaceView === this.mainImage) {
                this.context.font = papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
                textWidth = this.context.measureText("Ruler Length: ").width;
                textWidthExample = this.context.measureText("Ruler Length: 000.00").width;
                offset = (textWidthExample / 2);

                this.context.fillStyle = "#ffb3db";
                this.context.fillText("Ruler Length:  ", slice.screenDim / 2 - (offset / 2), papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE + padding);
                this.context.fillStyle = "#FFFFFF";
                this.context.fillText(this.surfaceView.getRulerLength().toFixed(2), (slice.screenDim / 2) + textWidth - (offset / 2), papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE + padding);
            }
        }
    } else {
        this.context.fillStyle = papaya.viewer.Viewer.BACKGROUND_COLOR;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.fillRect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.save();
        this.context.beginPath();
        this.context.rect(slice.screenOffsetX, slice.screenOffsetY, slice.screenDim, slice.screenDim);
        this.context.clip();
        this.context.setTransform(slice.finalTransform[0][0], 0, 0, slice.finalTransform[1][1], slice.finalTransform[0][2], slice.finalTransform[1][2]);
        this.context.drawImage(slice.canvasMain, 0, 0);
        this.context.restore();

        if (slice.canvasDTILines) {
            this.context.drawImage(slice.canvasDTILines, slice.screenOffsetX, slice.screenOffsetY);
        }
    }
};



papaya.viewer.Viewer.prototype.drawOrientation = function () {
    var metrics, textWidth, radiological, top, bottom, left, right, orientStartX, orientEndX, orientMidX,
        orientStartY, orientEndY, orientMidY,
        showOrientation = (this.container.preferences.showOrientation === "Yes");

    if (this.mainImage === this.surfaceView) {
        return;
    }

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.fillStyle = this.getOrientationCertaintyColor();
    this.context.font = papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
    metrics = this.context.measureText("X");
    textWidth = metrics.width;
    radiological = (this.container.preferences.radiological === "Yes");

    if (this.mainImage === this.axialSlice) {
        top = papaya.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR;
        bottom = papaya.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR;

        if (radiological) {
            left = papaya.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
            right = papaya.viewer.Viewer.ORIENTATION_MARKER_LEFT;
        } else {
            left = papaya.viewer.Viewer.ORIENTATION_MARKER_LEFT;
            right = papaya.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
        }
    } else if (this.mainImage === this.coronalSlice) {
        top = papaya.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR;
        bottom = papaya.viewer.Viewer.ORIENTATION_MARKER_INFERIOR;

        if (radiological) {
            left = papaya.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
            right = papaya.viewer.Viewer.ORIENTATION_MARKER_LEFT;
        } else {
            left = papaya.viewer.Viewer.ORIENTATION_MARKER_LEFT;
            right = papaya.viewer.Viewer.ORIENTATION_MARKER_RIGHT;
        }
    } else if (this.mainImage === this.sagittalSlice) {
        top = papaya.viewer.Viewer.ORIENTATION_MARKER_SUPERIOR;
        bottom = papaya.viewer.Viewer.ORIENTATION_MARKER_INFERIOR;
        left = papaya.viewer.Viewer.ORIENTATION_MARKER_ANTERIOR;
        right = papaya.viewer.Viewer.ORIENTATION_MARKER_POSTERIOR;
    }

    orientStartX = this.mainImage.screenOffsetX;
    orientEndX = this.mainImage.screenOffsetX + this.mainImage.screenDim;
    orientMidX = Math.round(orientEndX / 2.0);

    orientStartY = this.mainImage.screenOffsetY;
    orientEndY = this.mainImage.screenOffsetY + this.mainImage.screenDim;
    orientMidY = Math.round(orientEndY / 2.0);

    if (showOrientation || this.mainImage.isRadiologicalSensitive()) {
        this.context.fillText(left, orientStartX + papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE, orientMidY +
            (papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE * 0.5));
        this.context.fillText(right, orientEndX - 1.5 * papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE, orientMidY +
            (papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE * 0.5));
    }

    if (showOrientation) {
        this.context.fillText(top, orientMidX - (textWidth / 2), orientStartY +
            papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE * 1.5);
        this.context.fillText(bottom, orientMidX - (textWidth / 2), orientEndY -
            papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE);
    }
};



papaya.viewer.Viewer.prototype.drawRuler = function () {
    var ruler1x, ruler1y, ruler2x, ruler2y, text, metrics, textWidth, textHeight, padding, xText, yText;

    if (this.mainImage === this.surfaceView) {
        return;
    }

    if (this.mainImage === this.axialSlice) {
        ruler1x = (this.axialSlice.finalTransform[0][2] + (this.axialSlice.rulerPoints[0].x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        ruler1y = (this.axialSlice.finalTransform[1][2] + (this.axialSlice.rulerPoints[0].y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
        ruler2x = (this.axialSlice.finalTransform[0][2] + (this.axialSlice.rulerPoints[1].x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        ruler2y = (this.axialSlice.finalTransform[1][2] + (this.axialSlice.rulerPoints[1].y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
    } else if (this.mainImage === this.coronalSlice) {
        ruler1x = (this.coronalSlice.finalTransform[0][2] + (this.coronalSlice.rulerPoints[0].x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        ruler1y = (this.coronalSlice.finalTransform[1][2] + (this.coronalSlice.rulerPoints[0].y + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
        ruler2x = (this.coronalSlice.finalTransform[0][2] + (this.coronalSlice.rulerPoints[1].x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        ruler2y = (this.coronalSlice.finalTransform[1][2] + (this.coronalSlice.rulerPoints[1].y + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
    } else if (this.mainImage === this.sagittalSlice) {
        ruler1x = (this.sagittalSlice.finalTransform[0][2] + (this.sagittalSlice.rulerPoints[0].x + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        ruler1y = (this.sagittalSlice.finalTransform[1][2] + (this.sagittalSlice.rulerPoints[0].y + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
        ruler2x = (this.sagittalSlice.finalTransform[0][2] + (this.sagittalSlice.rulerPoints[1].x + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        ruler2y = (this.sagittalSlice.finalTransform[1][2] + (this.sagittalSlice.rulerPoints[1].y + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
    }

    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.strokeStyle = "#FF1493";
    this.context.fillStyle = "#FF1493";
    this.context.lineWidth = 2.0;
    this.context.save();
    this.context.beginPath();
    this.context.moveTo(ruler1x, ruler1y);
    this.context.lineTo(ruler2x, ruler2y);
    this.context.stroke();
    this.context.closePath();

    this.context.beginPath();
    this.context.arc(ruler1x, ruler1y, 3, 0, 2 * Math.PI, false);
    this.context.arc(ruler2x, ruler2y, 3, 0, 2 * Math.PI, false);
    this.context.fill();
    this.context.closePath();

    text = papaya.utilities.StringUtils.formatNumber(papaya.utilities.MathUtils.lineDistance(
        this.mainImage.rulerPoints[0].x * this.mainImage.xSize,
        this.mainImage.rulerPoints[0].y * this.mainImage.ySize,
        this.mainImage.rulerPoints[1].x * this.mainImage.xSize,
        this.mainImage.rulerPoints[1].y * this.mainImage.ySize), false);
    metrics = this.context.measureText(text);
    textWidth = metrics.width;
    textHeight = 14;
    padding = 2;
    xText = parseInt((ruler1x + ruler2x) / 2) - (textWidth / 2);
    yText = parseInt((ruler1y + ruler2y) / 2) + (textHeight / 2);

    this.context.fillStyle = "#FFFFFF";
    papaya.viewer.Viewer.drawRoundRect(this.context, xText - padding, yText - textHeight - padding + 1, textWidth + (padding * 2), textHeight+ (padding * 2), 5, true, false);

    this.context.font = papaya.viewer.Viewer.ORIENTATION_MARKER_SIZE + "px sans-serif";
    this.context.strokeStyle = "#FF1493";
    this.context.fillStyle = "#FF1493";
    this.context.fillText(text, xText, yText);
};



papaya.viewer.Viewer.prototype.drawCrosshairs = function () {
    var xLoc, yStart, yEnd, yLoc, xStart, xEnd;

    // initialize crosshairs
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.strokeStyle = papaya.viewer.Viewer.CROSSHAIRS_COLOR;
    this.context.lineWidth = 1.0;

    if ((this.mainImage !== this.axialSlice) || this.toggleMainCrosshairs) {
        // draw axial crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.axialSlice.screenOffsetX, this.axialSlice.screenOffsetY, this.axialSlice.screenDim,
            this.axialSlice.screenDim);
        this.context.closePath();
        this.context.clip();

        this.context.beginPath();

        xLoc = (this.axialSlice.finalTransform[0][2] + (this.currentCoord.x + 0.5) *
            this.axialSlice.finalTransform[0][0]);
        yStart = (this.axialSlice.finalTransform[1][2]);
        yEnd = (this.axialSlice.finalTransform[1][2] + this.axialSlice.yDim * this.axialSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);

        yLoc = (this.axialSlice.finalTransform[1][2] + (this.currentCoord.y + 0.5) *
            this.axialSlice.finalTransform[1][1]);
        xStart = (this.axialSlice.finalTransform[0][2]);
        xEnd = (this.axialSlice.finalTransform[0][2] + this.axialSlice.xDim * this.axialSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }


    if ((this.mainImage !== this.coronalSlice) || this.toggleMainCrosshairs) {
        // draw coronal crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.coronalSlice.screenOffsetX, this.coronalSlice.screenOffsetY, this.coronalSlice.screenDim,
            this.coronalSlice.screenDim);
        this.context.closePath();
        this.context.clip();

        this.context.beginPath();

        xLoc = (this.coronalSlice.finalTransform[0][2] + (this.currentCoord.x + 0.5) *
            this.coronalSlice.finalTransform[0][0]);
        yStart = (this.coronalSlice.finalTransform[1][2]);
        yEnd = (this.coronalSlice.finalTransform[1][2] + this.coronalSlice.yDim *
            this.coronalSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);

        yLoc = (this.coronalSlice.finalTransform[1][2] + (this.currentCoord.z + 0.5) *
            this.coronalSlice.finalTransform[1][1]);
        xStart = (this.coronalSlice.finalTransform[0][2]);
        xEnd = (this.coronalSlice.finalTransform[0][2] + this.coronalSlice.xDim *
            this.coronalSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }

    if ((this.mainImage !== this.sagittalSlice) || this.toggleMainCrosshairs) {
        // draw sagittal crosshairs
        this.context.save();
        this.context.beginPath();
        this.context.rect(this.sagittalSlice.screenOffsetX, this.sagittalSlice.screenOffsetY,
            this.sagittalSlice.screenDim, this.sagittalSlice.screenDim);
        this.context.closePath();
        this.context.clip();

        this.context.beginPath();

        xLoc = (this.sagittalSlice.finalTransform[0][2] + (this.currentCoord.y + 0.5) *
            this.sagittalSlice.finalTransform[0][0]);
        yStart = (this.sagittalSlice.finalTransform[1][2]);
        yEnd = (this.sagittalSlice.finalTransform[1][2] + this.sagittalSlice.yDim *
            this.sagittalSlice.finalTransform[1][1]);
        this.context.moveTo(xLoc, yStart);
        this.context.lineTo(xLoc, yEnd);

        yLoc = (this.sagittalSlice.finalTransform[1][2] + (this.currentCoord.z + 0.5) *
            this.sagittalSlice.finalTransform[1][1]);
        xStart = (this.sagittalSlice.finalTransform[0][2]);
        xEnd = (this.sagittalSlice.finalTransform[0][2] + this.sagittalSlice.xDim *
            this.sagittalSlice.finalTransform[0][0]);
        this.context.moveTo(xStart, yLoc);
        this.context.lineTo(xEnd, yLoc);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }
};



papaya.viewer.Viewer.prototype.calculateScreenSliceTransforms = function () {
    if (this.container.orthogonalTall) {
        if (this.container.hasSurface()) {
            this.viewerDim = this.canvas.height / 1.333;

            this.getTransformParameters(this.mainImage, this.viewerDim, false, 3);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;

            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 3);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX = 0;
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = this.viewerDim + (papaya.viewer.Viewer.GAP);

            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 3);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX = (((this.viewerDim - papaya.viewer.Viewer.GAP) / 3) + (papaya.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =  this.viewerDim + (papaya.viewer.Viewer.GAP);

            this.getTransformParameters(this.lowerImageBot2, this.viewerDim, true, 3);
            this.lowerImageBot2.screenTransform[0][2] += this.lowerImageBot2.screenOffsetX = 2 * ((((this.viewerDim - papaya.viewer.Viewer.GAP) / 3) + (papaya.viewer.Viewer.GAP)));
            this.lowerImageBot2.screenTransform[1][2] += this.lowerImageBot2.screenOffsetY =  this.viewerDim + (papaya.viewer.Viewer.GAP);
        } else {
            this.viewerDim = this.canvas.height / 1.5;

            this.getTransformParameters(this.mainImage, this.viewerDim, false, 2);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;

            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 2);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX = 0;
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY = this.viewerDim + (papaya.viewer.Viewer.GAP);

            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 2);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX = (((this.viewerDim - papaya.viewer.Viewer.GAP) / 2) + (papaya.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY =  this.viewerDim + (papaya.viewer.Viewer.GAP);
        }
    } else {
        this.viewerDim = this.canvas.height;

        if (this.container.hasSurface()) {
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 3);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;

            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 3);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX =
                (this.viewerDim + (papaya.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = 0;

            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 3);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX =
                (this.viewerDim + (papaya.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =
                (((this.viewerDim - papaya.viewer.Viewer.GAP) / 3) + (papaya.viewer.Viewer.GAP));

            this.getTransformParameters(this.lowerImageBot2, this.viewerDim, true, 3);
            this.lowerImageBot2.screenTransform[0][2] += this.lowerImageBot2.screenOffsetX =
                (this.viewerDim + (papaya.viewer.Viewer.GAP));
            this.lowerImageBot2.screenTransform[1][2] += this.lowerImageBot2.screenOffsetY =
                (((this.viewerDim - papaya.viewer.Viewer.GAP) / 3) * 2 + (papaya.viewer.Viewer.GAP) * 2);
        } else {
            this.getTransformParameters(this.mainImage, this.viewerDim, false, 2);
            this.mainImage.screenTransform[0][2] += this.mainImage.screenOffsetX = 0;
            this.mainImage.screenTransform[1][2] += this.mainImage.screenOffsetY = 0;

            this.getTransformParameters(this.lowerImageBot, this.viewerDim, true, 2);
            this.lowerImageBot.screenTransform[0][2] += this.lowerImageBot.screenOffsetX =
                (this.viewerDim + (papaya.viewer.Viewer.GAP));
            this.lowerImageBot.screenTransform[1][2] += this.lowerImageBot.screenOffsetY =
                (((this.viewerDim - papaya.viewer.Viewer.GAP) / 2) + (papaya.viewer.Viewer.GAP));

            this.getTransformParameters(this.lowerImageTop, this.viewerDim, true, 2);
            this.lowerImageTop.screenTransform[0][2] += this.lowerImageTop.screenOffsetX =
                (this.viewerDim + (papaya.viewer.Viewer.GAP));
            this.lowerImageTop.screenTransform[1][2] += this.lowerImageTop.screenOffsetY = 0;
        }
    }

    this.updateScreenSliceTransforms();
};



papaya.viewer.Viewer.prototype.updateScreenSliceTransforms = function () {
    this.axialSlice.updateFinalTransform();
    this.coronalSlice.updateFinalTransform();
    this.sagittalSlice.updateFinalTransform();
};



papaya.viewer.Viewer.prototype.getTransformParameters = function (image, height, lower, factor) {
    var bigScale, scaleX, scaleY, transX, transY;

    bigScale = lower ? factor : 1;

    if (image === this.surfaceView) {
        this.surfaceView.resize(this.viewerDim / bigScale);
        return;
    }

    if (image.getRealWidth() > image.getRealHeight()) {
        scaleX = (((lower ? height - papaya.viewer.Viewer.GAP : height) / this.longestDim) / bigScale) *
            (image.getXSize() / this.longestDimSize);
        scaleY = ((((lower ? height - papaya.viewer.Viewer.GAP : height) / this.longestDim) *
            image.getYXratio()) / bigScale) * (image.getXSize() / this.longestDimSize);
    } else {
        scaleX = ((((lower ? height - papaya.viewer.Viewer.GAP : height) / this.longestDim) *
            image.getXYratio()) / bigScale) * (image.getYSize() / this.longestDimSize);
        scaleY = (((lower ? height - papaya.viewer.Viewer.GAP : height) / this.longestDim) / bigScale) *
            (image.getYSize() / this.longestDimSize);
    }

    transX = (((lower ? height - papaya.viewer.Viewer.GAP : height) / bigScale) - (image.getXDim() * scaleX)) / 2;
    transY = (((lower ? height - papaya.viewer.Viewer.GAP : height) / bigScale) - (image.getYDim() * scaleY)) / 2;

    image.screenDim = (lower ? (height - papaya.viewer.Viewer.GAP) / factor : height);
    image.screenTransform[0][0] = scaleX;
    image.screenTransform[1][1] = scaleY;
    image.screenTransform[0][2] = transX;
    image.screenTransform[1][2] = transY;

    image.screenTransform2[0][0] = scaleX;
    image.screenTransform2[1][1] = scaleY;
    image.screenTransform2[0][2] = transX;
    image.screenTransform2[1][2] = transY;
};



papaya.viewer.Viewer.prototype.setLongestDim = function (volume) {
    this.longestDim = volume.getXDim();
    this.longestDimSize = volume.getXSize();

    if ((volume.getYDim() * volume.getYSize()) > (this.longestDim * this.longestDimSize)) {
        this.longestDim = volume.getYDim();
        this.longestDimSize = volume.getYSize();
    }

    if ((volume.getZDim() * volume.getZSize()) > (this.longestDim * this.longestDimSize)) {
        this.longestDim = volume.getZDim();
        this.longestDimSize = volume.getZSize();
    }
};



papaya.viewer.Viewer.prototype.keyDownEvent = function (ke) {
    var keyCode, center;

    this.keyPressIgnored = false;

    if (this.container.toolbar.isShowingMenus()) {
        return;
    }

    if (((papayaContainers.length > 1) || papayaContainers[0].nestedViewer) && (papaya.Container.papayaLastHoveredViewer !== this)) {
        return;
    }

    keyCode = papaya.viewer.Viewer.getKeyCode(ke);

    if (papaya.viewer.Viewer.isControlKey(ke)) {
        this.isControlKeyDown = true;
    } else if (papaya.viewer.Viewer.isAltKey(ke)) {
        this.isAltKeyDown = true;
    } else if (papaya.viewer.Viewer.isShiftKey(ke)) {
        this.isShiftKeyDown = true;
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ROTATE_VIEWS) {
        this.rotateViews();
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_CENTER) {
        center = new papaya.core.Coordinate(Math.floor(this.volume.header.imageDimensions.xDim / 2),
            Math.floor(this.volume.header.imageDimensions.yDim / 2),
            Math.floor(this.volume.header.imageDimensions.zDim / 2));
        this.gotoCoordinate(center);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ORIGIN) {
        this.gotoCoordinate(this.volume.header.origin);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ARROW_UP) {
        this.incrementCoronal(false);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ARROW_DOWN) {
        this.incrementCoronal(true);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ARROW_LEFT) {
        this.incrementSagittal(true);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_ARROW_RIGHT) {
        this.incrementSagittal(false);
    } else if ((keyCode === papaya.viewer.Viewer.KEYCODE_PAGE_DOWN) ||
        (keyCode === papaya.viewer.Viewer.KEYCODE_FORWARD_SLASH)) {
        this.incrementAxial(true);
    } else if ((keyCode === papaya.viewer.Viewer.KEYCODE_PAGE_UP) ||
        (keyCode === papaya.viewer.Viewer.KEYCODE_SINGLE_QUOTE)) {
        this.incrementAxial(false);
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_INCREMENT_MAIN) {
        if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.incrementAxial(false);
        } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.incrementCoronal(false);
        } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.incrementSagittal(true);
        }
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_DECREMENT_MAIN) {
        if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.incrementAxial(true);
        } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.incrementCoronal(true);
        } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.incrementSagittal(false);
        }
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_TOGGLE_CROSSHAIRS) {
        if (this.container.preferences.showCrosshairs === "Yes") {
            this.toggleMainCrosshairs = !this.toggleMainCrosshairs;
            this.drawViewer(true);
        }
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_SERIES_FORWARD) {
        this.incrementSeriesPoint();
    } else if (keyCode === papaya.viewer.Viewer.KEYCODE_SERIES_BACK) {
        this.decrementSeriesPoint();
    } else {
        this.keyPressIgnored = true;
    }

    if (!this.keyPressIgnored) {
        ke.handled = true;
        ke.preventDefault();
    }
};



papaya.viewer.Viewer.prototype.keyUpEvent = function (ke) {
    if ((papayaContainers.length > 1) && (papaya.Container.papayaLastHoveredViewer !== this)) {
        return;
    }

    this.isControlKeyDown = false;
    this.isAltKeyDown = false;
    this.isShiftKeyDown = false;

    if (!this.keyPressIgnored) {
        ke.handled = true;
        ke.preventDefault();
    }

    if (this.hasSurface()) {
        if (papaya.utilities.PlatformUtils.smallScreen) {
            this.drawViewer(true, false);
        }
    }
};



papaya.viewer.Viewer.prototype.rotateViews = function () {
    var temp;

    if (this.container.contextManager && this.container.contextManager.clearContext) {
        this.container.contextManager.clearContext();
    }

    if (this.hasSurface()) {
        temp = this.lowerImageBot2;
        this.lowerImageBot2 = this.lowerImageBot;
        this.lowerImageBot = this.lowerImageTop;
        this.lowerImageTop = this.mainImage;
        this.mainImage = temp;
    } else {
        temp = this.lowerImageBot;
        this.lowerImageBot = this.lowerImageTop;
        this.lowerImageTop = this.mainImage;
        this.mainImage = temp;
    }

    this.viewsChanged();
};



papaya.viewer.Viewer.prototype.viewsChanged = function () {
    this.calculateScreenSliceTransforms();

    if (this.hasSurface()) {
        this.lowerImageBot2.clearDTILinesImage();
    }

    this.lowerImageBot.clearDTILinesImage();
    this.lowerImageTop.clearDTILinesImage();
    this.mainImage.clearDTILinesImage();

    if (!this.controlsHidden) {
        if (this.mainImage !== this.surfaceView) {
            this.fadeInControls();
        } else {
            $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
            $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
        }

        $("#" + PAPAYA_DEFAULT_SLIDER_ID + this.container.containerIndex + "main").find("button").prop("disabled",
            (this.mainImage === this.surfaceView));
    }

    this.drawViewer(true);
    this.updateSliceSliderControl();
};



papaya.viewer.Viewer.prototype.timepointChanged = function () {
    this.drawViewer(true);
    this.updateSliceSliderControl();
    this.updateWindowTitle();
};



papaya.viewer.Viewer.prototype.resetUpdateTimer = function (me) {
    var viewer = this;

    if (this.updateTimer !== null) {
        window.clearTimeout(this.updateTimer);
        this.updateTimer = null;
        this.updateTimerEvent = null;
    }

    if (me !== null) {
        this.updateTimerEvent = me;
        this.updateTimer = window.setTimeout(papaya.utilities.ObjectUtils.bind(viewer,
            function () {
                viewer.updatePosition(this, papaya.utilities.PlatformUtils.getMousePositionX(viewer.updateTimerEvent),
                    papaya.utilities.PlatformUtils.getMousePositionY(viewer.updateTimerEvent));
            }),
            papaya.viewer.Viewer.UPDATE_TIMER_INTERVAL);
    }
};



papaya.viewer.Viewer.prototype.mouseDownEvent = function (me) {
    var draggingStarted = true, menuData, menu, pickedColor;

    if (!papaya.Container.allowPropagation) {
        me.stopPropagation();
    }

    me.preventDefault();

    if (this.showingContextMenu) {
        this.container.toolbar.closeAllMenus();
        me.handled = true;
        return;
    }

    if ((me.target.nodeName === "IMG") || (me.target.nodeName === "CANVAS")) {
        if (me.handled !== true) {
            this.container.toolbar.closeAllMenus();

            this.previousMousePosition.x = papaya.utilities.PlatformUtils.getMousePositionX(me);
            this.previousMousePosition.y = papaya.utilities.PlatformUtils.getMousePositionY(me);

            this.findClickedSlice(this, this.previousMousePosition.x, this.previousMousePosition.y);

            if (((me.button === 2) || this.isControlKeyDown || this.isLongTouch) && this.container.contextManager && (this.selectedSlice === this.mainImage) && (this.mainImage === this.surfaceView)) {
                this.contextMenuMousePositionX = this.previousMousePosition.x - this.canvasRect.left;
                this.contextMenuMousePositionY = this.previousMousePosition.y - this.canvasRect.top;

                if (this.container.contextManager.prefersColorPicking && this.container.contextManager.prefersColorPicking()) {
                    pickedColor = this.surfaceView.pickColor(this.contextMenuMousePositionX, this.contextMenuMousePositionY);
                    menuData = this.container.contextManager.getContextAtColor(pickedColor[0], pickedColor[1], pickedColor[2]);
                }

                if (menuData) {
                    this.isContextMode = true;
                    menu = this.container.toolbar.buildMenu(menuData, null, null, null, true);
                    papaya.ui.Toolbar.applyContextState(menu);
                    draggingStarted = false;
                    menu.showMenu();
                    this.showingContextMenu = true;
                }

                this.isContextMode = true;
            } else if (((me.button === 2) || this.isControlKeyDown || this.isLongTouch) && this.container.contextManager && (this.selectedSlice === this.mainImage)) {
                if (this.isLongTouch) {
                    var point = this.convertCurrentCoordinateToScreen(this.mainImage);
                    this.contextMenuMousePositionX = point.x;
                    this.contextMenuMousePositionY = point.y;
                    menuData = this.container.contextManager.getContextAtImagePosition(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z);
                } else {
                    this.contextMenuMousePositionX = this.previousMousePosition.x - this.canvasRect.left;
                    this.contextMenuMousePositionY = this.previousMousePosition.y - this.canvasRect.top;
                    menuData = this.container.contextManager.getContextAtImagePosition(this.cursorPosition.x, this.cursorPosition.y, this.cursorPosition.z);
                }

                if (menuData) {
                    this.isContextMode = true;
                    menu = this.container.toolbar.buildMenu(menuData, null, null, null, true);
                    papaya.ui.Toolbar.applyContextState(menu);
                    draggingStarted = false;
                    menu.showMenu();
                    this.showingContextMenu = true;
                }
            } else if (((me.button === 2) || this.isControlKeyDown) && !this.currentScreenVolume.rgb && !this.container.kioskMode) {
                this.isWindowControl = true;

                if (this.container.showImageButtons && (this.container.showControlBar || !this.container.kioskMode) &&
                        this.screenVolumes[this.getCurrentScreenVolIndex()].supportsDynamicColorTable()) {
                    this.container.toolbar.showImageMenu(this.getCurrentScreenVolIndex());
                }
            } else if (this.isAltKeyDown && this.selectedSlice) {
                this.isZoomMode = true;

                if (this.selectedSlice === this.surfaceView) {
                    this.isPanning = this.isShiftKeyDown;
                    this.surfaceView.setStartDynamic(this.previousMousePosition.x, this.previousMousePosition.y);
                } else if (this.isZooming() && this.isShiftKeyDown) {
                    this.isPanning = true;

                    this.setStartPanLocation(
                        this.convertScreenToImageCoordinateX(this.previousMousePosition.x, this.selectedSlice),
                        this.convertScreenToImageCoordinateY(this.previousMousePosition.y, this.selectedSlice),
                        this.selectedSlice.sliceDirection
                    );
                } else {
                    this.setZoomLocation();
                }
            } else {
                if (this.selectedSlice && (this.selectedSlice !== this.surfaceView)) {
                    this.grabbedHandle = this.selectedSlice.findProximalRulerHandle(this.convertScreenToImageCoordinateX(this.previousMousePosition.x - this.canvasRect.left, this.selectedSlice),
                        this.convertScreenToImageCoordinateY(this.previousMousePosition.y - this.canvasRect.top, this.selectedSlice));

                    if (this.grabbedHandle === null) {
                        this.updatePosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me), papaya.utilities.PlatformUtils.getMousePositionY(me), false);
                        this.resetUpdateTimer(me);
                    }
                } else if (this.selectedSlice && (this.selectedSlice === this.surfaceView)) {
                    if (this.surfaceView.findProximalRulerHandle(this.previousMousePosition.x - this.canvasRect.left,
                            this.previousMousePosition.y - this.canvasRect.top)) {

                    } else {
                        this.isPanning = this.isShiftKeyDown;
                        this.surfaceView.setStartDynamic(this.previousMousePosition.x, this.previousMousePosition.y);
                    }

                    this.container.display.drawEmptyDisplay();
                }
            }

            this.isDragging = draggingStarted;
            me.handled = true;
        }

        if (!this.controlsHidden) {
            this.controlsHiddenPrimed = true;
        }
    }
};



papaya.viewer.Viewer.prototype.mouseUpEvent = function (me) {
    if (!papaya.Container.allowPropagation) {
        me.stopPropagation();
    }

    me.preventDefault();

    if (this.showingContextMenu) {
        this.showingContextMenu = false;
        me.handled = true;
        return;
    }

    if ((me.target.nodeName === "IMG") || (me.target.nodeName === "CANVAS")) {
        if (me.handled !== true) {
            if (!this.isWindowControl && !this.isZoomMode && !this.isContextMode && (this.grabbedHandle === null) && (!this.surfaceView || (this.surfaceView.grabbedRulerPoint === -1))) {
                this.updatePosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me), papaya.utilities.PlatformUtils.getMousePositionY(me));
            }

            if (this.selectedSlice === this.surfaceView) {
                this.updateCursorPosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me), papaya.utilities.PlatformUtils.getMousePositionY(me));
            }

            this.zoomFactorPrevious = this.zoomFactor;
            this.isDragging = false;
            this.isWindowControl = false;
            this.isZoomMode = false;
            this.isPanning = false;
            this.selectedSlice = null;
            this.controlsHiddenPrimed = false;

            me.handled = true;
        }
    }

    this.grabbedHandle = null;
    this.isContextMode = false;

    this.updateWindowTitle();
    this.updateSliceSliderControl();
    this.container.toolbar.closeAllMenus(true);

    if (this.hasSurface()) {
        if (this.surfaceView.grabbedRulerPoint === -1) {
            this.surfaceView.updateCurrent();
        } else {
            this.surfaceView.grabbedRulerPoint = -1;
        }

        if (papaya.utilities.PlatformUtils.smallScreen) {
            this.drawViewer(true, false);
        }
    }

    if (this.controlsHidden) {
        this.controlsHidden = false;
        this.fadeInControls();
    }
};


papaya.viewer.Viewer.prototype.fadeOutControls = function () {
    $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).fadeOut();
    $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).fadeOut();
};



papaya.viewer.Viewer.prototype.fadeInControls = function () {
    if (this.container.getViewerDimensions()[0] < 600) {
        if (this.mainImage !== this.surfaceView) {
            $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
            $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
        }

        $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeIn();
    } else {
        if (this.mainImage !== this.surfaceView) {
            $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
            $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).fadeIn();
        }

        $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).fadeIn();
        $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).fadeIn();
        $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).fadeIn();
    }
};



papaya.viewer.Viewer.prototype.findClickedSlice = function (viewer, xLoc, yLoc) {
    xLoc = xLoc - this.canvasRect.left;
    yLoc = yLoc - this.canvasRect.top;

    if (this.insideScreenSlice(viewer.axialSlice, xLoc, yLoc, viewer.volume.getXDim(), viewer.volume.getYDim())) {
        this.selectedSlice = this.axialSlice;
    } else if (this.insideScreenSlice(viewer.coronalSlice, xLoc, yLoc, viewer.volume.getXDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.coronalSlice;
    } else if (this.insideScreenSlice(viewer.sagittalSlice, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.sagittalSlice;
    } else if (this.insideScreenSlice(viewer.surfaceView, xLoc, yLoc, viewer.volume.getYDim(),
            viewer.volume.getZDim())) {
        this.selectedSlice = this.surfaceView;
    } else {
        this.selectedSlice = null;
    }
};



papaya.viewer.Viewer.prototype.mouseMoveEvent = function (me) {
    me.preventDefault();

    if (this.showingContextMenu) {
        me.handled = true;
        return;
    }

    var currentMouseX, currentMouseY, zoomFactorCurrent;

    papaya.Container.papayaLastHoveredViewer = this;

    currentMouseX = papaya.utilities.PlatformUtils.getMousePositionX(me);
    currentMouseY = papaya.utilities.PlatformUtils.getMousePositionY(me);

    if (this.isDragging) {
        if (this.grabbedHandle) {
            if (this.isInsideMainSlice(currentMouseX, currentMouseY)) {
                this.grabbedHandle.x = this.convertScreenToImageCoordinateX(currentMouseX - this.canvasRect.left, this.selectedSlice);
                this.grabbedHandle.y = this.convertScreenToImageCoordinateY(currentMouseY - this.canvasRect.top, this.selectedSlice);
                this.drawViewer(true, true);
            }
        } else if (this.isWindowControl) {
            this.windowLevelChanged(this.previousMousePosition.x - currentMouseX, this.previousMousePosition.y - currentMouseY);
            this.previousMousePosition.x = currentMouseX;
            this.previousMousePosition.y = currentMouseY;
        } else if (this.isPanning) {
            if (this.selectedSlice === this.surfaceView) {
                this.surfaceView.updateTranslateDynamic(papaya.utilities.PlatformUtils.getMousePositionX(me),
                    papaya.utilities.PlatformUtils.getMousePositionY(me), (this.selectedSlice === this.mainImage) ? 1 : 3);
                this.drawViewer(false, true);
            } else {
                this.setCurrentPanLocation(
                    this.convertScreenToImageCoordinateX(currentMouseX, this.selectedSlice),
                    this.convertScreenToImageCoordinateY(currentMouseY, this.selectedSlice),
                    this.selectedSlice.sliceDirection
                );
            }
        } else if (this.isZoomMode) {
            if (this.selectedSlice === this.surfaceView) {
                zoomFactorCurrent = ((this.previousMousePosition.y - currentMouseY) * 0.5) * this.surfaceView.scaleFactor;
                this.surfaceView.zoom += zoomFactorCurrent;
                this.previousMousePosition.x = currentMouseX;
                this.previousMousePosition.y = currentMouseY;
            } else {
                zoomFactorCurrent = ((this.previousMousePosition.y - currentMouseY) * 0.05);
                this.setZoomFactor(this.zoomFactorPrevious - zoomFactorCurrent);

                this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
                    this.panAmountY, this);
                this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
                    this.panAmountZ, this);
                this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
                    this.panAmountZ, this);
            }

            this.drawViewer(true);
        } else {
            this.resetUpdateTimer(null);

            if (this.selectedSlice !== null) {
                if (this.selectedSlice === this.surfaceView) {
                    if (this.surfaceView.grabbedRulerPoint !== -1) {
                        this.surfaceView.pickRuler(currentMouseX - this.canvasRect.left,
                            currentMouseY - this.canvasRect.top);
                        this.drawViewer(false, true);
                    } else {
                        this.surfaceView.updateDynamic(papaya.utilities.PlatformUtils.getMousePositionX(me),
                            papaya.utilities.PlatformUtils.getMousePositionY(me), (this.selectedSlice === this.mainImage) ? 1 : 3);
                        this.drawViewer(false, true);
                        this.container.display.drawEmptyDisplay();
                    }
                } else {
                    this.updatePosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me),
                        papaya.utilities.PlatformUtils.getMousePositionY(me));
                }
            }
        }
    } else {
        this.updateCursorPosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me),
            papaya.utilities.PlatformUtils.getMousePositionY(me));
        this.isZoomMode = false;
    }

    if (this.controlsHidden && !this.isDragging) {
        this.controlsHidden = false;
        this.fadeInControls();
    }

    if (this.controlsTimer) {
        clearTimeout(this.controlsTimer);
        this.controlsTimer = null;
    }

    this.controlsTimer = setTimeout(papaya.utilities.ObjectUtils.bind(this, function () {
        this.controlsHidden = true;
        this.fadeOutControls();
        }), 8000);

    if (this.controlsHiddenPrimed) {
        this.controlsHiddenPrimed = false;
        this.controlsHidden = true;
        this.fadeOutControls();
    }
};



papaya.viewer.Viewer.prototype.mouseDoubleClickEvent = function () {
    if (this.isAltKeyDown) {
        this.zoomFactorPrevious = 1;
        this.setZoomFactor(1);
    }
};



papaya.viewer.Viewer.prototype.mouseOutEvent = function (me) {
    papaya.Container.papayaLastHoveredViewer = null;

    if (this.isDragging) {
        this.mouseUpEvent(me);
    } else {
        if (this.container.display) {
            this.container.display.drawEmptyDisplay();
        }

        this.grabbedHandle = null;
    }
};




papaya.viewer.Viewer.prototype.mouseLeaveEvent = function () {};


papaya.viewer.Viewer.prototype.touchMoveEvent = function (me) {
    if (!this.didLongTouch) {
        if (this.longTouchTimer) {
            clearTimeout(this.longTouchTimer);
            this.longTouchTimer = null;
        }

        if (!this.isDragging) {
            this.mouseDownEvent(me);
            this.isDragging = true;
        }

        this.mouseMoveEvent(me);
    }
};



papaya.viewer.Viewer.prototype.touchStartEvent = function (me) {
    if (!papaya.Container.allowPropagation) {
        me.stopPropagation();
    }

    me.preventDefault();
    this.longTouchTimer = setTimeout(papaya.utilities.ObjectUtils.bind(this, function() {this.doLongTouch(me); }), 500);
};



papaya.viewer.Viewer.prototype.touchEndEvent = function (me) {
    if (!this.didLongTouch) {
        if (this.longTouchTimer) {
            clearTimeout(this.longTouchTimer);
            this.longTouchTimer = null;
        }

        if (!this.isDragging) {
            this.mouseDownEvent(me);
        }

        this.mouseUpEvent(me);
    }

    this.didLongTouch = false;
    this.isLongTouch = false;
};



papaya.viewer.Viewer.prototype.doLongTouch = function (me) {
    this.longTouchTimer = null;
    this.didLongTouch = true;
    this.isLongTouch = true;

    this.updateCursorPosition(this, papaya.utilities.PlatformUtils.getMousePositionX(me), papaya.utilities.PlatformUtils.getMousePositionY(me));

    this.mouseDownEvent(me);
    this.mouseUpEvent(me);
};



papaya.viewer.Viewer.prototype.windowLevelChanged = function (contrastChange, brightnessChange) {
    var range, step, minFinal, maxFinal;

    range = this.currentScreenVolume.screenMax - this.currentScreenVolume.screenMin;
    step = range * 0.025;

    if (Math.abs(contrastChange) > Math.abs(brightnessChange)) {
        minFinal = this.currentScreenVolume.screenMin + (step * papaya.utilities.MathUtils.signum(contrastChange));
        maxFinal = this.currentScreenVolume.screenMax + (-1 * step * papaya.utilities.MathUtils.signum(contrastChange));

        if (maxFinal <= minFinal) {
            minFinal = this.currentScreenVolume.screenMin;
            maxFinal = this.currentScreenVolume.screenMin; // yes, min
        }
    } else {
        minFinal = this.currentScreenVolume.screenMin + (step * papaya.utilities.MathUtils.signum(brightnessChange));
        maxFinal = this.currentScreenVolume.screenMax + (step * papaya.utilities.MathUtils.signum(brightnessChange));
    }

    this.currentScreenVolume.setScreenRange(minFinal, maxFinal);

    if (this.container.showImageButtons) {
        this.container.toolbar.updateImageMenuRange(this.getCurrentScreenVolIndex(), parseFloat(minFinal.toPrecision(7)),
            parseFloat(maxFinal.toPrecision(7)));
    }

    this.drawViewer(true);
};



papaya.viewer.Viewer.prototype.gotoCoordinate = function (coor, nosync) {
    if (!this.initialized) {
        return;
    }

    var xDim = this.volume.header.imageDimensions.xDim;
    var yDim = this.volume.header.imageDimensions.yDim;
    var zDim = this.volume.header.imageDimensions.zDim;

    if (coor.x < 0) {
        this.currentCoord.x = 0;
    } else if (coor.x >= xDim) {
        this.currentCoord.x = (xDim - 1);
    } else {
        this.currentCoord.x = coor.x;
    }

    if (coor.y < 0) {
        this.currentCoord.y = 0;
    } else if (coor.y >= yDim) {
        this.currentCoord.y = (yDim - 1);
    } else {
        this.currentCoord.y = coor.y;
    }

    if (coor.z < 0) {
        this.currentCoord.z = 0;
    } else if (coor.z >= zDim) {
        this.currentCoord.z = (zDim - 1);
    } else {
        this.currentCoord.z = coor.z;
    }

    this.drawViewer(true);
    this.updateSliceSliderControl();

    if (nosync) {
        return;
    }

    this.container.coordinateChanged(this);
    this.drawViewer(false);
};


papaya.viewer.Viewer.prototype.gotoWorldCoordinate = function (coorWorld, nosync) {
    var coor = new papaya.core.Coordinate();
    this.gotoCoordinate(this.getIndexCoordinateAtWorld(coorWorld.x, coorWorld.y, coorWorld.z, coor), nosync);
};


papaya.viewer.Viewer.prototype.resizeViewer = function (dims) {
    var halfPadding = PAPAYA_PADDING / 2, offset, swapButton, originButton, incButton, decButton, centerButton;
    this.canvas.width = dims[0];
    this.canvas.height = dims[1];

    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    if (this.initialized) {
        this.calculateScreenSliceTransforms();
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.drawViewer(true);

        if (this.container.showControls) {
            offset = $(this.canvas).offset();

            incButton = $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex);
            incButton.css({
                top: offset.top + halfPadding,
                left: offset.left + this.mainImage.screenDim - incButton.outerWidth() - halfPadding,
                position:'absolute'});

            decButton = $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex);
            decButton.css({
                top: offset.top + decButton.outerHeight() + PAPAYA_PADDING,
                left: offset.left + this.mainImage.screenDim - decButton.outerWidth() - halfPadding,
                position:'absolute'});

            swapButton = $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex);
            swapButton.css({
                top: offset.top + this.mainImage.screenDim - swapButton.outerHeight() - halfPadding,
                left: offset.left + this.mainImage.screenDim - swapButton.outerWidth() - halfPadding,
                //width: swapButton.outerWidth(),
                position:'absolute'});

            centerButton = $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex);
            centerButton.css({
                top: offset.top + this.mainImage.screenDim - centerButton.outerHeight() - halfPadding,
                left: offset.left + halfPadding,
                position:'absolute'});

            originButton = $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex);
            originButton.css({
                top: offset.top + this.mainImage.screenDim - originButton.outerHeight() - halfPadding,
                left: offset.left + halfPadding + originButton.outerWidth() + PAPAYA_PADDING,
                position:'absolute'});
        }
    }
};



papaya.viewer.Viewer.prototype.getWorldCoordinateAtIndex = function (ctrX, ctrY, ctrZ, coord) {
    coord.setCoordinate((ctrX - this.volume.header.origin.x) * this.volume.header.voxelDimensions.xSize,
        (this.volume.header.origin.y - ctrY) * this.volume.header.voxelDimensions.ySize,
        (this.volume.header.origin.z - ctrZ) * this.volume.header.voxelDimensions.zSize);
    return coord;
};



papaya.viewer.Viewer.prototype.getIndexCoordinateAtWorld = function (ctrX, ctrY, ctrZ, coord) {
    coord.setCoordinate((ctrX / this.volume.header.voxelDimensions.xSize) + this.volume.header.origin.x,
        -1 * ((ctrY / this.volume.header.voxelDimensions.ySize) - this.volume.header.origin.y),
        -1 * ((ctrZ / this.volume.header.voxelDimensions.zSize) - this.volume.header.origin.z), true);
    return coord;
};



papaya.viewer.Viewer.prototype.getNextColorTable = function () {
    var ctr, count = 0, value;

    for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
        if (!this.screenVolumes[ctr].dti) {
            count += 1;
        }
    }

    value = count % papaya.viewer.ColorTable.OVERLAY_COLOR_TABLES.length;

    return papaya.viewer.ColorTable.OVERLAY_COLOR_TABLES[value].name;
};



papaya.viewer.Viewer.prototype.getCurrentValueAt = function (ctrX, ctrY, ctrZ) {
    /*jslint bitwise: true */

    var interpolation = !this.currentScreenVolume.interpolation;
    interpolation &= (this.container.preferences.smoothDisplay === "Yes");

    if (this.worldSpace) {
        return this.currentScreenVolume.volume.getVoxelAtCoordinate(
            (ctrX - this.volume.header.origin.x) * this.volume.header.voxelDimensions.xSize,
            (this.volume.header.origin.y - ctrY) * this.volume.header.voxelDimensions.ySize,
            (this.volume.header.origin.z - ctrZ) * this.volume.header.voxelDimensions.zSize,
            this.currentScreenVolume.currentTimepoint, !interpolation);
    } else {
        return this.currentScreenVolume.volume.getVoxelAtMM(
            ctrX * this.volume.header.voxelDimensions.xSize,
            ctrY * this.volume.header.voxelDimensions.ySize,
            ctrZ * this.volume.header.voxelDimensions.zSize,
            this.currentScreenVolume.currentTimepoint, !interpolation);
    }
};



papaya.viewer.Viewer.prototype.resetViewer = function () {
    if (this.container.showControlBar) {
        $("." + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', true);
        $("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS).prop('disabled', true);
        $("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', true);
        $("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', true);
    } else if (this.container.showControls) {
        $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
        $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.container.containerIndex).css({display: "none"});
    }

    this.initialized = false;
    this.loadingVolume = null;
    this.volume = new papaya.volume.Volume(this.container.display, this);
    this.screenVolumes = [];
    this.surfaces = [];
    this.surfaceView = null;
    this.currentScreenVolume = null;
    this.axialSlice = null;
    this.coronalSlice = null;
    this.sagittalSlice = null;
    this.mainImage = null;
    this.lowerImageBot2 = null;
    this.lowerImageBot = null;
    this.lowerImageTop = null;
    this.viewerDim = 0;
    this.currentCoord = new papaya.core.Coordinate(0, 0, 0);
    this.longestDim = 0;
    this.longestDimSize = 0;
    this.draggingSliceDir = 0;
    this.isDragging = false;
    this.isWindowControl = false;
    this.hasSeries = false;
    this.previousMousePosition = new papaya.core.Point();
    this.canvas.removeEventListener("mousemove", this.listenerMouseMove, false);
    this.canvas.removeEventListener("mousedown", this.listenerMouseDown, false);
    this.canvas.removeEventListener("mouseout", this.listenerMouseOut, false);
    this.canvas.removeEventListener("mouseleave", this.listenerMouseLeave, false);
    this.canvas.removeEventListener("mouseup", this.listenerMouseUp, false);
    document.removeEventListener("keydown", this.listenerKeyDown, true);
    document.removeEventListener("keyup", this.listenerKeyUp, true);
    document.removeEventListener("contextmenu", this.listenerContextMenu, false);
    this.canvas.removeEventListener("touchmove", this.listenerTouchMove, false);
    this.canvas.removeEventListener("touchstart", this.listenerTouchStart, false);
    this.canvas.removeEventListener("touchend", this.listenerTouchEnd, false);
    this.canvas.removeEventListener("dblclick", this.listenerMouseDoubleClick, false);

    this.removeScroll();

    this.updateTimer = null;
    this.updateTimerEvent = null;
    this.drawEmptyViewer();
    if (this.container.display) {
        this.container.display.drawEmptyDisplay();
    }

    this.updateSliceSliderControl();
    this.container.toolbar.buildToolbar();
};



papaya.viewer.Viewer.prototype.getHeaderDescription = function (index) {
    index = index || 0;
    return this.screenVolumes[index].volume.header.toString();
};



papaya.viewer.Viewer.prototype.getImageDimensionsDescription = function (index) {
    var orientationStr, imageDims;

    orientationStr = this.screenVolumes[index].volume.header.orientation.orientation;
    imageDims = this.screenVolumes[index].volume.header.imageDimensions;

    return ("(" + orientationStr.charAt(0) + ", " + orientationStr.charAt(1) + ", " + orientationStr.charAt(2) + ") " +
        imageDims.cols + " x " + imageDims.rows + " x " + imageDims.slices);
};



papaya.viewer.Viewer.prototype.getVoxelDimensionsDescription = function (index) {
    var orientationStr, voxelDims;

    orientationStr = this.screenVolumes[index].volume.header.orientation.orientation;
    voxelDims = this.screenVolumes[index].volume.header.voxelDimensions;

    return ("(" + orientationStr.charAt(0) + ", " + orientationStr.charAt(1) + ", " + orientationStr.charAt(2) + ") " +
        papaya.utilities.StringUtils.formatNumber(voxelDims.colSize, true) + " x " + papaya.utilities.StringUtils.formatNumber(voxelDims.rowSize, true) + " x " +
        papaya.utilities.StringUtils.formatNumber(voxelDims.sliceSize, true) + " " + voxelDims.getSpatialUnitString());
};



papaya.viewer.Viewer.prototype.getSeriesDimensionsDescription = function (index) {
    var imageDims = this.screenVolumes[index].volume.header.imageDimensions;

    return (imageDims.timepoints.toString());
};



papaya.viewer.Viewer.prototype.getSeriesSizeDescription = function (index) {
    var voxelDims = this.screenVolumes[index].volume.header.voxelDimensions;

    return (voxelDims.timeSize.toString() + " " + voxelDims.getTemporalUnitString());
};



papaya.viewer.Viewer.prototype.getFilename = function (index) {
    return papaya.utilities.StringUtils.wordwrap(this.screenVolumes[index].volume.fileName, 25, "<br />", true);
};



papaya.viewer.Viewer.prototype.getSurfaceFilename = function (index) {
    return papaya.utilities.StringUtils.wordwrap(this.surfaces[index].filename, 25, "<br />", true);
};



papaya.viewer.Viewer.prototype.getSurfaceNumPoints = function (index) {
    return this.surfaces[index].numPoints;
};



papaya.viewer.Viewer.prototype.getSurfaceNumTriangles = function (index) {
    return this.surfaces[index].numTriangles;
};



papaya.viewer.Viewer.prototype.getNiceFilename = function (index) {
    var truncateText, filename;

    truncateText = "...";
    filename = this.screenVolumes[index].volume.fileName.replace(".nii", "").replace(".gz", "");

    if (filename.length > papaya.viewer.Viewer.TITLE_MAX_LENGTH) {
        filename = filename.substr(0, papaya.viewer.Viewer.TITLE_MAX_LENGTH - truncateText.length) + truncateText;
    }

    return filename;
};



papaya.viewer.Viewer.prototype.getFileLength = function (index) {
    return papaya.utilities.StringUtils.getSizeString(this.screenVolumes[index].volume.fileLength);
};



papaya.viewer.Viewer.prototype.getByteTypeDescription = function (index) {
    return (this.screenVolumes[index].volume.header.imageType.numBytes + "-Byte " +
        this.screenVolumes[index].volume.header.imageType.getTypeDescription());
};



papaya.viewer.Viewer.prototype.getByteOrderDescription = function (index) {
    return this.screenVolumes[index].volume.header.imageType.getOrderDescription();
};



papaya.viewer.Viewer.prototype.getCompressedDescription = function (index) {
    if (this.screenVolumes[index].volume.header.imageType.compressed) {
        return "Yes";
    }

    return "No";
};



papaya.viewer.Viewer.prototype.getOrientationDescription = function (index) {
    return this.screenVolumes[index].volume.header.orientation.getOrientationDescription();
};



papaya.viewer.Viewer.prototype.getImageDescription = function (index) {
    return papaya.utilities.StringUtils.wordwrap(this.screenVolumes[index].volume.header.imageDescription.notes, 35, "<br />", true);
};



papaya.viewer.Viewer.prototype.setCurrentScreenVol = function (index) {
    this.currentScreenVolume = this.screenVolumes[index];
    this.updateWindowTitle();
};



papaya.viewer.Viewer.prototype.updateWindowTitle = function () {
    var title;

    title = this.getNiceFilename(this.getCurrentScreenVolIndex());

    if (this.currentScreenVolume.volume.numTimepoints > 1) {
        title = (title + " (" + (this.currentScreenVolume.currentTimepoint + 1) + " of " +
            this.currentScreenVolume.volume.numTimepoints + ")");
    }

    if (this.isZooming()) {
        title = (title + " " + this.getZoomString());
    }

    this.container.toolbar.updateTitleBar(title);
};



papaya.viewer.Viewer.prototype.getCurrentScreenVolIndex = function () {
    var ctr;

    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (this.screenVolumes[ctr] === this.currentScreenVolume) {
            return ctr;
        }
    }

    return -1;
};



papaya.viewer.Viewer.prototype.toggleWorldSpace = function () {
    this.worldSpace = !this.worldSpace;

    if (this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }
};



papaya.viewer.Viewer.prototype.isSelected = function (index) {
    return (this.isSelectable() && (index === this.getCurrentScreenVolIndex()));
};



papaya.viewer.Viewer.prototype.isSelectable = function () {
    return (this.screenVolumes.length > 1);
};



papaya.viewer.Viewer.prototype.processParams = function (params) {
    if (params.worldSpace) {
        this.worldSpace = true;
    }

    if (params.coordinate) {
        this.initialCoordinate = params.coordinate;
    }


    if (!this.container.isDesktopMode()) {
        if (params.showOrientation !== undefined) {
            this.container.preferences.showOrientation = (params.showOrientation ? "Yes" : "No");
        }

        if (params.smoothDisplay !== undefined) {
            this.container.preferences.smoothDisplay = (params.smoothDisplay ? "Yes" : "No");
        }

        if (params.radiological !== undefined) {
            this.container.preferences.radiological = (params.radiological ? "Yes" : "No");
        }

        if (params.showRuler !== undefined) {
            this.container.preferences.showRuler = (params.showRuler ? "Yes" : "No");
        }

        if (params.showSurfacePlanes !== undefined) {
            this.container.preferences.showSurfacePlanes = (params.showSurfacePlanes ? "Yes" : "No");
        }

        if (params.showSurfaceCrosshairs !== undefined) {
            this.container.preferences.showSurfaceCrosshairs = (params.showSurfaceCrosshairs ? "Yes" : "No");
        }
    }
};



papaya.viewer.Viewer.prototype.hasLoadedDTI = function () {
    return (this.screenVolumes.length === 1) && (this.screenVolumes[0].dti) && (this.screenVolumes[0].dtiVolumeMod === null);
};



papaya.viewer.Viewer.prototype.goToInitialCoordinate = function () {
    var coord = new papaya.core.Coordinate();

    if (this.screenVolumes.length > 0) {
        if (this.initialCoordinate === null) {
            coord.setCoordinate(papayaFloorFast(this.volume.header.imageDimensions.xDim / 2),
                papayaFloorFast(this.volume.header.imageDimensions.yDim / 2),
                papayaFloorFast(this.volume.header.imageDimensions.zDim / 2), true);
        } else {
            if (this.worldSpace) {
                this.getIndexCoordinateAtWorld(this.initialCoordinate[0], this.initialCoordinate[1],
                    this.initialCoordinate[2], coord);
            } else {
                coord.setCoordinate(this.initialCoordinate[0], this.initialCoordinate[1], this.initialCoordinate[2], true);
            }

            this.initialCoordinate = null;
        }

        this.gotoCoordinate(coord);

        if (this.container.display) {
            this.container.display.drawDisplay(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z,
                this.getCurrentValueAt(this.currentCoord.x, this.currentCoord.y, this.currentCoord.z));
        }
    }
};



papaya.viewer.Viewer.prototype.getOrientationCertaintyColor = function () {
    var certainty = this.screenVolumes[0].volume.header.orientationCertainty;

    if (certainty === papaya.volume.Header.ORIENTATION_CERTAINTY_LOW) {
        return papaya.viewer.Viewer.ORIENTATION_CERTAINTY_LOW_COLOR;
    }

    if (certainty === papaya.volume.Header.ORIENTATION_CERTAINTY_HIGH) {
        return papaya.viewer.Viewer.ORIENTATION_CERTAINTY_HIGH_COLOR;
    }

    return papaya.viewer.Viewer.ORIENTATION_CERTAINTY_UNKNOWN_COLOR;
};



papaya.viewer.Viewer.prototype.isUsingAtlas = function (name) {
    return (name === this.atlas.currentAtlas);
};



papaya.viewer.Viewer.prototype.scrolled = function (e) {
    var scrollSign, isSliceScroll;

    if (this.container.nestedViewer || ((papayaContainers.length > 1) && !this.container.collapsable)) {
        return;
    }

    e = e || window.event;
    if (e.preventDefault) {
        e.preventDefault();
    }

    e.returnValue = false;

    isSliceScroll = (this.container.preferences.scrollBehavior === "Increment Slice");
    scrollSign = papaya.utilities.PlatformUtils.getScrollSign(e, !isSliceScroll);

    if (isSliceScroll) {
        if (scrollSign < 0) {
            if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                this.incrementAxial(false, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                this.incrementCoronal(false, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                this.incrementSagittal(false, Math.abs(scrollSign));
            }

            this.gotoCoordinate(this.currentCoord);
        } else if (scrollSign > 0) {
            if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                this.incrementAxial(true, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                this.incrementCoronal(true, Math.abs(scrollSign));
            } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                this.incrementSagittal(true, Math.abs(scrollSign));
            }

            this.gotoCoordinate(this.currentCoord);
        }
    } else {
        if (scrollSign !== 0) {
            this.isZoomMode = true;

            if (this.mainImage === this.surfaceView) {
                this.surfaceView.zoom += ((scrollSign * -5) * this.surfaceView.scaleFactor);
                this.drawViewer(false, true);
            } else {
                if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                    this.setZoomLocation(this.currentCoord.x, this.currentCoord.y, this.mainImage.sliceDirection);
                } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                    this.setZoomLocation(this.currentCoord.x, this.currentCoord.z, this.mainImage.sliceDirection);
                } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                    this.setZoomLocation(this.currentCoord.y, this.currentCoord.z, this.mainImage.sliceDirection);
                }

                this.setZoomFactor(this.zoomFactorPrevious + (scrollSign * 0.1 * this.zoomFactorPrevious));
            }

            this.zoomFactorPrevious = this.zoomFactor;
        }
    }
};



papaya.viewer.Viewer.prototype.incrementAxial = function (increment, degree) {
    var max = this.volume.header.imageDimensions.zDim;

    if (degree === undefined) {
        degree = 1;
    }

    if (increment) {
        this.currentCoord.z += degree;

        if (this.currentCoord.z >= max) {
            this.currentCoord.z = max - 1;
        }
    } else {
        this.currentCoord.z -= degree;

        if (this.currentCoord.z < 0) {
            this.currentCoord.z = 0;
        }
    }

    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.incrementCoronal = function (increment, degree) {
    var max = this.volume.header.imageDimensions.yDim;

    if (degree === undefined) {
        degree = 1;
    }

    if (increment) {
        this.currentCoord.y += degree;

        if (this.currentCoord.y >= max) {
            this.currentCoord.y = max - 1;
        }
    } else {
        this.currentCoord.y -= degree;

        if (this.currentCoord.y < 0) {
            this.currentCoord.y = 0;
        }
    }

    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.incrementSagittal = function (increment, degree) {
    var max = this.volume.header.imageDimensions.xDim;

    if (degree === undefined) {
        degree = 1;
    }

    if (increment) {
        this.currentCoord.x -= degree;

        if (this.currentCoord.x < 0) {
            this.currentCoord.x = 0;
        }
    } else {
        this.currentCoord.x += degree;

        if (this.currentCoord.x >= max) {
            this.currentCoord.x = max - 1;
        }
    }

    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.setZoomFactor = function (val) {
    if (val > papaya.viewer.Viewer.ZOOM_FACTOR_MAX) {
        val = papaya.viewer.Viewer.ZOOM_FACTOR_MAX;
    } else if (val < papaya.viewer.Viewer.ZOOM_FACTOR_MIN) {
        val = papaya.viewer.Viewer.ZOOM_FACTOR_MIN;
    }

    this.zoomFactor = val;

    if (this.zoomFactor === 1) {
        this.panAmountX = this.panAmountY = this.panAmountZ = 0;
    }

    this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
        this.panAmountY, this);
    this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
        this.panAmountZ, this);
    this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
        this.panAmountZ, this);
    this.drawViewer(false, true);

    this.updateWindowTitle();
};



papaya.viewer.Viewer.prototype.getZoomString = function () {
    return (parseInt(this.zoomFactor * 100, 10) + "%");
};



papaya.viewer.Viewer.prototype.isZooming = function () {
    return (this.zoomFactor > 1);
};



papaya.viewer.Viewer.prototype.setZoomLocation = function () {
    if (this.zoomFactor === 1) {
        this.zoomLocX = this.currentCoord.x;
        this.zoomLocY = this.currentCoord.y;
        this.zoomLocZ = this.currentCoord.z;

        this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
            this.panAmountY, this);
        this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
            this.panAmountZ, this);
        this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
            this.panAmountZ, this);
        this.drawViewer(false, true);
    }
};



papaya.viewer.Viewer.prototype.setStartPanLocation = function (xLoc, yLoc, sliceDirection) {
    var temp;

    if (this.zoomFactor > 1) {
        if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.panLocX = xLoc;
            this.panLocY = yLoc;
            this.panLocZ = this.axialSlice.currentSlice;
        } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.panLocX = xLoc;
            this.panLocY = this.coronalSlice.currentSlice;
            this.panLocZ = yLoc;
        } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.panLocX = this.sagittalSlice.currentSlice;
            temp = xLoc;  // because of dumb IDE warning
            this.panLocY = temp;
            this.panLocZ = yLoc;
        }
    }
};



papaya.viewer.Viewer.prototype.setCurrentPanLocation = function (xLoc, yLoc, sliceDirection) {
    if (this.zoomFactor > 1) {
        if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            this.panAmountX += (xLoc - this.panLocX);
            this.panAmountY += (yLoc - this.panLocY);
            this.panAmountZ = 0;
        } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            this.panAmountX += (xLoc - this.panLocX);
            this.panAmountY = 0;
            this.panAmountZ += (yLoc - this.panLocZ);
        } else if (sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            this.panAmountX = 0;
            this.panAmountY += (xLoc - this.panLocY);
            this.panAmountZ += (yLoc - this.panLocZ);
        }

        this.axialSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocY, this.panAmountX,
            this.panAmountY, this);
        this.coronalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocX, this.zoomLocZ, this.panAmountX,
            this.panAmountZ, this);
        this.sagittalSlice.updateZoomTransform(this.zoomFactor, this.zoomLocY, this.zoomLocZ, this.panAmountY,
            this.panAmountZ, this);
        this.drawViewer(false, true);
    }
};



papaya.viewer.Viewer.prototype.isWorldMode = function () {
    return this.worldSpace;
};



papaya.viewer.Viewer.prototype.isRadiologicalMode = function () {
    return (this.container.preferences.radiological === "Yes");
};



papaya.viewer.Viewer.prototype.isCollapsable = function () {
    return this.container.collapsable;
};



papaya.viewer.Viewer.prototype.mainSliderControlChanged = function () {
    if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        this.currentCoord.z = parseInt(this.mainSliderControl.val(), 10);
    } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        this.currentCoord.y = parseInt(this.mainSliderControl.val(), 10);
    } else if (this.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        this.currentCoord.x = parseInt(this.mainSliderControl.val(), 10);
    }

    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.axialSliderControlChanged = function () {
    this.currentCoord.z = parseInt(this.axialSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.coronalSliderControlChanged = function () {
    this.currentCoord.y = parseInt(this.coronalSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.sagittalSliderControlChanged = function () {
    this.currentCoord.x = parseInt(this.sagittalSliderControl.val(), 10);
    this.gotoCoordinate(this.currentCoord);
};



papaya.viewer.Viewer.prototype.seriesSliderControlChanged = function () {
    this.currentScreenVolume.setTimepoint(parseInt(this.seriesSliderControl.val(), 10));
    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }

    this.timepointChanged();
};



papaya.viewer.Viewer.prototype.updateSliceSliderControl = function () {
    if (this.mainSliderControl) {
        this.doUpdateSliceSliderControl(this.mainSliderControl, this.mainImage.sliceDirection);
    }

    if (this.axialSliderControl) {
        this.doUpdateSliceSliderControl(this.axialSliderControl, papaya.viewer.ScreenSlice.DIRECTION_AXIAL);
    }

    if (this.coronalSliderControl) {
        this.doUpdateSliceSliderControl(this.coronalSliderControl, papaya.viewer.ScreenSlice.DIRECTION_CORONAL);
    }

    if (this.sagittalSliderControl) {
        this.doUpdateSliceSliderControl(this.sagittalSliderControl, papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL);
    }

    if (this.seriesSliderControl) {
        this.doUpdateSliceSliderControl(this.seriesSliderControl, papaya.viewer.ScreenSlice.DIRECTION_TEMPORAL);
    }
};




papaya.viewer.Viewer.prototype.doUpdateSliceSliderControl = function (slider, direction) {
    if (this.initialized) {
        slider.prop("disabled", false);
        slider.prop("min", "0");
        slider.prop("step", "1");

        if (direction === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
            slider.prop("max", (this.volume.header.imageDimensions.zDim - 1).toString());
            slider.val(this.currentCoord.z);
        } else if (direction === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
            slider.prop("max", (this.volume.header.imageDimensions.yDim - 1).toString());
            slider.val(this.currentCoord.y);
        } else if (direction === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
            slider.prop("max", (this.volume.header.imageDimensions.xDim - 1).toString());
            slider.val(this.currentCoord.x);
        } else if (direction === papaya.viewer.ScreenSlice.DIRECTION_TEMPORAL) {
            slider.prop("max", (this.currentScreenVolume.volume.header.imageDimensions.timepoints - 1).toString());
            slider.val(this.currentScreenVolume.currentTimepoint);
        }
    } else {
        slider.prop("disabled", true);
        slider.prop("min", "0");
        slider.prop("step", "1");
        slider.prop("max", "1");
        slider.val(0);
    }
};



papaya.viewer.Viewer.prototype.incrementSeriesPoint = function () {
    this.currentScreenVolume.incrementTimepoint();

    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }

    this.timepointChanged();
};



papaya.viewer.Viewer.prototype.decrementSeriesPoint = function () {
    this.currentScreenVolume.decrementTimepoint();

    if (this.currentScreenVolume.isOverlay() && this.container.syncOverlaySeries) {
        this.reconcileOverlaySeriesPoint(this.currentScreenVolume);
    }

    this.timepointChanged();
};



papaya.viewer.Viewer.prototype.reconcileOverlaySeriesPoint = function (screenVolume) {
    var ctr, seriesPoint, seriesPointSeconds;

    if (this.worldSpace) {
        seriesPointSeconds = screenVolume.getCurrentTime();

        for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr] !== screenVolume) {
                this.screenVolumes[ctr].setCurrentTime(seriesPointSeconds);
            }
        }
    } else {
        seriesPoint = screenVolume.currentTimepoint;

        for (ctr = 1; ctr < this.screenVolumes.length; ctr += 1) {
            if (this.screenVolumes[ctr] !== screenVolume) {
                this.screenVolumes[ctr].setTimepoint(seriesPoint);
            }
        }
    }
};



papaya.viewer.Viewer.prototype.hasParametricPair = function (index) {
    if (index) {
        return (this.screenVolumes[index].negativeScreenVol !== null);
    } else {
        return false;
    }
};


papaya.viewer.Viewer.prototype.getScreenVolumeIndex = function (screenVol) {
    var ctr;

    if (screenVol) {
        for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
            if (screenVol === this.screenVolumes[ctr]) {
                return ctr;
            }
        }
    }

    return -1;
};



papaya.viewer.Viewer.prototype.getScreenVolumeByName = function (name) {
    var ctr;

    for (ctr = 0; ctr < this.screenVolumes.length; ctr += 1) {
        if (name == this.screenVolumes[ctr].volume.fileName) {
            return this.screenVolumes[ctr];
        }
    }

    return null;
};



papaya.viewer.Viewer.prototype.isShowingRuler = function () {
    return (this.container.preferences.showRuler === "Yes");
};



papaya.viewer.Viewer.prototype.isShowingOrientation = function () {
    return (this.container.preferences.showOrientation === "Yes");
};



papaya.viewer.Viewer.prototype.isShowingCrosshairs = function () {
    return (this.container.preferences.showCrosshairs === "Yes");
};



papaya.viewer.Viewer.prototype.isShowingSurfacePlanes = function () {
    return (this.surfaceView && this.surfaceView.showSurfacePlanes);
};



papaya.viewer.Viewer.prototype.isShowingSurfaceCrosshairs = function () {
    return (this.surfaceView && this.surfaceView.showSurfaceCrosshairs);
};



papaya.viewer.Viewer.prototype.restart = function (refs, forceUrl, forceEncode) {
    this.resetViewer();
    this.container.toolbar.updateImageButtons();
    this.loadImage(refs, forceUrl, forceEncode);
};



papaya.viewer.Viewer.prototype.removeOverlay = function (imageIndex) {
    var screenVol, screenVolNeg;

    screenVol = this.container.viewer.screenVolumes[imageIndex];
    screenVolNeg = screenVol.negativeScreenVol;

    this.closeOverlayByRef(screenVol);

    if (this.container.combineParametric) {
        this.closeOverlayByRef(screenVolNeg);
    }

    this.drawViewer(true, false);
};



papaya.viewer.Viewer.prototype.toggleOverlay = function (imageIndex) {
    var screenVol, screenVolNeg;

    screenVol = this.container.viewer.screenVolumes[imageIndex];
    screenVol.hidden = !screenVol.hidden;

    screenVolNeg = screenVol.negativeScreenVol;

    if (this.container.combineParametric && screenVolNeg) {
        screenVolNeg.hidden = !screenVolNeg.hidden;
    }

    this.drawViewer(true, false);

    return screenVol.hidden;
};



papaya.viewer.Viewer.prototype.addParametric = function (imageIndex) {
    var screenVol = this.container.viewer.screenVolumes[imageIndex],
        overlayNeg;

    if (screenVol.negativeScreenVol === null) {
        this.screenVolumes[this.screenVolumes.length] = overlayNeg = new papaya.viewer.ScreenVolume(screenVol.volume,
            {}, papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES[1].name, false, true, this.currentCoord);
        screenVol.negativeScreenVol = overlayNeg;

        this.setCurrentScreenVol(this.screenVolumes.length - 1);
        this.drawViewer(true, false);
        this.container.toolbar.buildToolbar();
        this.container.toolbar.updateImageButtons();
    }
};

/*jslint browser: true, node: true */
/*global $, PAPAYA_VIEWER_CSS, PAPAYA_DEFAULT_TOOLBAR_ID, PAPAYA_DEFAULT_VIEWER_ID, PAPAYA_DEFAULT_DISPLAY_ID,
 PAPAYA_TOOLBAR_CSS, PAPAYA_DISPLAY_CSS, PAPAYA_DEFAULT_SLIDER_ID, PAPAYA_DEFAULT_CONTAINER_ID, PAPAYA_SLIDER_CSS,
 PAPAYA_UTILS_UNSUPPORTED_CSS, PAPAYA_UTILS_UNSUPPORTED_MESSAGE_CSS, PAPAYA_CONTAINER_CLASS_NAME,
 PAPAYA_CONTAINER_FULLSCREEN, PAPAYA_CONTAINER_CLASS_NAME, PAPAYA_UTILS_CHECKFORJS_CSS, PAPAYA_SPACING,
 papayaRoundFast, PAPAYA_PADDING, PAPAYA_CONTAINER_PADDING_TOP, PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT,
 PAPAYA_CONTAINER_COLLAPSABLE, PAPAYA_MANGO_INSTALLED, PAPAYA_KIOSK_CONTROLS_CSS, PAPAYA_CONTROL_INCREMENT_BUTTON_CSS,
 PAPAYA_CONTROL_SLIDER_CSS, PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS, PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS,
 PAPAYA_CONTROL_SWAP_BUTTON_CSS, PAPAYA_CONTROL_DIRECTION_SLIDER, PAPAYA_CONTROL_MAIN_SLIDER,
 PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS, PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS,
 PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS, PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS, PAPAYA_CONTROL_BAR_LABELS_CSS,
 PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS, PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS
 */

"use strict";

/*** Imports ***/
var papaya = papaya || {};


/*** Global Fields ***/
var papayaContainers = [];
var papayaLoadableImages = papayaLoadableImages || [];
var papayaDroppedFiles = [];


/*** Constructor ***/
papaya.Container = papaya.Container || function (containerHtml) {
    this.containerHtml = containerHtml;
    this.containerIndex = null;
    this.toolbarHtml = null;
    this.viewerHtml = null;
    this.displayHtml = null;
    this.titlebarHtml = null;
    this.sliderControlHtml = null;
    this.viewer = null;
    this.display = null;
    this.toolbar = null;
    this.preferences = null;
    this.params = [];
    this.loadingImageIndex = 0;
    this.loadingSurfaceIndex = 0;
    this.nestedViewer = false;
    this.collapsable = false;
    this.orthogonal = true;
    this.orthogonalTall = false;
    this.orthogonalDynamic = false;
    this.kioskMode = false;
    this.showControls = true;
    this.showControlBar = false;
    this.showImageButtons = true;
    this.fullScreenPadding = true;
    this.combineParametric = false;
    this.dropTimeout = null;
    this.showRuler = false;
    this.syncOverlaySeries = true;
    this.surfaceParams = {};
    this.contextManager = null;
    this.allowScroll = true;
    this.loadingComplete = null;
    this.resetComponents();
};


/*** Static Pseudo-constants ***/

papaya.Container.LICENSE_TEXT = "<p>THIS PRODUCT IS NOT FOR CLINICAL USE.<br /><br />" +
    "This software is available for use, as is, free of charge.  The software and data derived from this software " +
    "may not be used for clinical purposes.<br /><br />" +
    "The authors of this software make no representations or warranties about the suitability of the software, " +
    "either express or implied, including but not limited to the implied warranties of merchantability, fitness for a " +
    "particular purpose, non-infringement, or conformance to a specification or standard. The authors of this software " +
    "shall not be liable for any damages suffered by licensee as a result of using or modifying this software or its " +
    "derivatives.<br /><br />" +
    "By using this software, you agree to be bounded by the terms of this license.  If you do not agree to the terms " +
    "of this license, do not use this software.</p>";

papaya.Container.KEYBOARD_REF_TEXT = "<span style='color:#B5CBD3'>[Spacebar]</span> Cycle the main slice view in a clockwise rotation.<br /><br />" +
    "<span style='color:#B5CBD3'>[Page Up]</span> or <span style='color:#B5CBD3'>[']</span> Increment the axial slice.<br /><br />" +
    "<span style='color:#B5CBD3'>[Page Down]</span> or <span style='color:#B5CBD3'>[/]</span> Decrement the axial slice.<br /><br />" +
    "<span style='color:#B5CBD3'>[Arrow Up]</span> and <span style='color:#B5CBD3'>[Arrow Down]</span> Increment/decrement the coronal slice.<br /><br />" +
    "<span style='color:#B5CBD3'>[Arrow Right]</span> and <span style='color:#B5CBD3'>[Arrow Left]</span> Increment/decrement the sagittal slice.<br /><br />" +
    "<span style='color:#B5CBD3'>[g]</span> and <span style='color:#B5CBD3'>[v]</span> Increment/decrement main slice.<br /><br />" +
    "<span style='color:#B5CBD3'>[<]</span> or <span style='color:#B5CBD3'>[,]</span> Decrement the series point.<br /><br />" +
    "<span style='color:#B5CBD3'>[>]</span> or <span style='color:#B5CBD3'>[.]</span> Increment the series point.<br /><br />" +
    "<span style='color:#B5CBD3'>[o]</span> Navigate viewer to the image origin.<br /><br />" +
    "<span style='color:#B5CBD3'>[c]</span> Navigate viewer to the center of the image.<br /><br />" +
    "<span style='color:#B5CBD3'>[a]</span> Toggle main crosshairs on/off.";

papaya.Container.MOUSE_REF_TEXT = "<span style='color:#B5CBD3'>(Left-click and drag)</span> Change current coordinate.<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt](Left-click and drag)</span> Zoom in and out.<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt](Double left-click)</span> Reset zoom.<br /><br />" +
    "<span style='color:#B5CBD3'>[Alt][Shift](Left-click and drag)</span> Pan zoomed image.<br /><br />" +
    "<span style='color:#B5CBD3'>(Right-click and drag)</span> Window level controls.<br /><br />" +
    "<span style='color:#B5CBD3'>(Scroll wheel)</span> See Preferences.<br /><br />";

papaya.Container.DICOM_SUPPORT = true;


/*** Static Fields ***/

papaya.Container.syncViewers = false;
papaya.Container.syncViewersWorld = false;
papaya.Container.allowPropagation = false;
papaya.Container.papayaLastHoveredViewer = null;


/*** Static Methods ***/

papaya.Container.restartViewer = function (index, refs, forceUrl, forceEncode) {
    papayaContainers[index].viewer.restart(refs, forceUrl, forceEncode);
};



papaya.Container.resetViewer = function (index, params) {
    if (!params) {
        params = papayaContainers[index].params;

        if (params.loadedImages) {
            params.images = params.loadedImages;
        }

        if (params.loadedEncodedImages) {
            params.encodedImages = params.loadedEncodedImages;
        }

        if (params.loadedSurfaces) {
            params.surfaces = params.loadedSurfaces;
        }

        if (params.loadedEncodedSurfaces) {
            params.encodedSurfaces = params.loadedEncodedSurfaces;
        }

        if (params.loadedFiles) {
            params.files = params.loadedFiles;
        }
    }

    papayaContainers[index].viewer.resetViewer();
    papayaContainers[index].toolbar.updateImageButtons();
    papayaContainers[index].reset();
    papayaContainers[index].params = params;
    papayaContainers[index].readGlobalParams();
    papayaContainers[index].rebuildContainer(params, index);
    papayaContainers[index].viewer.processParams(params);
};



papaya.Container.removeImage = function (index, imageIndex) {
    if (imageIndex < 1) {
        console.log("Cannot remove the base image.  Try papaya.Container.resetViewer() instead.");
    }

    papayaContainers[index].viewer.removeOverlay(imageIndex);
};



papaya.Container.hideImage = function (index, imageIndex) {
    papayaContainers[index].viewer.screenVolumes[imageIndex].hidden = true;
    papayaContainers[index].viewer.drawViewer(true, false);
};



papaya.Container.showImage = function (index, imageIndex) {
    papayaContainers[index].viewer.screenVolumes[imageIndex].hidden = false;
    papayaContainers[index].viewer.drawViewer(true, false);
};



papaya.Container.addImage = function (index, imageRef, imageParams) {
    var imageRefs;

    if (imageParams) {
        papayaContainers[index].params = $.extend({}, papayaContainers[index].params, imageParams);
    }

    if (!(imageRef instanceof Array)) {
        imageRefs = [];
        imageRefs[0] = imageRef;
    } else {
        imageRefs = imageRef;
    }

    if (papayaContainers[index].params.images) {
        papayaContainers[index].viewer.loadImage(imageRefs, true, false);
    } else if (papayaContainers[index].params.encodedImages) {
        papayaContainers[index].viewer.loadImage(imageRefs, false, true);
    }
};



papaya.Container.findParameters = function (containerHTML) {
    var viewerHTML, paramsName, loadedParams = null;

    paramsName = containerHTML.data("params");

    if (!paramsName) {
        viewerHTML = containerHTML.find("." + PAPAYA_VIEWER_CSS);

        if (viewerHTML) {
            paramsName = viewerHTML.data("params");
        }
    }

    /*
     if (paramsName) {
     loadedParams = window[paramsName];
     }
     */

    if (paramsName) {
        if (typeof paramsName === 'object') {
            loadedParams = paramsName;
        }
        else if (window[paramsName]) {
            loadedParams = window[paramsName];
        }
    }

    if (loadedParams) {
        papaya.utilities.UrlUtils.getQueryParams(loadedParams);
    }

    return loadedParams;
};



papaya.Container.fillContainerHTML = function (containerHTML, isDefault, params, replaceIndex) {
    var toolbarHTML, viewerHTML, displayHTML, index;

    if (isDefault) {
        toolbarHTML = containerHTML.find("#" + PAPAYA_DEFAULT_TOOLBAR_ID);
        viewerHTML = containerHTML.find("#" + PAPAYA_DEFAULT_VIEWER_ID);
        displayHTML = containerHTML.find("#" + PAPAYA_DEFAULT_DISPLAY_ID);

        if (toolbarHTML) {
            toolbarHTML.addClass(PAPAYA_TOOLBAR_CSS);
        } else {
            containerHTML.prepend("<div class='" + PAPAYA_TOOLBAR_CSS + "' id='" +
                PAPAYA_DEFAULT_TOOLBAR_ID + "'></div>");
        }

        if (viewerHTML) {
            viewerHTML.addClass(PAPAYA_VIEWER_CSS);
        } else {
            $("<div class='" + PAPAYA_VIEWER_CSS + "' id='" +
                PAPAYA_DEFAULT_VIEWER_ID + "'></div>").insertAfter($("#" + PAPAYA_DEFAULT_TOOLBAR_ID));
        }

        if (displayHTML) {
            displayHTML.addClass(PAPAYA_DISPLAY_CSS);
        } else {
            $("<div class='" + PAPAYA_DISPLAY_CSS + "' id='" +
                PAPAYA_DEFAULT_DISPLAY_ID + "'></div>").insertAfter($("#" + PAPAYA_DEFAULT_VIEWER_ID));
        }

        console.log("This method of adding a Papaya container is deprecated.  " +
            "Try simply <div class='papaya' data-params='params'></div> instead...");
    } else {
        if (replaceIndex !== undefined) {
            index = replaceIndex;
        } else {
            index = papayaContainers.length;
        }

        containerHTML.attr("id", PAPAYA_DEFAULT_CONTAINER_ID + index);

        if (!params || (params.kioskMode === undefined) || !params.kioskMode) {
            containerHTML.append("<div id='" + (PAPAYA_DEFAULT_TOOLBAR_ID + index) +
            "' class='" + PAPAYA_TOOLBAR_CSS + "'></div>");
        }

        containerHTML.append("<div id='" + (PAPAYA_DEFAULT_VIEWER_ID + index) +
            "' class='" + PAPAYA_VIEWER_CSS + "'></div>");
        containerHTML.append("<div id='" + (PAPAYA_DEFAULT_DISPLAY_ID + index) +
            "' class='" + PAPAYA_DISPLAY_CSS + "'></div>");

        if (params && params.showControlBar && ((params.showControls === undefined) || params.showControls)) {
            containerHTML.append(
                "<div id='" + PAPAYA_KIOSK_CONTROLS_CSS + index + "' class='" + PAPAYA_KIOSK_CONTROLS_CSS + "'>" +
                "<div id='" + (PAPAYA_DEFAULT_SLIDER_ID + index) + "main" + "' class='" + PAPAYA_SLIDER_CSS + " " + PAPAYA_CONTROL_MAIN_SLIDER + "'>" +
                "<span class='" + PAPAYA_CONTROL_BAR_LABELS_CSS+ "'>Slice: </span>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (PAPAYA_DEFAULT_SLIDER_ID + index) + "axial" + "' class='" + PAPAYA_SLIDER_CSS + " " + PAPAYA_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + PAPAYA_CONTROL_BAR_LABELS_CSS+ "'>Axial: </span>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> " +
                "</div>" +

                "<div id='" + (PAPAYA_DEFAULT_SLIDER_ID + index) + "coronal" + "' class='" + PAPAYA_SLIDER_CSS + " " + PAPAYA_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + PAPAYA_CONTROL_BAR_LABELS_CSS+ "'>Coronal: </span>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>"+ " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (PAPAYA_DEFAULT_SLIDER_ID + index) + "sagittal" + "' class='" + PAPAYA_SLIDER_CSS + " " + PAPAYA_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + PAPAYA_CONTROL_BAR_LABELS_CSS+ "'>Sagittal: </span>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>+</button>"+ " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>-</button> "  +
                "</div>" +

                "<div id='" + (PAPAYA_DEFAULT_SLIDER_ID + index) + "series" + "' class='" + PAPAYA_SLIDER_CSS + " " + PAPAYA_CONTROL_DIRECTION_SLIDER + "'>" +
                "<span class='" + PAPAYA_CONTROL_BAR_LABELS_CSS+ "'>Series: </span>" + " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>&lt;</button>"+ " <button type='button' class='" + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS + "'>&gt;</button> "  +
                "</div>" +
                "&nbsp;&nbsp;&nbsp;" +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + PAPAYA_CONTROL_SWAP_BUTTON_CSS + "'>Swap View</button> " +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS + "'>Go To Center</button> " +
                "<button type='button' " + ((params.kioskMode && ((params.showImageButtons === undefined) || params.showImageButtons)) ? "" : "style='float:right;margin-left:5px;' ") + "class='" + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS + "'>Go To Origin</button> " +
                "</div>");

            $("." + PAPAYA_CONTROL_INCREMENT_BUTTON_CSS).prop('disabled', true);
            $("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS).prop('disabled', true);
            $("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS).prop('disabled', true);
            $("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS).prop('disabled', true);
        } else if (params && ((params.showControls === undefined ) || params.showControls)) {
            containerHTML.append("<button type='button' id='"+ (PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + index) + "' class='" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + "'>+</button> ");
            containerHTML.append("<button type='button' id='"+ (PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + index) + "' class='" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + "'>-</button> ");
            containerHTML.append("<button type='button' id='"+ (PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + index) + "' class='" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + "'>Swap View</button> ");
            containerHTML.append("<button type='button' id='"+ (PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + index) + "' class='" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + "'>Go To Center</button> ");
            containerHTML.append("<button type='button' id='"+ (PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + index) + "' class='" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + "'>Go To Origin</button> ");

            $("#" + PAPAYA_CONTROL_MAIN_INCREMENT_BUTTON_CSS + index).css({display: "none"});
            $("#" + PAPAYA_CONTROL_MAIN_DECREMENT_BUTTON_CSS + index).css({display: "none"});
            $("#" + PAPAYA_CONTROL_MAIN_SWAP_BUTTON_CSS + index).css({display: "none"});
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + index).css({display: "none"});
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + index).css({display: "none"});
        }
    }

    return viewerHTML;
};



papaya.Container.buildContainer = function (containerHTML, params, replaceIndex) {
    var container, message, viewerHtml, loadUrl, index, imageRefs = null;

    message = papaya.utilities.PlatformUtils.checkForBrowserCompatibility();
    viewerHtml = containerHTML.find("." + PAPAYA_VIEWER_CSS);

    if (message !== null) {
        papaya.Container.removeCheckForJSClasses(containerHTML, viewerHtml);
        containerHTML.addClass(PAPAYA_UTILS_UNSUPPORTED_CSS);
        viewerHtml.addClass(PAPAYA_UTILS_UNSUPPORTED_MESSAGE_CSS);
        viewerHtml.html(message);
    } else {
        if (replaceIndex !== undefined) {
            index = replaceIndex;
        } else {
            index = papayaContainers.length;
        }

        container = new papaya.Container(containerHTML);
        container.containerIndex = index;
        container.preferences = new papaya.viewer.Preferences();
        papaya.Container.removeCheckForJSClasses(containerHTML, viewerHtml);

        if (params) {
            container.params = $.extend(container.params, params);
        }

        container.nestedViewer = (containerHTML.parent()[0].tagName.toUpperCase() !== 'BODY');
        container.readGlobalParams();

        if (container.isDesktopMode()) {
            container.preferences.readPreferences();
        }

        container.buildViewer(container.params);
        container.buildDisplay();

        if (container.showControlBar) {
            container.buildSliderControl();
        }

        container.buildToolbar();

        container.setUpDnD();

        loadUrl = viewerHtml.data("load-url");

        if (loadUrl) {
            imageRefs = loadUrl;
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = loadUrl;
            }

            container.viewer.loadImage(imageRefs, true, false);
        } else if (container.params.images) {
            imageRefs = container.params.images[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.images[0];
            }

            container.viewer.loadImage(imageRefs, true, false);
        } else if (container.params.encodedImages) {
            imageRefs = container.params.encodedImages[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.encodedImages[0];
            }

            container.viewer.loadImage(imageRefs, false, true);
        } else if (container.params.files) {
            imageRefs = container.params.files[0];
            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = container.params.files[0];
            }

            container.viewer.loadImage(imageRefs, false, false);
        } else {
            container.viewer.finishedLoading();
        }

        container.resizeViewerComponents(false);

        if (!container.nestedViewer) {
            containerHTML.parent().height("100%");
            containerHTML.parent().width("100%");
        }

        papayaContainers[index] = container;

        papaya.Container.showLicense(container, params);
    }
};



papaya.Container.prototype.rebuildContainer = function (params, index) {
    this.containerHtml.empty();
    papaya.Container.fillContainerHTML(this.containerHtml, false, params, index);
    papaya.Container.buildContainer(this.containerHtml, params, index);

    if ((papayaContainers.length === 1) && !papayaContainers[0].nestedViewer) {
        $("html").addClass(PAPAYA_CONTAINER_FULLSCREEN);
        $("body").addClass(PAPAYA_CONTAINER_FULLSCREEN);
        papaya.Container.setToFullPage();
    }
};



papaya.Container.buildAllContainers = function () {
    var defaultContainer, params;

    defaultContainer = $("#" + PAPAYA_DEFAULT_CONTAINER_ID);

    if (defaultContainer.length > 0) {
        papaya.Container.fillContainerHTML(defaultContainer, true);
        params = papaya.Container.findParameters(defaultContainer);
        papaya.Container.buildContainer(defaultContainer, params);
    } else {
        $("." + PAPAYA_CONTAINER_CLASS_NAME).each(function () {
            params = papaya.Container.findParameters($(this));

            if (params === null) {
                params = [];
            }

            if (params.fullScreen === true) {
                params.fullScreenPadding = false;
                params.kioskMode = true;
                params.showControlBar = false;
                $('body').css({"background-color":"black"});
            }

            papaya.Container.fillContainerHTML($(this), false, params);
            papaya.Container.buildContainer($(this), params);
        });
    }

    if ((papayaContainers.length === 1) && !papayaContainers[0].nestedViewer) {
        $("html").addClass(PAPAYA_CONTAINER_FULLSCREEN);
        $("body").addClass(PAPAYA_CONTAINER_FULLSCREEN);
        papaya.Container.setToFullPage();

        papayaContainers[0].resizeViewerComponents(true);
    }
};



papaya.Container.startPapaya = function () {
    setTimeout(function () {  // setTimeout necessary in Chrome
        window.scrollTo(0, 0);
    }, 0);

    papaya.Container.DICOM_SUPPORT = (typeof(daikon) !== "undefined");

    papaya.Container.buildAllContainers();
};



papaya.Container.resizePapaya = function (ev, force) {
    var ctr;

    papaya.Container.updateOrthogonalState();

    if ((papayaContainers.length === 1) && !papayaContainers[0].nestedViewer) {
        if (!papaya.utilities.PlatformUtils.smallScreen || force) {
            papayaContainers[0].resizeViewerComponents(true);
        }
    } else {
        for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
            papayaContainers[ctr].resizeViewerComponents(true);
        }
    }

    setTimeout(function () {  // setTimeout necessary in Chrome
        window.scrollTo(0, 0);
    }, 0);
};



papaya.Container.addViewer = function (parentName, params, callback) {
    var container, parent;

    parent = $("#" + parentName);
    container = $('<div class="papaya"></div>');

    parent.html(container);

    // remove parent click handler
    parent[0].onclick = '';
    parent.off("click");

    papaya.Container.fillContainerHTML(container, false, params);
    papaya.Container.buildContainer(container, params);

    if (callback) {
        callback();
    }
};



papaya.Container.removeCheckForJSClasses = function (containerHtml, viewerHtml) {
    // old way, here for backwards compatibility
    viewerHtml.removeClass(PAPAYA_CONTAINER_CLASS_NAME);
    viewerHtml.removeClass(PAPAYA_UTILS_CHECKFORJS_CSS);

    // new way
    containerHtml.removeClass(PAPAYA_CONTAINER_CLASS_NAME);
    containerHtml.removeClass(PAPAYA_UTILS_CHECKFORJS_CSS);
};



papaya.Container.setToFullPage = function () {
    document.body.style.marginTop = 0;
    document.body.style.marginBottom = 0;
    document.body.style.marginLeft = 'auto';
    document.body.style.marginRight = 'auto';
    document.body.style.padding = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.width = "100%";
    document.body.style.height = "100%";
};



papaya.Container.getLicense = function () {
    return papaya.Container.LICENSE_TEXT;
};



papaya.Container.getKeyboardReference = function () {
    return papaya.Container.KEYBOARD_REF_TEXT;
};



papaya.Container.getMouseReference = function () {
    return papaya.Container.MOUSE_REF_TEXT;
};



papaya.Container.setLicenseRead = function () {
    papaya.utilities.UrlUtils.createCookie(papaya.viewer.Preferences.COOKIE_PREFIX + "eula", "Yes",
        papaya.viewer.Preferences.COOKIE_EXPIRY_DAYS);
};



papaya.Container.isLicenseRead = function () {
    var value = papaya.utilities.UrlUtils.readCookie(papaya.viewer.Preferences.COOKIE_PREFIX + "eula");
    return (value && (value === 'Yes'));
};



papaya.Container.showLicense = function (container, params) {
    var showEula = (params && params.showEULA !== undefined) && params.showEULA;

    if (showEula && !papaya.Container.isLicenseRead()) {
        var dialog = new papaya.ui.Dialog(container, "License", papaya.ui.Toolbar.LICENSE_DATA,
            papaya.Container, null, papaya.Container.setLicenseRead, null, true);
        dialog.showDialog();
    }
};



papaya.Container.updateOrthogonalState = function () {
    var ctr;

    for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
        if (papayaContainers[ctr].orthogonal &&
            ((papaya.utilities.PlatformUtils.mobile || papayaContainers[ctr].orthogonalDynamic))) {
            if ($(window).height() > $(window).width()) {
                papayaContainers[ctr].orthogonalTall = true;
            } else {
                papayaContainers[ctr].orthogonalTall = false;
            }
        }
    }
};



papaya.Container.reorientPapaya = function () {
    var ctr;

    for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
        papayaContainers[ctr].toolbar.closeAllMenus();
    }

    papaya.Container.updateOrthogonalState();
    papaya.Container.resizePapaya(null, true);
};



/*** Prototype Methods ***/

papaya.Container.prototype.resetComponents = function () {
    this.containerHtml.css({height: "auto"});
    this.containerHtml.css({width: "auto"});
    this.containerHtml.css({margin: "auto"});
    $('head').append("<style>div#papayaViewer:before{ content:'' }</style>");
};



papaya.Container.prototype.hasSurface = function () {
    return (this.viewer && (this.viewer.surfaces.length > 0));
};




papaya.Container.prototype.getViewerDimensions = function () {
    var parentWidth, height, width, ratio, maxHeight, maxWidth;

    parentWidth = this.containerHtml.parent().width() - (this.fullScreenPadding ? (2 * PAPAYA_PADDING) : 0);
    ratio = (this.orthogonal ? (this.hasSurface() ? 1.333 : 1.5) : 1);

    if (this.orthogonalTall || !this.orthogonal) {
        height = (this.collapsable ? window.innerHeight : this.containerHtml.parent().height()) - (papaya.viewer.Display.SIZE + (this.kioskMode ? 0 : (papaya.ui.Toolbar.SIZE +
            PAPAYA_SPACING)) + PAPAYA_SPACING + (this.fullScreenPadding && !this.nestedViewer ? (2 * PAPAYA_CONTAINER_PADDING_TOP) : 0)) -
            (this.showControlBar ? 2*papaya.ui.Toolbar.SIZE : 0);

        width = papayaRoundFast(height / ratio);
    } else {
        width = parentWidth;
        height = papayaRoundFast(width / ratio);
    }

    if (!this.nestedViewer || this.collapsable) {
        if (this.orthogonalTall) {
            maxWidth = window.innerWidth - (this.fullScreenPadding ? (2 * PAPAYA_PADDING) : 0);
            if (width > maxWidth) {
                width = maxWidth;
                height = papayaRoundFast(width * ratio);
            }
        } else {
            maxHeight = window.innerHeight - (papaya.viewer.Display.SIZE + (this.kioskMode ? 0 : (papaya.ui.Toolbar.SIZE +
                PAPAYA_SPACING)) + PAPAYA_SPACING + (this.fullScreenPadding ? (2 * PAPAYA_CONTAINER_PADDING_TOP) : 0)) -
                (this.showControlBar ? 2*papaya.ui.Toolbar.SIZE : 0);
            if (height > maxHeight) {
                height = maxHeight;
                width = papayaRoundFast(height * ratio);
            }
        }
    }

    return [width, height];
};



papaya.Container.prototype.getViewerPadding = function () {
    var parentWidth, viewerDims, padding;

    parentWidth = this.containerHtml.parent().width() - (this.fullScreenPadding ? (2 * PAPAYA_PADDING) : 0);
    viewerDims = this.getViewerDimensions();
    padding = ((parentWidth - viewerDims[0]) / 2);

    return padding;
};



papaya.Container.prototype.readGlobalParams = function() {
    this.kioskMode = (this.params.kioskMode === true) || papaya.utilities.PlatformUtils.smallScreen;
    this.combineParametric = (this.params.combineParametric === true);

    if (this.params.loadingComplete) {
        this.loadingComplete = this.params.loadingComplete;
    }

    if (this.params.showControls !== undefined) {  // default is true
        this.showControls = this.params.showControls;
    }

    if (this.params.showImageButtons !== undefined) {  // default is true
        this.showImageButtons = this.params.showImageButtons;
    }

    if (papaya.utilities.PlatformUtils.smallScreen) {
        this.showImageButtons = false;
    }

    if (this.params.fullScreenPadding !== undefined) {  // default is true
        this.fullScreenPadding = this.params.fullScreenPadding;
    }

    if (this.params.orthogonal !== undefined) {  // default is true
        this.orthogonal = this.params.orthogonal;
    }

    this.surfaceParams.showSurfacePlanes = (this.params.showSurfacePlanes === true);
    this.surfaceParams.showSurfaceCrosshairs = (this.params.showSurfaceCrosshairs === true);
    this.surfaceParams.surfaceBackground = this.params.surfaceBackground;

    this.orthogonalTall = this.orthogonal && (this.params.orthogonalTall === true);
    this.orthogonalDynamic = this.orthogonal && (this.params.orthogonalDynamic === true);

    if (this.params.allowScroll !== undefined) {  // default is true
        this.allowScroll = this.params.allowScroll;
    }

    if (papaya.utilities.PlatformUtils.mobile || this.orthogonalDynamic) {
        if (this.orthogonal) {
            if ($(window).height() > $(window).width()) {
                this.orthogonalTall = true;
            } else {
                this.orthogonalTall = false;
            }
        }
    }

    if (this.params.syncOverlaySeries !== undefined) {  // default is true
        this.syncOverlaySeries = this.params.syncOverlaySeries;
    }

    if (this.params.showControlBar !== undefined) {  // default is true
        this.showControlBar = this.showControls && this.params.showControlBar;
    }

    if (this.params.contextManager !== undefined) {
        this.contextManager = this.params.contextManager;
    }

    if (this.params.fullScreen === true) {
        this.fullScreenPadding = this.params.fullScreenPadding = false;
        this.kioskMode = this.params.kioskMode = true;
        this.showControlBar = this.params.showControlBar = false;
        $('body').css("background-color:'black'");
    }
};



papaya.Container.prototype.reset = function () {
    this.loadingImageIndex = 0;
    this.loadingSurfaceIndex = 0;
    this.nestedViewer = false;
    this.collapsable = false;
    this.orthogonal = true;
    this.orthogonalTall = false;
    this.orthogonalDynamic = false;
    this.kioskMode = false;
    this.showControls = true;
    this.showControlBar = false;
    this.fullScreenPadding = true;
    this.combineParametric = false;
    this.showRuler = false;
};



papaya.Container.prototype.resizeViewerComponents = function (resize) {
    var dims, padding, diff = 0;

    this.toolbar.closeAllMenus();

    dims = this.getViewerDimensions();
    padding = this.getViewerPadding();

    this.toolbarHtml.css({width: dims[0] + "px"});
    this.toolbarHtml.css({height: papaya.ui.Toolbar.SIZE + "px"});
    this.toolbarHtml.css({paddingLeft: padding + "px"});
    this.toolbarHtml.css({paddingBottom: PAPAYA_SPACING + "px"});

    this.viewerHtml.css({width: dims[0] + "px"});
    this.viewerHtml.css({height: dims[1] + "px"});
    this.viewerHtml.css({paddingLeft: padding + "px"});

    if (resize) {
        this.viewer.resizeViewer(dims);
    }

    this.displayHtml.css({height: papaya.viewer.Display.SIZE + "px"});
    this.displayHtml.css({paddingLeft: padding + "px"});
    this.displayHtml.css({paddingTop: PAPAYA_SPACING + "px"});
    this.display.canvas.width = dims[0];

    if (this.showControls && this.showControlBar) {
        this.sliderControlHtml.css({width: dims[0] + "px"});
        this.sliderControlHtml.css({height: papaya.viewer.Display.SIZE + "px"});

        if (this.kioskMode) {
            diff += 0;
        } else {
            diff += -50;
        }

        if (this.viewer.hasSeries) {
            diff += 200;
        } else {
            diff += 0;
        }

        if (dims[0] < (775 + diff)) {
            $("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS).css({display: "none"});
            $("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS).css({display: "none"});
        } else {
            $("." + PAPAYA_CONTROL_GOTO_CENTER_BUTTON_CSS).css({display: "inline"});
            $("." + PAPAYA_CONTROL_GOTO_ORIGIN_BUTTON_CSS).css({display: "inline"});
        }

        if (dims[0] < (600 + diff)) {
            $("." + PAPAYA_CONTROL_DIRECTION_SLIDER).css({display: "none"});
            $("." + PAPAYA_CONTROL_MAIN_SLIDER).css({display: "inline"});
        } else {
            $("." + PAPAYA_CONTROL_DIRECTION_SLIDER).css({display: "inline"});
            $("." + PAPAYA_CONTROL_MAIN_SLIDER).css({display: "none"});
        }

        if (this.viewer.hasSeries && (dims[0] < (450 + diff))) {
            $("." + PAPAYA_CONTROL_MAIN_SLIDER).css({display: "none"});
        }

        if (dims[0] < 200) {
            $("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS).css({display: "none"});
        } else {
            $("." + PAPAYA_CONTROL_SWAP_BUTTON_CSS).css({display: "inline"});
        }

        if (this.viewer.hasSeries) {
            $("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(3).css({display: "inline"});
        } else {
            $("." + PAPAYA_CONTROL_DIRECTION_SLIDER).eq(3).css({display: "none"});
        }
    } else if (this.showControls && this.viewer.initialized) {
        if (dims[0] < 600) {
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.containerIndex).css({display: "none"});
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.containerIndex).css({display: "none"});
        } else if (!this.viewer.controlsHidden) {
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_CENTER_BUTTON_CSS + this.containerIndex).css({display: "inline"});
            $("#" + PAPAYA_CONTROL_MAIN_GOTO_ORIGIN_BUTTON_CSS + this.containerIndex).css({display: "inline"});
        }
    }

    if (this.isDesktopMode()) {
        if (dims[0] < 600) {
            this.titlebarHtml.css({visibility: "hidden"});
        } else {
            this.titlebarHtml.css({visibility: "visible"});
        }
    }

    if ((!this.nestedViewer || this.collapsable) && this.fullScreenPadding) {
        this.containerHtml.css({paddingTop: PAPAYA_CONTAINER_PADDING_TOP + "px"});
    } else {
        this.containerHtml.css({paddingTop: "0"});
    }

    if (this.fullScreenPadding) {
        this.containerHtml.css({paddingLeft: PAPAYA_PADDING + "px"});
        this.containerHtml.css({paddingRight: PAPAYA_PADDING + "px"});
    }

    if (this.viewer.initialized) {
        this.viewer.drawViewer(false, true);
    } else {
        this.viewer.drawEmptyViewer();
        this.display.drawEmptyDisplay();
    }

    this.titlebarHtml.css({width: dims[0] + "px", top: (this.viewerHtml.position().top - 1.25 *
        papaya.ui.Toolbar.SIZE)});
};



papaya.Container.prototype.updateViewerSize = function () {
    this.toolbar.closeAllMenus();
    this.viewer.resizeViewer(this.getViewerDimensions());
    this.viewer.updateOffsetRect();
};



papaya.Container.prototype.buildViewer = function (params) {
    var dims;

    this.viewerHtml = this.containerHtml.find("." + PAPAYA_VIEWER_CSS);
    papaya.Container.removeCheckForJSClasses(this.containerHtml, this.viewerHtml);
    this.viewerHtml.html("");  // remove noscript message
    dims = this.getViewerDimensions();
    this.viewer = new papaya.viewer.Viewer(this, dims[0], dims[1], params);
    this.viewerHtml.append($(this.viewer.canvas));
    this.preferences.viewer = this.viewer;
};



papaya.Container.prototype.buildDisplay = function () {
    var dims;

    this.displayHtml = this.containerHtml.find("." + PAPAYA_DISPLAY_CSS);
    dims = this.getViewerDimensions();
    this.display = new papaya.viewer.Display(this, dims[0]);
    this.displayHtml.append($(this.display.canvas));
};



papaya.Container.prototype.buildSliderControl = function () {
    this.sliderControlHtml = this.containerHtml.find("." + PAPAYA_KIOSK_CONTROLS_CSS);
};



papaya.Container.prototype.buildToolbar = function () {
    this.toolbarHtml = this.containerHtml.find("." + PAPAYA_TOOLBAR_CSS);
    this.toolbar = new papaya.ui.Toolbar(this);
    this.toolbar.buildToolbar();
    this.toolbar.updateImageButtons();
};



papaya.Container.prototype.readFile = function(fileEntry, callback) {
    fileEntry.file(function(callback, file){
        if (callback) {
            if (file.name.charAt(0) !== '.') {
                callback(file);
            }
        }
    }.bind(this, callback));
};



papaya.Container.prototype.readDir = function(itemEntry) {
    this.readDirNextEntries(itemEntry.createReader());
};



papaya.Container.prototype.readDirNextEntries = function(dirReader) {
    var container = this;

    dirReader.readEntries(function(entries) {
        var len = entries.length,
            ctr, entry;

        if (len > 0) {
            for (ctr = 0; ctr < len; ctr += 1) {
                entry = entries[ctr];
                if (entry.isFile) {
                    container.readFile(entry, papaya.utilities.ObjectUtils.bind(container, container.addDroppedFile));
                }
            }

            container.readDirNextEntries(dirReader);
        }
    });
};



papaya.Container.prototype.setUpDnD = function () {
    var container = this;

    this.containerHtml[0].ondragover = function () {
        container.viewer.draggingOver = true;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }

        return false;
    };

    this.containerHtml[0].ondragleave = function () {
        container.viewer.draggingOver = false;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }
        return false;
    };

    this.containerHtml[0].ondragend = function () {
        container.viewer.draggingOver = false;
        if (!container.viewer.initialized) {
            container.viewer.drawEmptyViewer();
        }
        return false;
    };

    this.containerHtml[0].ondrop = function (evt) {
        evt.preventDefault();

        var dataTransfer = evt.dataTransfer;

        container.display.drawProgress(0.1, "Loading");

        if (dataTransfer) {
            if (dataTransfer.items && (dataTransfer.items.length > 0)) {
                var items = dataTransfer.items,
                    len = items.length,
                    ctr, entry;

                for (ctr = 0; ctr<len; ctr += 1) {
                    entry = items[ctr];

                    if (entry.getAsEntry) {
                        entry = entry.getAsEntry();
                    } else if(entry.webkitGetAsEntry) {
                        entry = entry.webkitGetAsEntry();
                    }

                    if (entry.isFile) {
                        container.readFile(entry, papaya.utilities.ObjectUtils.bind(container,
                            container.addDroppedFile));
                    } else if (entry.isDirectory) {
                        container.readDir(entry);
                    }
                }
            }

            //else if (dataTransfer.mozGetDataAt) {  // permission denied :-(
            //    console.log(dataTransfer.mozGetDataAt('application/x-moz-file', 0));
            //}

            else if (dataTransfer.files && (dataTransfer.files.length > 0)) {
                container.viewer.loadImage(evt.dataTransfer.files);
            }
        }

        return false;
    };
};



papaya.Container.prototype.addDroppedFile = function (file) {
    clearTimeout(this.dropTimeout);
    papayaDroppedFiles.push(file);
    this.dropTimeout = setTimeout(papaya.utilities.ObjectUtils.bind(this, this.droppedFilesFinishedLoading), 100);
};



papaya.Container.prototype.droppedFilesFinishedLoading = function () {
    if (papaya.surface.Surface.findSurfaceType(papayaDroppedFiles[0].name) !== papaya.surface.Surface.SURFACE_TYPE_UNKNOWN) {
        this.viewer.loadSurface(papayaDroppedFiles);
    } else {
        this.viewer.loadImage(papayaDroppedFiles);
    }

    papayaDroppedFiles = [];
};



papaya.Container.prototype.clearParams = function () {
    this.params = [];
};



papaya.Container.prototype.loadNext = function () {
    if (this.hasImageToLoad()) {
        this.loadNextImage();
    } else if (this.hasSurfaceToLoad()) {
        this.loadNextSurface();
    } else if (this.hasAtlasToLoad()) {
        this.viewer.loadAtlas();
    }
};



papaya.Container.prototype.hasMoreToLoad = function () {
    return (this.hasImageToLoad() || this.hasSurfaceToLoad() || this.hasAtlasToLoad());
};



papaya.Container.prototype.hasImageToLoad = function () {
    if (this.params.images) {
        return (this.loadingImageIndex < this.params.images.length);
    } else if (this.params.encodedImages) {
        return (this.loadingImageIndex < this.params.encodedImages.length);
    } else if (this.params.files) {
        return (this.loadingImageIndex < this.params.files.length);
    }

    return false;
};



papaya.Container.prototype.hasAtlasToLoad = function () {
    return this.viewer.hasDefinedAtlas();
};


papaya.Container.prototype.hasSurfaceToLoad = function () {
    if (!papaya.utilities.PlatformUtils.isWebGLSupported()) {
        console.log("Warning: This browser version is not able to load surfaces.");
        return false;
    }

    if (this.params.surfaces) {
        return (this.loadingSurfaceIndex < this.params.surfaces.length);
    } else if (this.params.encodedSurfaces) {
        return (this.loadingSurfaceIndex < this.params.encodedSurfaces.length);
    }

    return false;
};



papaya.Container.prototype.loadNextSurface = function () {
    var loadingNext = false, imageRefs;

    if (this.params.surfaces) {
        if (this.loadingSurfaceIndex < this.params.surfaces.length) {
            loadingNext = true;
            imageRefs = this.params.surfaces[this.loadingSurfaceIndex];
            this.loadingSurfaceIndex += 1;
            this.viewer.loadSurface(imageRefs, true, false);
        } else {
            this.params.loadedSurfaces = this.params.surfaces;
            this.params.surfaces = [];
        }
    } else if (this.params.encodedSurfaces) {
        if (this.loadingSurfaceIndex < this.params.encodedSurfaces.length) {
            loadingNext = true;
            imageRefs = this.params.encodedSurfaces[this.loadingSurfaceIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.encodedSurfaces[this.loadingSurfaceIndex];
            }

            this.viewer.loadSurface(imageRefs, false, true);
            this.loadingSurfaceIndex += 1;
        } else {
            this.params.loadedEncodedSurfaces = this.params.encodedSurfaces;
            this.params.encodedSurfaces = [];
        }
    }

    return loadingNext;
};



papaya.Container.prototype.loadNextImage = function () {
    var loadingNext = false, imageRefs;

    if (this.params.images) {
        if (this.loadingImageIndex < this.params.images.length) {
            loadingNext = true;
            imageRefs = this.params.images[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.images[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, true, false);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedImages = this.params.images;
            this.params.images = [];
        }
    } else if (this.params.encodedImages) {
        if (this.loadingImageIndex < this.params.encodedImages.length) {
            loadingNext = true;
            imageRefs = this.params.encodedImages[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.encodedImages[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, false, true);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedEncodedImages = this.params.encodedImages;
            this.params.encodedImages = [];
        }
    } else if (this.params.files) {
        if (this.loadingImageIndex < this.params.files.length) {
            loadingNext = true;
            imageRefs = this.params.files[this.loadingImageIndex];

            if (!(imageRefs instanceof Array)) {
                imageRefs = [];
                imageRefs[0] = this.params.files[this.loadingImageIndex];
            }

            this.viewer.loadImage(imageRefs, false, false);
            this.loadingImageIndex += 1;
        } else {
            this.params.loadedFiles = this.params.files;
            this.params.files = [];
        }
    }

    return loadingNext;
};



papaya.Container.prototype.readyForDnD = function () {
    return !this.kioskMode && ((this.params.images === undefined) ||
        (this.loadingImageIndex >= this.params.images.length)) &&
        ((this.params.encodedImages === undefined) ||
        (this.loadingImageIndex >= this.params.encodedImages.length)) &&
        ((this.params.encodedSurfaces === undefined) ||
        (this.loadingSurfaceIndex >= this.params.encodedSurfaces.length));
};



papaya.Container.prototype.findLoadableImage = function (name, surface) {
    var ctr;

    for (ctr = 0; ctr < papayaLoadableImages.length; ctr += 1) {
        if (surface) {
            if (papayaLoadableImages[ctr].surface) {
                if (papayaLoadableImages[ctr].name == name) {  // needs to be ==, not ===
                    return papayaLoadableImages[ctr];
                }
            }
        } else {
            if (papayaLoadableImages[ctr].name == name) {  // needs to be ==, not ===
                return papayaLoadableImages[ctr];
            }
        }
    }

    return null;
};



papaya.Container.prototype.expandViewer = function () {
    var container = this;

    if (this.nestedViewer) {
        this.nestedViewer = false;
        this.collapsable = true;
        this.tempScrollTop = $(window).scrollTop();

        $(":hidden").addClass(PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT);
        $(document.body).children().hide();
        this.containerHtml.show();

        this.originalStyle = {};
        this.originalStyle.width = document.body.style.width;
        this.originalStyle.height = document.body.style.height;
        this.originalStyle.marginTop = document.body.style.marginTop;
        this.originalStyle.marginRight = document.body.style.marginRight;
        this.originalStyle.marginBottom = document.body.style.marginBottom;
        this.originalStyle.marginLeft = document.body.style.marginLeft;
        this.originalStyle.paddingTop = document.body.style.paddingTop;
        this.originalStyle.paddingRight = document.body.style.paddingRight;
        this.originalStyle.paddingBottom = document.body.style.paddingBottom;
        this.originalStyle.paddingLeft = document.body.style.paddingLeft;
        this.originalStyle.overflow = document.body.style.overflow;

        papaya.Container.setToFullPage();

        this.containerHtml.after('<div style="display:none" class="' + PAPAYA_CONTAINER_COLLAPSABLE + '"></div>');
        $(document.body).prepend(this.containerHtml);

        this.resizeViewerComponents(true);
        this.viewer.updateOffsetRect();
        this.updateViewerSize();

        setTimeout(function () {
            window.scrollTo(0, 0);
            container.viewer.addScroll();
        }, 0);
    }
};


papaya.Container.prototype.collapseViewer = function () {
    var ctr, container;

    container = this;

    if (this.collapsable) {
        this.nestedViewer = true;
        this.collapsable = false;

        document.body.style.width = this.originalStyle.width;
        document.body.style.height = this.originalStyle.height;
        document.body.style.marginTop = this.originalStyle.marginTop;
        document.body.style.marginRight = this.originalStyle.marginRight;
        document.body.style.marginBottom = this.originalStyle.marginBottom;
        document.body.style.marginLeft = this.originalStyle.marginLeft;
        document.body.style.paddingTop = this.originalStyle.paddingTop;
        document.body.style.paddingRight = this.originalStyle.paddingRight;
        document.body.style.paddingBottom = this.originalStyle.paddingBottom;
        document.body.style.paddingLeft = this.originalStyle.paddingLeft;
        document.body.style.overflow = this.originalStyle.overflow;

        $("." + PAPAYA_CONTAINER_COLLAPSABLE).replaceWith(this.containerHtml);
        $(document.body).children(":not(." + PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT + ")").show();
        $("." + PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT).removeClass(PAPAYA_CONTAINER_COLLAPSABLE_EXEMPT);

        this.resizeViewerComponents(true);

        for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
            papayaContainers[ctr].updateViewerSize();
            papayaContainers[ctr].viewer.drawViewer(true);
        }

        setTimeout(function () {
            $(window).scrollTop(container.tempScrollTop);
            container.viewer.removeScroll();
        }, 0);
    }
};



papaya.Container.prototype.isNestedViewer = function () {
    return (this.nestedViewer || this.collapsable);
};



papaya.Container.prototype.isDesktopMode = function () {
    return !this.kioskMode;
};



papaya.Container.prototype.hasLoadedDTI = function () {
    return this.viewer.hasLoadedDTI();
};



papaya.Container.prototype.disableScrollWheel = function () {
    return (this.isNestedViewer() || papaya.utilities.PlatformUtils.ios);
};



papaya.Container.prototype.canOpenInMango = function () {
    return this.params.canOpenInMango;
};



papaya.Container.prototype.isExpandable = function () {
    return this.params.expandable && this.isNestedViewer();
};



papaya.Container.prototype.isParametricCombined = function (index) {
    return this.combineParametric && this.viewer.hasParametricPair(index);
};



papaya.Container.prototype.isNonParametricCombined = function (index) {
    return !this.isParametricCombined(index);
};



papaya.Container.prototype.coordinateChanged = function (viewer) {
    var ctr, coorWorld,
        coor = viewer.currentCoord;

    if (papaya.Container.syncViewersWorld) {
        for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
            if (papayaContainers[ctr].viewer !== viewer) {
                coorWorld = new papaya.core.Coordinate();
                papayaContainers[ctr].viewer.gotoWorldCoordinate(viewer.getWorldCoordinateAtIndex(coor.x, coor.y, coor.z, coorWorld), true);
            }
        }
    } else if (papaya.Container.syncViewers) {
        for (ctr = 0; ctr < papayaContainers.length; ctr += 1) {
            if (papayaContainers[ctr].viewer !== viewer) {
                papayaContainers[ctr].viewer.gotoCoordinate(coor, true);
            }
        }
    }

    if (viewer.surfaceView) {
        viewer.surfaceView.updateActivePlanes();
    }

    if (this.contextManager && this.contextManager.clearContext) {
        this.contextManager.clearContext();
    }
};



papaya.Container.prototype.canCurrentOverlayLoadNegatives = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (!overlay.negative && (overlay.negativeScreenVol === null));
};



papaya.Container.prototype.canCurrentOverlayLoadMod = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (overlay.dti && (overlay.dtiVolumeMod === null));
};



papaya.Container.prototype.canCurrentOverlayModulate = function () {
    var overlay = this.viewer.currentScreenVolume;
    return (overlay.dti && (overlay.dtiVolumeMod !== null));
};



/*** Window Events ***/

window.addEventListener('resize', papaya.Container.resizePapaya, false);
window.addEventListener("orientationchange", papaya.Container.reorientPapaya, false);
window.addEventListener("load", papaya.Container.startPapaya, false);
window.addEventListener('message', function (msg) {
    if (msg.data === PAPAYA_MANGO_INSTALLED) {
        papaya.mangoinstalled = true;
    }
}, false);

// Make the containers visible.
papaya.papayaContainers = papayaContainers;

export { papaya as default };
