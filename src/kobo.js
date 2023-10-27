'use strict';


function generate(input) {
	let out = [[]];
	Object.entries(koboIdx).forEach((entry) => {
			out[0].push(entry[0]);
		});
	
	let facilities = mapRows(input['facilities', facilityIdx['seksjonsnummer']);
	let contracts = mapRows(input['contracts', contractIdx['fasilitetsnummer']);
	let estates = mapRows(input['estates', estateIdx['eiendom']);
	
	
	input['rentables'].forEach((row) => {
			
			
			
		});
	
	return out;
}


function begin() {
	
	const eventName = 'dataReady';
	let readyTarget = {
			fileA: 2,
			fileB: 2,
			fileC: 2,
			fileD: 2
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd('download').disabled = true;
					if (target['fileA'] < 2 && target['fileB'] < 2 && target['fileC'] < 2 && target['fileD'] < 2) {
						fxcd('filter').disabled = false;
						if (target['fileA'] < 1 && target['fileB'] < 1 && target['fileC'] < 1 && target['fileD'] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	fileChangeEvents(['rentables', 'contracts', 'facilities', 'estates'], ready);
	
	let inputData = null;
	let spinner = fxcd('spinner');
	document.addEventListener(eventName, () => {
			
			let out = generate(inputData);
			let btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, out, 'boligimport');
			hide(spinner);
		});
	
	fxcd('filter').onclick = () => {
			show(spinner);
			inputData = fileReadInput(['rentables', 'contracts', 'facilities', 'estates'], ready);
		};
}

function unitTest() {
	let q = false;
	
	if (testEstateConnectivity()) {
		xc('estate failed');
		q = true;
	}
	if (testContractConnectivity()) {
		xc('contract failed');
		q = true;
	}
	if (testFacilityConnectivity()) {
		xc('facility failed');
		q = true;
	}
	if (testAddressParse()) {
		xc('address failed');
		q = true;
	}
	if (testRoomNumberParse()) {
		xc('room number failed');
		q = true;
	}
	
	return q;
}

function testEstateConnectivity() {
	
	return true;
}

function testContractConnectivity() {
	
	return true;
}

function testFacilityConnectivity() {
	
	return true;
}

function testAddressParse() {
	
	return true;
}

function testRoomNumberParse() {
	
	return true;
}