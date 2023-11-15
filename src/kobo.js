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
	
	let name = rowFn('seksjonsnavn').trim().split(',');
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
		name = name.slice(0, name.length - 1);
	} else {
		letter = '';
	}
	enterFn('husbokstav', letter);
	
	const street = name.split(' ');
	enterFn('husnummer', street.pop());
	enterFn('gatenavn', street.join(' '));
	
	const category = rowFn('seksjonstype');
	if (category != 'Komm.bolig') {
		enterFn('underkategoriboligtype', category);
	}
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
	let includePower = true;
	
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
						if (includePower) {
							if (power == null) {
							
								if (v != null) {
									power = v;
								}
								
							} else {
								includePower = false;
							}
						}
						break;
						
						case 'Soverom':
						bedrooms = v;
						break;
					}
				}
			});
		
		if (includePower) {
			if (power != null) {
				enterFn('malernummerstrom', power);
			}
		}
		enterFn('antallsoverom', bedrooms);
		enterFn('erdognbemannet', staffed);
		enterFn('harpersonalbase', base);
		enterFn('errullestoltilpasset', handicap);
		enterFn('boligeiersnavn', ownerName);
		enterFn('boligeiersorganisasjonsnummer', ownerReg);
		enterFn('boligeiersmobilnummer', ownerPhone);
	}
}

function applyContracts(rowFn, enterFn, contracts) {
	/*
		data fra kontrakter
	*/
	const customerName = rowFn('leietakernavn');
	if (customerName == '') {
		enterFn('boligstatus', 'KLAR_FOR_INNFLYTTING');
	} else if (customerName == 'Passiv'
			|| customerName == 'Midlertidig bolig') {
		enterFn('boligstatus', 'IKKE_TILGJENGELIG');
	} else {
		
		const customerID = rowFn('leietakernummer');
		if (customerID != null) {
			while (customerID.length < 11 && customerID.length != 6) {
				customerID = "0" + customerID;
			}
		}
		
		let timeLimited = false;
		let startDate = '';
		let stopDate = '';
		let expiry = '';
		if (contracts.has(rowFn('seksjonsnummer'))) {
			contracts.get(rowFn('seksjonsnummer')).filter((contract) => {
					return !(contract[contractIdx['behandlingsstatus']] == 'Avsluttet');
				}).forEach((contract) => {
						function c(key) {
							let v = contract[contractIdx[key]]; 
							if (v != null) {
								v.trim();
							}
							return v;
						}
						
						if (rowFn('løpenummer') != c('løpenummer')) {
							return;
						}
						
						const tenant = c('leietakernavn');
						if (tenant == 'Passiv') {
							enterFn('boligstatus', 'IKKE_TILGJENGELIG');
						} else {
							if (tenant == 'Midlertidig bolig') {
								enterFn('boligstatus', 'IKKE_TILGJENGELIG');
							} else {
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
							}
						}
					});
			if (stopDate != null) {
				stopDate = expiry;
			}
		}
		enterFn('leieforholdstartdato', startDate);
		enterFn('leieforholdsluttdato', stopDate);
		enterFn('hovedsoker', customerID);
	}
}

