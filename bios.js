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
	};
	io.drawPixel = function(x, y, c) {
		let m_ = cfg.pixelSize * (window.devicePixelRatio || 1);
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

	// each character is 5 pixels wide and 8 pixels tall.
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
		',':     [0b00000, 0b00000, 0b00000, 0b00000, 0b00000, 0b00100, 0b00100, 0b00000],
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

	io.drawText(1,  1, 'Font test');
	io.drawText(2,  1, 'Font test');
	io.drawText(1, 11, ' !"#$%&\'()*+,-./012356789:;<=>?@');
	io.drawText(1, 21, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`');
	io.drawText(1, 31, 'abcdefghijklmnopqrstuvwxyz~');
}
