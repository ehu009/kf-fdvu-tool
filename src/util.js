'use strict';


const ignoreContracts = [
		'Driftsadministrasjonen',
		'Driftsavdelingen',
		'Troms\u00F8 kommune v/Byggforvaltningen',
		'Drift Leide Boliger',
		'Stiftelsen Kommunale Boliger'
	];
let ignoreContractsAddition = ['Omsorgstjenesten S\u00F8r\u00F8ya',
		'Enhet for psykisk helse og rus, avdeling Ankeret v/Heidi H\u00F8ie',
		'Enhet for psykisk helse og rus, avdeling B\u00F8lgen',
		'Stiftelsen Kommunale Boliger',
		'Flyktningtjenesten Privatinnleide',
		'Tildelingskontoret'
	];


const deviationIdx = {
		'avviksnavn': 0,
		'avviksmerknad': 1,
		'fasilitet': 8,
		'bygningsnavn': 10
	};
const rentableIdx = {
		'seksjonsnummer': 0,
		'seksjonsnavn': 1,
		'merknad': 2,
		'adresse': 3,
		'eiendom' : 5,
		'bygningsnavn': 6,
		'formål': 9,
		'seksjonstype': 14,
		'seksjonspris': 16,
		'anskaffelsespris': 17,
		'aktiv': 21,
		'utleibar': 22,
		'løpenummer': 23,
		'leietakernummer': 24,
		'leietakernavn': 25,
		'eierform': 26
	};
const keyIdx = {
		'hanknummer': 0,
		'seksjonsnummer': 9
	};
const contractIdx = {
		'løpenummer': 0,
		'leietakernavn': 3,
		'leietakernummer': 4,
		'reskontronummer': 5,
		'startdato': 7,
		'sluttdato': 8,
		'kontraktsum': 9,
		'utgårdato': 10,
		'fasilitetsnummer': 13,
		'fasilitet': 14,
		'kontrakttype': 19,
		'behandlingsstatus': 25
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
		'seksjon': 4
	};
const estateIdx = {
		'nummer': 0,
		'navn': 1,
		'eiendom': 3
	};
const koboIdx = {
		'kommunenummer': 0,
		'gnrbnr': 1,
		'festenummer': 2,
		'seksjonsnummer': 3,
		'bruksenhetsnummer': 4,
		'gatenavn': 5,
		'husnummer': 6,
		'husbokstav': 7,
		'postnummer': 8,
		'ekstrareferanse': 9,
		'koboboligtype': 10,
		'underkategoriboligtype': 11,
		'kobodisposisjonsform': 12,
		'boligeiersnavn': 13,
		'boligeiersorganisasjonsnummer': 14,
		'boligeiersmobilnummer': 15,
		'boligstatus': 16,
		'statusdato': 17,
		'manedsleie': 18,
		'malernummerstrom': 19,
		'malernummervann': 20,
		'depositum': 21,
		'errullestoltilpasset': 22,
		'antallsoverom': 23,
		'skolekretsbarneskole': 24,
		'skolekretsungdomsskole': 25,
		'ovriginformasjon': 26,
		'kvalifiserermvakompensasjon': 27,
		'erbofellesskap': 28,
		'erdognbemannet': 29,
		'harpersonalbase': 30,
		'hovedsoker': 31,
		'leieforholdertidsubegrenset': 32,
		'leieforholdstartdato': 33,
		'leieforholdsluttdato': 34
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
	let arr = s.split('.');
	return new Date(arr.reverse());
}
function dateToFdvuDate(date) {
	const arr = date.split('-');
	return arr.reverse().join('.');
}
function temporalOverlap(beginA, endA, beginB, endB) {
	return ((endA >= beginB) & (endA <= endB))
			| ((beginA >= beginB) & (beginA <= endB))
			| ((endB >= beginA) & (endB <= endA))
			| ((beginB >= beginA) & (beginB <= endA));
}

function stringToNumber(s) {
	return parseFloat(s.replace(',', '.').replace(' ', ''));
}
function numToFDVUNum(n) {
	let u = String(n);
	return u.replace('.', ',');
}
function isInvalid(val) {
	return val == null
			| val == undefined
			| val == ''
			| val == ' ';
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
		let key = arr[i][idx];
		if (key != undefined) {
			key = key.trim()
		}
		if (m.has(key) == false) {
			m.set(key, []);
		}
		m.get(key).push(arr[i]);
	}
	return m;
}

const fileKeys = ['fileA', 'fileB', 'fileC', 'fileD', 'fileE', 'fileF', 'fileG', 'fileH'];
function fileChangeEvents(ids, readyObj) {
	for (let i = 0; i < ids.length; i += 1) {
		fxcd(ids[i]).onchange = (evt) => {
				if (evt.target.files.length == 0) {
					readyObj[fileKeys[i]] = 2;
				} else {
					readyObj[fileKeys[i]] -= 1;
				}
			};
	}
}
function fileReadInput(ids, readyObj) {
	let out = {};
	for (let i = 0; i < ids.length; i += 1) {
		
		let e = fxcd(ids[i]);
		let f = new FileReader();
		f.onload = () => {
				let l = CSVToArray(f.result, ';');
				CSVRemoveBlanks(l);
				out[ids[i]] = l;
				readyObj[fileKeys[i]] -= 1;
			};
		f.readAsText(e.files[0], 'iso-8859-1');
	}
	return out;
}