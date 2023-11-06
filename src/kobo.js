'use strict';


function generate(input) {
	const out = [[]];
	Object.entries(koboIdx).forEach((entry) => {
			out[0].push(entry[0]);
		});
	
	const facilities = mapRows(input['facilities'], facilityIdx['seksjon']);
	const contracts = mapRows(input['contracts'], contractIdx['fasilitetsnummer']);
	const estates = mapRows(input['estates'], estateIdx['eiendom']);
	
	const numbers = [];
	for (let i = 0; i < 10; i += 1) {
		numbers.push(i.toString());
	}
	
	input['rentables'].shift();
	input['rentables'].forEach((row) => {
			if (row[rentableIdx['leietakernavn']] == 'Passiv') {
				return;
			}
			if (row[rentableIdx['utleibar']] == 'False' || row[rentableIdx['aktiv']] == 'False') {
				return;
			}
			
			const add = [];
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
					const addr = r('adresse').split(' ');
					
					let pos = 1;
					while (addr[addr.length - pos] == '') {
						pos += 1;
					}
					return addr[addr.length - (pos + 1)];
				}
				enter('postnummer', postnummer());
				enter('kommunenummer', '5401');
				enter('manedsleie', r('seksjonspris').split(',')[0]);
				enter('ovriginformasjon', r('merknad'));
				
				const name = r('seksjonsnavn').trim().split(',');
				const len = name.length;
				if (len > 1) {
					if (len > 2) {
						enter('ekstrareferanse', name[2]);
					}
					enter('bruksenhetsnummer', name[1]);
				}
				
				name = name[0].trim();
				let letter = name.slice(-1);
				if (isNaN(parseInt(letter))) {
					name = name.slice(0, name[name.length - 1]);
				} else {
					letter = '';
				}
				enter('husbokstav', letter);
				
				const street = name.split(' ');
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
				let power = null;
				let ownerName = '';
				let ownerPhone = '';
				let ownerReg = '';
				
				let ignorePower = true;
				
				if (facilities.has(r('seksjonsnummer') + ' ' + r('seksjonsnavn'))) {
					facilities.get(r('seksjonsnummer') + ' ' + r('seksjonsnavn')).forEach((facility) => {
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
						enter('malernummerstrom', power);
					} 
					enter('antallsoverom', bedrooms);
					enter('erdognbemannet', staffed);
					enter('harpersonalbase', base);
					enter('errullestoltilpasset', handicap);
					enter('boligeiersnavn', ownerName);
					enter('boligeiersorganisasjonsnummer', ownerReg);
					enter('boligeiersmobilnummer', ownerPhone);
				}
			}
			/*
				data fra kontrakter
			*/
			{
				const customerName = r('leietakernavn');
				if (customerName == '') {
					enter('boligstatus', 'KLAR_FOR_INNFLYTTING');
				} else if (customerName == ['Passiv']) {
					enter('boligstatus', 'IKKE_TILGJENGELIG');
				} else {
					
					const customerID = r('leietakernummer');
					for (; customerID.length < 11 && customerID.length != 6;) {
						customerID = "0" + customerID;
					}
					
					if (!isInvalid(customerID)) {
						if (contracts.has(r('seksjonsnummer'))) {
						const l = contracts.get(r('seksjonsnummer')).filter((contract) => {
								return !contract[contractIdx['behandlingsstatus']] == 'Avsluttet';
							});
						
						let timeLimited = false;
						let startDate = '';
						let stopDate = '';
						let expiry = '';
						l.forEach((contract) => {
								
								function c(key) {
									return contract[contractIdx[key]];
								}
								
								if (r('leietakernummer') != c('leietakernummer')) {
									return;
								}
								
								const tenant = c('leietakernavn');
								
								
								if (c('kontrakttype') == 'Vedlikehold') {
									enter('boligstatus', 'VEDLIKEHOLD');
								} else {
								
									enter('boligstatus', 'UTLEID');
								
									if (c('kontrakttype') != 'A-Omsorg tidsubestemt') {
										timeLimited = true;
									}
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
			}
			
			/*
				data fra grunneiendom
			*/
			{
				if (estates.has(r('eiendom'))) {
					const l = estates.get(r('eiendom'));
					
					if (l.length < 2) {
						if (l.length > 0) {
							l.forEach((estate) => {
									enter('gnrbnr', estate[estateIdx['nummer']].replace('.', '/'));
								});
						}
						
					}
				}
			}
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
			
			const out = generate(inputData);
			const btn = fxcd('download');
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