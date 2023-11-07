'use strict';


function koboHeader() {
	const out = [];
	Object.entries(koboIdx).forEach((entry) => {
			out[0].push(entry[0]);
		});
	return out;
}

function applyRentable(rowFn, enterFn) {
	/*
		data rett fra seksjon
	*/
	function postnummer() {
		const addr = rowFn('adresse').split(' ');
		
		let pos = 1;
		while (addr[addr.length - pos] == '') {
			pos += 1;
		}
		return addr[addr.length - (pos + 1)];
	}
	enterFn('postnummer', postnummer());
	enterFn('kommunenummer', '5401');
	enterFn('manedsleie', rowFn('seksjonspris').split(',')[0]);
	enterFn('ovriginformasjon', rowFn('merknad'));
	
	const name = rowFn('seksjonsnavn').trim().split(',');
	const len = name.length;
	if (len > 1) {
		if (len > 2) {
			enterFn('ekstrareferanse', name[2]);
		}
		enterFn('bruksenhetsnummer', name[1]);
	}
	
	name = name[0].trim();
	let letter = name.slice(-1);
	if (isNaN(parseInt(letter))) {
		name = name.slice(0, name[name.length - 1]);
	} else {
		letter = '';
	}
	enterFn('husbokstav', letter);
	
	const street = name.split(' ');
	enterFn('husnummer', street[street.length - 1]);
	street.pop();
	enterFn('gatenavn', street.join(' '));
}

function applyEstates(rowFn, enterFn, estates) {
	/*
		data fra grunneiendom
	*/
	if (estates.has(rowFn('eiendom'))) {
		const l = estates.get(rowFn('eiendom'));
		
		if (l.length < 2) {
			if (l.length > 0) {
				l.forEach((estate) => {
						enterFn('gnrbnr', estate[estateIdx['nummer']].replace('.', '/'));
					});
			}
			
		}
	}
}

function applyFacilities(rowFn, enterFn, facilities) {
	/*
		data fra fasilitetsbeskrivelse
	*/
	const bools = ['Døgnbemanning', 'Personalbase', 'Handicaptilpasset']
	let base = '';
	let staffed = '';
	let handicap = '';
	
	let bedrooms = '';
	let power = null;
	let ownerName = '';
	let ownerPhone = '';
	let ownerReg = '';
	
	let ignorePower = true;
	
	if (facilities.has(rowFn('seksjonsnummer') + ' ' + rowFn('seksjonsnavn'))) {
		facilities.get(rowFn('seksjonsnummer') + ' ' + rowFn('seksjonsnavn')).forEach((facility) => {
				function f(key) {
					return facility[facilityIdx[key]];
				}
				
				const k = f('beskrivelse');
				if (bools.includes(k)) {
					const v = '1';
					switch(k) {
						case 'Døgnbemanning':
						staffed = v;
						break;
						
						case 'Handicaptilpasset':
						handicap = v;
						break;
						
						case 'Personalbase':
						base = v;
						break;
					}
				} else {
					const v = f('merknad').trim();
					switch(k) {
						case 'Eier navn':
						ownerName = v;
						break;
						
						case 'Eier tlf. nummer':
						ownerPhone = v.replaceAll(' ', '').replaceAll('-', '');
						break;
						
						case 'Eier org. nummer':
						ownerReg = v.replaceAll(' ', '').replaceAll('-', '');
						break;
						
						case 'Målernummer strøm':
						if (power == null) {
							power = v;
							ignorePower = false;
							break;
						}
						if (!ignorePower) {
							if (power == '') {
								power = v;
							} else {
								if (v != '') {
									ignorePower = true;
								}
							}
						}
						break;
						
						case 'Soverom':
						bedrooms = v;
						break;
					}
				}
			});
		
		if (!ignorePower) {
			enterowFn('malernummerstrom', power);
		} 
		enterowFn('antallsoverom', bedrooms);
		enterowFn('erdognbemannet', staffed);
		enterowFn('harpersonalbase', base);
		enterowFn('errullestoltilpasset', handicap);
		enterowFn('boligeiersnavn', ownerName);
		enterowFn('boligeiersorganisasjonsnummer', ownerReg);
		enterowFn('boligeiersmobilnummer', ownerPhone);
	}
}

function applyContracts(rowFn, enterFn, contracts) {
	/*
		data fra kontrakter
	*/
	const customerName = rowFn('leietakernavn');
	if (customerName == '') {
		enterFn('boligstatus', 'KLAR_FOR_INNFLYTTING');
	} else if (customerName == ['Passiv']) {
		enterFn('boligstatus', 'IKKE_TILGJENGELIG');
	} else {
		
		const customerID = rowFn('leietakernummer');
		while (customerID.length < 11 && customerID.length != 6) {
			customerID = "0" + customerID;
		}
		
		if (!isInvalid(customerID) && contracts.has(rowFn('seksjonsnummer'))) {
				
			let timeLimited = false;
			let startDate = '';
			let stopDate = '';
			let expiry = '';
			contracts.get(rowFn('seksjonsnummer')).filterowFn((contract) => {
					return !contract[contractIdx['behandlingsstatus']] == 'Avsluttet';
				}).forEach((contract) => {
					
						function c(key) {
							return contract[contractIdx[key]];
						}
						
						if (rowFn('leietakernummer') != c('leietakernummer')) {
							return;
						}
						
						const tenant = c('leietakernavn');
						
						
						if (c('kontrakttype') == 'Vedlikehold') {
							enterFn('boligstatus', 'VEDLIKEHOLD');
						} else {
						
							enterFn('boligstatus', 'UTLEID');
						
							if (c('kontrakttype') != 'A-Omsorg tidsubestemt') {
								timeLimited = true;
							}
						}
						startDate = c('startdato');
						stopDate = c('sluttdato');
						expiry = c('utgårdato');
					});
			enterFn('leieforholdertidsubegrenset', timeLimited);
			enterFn('leieforholdstartdato', startDate);
			enterFn('leieforholdsluttdato', stopDate);
			enterFn('hovedsoker', customerID);
		}
	}
}

function ignoreRentable(r) {
	return (r[rentableIdx['leietakernavn']] == 'Passiv'
			|| row[rentableIdx['utleibar']] == 'False'
			|| row[rentableIdx['aktiv']] == 'False');
}

function generate(input) {
	const out = [koboHeader()];
	
	const facilities = mapRows(input['facilities'], facilityIdx['seksjon']);
	const contracts = mapRows(input['contracts'], contractIdx['fasilitetsnummer']);
	const estates = mapRows(input['estates'], estateIdx['eiendom']);
	
	input['rentables'].shift();
	
	input['rentables'].filter((row) => {
			return !ignoreRentable(row);
		}).forEach((row) => {
				
				function read(key) {
					return row[rentableIdx[key]].trim();
				}
				
				const add = [];
				add.fill('', 0, out[0].length);
				function write(key, val) {
					add[koboIdx[key]] = val.trim();
				}
				
				applyRentable(read, write);
				applyEstates(read, write, estates);
				applyFacilities(read, write, facilities);
				applyContracts(read, write, contracts);
				
				out.push(add);
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
			
			const btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, generate(inputData), 'boligimport');
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