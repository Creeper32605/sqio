'use strict';
{
	let title = document.querySelector('title');
	let titleBlink = true;
	let titleBlinkLoop = function() {
		title.textContent = '>' + (titleBlink ? '_' : '\u2004\u200a\u200b\u00a0');
		titleBlink = !titleBlink;
		setTimeout(titleBlinkLoop, 500);
	};
	titleBlinkLoop();
	let canvas = document.querySelector('#main-canvas');
	if (!canvas) {
		alert('No canvas found\nbail');
		document.body.parentNode.removeChild(document.body);
	}
	let ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	let cfg = {
		width: 480,
		height: 300,
		pixelSize: 2
	};

	let updateSize = function() {
		canvas.style.width = cfg.width + 'px';
		canvas.style.height = cfg.height + 'px';
		canvas.setAttribute('width', cfg.width * (window.devicePixelRatio || 1));
		canvas.setAttribute('height', cfg.height * (window.devicePixelRatio || 1));
	};
	updateSize();

	document.querySelector('#fullscreen-btn').addEventListener('click', function() {
		if (!document.fullscreenElement &&
				!document.mozFullScreenElement && !document.webkitFullscreenElement &&
				!document.msFullscreenElement) {
			if (canvas.requestFullscreen) {
				canvas.requestFullscreen();
			} else if (canvas.msRequestFullscreen) {
				canvas.msRequestFullscreen();
			} else if (canvas.mozRequestFullScreen) {
				canvas.mozRequestFullScreen();
			} else if (canvas.webkitRequestFullscreen) {
				canvas.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			}
		}
	});

	var io = {};

	// this is the color class used everywhere where something is drawn. It's limited to
	// 4096 colors and 16 alpha values
	io.Color = class Color {
		constructor(r, g, b, a) {
			this.r = Math.round(Math.min(15, Math.max(0, r)));
			this.g = Math.round(Math.min(15, Math.max(0, g)));
			this.b = Math.round(Math.min(15, Math.max(0, b)));
			this.a = Math.round(Math.min(15, Math.max(0, a)));
			if (!Number.isInteger(this.r)) this.r = 0;
			if (!Number.isInteger(this.g)) this.g = 0;
			if (!Number.isInteger(this.b)) this.b = 0;
			if (!Number.isInteger(this.a)) this.a = 15;
		}
		toFloat() {
			return [this.r / 15, this.g / 15, this.b / 15, this.a / 15];
		}
		toRgba() {
			var f_ = 255 / 15;
			return `rgba(${Math.round(this.r * f_)},${Math.round(this.g * f_)},${Math.round(this.b * f_)},${this.a / 15})`;
		}
		toBitRGB() {
			return (this.r << 8) + (this.g << 4) + this.b;
		}
		clone(or, og, ob, oa) {
			return new io.Color(or || this.r, og || this.g, ob || this.b, oa || this.a);
		}
		getRed() {
			return this.r;
		}
		getGreen() {
			return this.g;
		}
		getBlue() {
			return this.b;
		}
		getAlpha() {
			return this.a;
		}
		static black() {
			return new io.Color(0, 0, 0);
		}
		static white() {
			return new io.Color(15, 15, 15);
		}
		static fromBitRGB(n) {
			return new io.Color(n >> 8 & 0b1111, n >> 4 & 0b1111, n & 0b1111);
		}
	};
	io.drawPixel = function(x, y, c) {
		let m_ = cfg.pixelSize * (window.devicePixelRatio || 1);
		// using a string here will actually allow using all 4228250625 colors
		// and although it shouldn't be allowed it's here for performance reasons
		ctx.fillStyle = (typeof c == 'string' ? c : c.toRgba());
		x = Math.trunc(x);
		y = Math.trunc(y);
		ctx.fillRect(x * m_, y * m_, m_, m_);
	};
	io.drawRect = function(x, y, dx, dy, c) {
		let m_ = cfg.pixelSize * (window.devicePixelRatio || 1);
		ctx.fillStyle = (typeof c == 'string' ? c : c.toRgba());
		x = Math.trunc(x);
		y = Math.trunc(y);
		dx = Math.trunc(dx);
		dy = Math.trunc(dy);
		ctx.fillRect(x * m_, y * m_, dx * m_, dy * m_);
	};

	// screen is now black
	io.drawRect(0, 0, 240, 150, io.Color.black());

	// default font
	// each character is 5 pixels wide and 8 pixels tall
	// just ASCII characters for now
	io.font = {
		unknown: [0b11111, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11111, 0b00000],
		' ':     [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
		'!':     [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000, 0b00100, 0b00000],
		'"':     [0b01010, 0b01010, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
		'#':     [0b01010, 0b01010, 0b11111, 0b01010, 0b11111, 0b01010, 0b01010, 0b00000],
		'$':     [0b00100, 0b01111, 0b10000, 0b01110, 0b00001, 0b11110, 0b00100, 0b00000],
		'%':     [0b10001, 0b10010, 0b00010, 0b00100, 0b01000, 0b01001, 0b10001, 0b00000],
		'&':     [0b00100, 0b01010, 0b00100, 0b01101, 0b10010, 0b10010, 0b01101, 0b00000],
		'\'':    [0b00100, 0b00100, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
		'(':     [0b00100, 0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b00100, 0b00000],
		')':     [0b00100, 0b00010, 0b00010, 0b00010, 0b00010, 0b00010, 0b00100, 0b00000],
		'*':     [0b00000, 0b00100, 0b10101, 0b01110, 0b10101, 0b00100, 0b00000, 0b00000],
		'+':     [0b00000, 0b00100, 0b00100, 0b11111, 0b00100, 0b00100, 0b00000, 0b00000],
		',':     [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00100, 0b00100],
		'-':     [0b00000, 0b00000, 0b00000, 0b01110, 0b00000, 0b00000, 0b00000, 0b00000],
		'.':     [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00000],
		'/':     [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000, 0b00000],
		'0':     [0b01110, 0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b01110, 0b00000],
		'1':     [0b00100, 0b01100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000],
		'2':     [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b01000, 0b11111, 0b00000],
		'3':     [0b01110, 0b10001, 0b00001, 0b00110, 0b00001, 0b10001, 0b01110, 0b00000],
		'4':     [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010, 0b00000],
		'5':     [0b11111, 0b10000, 0b11110, 0b00001, 0b00001, 0b10001, 0b01110, 0b00000],
		'6':     [0b00110, 0b01000, 0b10000, 0b11110, 0b10001, 0b10001, 0b01110, 0b00000],
		'7':     [0b11111, 0b00001, 0b00001, 0b00010, 0b00010, 0b00100, 0b00100, 0b00000],
		'8':     [0b01110, 0b10001, 0b10001, 0b01110, 0b10001, 0b10001, 0b01110, 0b00000],
		'9':     [0b01110, 0b10001, 0b10001, 0b01111, 0b00001, 0b00010, 0b01100, 0b00000],
		':':     [0b00000, 0b00000, 0b00100, 0b00000, 0b00000, 0b00100, 0b00000, 0b00000],
		';':     [0b00000, 0b00000, 0b00100, 0b00000, 0b00000, 0b00100, 0b00100, 0b00000],
		'<':     [0b00000, 0b00010, 0b00100, 0b01000, 0b00100, 0b00010, 0b00000, 0b00000],
		'=':     [0b00000, 0b00000, 0b01110, 0b00000, 0b01110, 0b00000, 0b00000, 0b00000],
		'>':     [0b00000, 0b01000, 0b00100, 0b00010, 0b00100, 0b01000, 0b00000, 0b00000],
		'?':     [0b01110, 0b10001, 0b00001, 0b00010, 0b00100, 0b00000, 0b00100, 0b00000],
		'@':     [0b01110, 0b10001, 0b10111, 0b10101, 0b10111, 0b10000, 0b01110, 0b00000],
		'A':     [0b00100, 0b01010, 0b01010, 0b10001, 0b11111, 0b10001, 0b10001, 0b00000],
		'B':     [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b11110, 0b00000],
		'C':     [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110, 0b00000],
		'D':     [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110, 0b00000],
		'E':     [0b11111, 0b10000, 0b10000, 0b11100, 0b10000, 0b10000, 0b11111, 0b00000],
		'F':     [0b11111, 0b10000, 0b10000, 0b11100, 0b10000, 0b10000, 0b10000, 0b00000],
		'G':     [0b01110, 0b10001, 0b10000, 0b10011, 0b10001, 0b10001, 0b01110, 0b00000],
		'H':     [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b00000],
		'I':     [0b01110, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b01110, 0b00000],
		'J':     [0b01110, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b01100, 0b00000],
		'K':     [0b10001, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b10001, 0b00000],
		'L':     [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111, 0b00000],
		'M':     [0b10001, 0b11011, 0b10101, 0b10001, 0b10001, 0b10001, 0b10001, 0b00000],
		'N':     [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001, 0b00000],
		'O':     [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110, 0b00000],
		'P':     [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000, 0b00000],
		'Q':     [0b01110, 0b10001, 0b10001, 0b10001, 0b10101, 0b10011, 0b01111, 0b00000],
		'R':     [0b11110, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b10001, 0b00000],
		'S':     [0b01110, 0b10001, 0b10000, 0b01110, 0b00001, 0b10001, 0b01110, 0b00000],
		'T':     [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000],
		'U':     [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110, 0b00000],
		'V':     [0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b00000],
		'W':     [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b01010, 0b00000],
		'X':     [0b10001, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b10001, 0b00000],
		'Y':     [0b10001, 0b10001, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000],
		'Z':     [0b11111, 0b00001, 0b00010, 0b00100, 0b01000, 0b10000, 0b11111, 0b00000],
		'[':     [0b01110, 0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b01110, 0b00000],
		'\\':    [0b10000, 0b01000, 0b01000, 0b00100, 0b00010, 0b00010, 0b00001, 0b00000],
		']':     [0b01110, 0b00010, 0b00010, 0b00010, 0b00010, 0b00010, 0b01110, 0b00000],
		'^':     [0b00100, 0b01010, 0b10001, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
		'_':     [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b11111, 0b00000],
		'`':     [0b01000, 0b00100, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00000],
		'a':     [0b00000, 0b00000, 0b01110, 0b00001, 0b01111, 0b10001, 0b01111, 0b00000],
		'b':     [0b10000, 0b10000, 0b10110, 0b11001, 0b10001, 0b10001, 0b11110, 0b00000],
		'c':     [0b00000, 0b00000, 0b01110, 0b10001, 0b10000, 0b10001, 0b01110, 0b00000],
		'd':     [0b00001, 0b00001, 0b01101, 0b10011, 0b10001, 0b10001, 0b01111, 0b00000],
		'e':     [0b00000, 0b00000, 0b01110, 0b10001, 0b11111, 0b10000, 0b01110, 0b00000],
		'f':     [0b00011, 0b00100, 0b01111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000],
		'g':     [0b00000, 0b00000, 0b01111, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110],
		'h':     [0b10000, 0b10000, 0b10110, 0b11001, 0b10001, 0b10001, 0b10001, 0b00000],
		'i':     [0b00100, 0b00000, 0b01100, 0b00100, 0b00100, 0b00100, 0b01110, 0b00000],
		'j':     [0b00100, 0b00000, 0b01100, 0b00100, 0b00100, 0b00100, 0b10100, 0b01000],
		'k':     [0b10000, 0b10000, 0b10010, 0b10100, 0b11000, 0b10100, 0b10010, 0b00000],
		'l':     [0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b01000, 0b00100, 0b00000],
		'm':     [0b00000, 0b00000, 0b11010, 0b10101, 0b10101, 0b10101, 0b10101, 0b00000],
		'n':     [0b00000, 0b00000, 0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b00000],
		'o':     [0b00000, 0b00000, 0b01110, 0b10001, 0b10001, 0b10001, 0b01110, 0b00000],
		'p':     [0b00000, 0b00000, 0b10110, 0b11001, 0b10001, 0b11110, 0b10000, 0b10000],
		'q':     [0b00000, 0b00000, 0b01101, 0b10011, 0b10001, 0b01111, 0b00001, 0b00001],
		'r':     [0b00000, 0b00000, 0b01011, 0b01100, 0b01000, 0b01000, 0b01000, 0b00000],
		's':     [0b00000, 0b00000, 0b01111, 0b10000, 0b01110, 0b00001, 0b11110, 0b00000],
		't':     [0b00100, 0b00100, 0b01111, 0b00100, 0b00100, 0b00100, 0b00011, 0b00000],
		'u':     [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b10001, 0b01111, 0b00000],
		'v':     [0b00000, 0b00000, 0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b00000],
		'w':     [0b00000, 0b00000, 0b10001, 0b10001, 0b10101, 0b10101, 0b01010, 0b00000],
		'x':     [0b00000, 0b00000, 0b10001, 0b01010, 0b00100, 0b01010, 0b10001, 0b00000],
		'y':     [0b00000, 0b00000, 0b10001, 0b10001, 0b10001, 0b01111, 0b00001, 0b01110],
		'z':     [0b00000, 0b00000, 0b11111, 0b00010, 0b00100, 0b01000, 0b11111, 0b00000],
		'{':     [0b00010, 0b00100, 0b00100, 0b01000, 0b00100, 0b00100, 0b00010, 0b00000],
		'|':     [0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00000],
		'}':     [0b01000, 0b00100, 0b00100, 0b00010, 0b00100, 0b00100, 0b01000, 0b00000],
		'~':     [0b00000, 0b00000, 0b01000, 0b10101, 0b00010, 0b00000, 0b00000, 0b00000]
	};

	// draws text on screen using the font above
	io.drawText = function(x, y, text, c) {
		let dx = x;
		let ny = parseInt(y);
		c = c || io.Color.white();
		let col = c.toRgba();
		for (let ch of text) {
			let n = io.font[ch] || io.font.unknown;
			let dy = 0;
			for (let li of n) {
				let qy = ny + dy;
				if(li & 0b10000) io.drawPixel(dx,     qy, col);
				if(li & 0b01000) io.drawPixel(dx + 1, qy, col);
				if(li & 0b00100) io.drawPixel(dx + 2, qy, col);
				if(li & 0b00010) io.drawPixel(dx + 3, qy, col);
				if(li & 0b00001) io.drawPixel(dx + 4, qy, col);
				dy++;
			}
			dx += 6;
		}
	};
	// similar to how drawText draws the font, this draws a 'map' (an array with strings)
	// on the screen in a specified color. Uses strings though as Javascript has great
	// difficulties handling big numbers
	io.drawMap = function(x, y, map, c) {
		c = c || io.Color.white();
		let col = c.toRgba();
		for (let l in map) {
			let ln = map[l];
			for (let dx in ln) {
				if (ln[dx] == '1' || ln[dx] == '+') {
					io.drawPixel(x + dx, y + l, col);
				}
			}
		}
	};
	io.getWidth = function() {
		return cfg.width / cfg.pixelSize;
	};
	io.getHeight = function() {
		return cfg.height / cfg.pixelSize;
	};

	// user events
	let eventListeners = {
		keypress: [],
		keydown:  [],
		keyup:    []
	};
	io.addEventListener = function(evt, lst) {
		if (!(evt in eventListeners)) return;
		if (typeof lst != 'function') return;
		eventListeners[evt].push(lst);
	};
	io.removeEventListener = function(lst) {
		for (let arr of eventListeners) {
			if (arr.indexOf(lst) > -1) {
				arr.splice(arr.indexOf(lst), 1);
			}
		}
	};

	// bind events to document
	document.addEventListener('keypress', function(e) {
		for (let fn of eventListeners.keypress) {
			try {
				fn(e);
			} catch (err) {
				console.error(err);
			}
		}
	});
	document.addEventListener('keydown', function(e) {
		for (let fn of eventListeners.keydown) {
			try {
				fn(e);
			} catch (err) {
				console.error(err);
			}
		}
	});
	document.addEventListener('keyup', function(e) {
		for (let fn of eventListeners.keyup) {
			try {
				fn(e);
			} catch (err) {
				console.error(err);
			}
		}
	});

	// string with color and bold options
	// style property has 13 bits
	// first 12 bits: R, G, B (each 4 bits) values of the color
	// 13th bit: bold
	io.FormattedString = class FormattedString {
		constructor() {
			this.parts = [];
			this.length = 0;
			for (let arg of arguments) {
				if (typeof arg == 'string') {
					this.parts.push([arg, 0b1111111111110]);
					this.length += arg.length;
				} else if (arg instanceof Array) {
					this.parts.push(['' + arg[0], arg[1] ? (+arg[1] & 0b1111111111111) : 0b1111111111110]);
					this.length += ('' + arg[0]).length;
				}
			}
		}
		updateLength() {
			this.length = 0;
			for (let item of this.parts) {
				this.length += item[0].length;
			}
		}
		setStyle(part, style) {
			this.parts[part][1] = style & 0b1111111111111;
		}
		setContent(part, content) {
			this.parts[part][0] = '' + content;
			this.updateLength();
		}
		addPart(content, style) {
			this.parts.push(['' + content, +style & 0b1111111111111]);
			this.length += content.length;
		}
		partIndexOf(index) {
			if (index > this.length - 1) return null;
			let idx = 0;
			for (let pi in this.parts) {
				let part = this.parts[pi];
				let pidx = idx;
				idx += part[0].length;
				if (idx >= index) {
					return [+pi, index - pidx];
				}
			}
		}
		toPlainText() {
			let str = '';
			for (let part of this.parts) {
				str += part[0];
			}
			return str;
		}
		split(chars, frontPadding) {
			// splits this every {chars} characters with optional frontPadding (indent in the first line)
			let pos = +frontPadding || 0;
			let lines = [];
			let line;
			for (let part of this.parts) {
				if (line && line[1] != part[1]) {
					line.push(['', part[1]]);
				} else {
					line = [['', part[1]]];
				}
				for (let char of part[0]) {
					if (pos < chars) {
						line[line.length - 1][0] += char;
					} else {
						pos = 0;
						lines.push(line);
						line = [[char, part[1]]];
					}
					pos++;
				}
			}
			if (line && line[0])
				lines.push(line);
			for (let i in lines) {
				lines[i] = new io.FormattedString(...lines[i]);
			}
			return lines;
		}
		overwrite(index, fstring, append) {
			// never touch this monstrousity again
			// this just overwrites this FormattedString at a given index with another one
			// if append is true it allows for overflow behind
			var pos = index;
			// space is a variable used lateron
			let space = true;
			if (pos === undefined) return this;
			if (!fstring.length) return this;
			for (let part of fstring.parts) {
				for (let char of part[0]) {
					let idx = this.partIndexOf(pos);
					// looks like the index is outside the string length
					if (!idx && append) {
						// only add spaces inbetween if append is true and space is true
						if (pos > this.length && space) {
							this.parts.push([new Array(pos - this.length + 1).join(' '), 0x1ffe]);
							space = false;
						}
						this.parts.push([char, part[1]]);
						continue;
					} else if (!idx) continue;
					// the part at the target index
					let pt = this.parts[idx[0]];
					// does the part match the wanted styles?
					if (pt[1] != part[1]) {
						// nope.
						// determine if the character goes inside the part or just behind it
						let idxi = idx[1] == pt[0].length;
						// split the part in two, right where the character goes
						let pt2 = pt[0].substr(idx[1] + 1);
						pt[0] = pt[0].substr(0, idx[1]);
						// if the second part isn't empty, put it behind the original part
						if (pt2 !== '')
							this.parts.splice(idx[0] + 1, 0, [pt2, pt[1]]);
						else if (pt2 === '' && idxi) {
							// if it's empty, find the next non-empty part and take the first character
							// but only if the character goes directly after the part, not inside the part
							let counter = 0;
							while (this.parts[idx[0] + (++counter)] && this.parts[idx[0] + counter][0] === '') {
								// already counting above, nothing to do here
							}
							if (this.parts[idx[0] + counter]) {
								let rmp = this.parts[idx[0] + counter];
								rmp[0] = rmp[0].substr(1);
								if (rmp[0] === '')
									this.parts.splice(idx[0] + counter, 1);
							}
						}
						// create a new part and put the character in it
						this.parts.splice(idx[0] + 1, 0, [char, part[1]]);
					} else {
						// it matches the styles. The character will now be put in this part
						// and won't create a new part

						// check if the character goes right behind the part
						if (idx[1] >= pt[0].length) {
							// if it does, find the next non-empty part and take the first character
							let counter = 0;
							while (this.parts[idx[0] + (++counter)] && this.parts[idx[0] + counter][0] === '') {
								// already counting above, nothing to do here
							}
							if (this.parts[idx[0] + counter]) {
								let rmp = this.parts[idx[0] + counter];
								rmp[0] = rmp[0].substr(1);
								if (rmp[0] === '')
									this.parts.splice(idx[0] + counter, 1);
							}
						}
						// put the character in the part
						pt[0] = pt[0].substr(0, idx[1]) + char + pt[0].substr(idx[1] + 1);
					}
					pos++;
				}
			}
			this.updateLength();
			return this;
		}
	};

	// simple scrolling terminal
	io.Terminal = class Terminal {
		constructor() {
			this.width = Math.floor(io.getWidth() / 6) - 1;
			this.height = Math.floor(io.getHeight() / 10) - 1;
			this.lines = [];
			for (let i = 0; i < this.height; i++) {
				this.lines.push(new io.FormattedString(''));
			}
			this.cursorPos = [0, 0];
		}
		write(formatted) {
			// (over-)writes formatted text at cursor position and draws
			for (let part of formatted.parts) {
				if (!this.lines[this.cursorPos[1]])
					this.lines[this.cursorPos[1]] = new io.FormattedString('');
				this.lines[this.cursorPos[1]].overwrite(this.cursorPos[0], new io.FormattedString(part), true);
				this.cursorPos[0] += part[0].length;
				if (this.cursorPos[0] > this.width) {
					this.cursorPos[0] = this.width;
					break;
				}
			}
			this.draw();
		}
		print(line) {
			// prints a line, supports simple wrapping
			if (!(line instanceof io.FormattedString))
				line = new io.FormattedString(line);
			let lines = line.split(this.width, this.cursorPos[0]);
			for (let ln of lines) {
				if (this.cursorPos[1] > this.height) {
					this.scroll();
					this.cursorPos[1] = this.height;
				}
				this.write(ln);
				this.cursorPos = [0, this.cursorPos[1] + 1];
			}
		}
		scroll() {
			// "scrolls" all lines up by 1
			this.lines.splice(0, 1);
		}
		draw() {
			io.drawRect(0, 0, io.getWidth(), io.getHeight(), io.Color.black());
			let dy = 0;
			for (let line of this.lines) {
				let cx = 0;
				for (let part of line.parts) {
					io.drawText(1 + cx * 6, 1 + dy * 10, part[0], io.Color.fromBitRGB(part[1] >> 1));
					if (part[1] & 1 == 1) {
						io.drawText(2 + cx * 6, 1 + dy * 10, part[0], io.Color.fromBitRGB(part[1] >> 1));
					}
					cx += part[0].length;
				}
				dy++;
			}
		}
	};
}
