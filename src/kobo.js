'use strict';


function koboHeader() {
	const out = [];
	Object.entries(koboIdx).forEach((entry) => {
			out.push(entry[0]);
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
	function check(key, val) {
		return r[rentableIdx[key]] == val;
	}
	return (check('leietakernavn', 'Passiv')
			|| check('utleibar', 'False')
			|| check('aktiv', 'False'));
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
				
				const add = new Array(out[0].length);
				add.fill('')
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
	
	const sampleA = [
			['114613276','Lars Eriksens veg 17, H0101, Leil. 52','Leilighetsnr. 52 Felles trapperom. Brannslange, i gang utenfor boenhet. Vaskemaskin montert på kjøkken. Utvendig postkasse merket med leilighetsnr. Stor bod i kjeller merket med leilighetsnr. Kodelås på ytterdør og egen nøkkel til leilighet. Mulighet for parkering gjennom Tromsø Parkering. WiFi forsterker står i leiligheten. S/N: 073221000928747 MAC: 840112D610E6','Lars Eriksens veg 17, H0101  9016 TROMSØ ','117702 Lars Eriksens veg 17','1177 Lars Eriksens veg','117702 Lars Eriksens veg 17','Tromsøya sør','Bolig','Ukrainabolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Flyktningebolig','32,00','9900,00','','01.11.2022','','2','True','True','K00017123','230790231116','Kostiantyn Kryvoshlykov','Leid'],
			['24979620011','Lars Eriksens Veg 11, H0204','Bygget har overrislingsanlegg - sprinkler TV og internett: 11.05.17. - Telenor ruter m/ kabler. - Canal Digital dekoder m/ kort og kabler. Mangler Canal Digital modem og fjernkontroll. Tjenesten bestiller.','Lars Eriksens Veg 11  H0204  9016 TROMSØ ','117701 Lars Eriksens veg 11','1177 Lars Eriksens veg','117701 Lars Eriksens veg 11','','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Rus og Psykiatribolig','31,10','9507,080','','01.01.1968','','2','True','True','K00017542','240703','Marthe Stenes Sætrum','Leid - Driftet'],
			['20130610198','Lars Eriksens veg 2B','Nøkkelboks: kode 1004 3 soverom. Bod i kjeller. Uteområde: Leietaker benytter fritt tomt som ligger i naturlig tilknytning til boenheten. Antall parkeringsplasser: 1 utendørs oppstillingsplass utenfor boligen (i innkjørsel). Ekstra parkering kan leies hos Tromsø Parkering.  Dyrehold og røyking ikke tillatt.  Strøm er inkludert, ikke internett. Delvis møblert: komfyr med koketopp, kjøleskap, oppvaskmaskin og vaskemaskin. ','Lars Eriksens veg 2B, H0101  9016 TROMSØ ','307801 Lars Eriksens veg 2','3078 Lars Eriksens veg 1 - 3','307801 Lars Eriksens veg 2','Tromsøya sør','Bolig','','','','','Ingen korreksjon','Flyktningebolig','90,00','15803,00','22 000','01.12.2017','','4','True','True','K00017424','061176','Jan Suliman Wali Khail','Leid'],
			['3078000','Lars Eriksens veg 1A','Nøkkelboks satt opp: kode 1001  3 soverom. Bod i kjeller. Uteområde: Leietaker benytter fritt tomt som ligger i naturlig tilknytning til boenheten. Antall parkeringsplasser: 1 utendørs oppstillingsplass utenfor boligen (i innkjørsel). Ekstra parkering kan leies hos Tromsø Parkering.  Dyrehold og røyking ikke tillatt.  Strøm er inkludert, ikke internett. Delvis møblert: komfyr med koketopp, kjøleskap, oppvaskmaskin og vaskemaskin. ','Lars Eriksens veg 1A, H0101  9016 TROMSØ ','307800 Lars Eriksens veg 1','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','Tromsøya sør','Bolig','Flyktningbolig  - Intro','','','Normal','Ingen korreksjon','Komm.bolig','90,00','15503,00','22 000','01.12.2017','','4','True','True','K00017467','(ikke oppgitt)','Tuyishime Mutesi','Leid'],
			['3078001','Lars Eriksens veg 1B','3 soverom. Bod i kjeller. Uteområde: Leietaker benytter fritt tomt som ligger i naturlig tilknytning til boenheten. Antall parkeringsplasser: 1 utendørs oppstillingsplass utenfor boligen (i innkjørsel). Ekstra parkering kan leies hos Tromsø Parkering.  Dyrehold og røyking ikke tillatt.  Strøm er inkludert, ikke internett. Delvis møblert: komfyr med koketopp, kjøleskap, oppvaskmaskin og vaskemaskin. ','Lars Eriksens veg 1B, H0101  9016 TROMSØ ','307800 Lars Eriksens veg 1','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','Tromsøya sør','Bolig','','','','','Ingen korreksjon','Flyktningebolig','90,00','15503,00','22 000','01.12.2017','','4','True','True','K00017466','14038725476','Ana Beatriz Do Nascimento Sampaio','Leid'],
			['3208131','Nordslettvegen 3B','Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 3B  9016 TROMSØ ','320813 Nordslettvegen 3','32081 Nordslettvegen 3 - 6','320813 Nordslettvegen 3','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','51,50','9302,00','','22.11.2022','','2','True','True','K00017411','14049544937','Håvard Klo Jakobsen','Leid'],
			['3208132','Nordslettvegen 4A','Nøkkelboks: Kode 4321 Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 4A  9016 TROMSØ ','320814 Nordslettvegen 4','32081 Nordslettvegen 3 - 6','320814 Nordslettvegen 4','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','119,00','14683,00','','22.11.2022','','4','True','True','K00017457','200992','Barzani Khalil Bozan','Leid']
		];
	
	const sampleB = [
			['Nummer','Navn','Adresse','Eiendom','Merknad','Hjemmelshaver','Matrikkelnr','Parkeringsplasser','Parkeringsareal','Plenareal','Bruksareal (BRA)','Totalt areal','Brøytet areal','Grunneiendomstype','Eierform','Kommune','Region','Kategori bolig','Formål','Status utleie'],
			['118.1729','Sørslettvegen 3','','1180 Åsgård','','','.118.1729','','','','','','','','','','','','',''],
			['118.341','Senjavegen 68','','3194 Senjavegen 68','','','.118.341','','','','','','','','','','','','',''],
			['118.409','Lars Eriksens veg 11, 14, 15','','1177 Lars Eriksens veg','','','.118.409','','','','','','','','','','','','',''],
			['118.506','Lars Eriksens veg 16, 17','','1177 Lars Eriksens veg','','','.118.506','','','','','','','','','','','','',''],
			['118.507','Nordslettvegen 3 - 6','','32081 Nordslettvegen 3 - 6','','','.118.507','','','','','','','','','','','','',''],
			['118.408','Lars Eriksens veg 2','','3078 Lars Eriksens veg 1 - 3','','','.118.408','','','','','','','','','','','','',''],
			['118.1729','Lars Eriksens veg 1 og 3','','3078 Lars Eriksens veg 1 - 3','','','.118.1729','','','','','','','','','','','','','']
		];
	
	const wanted = [koboHeader()];
	for (let i = 0; i < sampleA.length; i += 1) {
		const a = new Array(wanted[0].length);
		a.fill('');
		wanted.push(a);
	}
	wanted[6][koboIdx['gnrbnr']] = '118/507';
	wanted[7][koboIdx['gnrbnr']] = '118/507';
	
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