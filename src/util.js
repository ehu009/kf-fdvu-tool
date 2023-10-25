"use strict";


const ignoreContracts = [
		"Driftsadministrasjonen",
		"Driftsavdelingen",
		"Troms\u00F8 kommune v/Byggforvaltningen",
		"Drift Leide Boliger",
		"Stiftelsen Kommunale Boliger"
	];


const deviationIdx = {
		'bygningsnavn': 10,
		'avviksnavn': 0,
		'fasilitet': 8,
		'avviksmerknad': 1
	};
const rentableIdx = {
		'seksjonsnummer': 0,
		'seksjonsnavn': 1,
		'bygningsnavn': 6,
		'seksjonspris': 16,
		'anskaffelsespris': 17,
		'aktiv': 21,
		'utleibar': 22
	};
const keyIdx = {
		'hanknummer': 0,
		'seksjonsnummer': 9
	};
const contractIdx = {
		'fasilitetsnummer': 13,
		'fasilitet': 14,
		'reskontronummer': 5,
		'leietakernummer': 4,
		'leietakernavn': 3,
		'løpenummer': 0,
		'startdato': 7,
		'sluttdato': 8,
		'behandlingsstatus': 25,
		'kontraktsum': 9
	};
const invoiceIdx = {
		'løpenummer': 5,
		'fasilitetsnummer': 6,
		'fakturatekst': 8,
		'fra dato': 13,
		'til dato': 14
	};
const facilityIdx = {
		'beskrivelse': 0,
		'merknad': 1,
		'seksjonsnummer': 4
	};
const estateIdx = {
		'nummer': 0,
		'navn': 1,
		'eiendom': 3
	};


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
	if (value != "") {
		try {
			return fdvuDateToDate(value);
		} catch {
		}
	}
	return defaultDate;
}
function fdvuDateToDate(s) {
	let arr = s.split(".");
	return new Date(arr.reverse());
}
function dateToFdvuDate(date) {
	const arr = date.split("-");
	return arr.reverse().join(".");
}
function temporalOverlap(beginA, endA, beginB, endB) {
	let q = ((endA >= beginB) & (endA <= endB))
			| ((beginA >= beginB) & (beginA <= endB))
			| ((endB >= beginA) & (endB <= endA))
			| ((beginB >= beginA) & (beginB <= endA));
	return q;
}

function stringToNumber(s) {
	return parseFloat(s.replace(",", ".").replace(" ", ""));
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

function arraySortNumeric(arr, idx) {
	arr.sort((a, b) => {
			let aNum = a[idx];
			let bNum = b[idx];
			if (isInvalid(aNum)) {
				aNum = 0;
			}
			if (isInvalid(bNum)) {
				bNum = 0;
			}
			return aNum - bNum;
		});
}
function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
}
function arrayCompare(a, b) {
	if (a.length - b.length != 0) {
		return false;
	}
	for (let i = 0; i < a.length; i += 1) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
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
function arrayRowFilter(inputCSV, idIdx, filterCSV, filterIdx, keepOpt) {
	let output = [inputCSV[0]];
	for (let i = 1; i < inputCSV.length; i += 1) {
		
		const a = inputCSV[i][idIdx];
		let found = false;
		
		for (let j = 0; j < filterCSV.length; j += 1) {
			const b = filterCSV[j][filterIdx];
			if (a == b) {
				found = true;
				break;
			}
		}
		if ((found && keepOpt) || (!found && !keepOpt)) {
			output.push(inputCSV[i]);
		}
	}
	return output;
}

function mapRows(arr, idx) {
	let m = new Map();
	for (let i = 1; i < arr.length; i += 1) {
		const key = arr[i][idx];
		if (m.has(key) == false) {
			m.set(key, []);
		}
		m.get(key).push(arr[i]);
	}
	return m;
}

function fileChangeEvents(ids, readyObj) {
	const keys = ['fileA', 'fileB', 'fileC', 'fileD', 'fileE', 'fileF', 'fileG', 'fileH'];
	for (let i = 0; i < ids.length; i += 1) {
		fxcd(ids[i]).onchange = (evt) => {
				if (evt.target.files.length == 0) {
					readyObj[keys[i]] = 2;
				} else {
					readyObj[keys[i]] -= 1;
				}
			};
	}
}
