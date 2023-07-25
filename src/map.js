"use strict";


class ListMap {
	
	constructor() {
		this.m = new Map();
	}
	
	has(key) {
		let out = false;
		for (let e of this.entries()) {
			if (arrayCompare(key, e[0])) {
				out = true;
				break;
			}
		}
		return out;
	}
	
	set(key, val) {
		this.m.set(key, val);
	}
	
	get(key) {
		let out = undefined;
		for (let e of this.entries()) {
			if (arrayCompare(key, e[0])) {
				out = e[1];
				break;
			}
		}
		return out;
	}
	
	entries() {
		return this.m.entries();
	}
	
	delete(key) {
		this.m.delete(key);
	}
	
}