function ignoreRentable(r) {
	function check(key, val) {
		return r[rentableIdx[key]] == val;
	}
	return (check('utleibar', 'False')
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
					let v = row[rentableIdx[key]];
					if (v != null) {
						v = v.trim();
					}
					return v;
				}
				
				const add = new Array(out[0].length);
				add.fill('')
				function write(key, val) {
					if (val != null) {
						val = val.trim();
					}
					add[koboIdx[key]] = val;
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
	
	if (testEstates()) {
		xc('estate failed');
		q = true;
	}
	if (testContracts()) {
		xc('contract failed');
		q = true;
	}
	if (testFacilities()) {
		xc('facility failed');
		q = true;
	}
	if (testRentables()) {
		xc('rentables failed');
		q = true;
	}
	
	return q;
}

function testEstates() {
	
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
	
	const result = [koboHeader()];
	sampleA.filter((row) => {
			return !ignoreRentable(row);
		}).forEach((row) => {
				
				function read(key) {
					return row[rentableIdx[key]].trim();
				}
				
				const add = new Array(result[0].length);
				add.fill('');
				function write(key, val) {
					add[koboIdx[key]] = val.trim();
				}
				
				applyEstates(read, write, mapRows(sampleB, estateIdx['eiendom']));
				result.push(add);
			});
	
	return compareCSV(wanted, result);
}


function testContracts() {
	
	const sampleA = [
			['24130610164','Ishavsvegen 63, U0102, A','Leilighet Underetasje sør. Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 A, U0102  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','','Bolig','Midlertidig bolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Midlertidig bolig','80,00','13555,60','','01.01.2016','','4','True','True','K00013974','00001','Passiv','Leid'],
			['24130610165','Ishavsvegen 63, U0101, B','Leilighet Underetasje Nord Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 B, U0101  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','80,00','13555,60','','01.01.2016','','4','True','True','','','','Leid'],
			['24130610166','Ishavsvegen 63, H0102, C','Leilighet 1. etasje sør. Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 C, H0102  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','Midlertidig bolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Midlertidig bolig','80,00','12822,60','','01.01.2016','','3','True','True','K00015565','(ikke oppgitt)','Midlertidig bolig','Leid'],
			['24130610167','Ishavsvegen 63, H0101, D','Leilighet 1. etasje Nord. Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 D, H0101  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','Midlertidig bolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Midlertidig bolig','80,00','12822,60','','01.01.2016','','3','True','True','K00013975','00001','Passiv','Leid'],
			['24130610168','Ishavsvegen 63, H0202, E','Leilighet 2. etasje Sør Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 E, H0202  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','Flyktningbolig  - Intro','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Flyktningebolig','80,00','13555,60','','01.01.2016','','4','True','True','K00013660','29017322999','Mohamed Abdulrahman Mohamed Ahmed','Leid'],
			['24130610169','Ishavsvegen 63, H0201, F','P-Kort Gjesteparkering for 63 F utlevert til beboer 15.4.2019. Leilighet 2. etasje Nord Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 F, H0201  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','80,00','13555,60','','01.01.2016','','4','True','True','K00013834','07118931534','Florent Twizere','Leid'],
			['114613313','Nordslettvegen 2A','Nøkkelboks montert med 1 nøkkel i, kode: 7654.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 2A  9016 TROMSØ ','320802 Nordslettvegen 2','3208 Nordslettvegen 1 og 2','320802 Nordslettvegen 2','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','150,00','16650,00','18 500','22.11.2022','','4','True','True','K00017456','130188',' Robert Zangabe ','Leid'],
			['114613314','Nordslettvegen 2B','Nøkkelboks montert med 1 nøkkel i, kode: 6543.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 2B  9016 TROMSØ ','320802 Nordslettvegen 2','3208 Nordslettvegen 1 og 2','320802 Nordslettvegen 2','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','150,00','16650,00','18 500','22.11.2022','','4','True','True','K00017458','010180',' Emmanuel Karasira','Leid']
		];
	
	const sampleB = [
			['Løpenummer','Overskrift','Ekstern ID','Leietaker','Nummer','Reskontronr','Saksbehandler','Fra','Til','Sum','Kontrakt utgår','Regulering','Gjengs regulering','Fasilitetsnummer','Fasilitet','Eiendomsnr','Eiendomsnavn','Byggnr','Byggnavn','Kontrakttype','Fakturatype','Mengde','Faktura fra','Fakturareferanse','E-handel faktura','Behandlingsstatus','Sikkerhetstype','Sikkerhetsbeløp','Prisperiode','Faktureringstermin','Terminstart','MVA-pliktig','Merknad','Seksjonstype'],
			['K00012491','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','09.05.2017','12500,00','','','','24130610164','24130610164 Ishavsvegen 63, U0102, A','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Etterskudd Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00012492','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','09.05.2017','12500,00','','','','24130610165','24130610165 Ishavsvegen 63, U0101, B','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Etterskudd Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Komm.bolig'],
			['K00012493','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','18.05.2017','12800,00','','','','24130610166','24130610166 Ishavsvegen 63, H0102, C','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00012494','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','30.06.2017','12800,00','','','','24130610167','24130610167 Ishavsvegen 63, H0101, D','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00012495','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','21.06.2017','12800,00','','','','24130610168','24130610168 Ishavsvegen 63, H0202, E','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Flyktningebolig'],
			['K00012496','Kontrakt for Flyktningtjenesten Privatinnleide','','Flyktningtjenesten Privatinnleide','24498300000','244983','','01.01.2016','30.06.2017','12800,00','','','','24130610169','24130610169 Ishavsvegen 63, H0201, F','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Agresso','','01.01.2016','','','Avsluttet','','0,00','Månedlig','Månedlig','','False','','Komm.bolig'],
			['K00013656','Kontrakt for Tildelingskontoret','','Tildelingskontoret','940101808','250314','','19.05.2017','07.08.2019','15177,79','','01.03.2021','01.03.2020','24130610166','24130610166 Ishavsvegen 63, H0102, C','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Etterskudd Agresso','','','','','Avsluttet','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00013660','Kontrakt for Mohamed Abdulrahman Mohamed Ahmed','','Mohamed Abdulrahman Mohamed Ahmed','29017322999','244079','','22.06.2017','','12193,00','30.06.2023','01.07.2024','','24130610168','24130610168 Ishavsvegen 63, H0202, E','1247','Ishavsvegen 63','124701','Ishavsvegen 63','A-Flyktning','Agresso','','','','','Under behandling','Garanti','12000,00','Månedlig','Månedlig','','False','Kona i intro','Flyktningebolig'],
			['K00013675','Kontrakt for Petros Haile Gebremikael','','Petros Haile Gebremikael','24038221511','216481','','28.06.2017','29.06.2023','12193,00','30.06.2023','','','24130610165','24130610165 Ishavsvegen 63, U0101, B','1247','Ishavsvegen 63','124701','Ishavsvegen 63','A-Velferdsbolig','Agresso','','','','','Avsluttet','Depositum','12000,00','Månedlig','Månedlig','','False','','Komm.bolig'],
			['K00013834','Kontrakt for Florent Twizere','','Florent Twizere','07118931534','261244','','07.09.2017','','14078,11','30.09.2023','01.10.2024','','24130610169','24130610169 Ishavsvegen 63, H0201, F','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Agresso','','','','','Løpende','Depositum','12000,00','Månedlig','Månedlig','','False','','Komm.bolig'],
			['K00013974','Kontrakt for Passiv','','Passiv','00001','','','10.05.2017','','13120,00','','','','24130610164','24130610164 Ishavsvegen 63, U0102, A','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Ingen','','','','','Løpende','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00013975','Kontrakt for Passiv','','Passiv','00001','','','01.07.2017','','13120,00','','','','24130610167','24130610167 Ishavsvegen 63, H0101, D','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Ingen','','','','','Løpende','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00015294','Kontrakt for Driftsadministrasjonen','','Driftsadministrasjonen','00000','','','08.08.2019','04.12.2019','13843,27','','','','24130610166','24130610166 Ishavsvegen 63, H0102, C','1247','Ishavsvegen 63','124701','Ishavsvegen 63','Vedlikehold','Vedlikehold','','','','','Avsluttet','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00015508','Kontrakt for Passiv','','Passiv','00001','','','05.12.2019','04.12.2019','13843,27','','01.01.2021','01.01.2023','24130610166','24130610166 Ishavsvegen 63, H0102, C','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Midlertidig','','','','','Avsluttet','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00015565','Kontrakt for Midlertidig bolig','','Midlertidig bolig','','','','05.12.2019','','13843,95','','','','24130610166','24130610166 Ishavsvegen 63, H0102, C','1247','Ishavsvegen 63','124701','Ishavsvegen 63','','Midlertidig','','','','','Løpende','','','Månedlig','Månedlig','','False','','Midlertidig bolig'],
			['K00017456','Kontrakt for  Robert Zangabe ','130188',' Robert Zangabe ','130188','281469','Andreas Arne Olsen','01.05.2023','','18500,00','31.05.2026','01.05.2024','','114613313','114613313 Nordslettvegen 2A','3208','Nordslettvegen 1 og 2','320802','Nordslettvegen 2','A-Flyktning','Agresso','','','','','Løpende','','','Månedlig','Månedlig','','False','','Komm.bolig'],
			['K00017458','Kontrakt for  Emmanuel Karasira','010180',' Emmanuel Karasira','010180','282207','Andreas Arne Olsen','25.05.2023','','18500,00','31.05.2026','01.06.2024','','114613314','114613314 Nordslettvegen 2B','3208','Nordslettvegen 1 og 2','320802','Nordslettvegen 2','A-Flyktning','Agresso','','','','','Løpende','','','Månedlig','Månedlig','','False','','Komm.bolig']
		];
	
	const wanted = [koboHeader()];
	for (let i = 0; i < sampleA.length; i += 1) {
		const a = new Array(wanted[0].length);
		a.fill('');
		wanted.push(a);
	}
	function desire(idx, key, val) {
		wanted[idx][koboIdx[key]] = val;
	}
	
	desire(1, 'boligstatus', 'IKKE_TILGJENGELIG');
	
	desire(2, 'boligstatus', 'KLAR_FOR_INNFLYTTING');
	
	desire(3, 'boligstatus', 'IKKE_TILGJENGELIG');
	desire(4, 'boligstatus', 'IKKE_TILGJENGELIG');
	
	desire(5, 'boligstatus', 'UTLEID');
	desire(5, 'hovedsoker', '29017322999');
	desire(5, 'leieforholdstartdato', '22.06.2017');
	desire(5, 'leieforholdsluttdato', '30.06.2023');
	
	desire(6, 'boligstatus', 'UTLEID');
	desire(6, 'hovedsoker', '07118931534');
	desire(6, 'leieforholdstartdato', '07.09.2017');
	desire(6, 'leieforholdsluttdato', '30.09.2023');
	
	desire(7, 'boligstatus', 'UTLEID');
	desire(7, 'hovedsoker', '130188');
	desire(7, 'leieforholdstartdato', '01.05.2023');
	desire(7, 'leieforholdsluttdato', '31.05.2026');
	
	desire(8, 'boligstatus', 'UTLEID');
	desire(8, 'hovedsoker', '010180');
	desire(8, 'leieforholdstartdato', '25.05.2023');
	desire(8, 'leieforholdsluttdato', '31.05.2026');
	
	
	const result = [koboHeader()];
	sampleA.filter((row) => {
			return !ignoreRentable(row);
		}).forEach((row) => {
				
				function read(key) {
					return row[rentableIdx[key]].trim();
				}
				
				const add = new Array(result[0].length);
				add.fill('');
				function write(key, val) {
					add[koboIdx[key]] = val.trim();
				}
				
				applyContracts(read, write, mapRows(sampleB, contractIdx['fasilitetsnummer']));
				result.push(add);
			});
	
	return compareCSV(wanted, result);
}

function testFacilities() {
	
	const sampleA = [
			['114613178','Ishavsvegen 54, U0102, A','Eies av UNN. Kontaktperson Ragni Løkholm Ramberg epost: ragni.lokholm.ramberg@unn.no Tlf.: 97514546 Se dokumentfane','Ishavsvegen 54A, U0102  9010 TROMSØ ','317801 Ishavsvegen 54','3178 Ishavsvegen 54','317801 Ishavsvegen 54','Tromsøya nord','Bolig','Ukrainabolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','','Komm.bolig','80,00','14021,40','','20.04.2022','','3','True','True','K00016789','270553','Tatiana Fesenko','Leid'],
			['3078001','Lars Eriksens veg 1B','3 soverom. Bod i kjeller. Uteområde: Leietaker benytter fritt tomt som ligger i naturlig tilknytning til boenheten. Antall parkeringsplasser: 1 utendørs oppstillingsplass utenfor boligen (i innkjørsel). Ekstra parkering kan leies hos Tromsø Parkering.  Dyrehold og røyking ikke tillatt.  Strøm er inkludert, ikke internett. Delvis møblert: komfyr med koketopp, kjøleskap, oppvaskmaskin og vaskemaskin. ','Lars Eriksens veg 1B, H0101  9016 TROMSØ ','307800 Lars Eriksens veg 1','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','Tromsøya sør','Bolig','','','','','Ingen korreksjon','Flyktningebolig','90,00','15503,00','22 000','01.12.2017','','4','True','True','K00017466','14038725476','Ana Beatriz Do Nascimento Sampaio','Leid'],
			['14110612053','Glimmerveien 7 ','Parkeringsplass: - Privat. Plass til 3-4 biler.   Bod:  - Tre boder inne - En utebod  Vedovn i stua','Glimmerveien 7  9022 KROKELVDALEN ','102503 Glimmerveien borettslag Glimmerveien','1025 Glimmerveien borettslag','102503 Glimmerveien borettslag Glimmerveien','','Bolig','','','Kvaløya, Hamna, Lunheim og Kroken','Normal','Ingen korreksjon','Andels og sameie','85,00','12509,00','','','','4','True','True','K00012843','17058925829','Kadija Mama Diallo','Tromsøbolig KF'],
			['14110612022','Conrad Holmboesvei 12, 1.etg.n ','Fra juni 2020: Internett fra Homenet. Leietaker må bestille tv-tjenester selv fra homenet (rikstv, viasat eller get, bestilles via Homenet)','Conrad Holmboesvei 12, H0101  9011 TROMSØ ','102401 Conrad Holmboesvei borettslag Conrad Holmboesvei','1024 Conrad Holmboesvei borettslag','102401 Conrad Holmboesvei borettslag Conrad Holmboesvei','','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Andels og sameie','76,00','11456,00','','','','3','True','True','K00007800','06046330690','Hildegunn Mathisen','Tromsøbolig KF',]
		];
	
	const sampleB = [
			['Beskrivelse','Merknad','Eiendom','Bygning','Seksjon','Seksjonstype'],
			['Anleggsnummer','9203','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Handicaptilpasset','','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Eier navn','Universitetssykehuset Nord-Norge HF','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Eier org. nummer','983974899','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Eier tlf. nummer','77754000','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Målernummer strøm','TK-27464433','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['TV løsning med utstyrsnummer','Se bilder under dokumenter','3178 Ishavsvegen 54','317801 Ishavsvegen 54','114613178 Ishavsvegen 54, U0102, A','Komm.bolig'],
			['Anleggsnummer','9289','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','3078001 Lars Eriksens veg 1B','Flyktningebolig'],
			['Målernummer strøm','Deles med 1A - #27920411: 49154 - 20.05.2023','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','3078001 Lars Eriksens veg 1B','Flyktningebolig'],
			['Soverom','3','3078 Lars Eriksens veg 1 - 3','307800 Lars Eriksens veg 1','3078001 Lars Eriksens veg 1B','Flyktningebolig'],
			['Målernummer strøm','Måler 2: TK 89875 Merknad: 30.06.05: 070365 ','1025 Glimmerveien borettslag','102503 Glimmerveien borettslag Glimmerveien','14110612053 Glimmerveien 7 ','Andels og sameie'],
			['Målernummer strøm','Avlest EB 07.07.16. TK-89875. 275996 kwh.','1025 Glimmerveien borettslag','102503 Glimmerveien borettslag Glimmerveien','14110612053 Glimmerveien 7 ','Andels og sameie'],
			['Målernummer strøm','Avlest IB 13.07.16. TK-89875. 276045 kwh.','1025 Glimmerveien borettslag','102503 Glimmerveien borettslag Glimmerveien','14110612053 Glimmerveien 7 ','Andels og sameie'],
			['Målernummer strøm','Merknad: 25.02.16: 272187 ','1025 Glimmerveien borettslag','102503 Glimmerveien borettslag Glimmerveien','14110612053 Glimmerveien 7 ','Andels og sameie'],
			['Målernummer strøm','Måler 1: 283476 KWh Måler 2: TK 67314 Merknad: Avlest 17.11.09 ','1024 Conrad Holmboesvei borettslag','102401 Conrad Holmboesvei borettslag Conrad Holmboesvei','14110612022 Conrad Holmboesvei 12, 1.etg.n ','Andels og sameie',]
		];
	const facilities = mapRows(sampleB, facilityIdx['seksjon']);
	
	
	const wanted = [koboHeader()];
	for (let i = 0; i < sampleA.length; i += 1) {
		const a = new Array(wanted[0].length);
		a.fill('');
		wanted.push(a);
	}
	function desire(idx, key, val) {
		wanted[idx][koboIdx[key]] = val;
	}
	desire(1, 'errullestoltilpasset', '1');
	desire(1, 'boligeiersnavn', 'Universitetssykehuset Nord-Norge HF');
	desire(1, 'boligeiersorganisasjonsnummer', '983974899');
	desire(1, 'boligeiersmobilnummer', '77754000');
	desire(1, 'malernummerstrom', 'TK-27464433');
	desire(2, 'antallsoverom', '3');
	desire(2, 'malernummerstrom', 'Deles med 1A - #27920411: 49154 - 20.05.2023');
	desire(3, 'malernummerstrom', '');
	desire(4, 'malernummerstrom', 'Måler 1: 283476 KWh Måler 2: TK 67314 Merknad: Avlest 17.11.09');
	
	const result = [koboHeader()];
	sampleA.filter((row) => {
			return !ignoreRentable(row);
		}).forEach((row) => {
				
				function read(key) {
					return row[rentableIdx[key]].trim();
				}
				
				const add = new Array(result[0].length);
				add.fill('');
				function write(key, val) {
					add[koboIdx[key]] = val.trim();
				}
				
				applyFacilities(read, write, facilities);
				result.push(add);
			});
	
	return compareCSV(wanted, result);
}


function testRentables() {
	
	const sample = [
			['24130610164','Ishavsvegen 63, U0102, A','Leilighet Underetasje sør. Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 A, U0102  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','','Bolig','Midlertidig bolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Midlertidig bolig','80,00','13555,60','','01.01.2016','','4','True','True','K00013974','00001','Passiv','Leid'],
			['24130610165','Ishavsvegen 63, U0101, B','Leilighet Underetasje Nord Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 B, U0101  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','80,00','13555,60','','01.01.2016','','4','True','True','','','','Leid'],
			['24130610168','Ishavsvegen 63, H0202, E','Leilighet 2. etasje Sør Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet','Ishavsvegen 63 E, H0202  9010 TROMSØ ','124701 Ishavsvegen 63','1247 Ishavsvegen 63','124701 Ishavsvegen 63','Tromsøya nord','Bolig','Flyktningbolig  - Intro','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Flyktningebolig','80,00','13555,60','','01.01.2016','','4','True','True','K00013660','29017322999','Mohamed Abdulrahman Mohamed Ahmed','Leid'],
			['114613314','Nordslettvegen 2B','Nøkkelboks montert med 1 nøkkel i, kode: 6543.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 2B  9016 TROMSØ ','320802 Nordslettvegen 2','3208 Nordslettvegen 1 og 2','320802 Nordslettvegen 2','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Omsorgsbolig','150,00','16650,00','18 500','22.11.2022','','4','True','True','K00017458','010180',' Emmanuel Karasira','Leid'],
			['114613315','Nordslettvegen 2A','Nøkkelboks montert med 1 nøkkel i, kode: 6543.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig','Nordslettvegen 2B  9016 TROMSØ ','320802 Nordslettvegen 2','3208 Nordslettvegen 1 og 2','320802 Nordslettvegen 2','Tromsøya sør','Bolig','','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Rus og Psykiatribolig','150,00','16650,00','18 500','22.11.2022','','4','True','True','K00017458','010180',' Emmanuel Karasira','Leid'],
			['114613173','Uranusvegen 37','Enebolig over 2 plan, med trappefri adkomst fra gateplan. 2 parkeringsplasser utenfor boligen. Møblert med hvitevarer. Ikke tillat med dyr/røyk. Mulighet med oppkobling til internett/tv, leietaker må bestille selv.','Uranusvegen 37  9024 TOMASJORD ','317501 Uranusvegen 37','3175 Uranusvegen 37','317501 Uranusvegen 37','Fastlandet','Bolig','Ukrainabolig','','Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)','Normal','Ingen korreksjon','Komm.bolig','135','20830','26 000','01.04.2022','','6','True','True','K00016729','21038717801','Aviel Hreis','Leid']
		];
	
	const wanted = [koboHeader()];
	for (let i = 0; i < sample.length; i += 1) {
		const a = new Array(wanted[0].length);
		a.fill('');
		wanted.push(a);
	}
	function desire(idx, key, val) {
		wanted[idx][koboIdx[key]] = val;
	}
	desire(1, 'kommunenummer', '5401');
	desire(1, 'bruksenhetsnummer', 'U0102');
	desire(1, 'gatenavn', 'Ishavsvegen');
	desire(1, 'husnummer', '63');
	desire(1, 'postnummer', '9010');
	desire(1, 'ekstrareferanse', 'A');
	desire(1, 'underkategoriboligtype', 'Midlertidig bolig');
	desire(1, 'manedsleie', '13555');
	desire(1, 'ovriginformasjon', 'Leilighet Underetasje sør. Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet');
	
	desire(2, 'kommunenummer', '5401');
	desire(2, 'bruksenhetsnummer', 'U0101');
	desire(2, 'gatenavn', 'Ishavsvegen');
	desire(2, 'husnummer', '63');
	desire(2, 'postnummer', '9010');
	desire(2, 'ekstrareferanse', 'B');
	desire(2, 'manedsleie', '13555');
	desire(2, 'ovriginformasjon', 'Leilighet Underetasje Nord Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet');
	
	desire(3, 'kommunenummer', '5401');
	desire(3, 'bruksenhetsnummer', 'H0202');
	desire(3, 'gatenavn', 'Ishavsvegen');
	desire(3, 'husnummer', '63');
	desire(3, 'postnummer', '9010');
	desire(3, 'ekstrareferanse', 'E');
	desire(3, 'underkategoriboligtype', 'Flyktningebolig');
	desire(3, 'manedsleie', '13555');
	desire(3, 'ovriginformasjon', 'Leilighet 2. etasje Sør Leieareal innehar 1/6 del av fellesareal som utgjør 17 m2 pr leilighet. Egen strøm måler i hver leilighet');
	
	desire(4, 'kommunenummer', '5401');
	desire(4, 'gatenavn', 'Nordslettvegen');
	desire(4, 'husnummer', '2');
	desire(4, 'husbokstav', 'B');
	desire(4, 'postnummer', '9016');
	desire(4, 'underkategoriboligtype', 'Omsorgsbolig');
	desire(4, 'manedsleie', '16650');
	desire(4, 'ovriginformasjon', 'Nøkkelboks montert med 1 nøkkel i, kode: 6543.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig');
	
	desire(5, 'kommunenummer', '5401');
	desire(5, 'gatenavn', 'Nordslettvegen');
	desire(5, 'husnummer', '2');
	desire(5, 'husbokstav', 'A');
	desire(5, 'postnummer', '9016');
	desire(5, 'underkategoriboligtype', 'Rus og Psykiatribolig');
	desire(5, 'manedsleie', '16650');
	desire(5, 'ovriginformasjon', 'Nøkkelboks montert med 1 nøkkel i, kode: 6543.  Eier: Åsgårdmarka Eiendom AS Publicsak 22/17416 Strøm, TV-signal og internett må leietaker selv bestille. Bolig kan ikke benyttes som rus- og psykiatribolig');
	
	desire(6, 'kommunenummer', '5401');
	desire(6, 'gatenavn', 'Uranusvegen');
	desire(6, 'husnummer', '37');
	desire(6, 'postnummer', '9024');
	desire(6, 'manedsleie', '20830');
	desire(6, 'ovriginformasjon', 'Enebolig over 2 plan, med trappefri adkomst fra gateplan. 2 parkeringsplasser utenfor boligen. Møblert med hvitevarer. Ikke tillat med dyr/røyk. Mulighet med oppkobling til internett/tv, leietaker må bestille selv.');
	
	
	const result = [koboHeader()];
	sample.filter((row) => {
			return !ignoreRentable(row);
		}).forEach((row) => {
				
				function read(key) {
					return row[rentableIdx[key]].trim();
				}
				
				const add = new Array(result[0].length);
				add.fill('');
				function write(key, val) {
					add[koboIdx[key]] = val.trim();
				}
				
				applyRentable(read, write);
				result.push(add);
			});
	
	return compareCSV(wanted, result);
}
