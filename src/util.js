"use strict";


function xc(...args) {
	console.log(...args);
}

function millisecondsToDays(n) {
	return Math.ceil(n / (1000*60*60*24));
}
function numberOfDaysInMonth(date) {
	let month = date.getMonth();
	if (month == 1) {
		return 28 + ((date.getFullYear() % 4) == 0);
	}
	if (month > 6) {
		month += 1;
	}
	return 31 - (month % 2);
}
function dateWithDefault(value, defaultDate) {
	try {
		return fdvuDateToDate(value);
	} catch {
		return defaultDate;
	}
}
function fdvuDateToDate(s) {
	let arr = s.split(".");
	return new Date(arr.reverse());
}
function dateToFdvuDate(date) {
	const arr = date.split("-");
	return arr.reverse().join(".");
}

function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
}
function numToFDVUNum(n) {
	let u = String(n);
	return u.replace(".", ",");
}
function isInvalid(val) {
	if (val == null
			|| val == undefined
			|| val == ""
			|| val == " ") {
		return true;
	}
	return false;
}

function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
}
function arrayCompare(a, b) {
	let out = (a.length - b.length == 0);
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] != b[i]) {
			out = false;
			break;
		}
	}
	return out;
}
function arrayColFilter(array, wantedList) {
	let filterIdx = [];
	for (let col = 0; col < array[0].length; col += 1) {
		if (wantedList.indexOf(array[0][col]) < 0) {
			continue;
		}
		filterIdx.push(col);
	}
	
	let out = [];
	for (let row = 0; row < array.length; row += 1) {
		let add = [];
		for (let col = 0; col < filterIdx.length; col += 1) {
			add.push(array[row][filterIdx[col]]);
		}
		out.push(add);
	}
	return out;
}