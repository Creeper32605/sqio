'use strict';
{
	var vfs = {};
	// a root filesystem
	// every user is a Symbol (thus unique) and defined in the private
	// `users` object. Private class variables are still not a thing
	// so this'll have to do for now
	// the su user can override and impersonate anyone

	// TODO: groups
	// TODO: export/import
	vfs.FileSystem = class FileSystem {
		constructor() {
			let users = {
				su: Symbol('superuser')
			};
			Object.defineProperty(this, 'isUser', {
				value: function(usr, id) {
					if (id == users[usr] || id == users.su) return true;
					return false;
				}
			});
			Object.defineProperty(this, 'addUser', {
				value: function(usr) {
					if (!users[usr]) {
						users[usr] = Symbol(usr);
						return true;
					}
					return false;
				}
			});
			Object.defineProperty(this, 'removeUser', {
				value: function(usr, id) {
					if (users[usr] && (id == users[usr] || id == users.su)) {
						delete users[usr];
						return true;
					}
					return false;
				}
			});
			Object.defineProperty(this, 'root', {
				value: new vfs.Folder(0b1111101101, this, users.su)
			});
		}
		getFileSystem() {
			return this;
		}
	};
	// a node on the filesystem
	// flags: drwxrwxrwx
	// d for directory
	// three read/write/execute permissions for owner/group/world
	vfs.Node = class Node {
		constructor(flags, parent, owner) {
			this.flags = flags & 0b1111111111;
			this.parent = parent || undefined;
			let own = owner;
			Object.defineProperty(this, 'isPermitted', {
				value: function(action, user) {
					let fs = this.getFileSystem();
				}
			});
		}
		clone() {
			return new vfs.Node(this.flags, this.parent);
		}
		getFileSystem() {
			return this.parent.getFileSystem();
		}
	};
	vfs.File = class File extends vfs.Node {
		constructor(flags, parent, owner) {
			super(flags, parent, owner);
			this.contents = new Blob();
		}
		write(bin) {
			if (bin instanceof Blob)
				this.contents = bin;
			else return false;
		}
		readText() {
			let reader = new FileReader();
			reader.readAsText(this.contents);
			return reader.result;
		}
		readArrayBuffer() {
			let reader = new FileReader();
			reader.readAsArrayBuffer(this.contents);
			return reader.result;
		}
		readDataURL() {
			let reader = new FileReader();
			reader.readAsDataURL(this.contents);
			return reader.result;
		}
		readBinaryString() {
			let reader = new FileReader();
			reader.readAsBinaryString(this.contents);
			return reader.result;
		}
	};
}