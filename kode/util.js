
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
	let v;
	try {
		v = fdvuDateToDate(value);
	}
	catch (err) {
		return defaultDate;
	}
	return v;
}
function fdvuDateToDate(s) {
	let arr = s.split(".");
	return new Date(arr.reverse());
}
function dateToFdvuDate(date) {
	let arr = date.split("-");
	return arr.reverse().join(".");
}

function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
}
function numToFDVUNum(n) {
	let u = String(n);
	return u.replace(".", ",");
}

function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
}