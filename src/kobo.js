'use strict';


function generate(input) {
	let out = [[]];
	Object.entries(koboIdx).forEach((entry) => {
			out[0].push(entry[0]);
		});
	
	let facilities = mapRows(input['facilities'], facilityIdx['seksjon']);
	let contracts = mapRows(input['contracts'], contractIdx['fasilitetsnummer']);
	let estates = mapRows(input['estates'], estateIdx['eiendom']);
	
	let numbers = [];
	for (let i = 0; i < 10; i += 1) {
		numbers.push(i.toString());
	}
	
	input['rentables'].forEach((row) => {
			if (row[rentableIdx['leietakernavn']] == 'Passiv') {
				return;
			}
			if (row[rentableIdx['utleibar']] == 'False' || row[rentableIdx['aktiv']] == 'False') {
				return;
			}
			
			let ok = true;
			let add = [];
			add.fill('', 0, out[0].length);
			function enter(key, val) {
				add[koboIdx[key]] = val.trim();
			}
			function r(key) {
				return row[rentableIdx[key]];
			}
			
			/*
				data rett fra seksjon
			*/
			{
				function postnummer() {
					let addr = r('adresse');
					addr.split(' ');
					return addr[addr.length - 2];
				}
				
				enter('kommunenummer', '5401');
				enter('manedsleie', r('seksjonspris').split(',')[0]);
				enter('postnummer', postnummer());
				
				let info = r('merknad');
				
				let name = r('navn').trim().split(',');
				let len = name.length;
				if (len > 1) {
					if (len > 2) {
						// legger leilighetsnummer i merknad
						info = name[2].trim() + '.\t' + info;
					}
					enter('bruksenhetsnummer', name[1].trim());
				}
				enter('ovriginformasjon', info);
				
				
				name = name[0].trim();
				let letter = name[name.length-1];
				if (isNaN(parseInt(letter))) {
					name = name.slice(0, name[name.length - 1]).trim();
				} else {
					letter = '';
				}
				enter('husbokstav', letter);
				
				let street = name.split(' ');
				enter('husnummer', street[street.length - 1]);
				street.pop();
				enter('gatenavn', street.join(' '));
			}
			/*
				data fra fasilitetsbeskrivelse
			*/
			{
				const bools = ['Døgnbemanning', 'Personalbase', 'Handicaptilpasset']
				let base = '';
				let staffed = '';
				let handicap = '';
				
				let bedrooms = '';
				let power = '';
				let ownerName = '';
				let ownerPhone = '';
				let ownerReg = '';
				
				let ignorePower = false;
				
				facilities.get(r('seksjonsnummer') + ' ' + r('seksjonsnavn')).forEach((facility) => {
						function f(key) {
							return facility[facilityIdx[key]];
						}
						
						const k = f('beskrivelse');
						let v = '1';
						if (bools.includes(k)) {
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
						
							v = f('merknad');
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
								if (power != '') {
									power = v;
								} else {
									ignorePower = true;
								}
								break;
								
								case 'Soverom':
								bedrooms = v;
								break;
							}
						}
					});
				
				if (!ignorePower) {
					enter('malernummerstrom', power);
				}
				enter('antallsoverom', bedrooms);
				enter('erdognbemannet', staffed);
				enter('harpersonalbase', base);
				enter('errullestoltilpasset', handicap);
				enter('boligeiersnavn', ownerName);
				enter('boligeiersorganisasjonsnummer');
				enter('boligeiersmobilnummer');
			}
			/*
				data fra kontrakter
			*/
			{
				let customerName = r('leietakernavn');
				if (customerName != ['Passiv']) {
					
					let customerID = r('leietakernummer');
					for (; customerID.length < 11 && customerID.length != 6;) {
						customerID = "0" + customerID;
					}
					
					if (!isInvalid(customerID)) {
						let l = contracts.get(f('seksjonsnummer')).filter((contract) => {
								return !(contract[contractIdx['behandlingsstatus']] == 'Avsluttet'
										|| ['Passiv'].concat(ignoreContracts.concat(ignoreContractsAddition)).includes(contract[contractIdx['leietakernavn']]));
							});
						
						let timeLimited = false;
						let startDate = '';
						let stopDate = '';
						let expiry = '';
						l.forEach((contract) => {
								function c(key) {
									return contract[contractIdx[key]];
								}
								
								if (c('kontrakttype') != 'A-Omsorg tidsubestemt') {
									timeLimited = true;
								}
								startDate = c('startdato');
								stopDate = c('sluttdato');
								expiry = c('utgårdato');
							});
						enter('leieforholdertidsubegrenset', timeLimited);
						enter('leieforholdstartdato', startDate);
						enter('leieforholdsluttdato', stopDate);
						enter('hovedsoker', customerID);
					}
				}
			}
			/*
				data fra grunneiendom
			*/
			{
				let l = facilities.get(f('eiendom'));
				if (l.length < 2) {
					if (l.length > 0) {
						l.forEach((row) => {
								enter('gnrbnr', row[estateIdx['nummer']].replace('.', '/'));
							});
					}
				}
			}
			
			if (ok) {
				out.push(add);
			}
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