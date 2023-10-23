"use strict";

let ignoreContractsAddition = ["Omsorgstjenesten S\u00F8r\u00F8ya",
		"Enhet for psykisk helse og rus, avdeling Ankeret v/Heidi H\u00F8ie",
		"Enhet for psykisk helse og rus, avdeling B\u00F8lgen",
		"Stiftelsen Kommunale Boliger",
		"Flyktningtjenesten Privatinnleide",
		"Tildelingskontoret"
	];


function overlapHeader(n, firstCol, label) {
	let head = [firstCol];
	for (let i = 1; i <= n; i += 1) {
		head.push(label + " " + i);
	}
	return head;
}

function customerOverlapFilter(arr) {
	
	const defaultBegin = new Date();
	const defaultEnd = new Date();
	defaultBegin.setFullYear(1950);
	defaultEnd.setFullYear(2090);
	
	let l = 2;
	let out = [];
	mapRows(arr, contractIdx['fasilitetsnummer']).forEach((val, key) => {
			
			let k = val.length;
			if (k >= 2) {
				
				for (let i = 0; i < k; i += 1) {
					const rowA = val[i];
					
					const beginA = dateWithDefault(rowA[contractIdx['startdato']], defaultBegin);
					const endA = dateWithDefault(rowA[contractIdx['sluttdato']], defaultEnd);
					
					let add = [key, rowA[contractIdx['løpenummer']]];
					for (let j = i + 1; j < k; j += 1) {
						const rowB = val[j];
						
						const beginB = dateWithDefault(rowB[contractIdx['startdato']], defaultBegin);
						const endB = dateWithDefault(rowB[contractIdx['sluttdato']], defaultEnd);
						
						if (temporalOverlap(beginA, endA, beginB, endB)) {
							add.push(rowB[contractIdx['løpenummer']]);
						}
					}
					let m = add.length - 1;
					if (m > 1) {
						out.push(add);
						if (l < m) {
							l = m;
						}
					}
				}
			}
		});
	
	out.unshift(overlapHeader(l, "Fasilitet", "L\u00F8penummer"));
	
	return out;
}
function rentableOverlapFilter(arr) {
		
	let l = 2;
	let out = [];
	mapRows(arr, rentableIdx['seksjonsnummer']).forEach((val, key) => {
			const k = val.length;
			if (k >= 2) {
			
				let add = [key];
				let s = new Set();
				val.forEach((row) => {
						s.add(row);
					});
				
				if (s.size > l) {
					l = s.size;
				}
				s.forEach((n) => {
						add.push(n[rentableIdx['seksjonsnavn']]);
					});
				out.push(add);
			}
		});
	
	out.unshift(overlapHeader(l, "Nummer", "Navn"));
	
	return out;
}
function contractOverlapFilter(arr) {
	
	const defaultBegin = new Date();
	const defaultEnd = new Date();
	defaultBegin.setFullYear(1950);
	defaultEnd.setFullYear(2090);
	
	let l = 2;
	let out = [];
	mapRows(arr, contractIdx['leietakernummer']).forEach((val, key) => {
			const k = val.length;
			if (k >= 2) {
				
				for (let i = 0; i < k; i += 1) {
					const rowA = val[i];
					
					const beginA = dateWithDefault(rowA[contractIdx['startdato']], defaultBegin);
					const endA = dateWithDefault(rowA[contractIdx['sluttdato']], defaultEnd);
					
					let add = [key, rowA[contractIdx['løpenummer']]];
					for (let j = i + 1; j < k; j += 1) {
						const rowB = val[j];
						
						const beginB = dateWithDefault(rowB[contractIdx['startdato']], defaultBegin);
						const endB = dateWithDefault(rowB[contractIdx['sluttdato']], defaultEnd);
						
						if (temporalOverlap(beginA, endA, beginB, endB)) {
							add.push(rowB[contractIdx['løpenummer']]);
						}
					}
					
					const m = add.length - 1;
					if (m > 1) {
						out.push(add);
						if (l < m) {
							l = m;
						}
					}
				}
			}
		});
	
	out.unshift(overlapHeader(l, "Akt\u00F8rnummer", "L\u00F8penummer"));
	
	return out;
}
function keyOverlapFilter(arr) {
		
	let l = 2;
	let out = [];
	mapRows(arr, keyIdx['hanknummer']).forEach((val, key) => {
			const k = val.length;
			if (k >= 2) {
				
				let add = [key];
				let s = new Set();
				val.forEach((row) => {
						s.add(row[keyIdx['seksjonsnummer']]);
					});
				const m = s.size;
				if (m > 1) {
					if (m > l) {
						l = m;
					}
					s.forEach((n) => {
							add.push(n);
						});
					out.push(add);
				}
			}
		});
	
	out.unshift(overlapHeader(l, "Nummer", "Seksjon"));
	
	return out;
}


function setupCustomerOverlapFilter() {
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target['count'] < 2) {
						fxcd('filter').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	
	let spinner = fxcd("spinner");
	
	let contracts = fxcd('contracts');
	let contractList = null;
	
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f = new FileReader();
			
			f.onload = () => {
				contractList = CSVToArray(f.result, ";");
				ready["count"] -= 1;
			};
			
			f.readAsText(contracts.files[0], "iso-8859-1");
		};
		
	document.addEventListener(eventName, () => {
			let table = fxcd("table");
			table.innerHTML = "";
			
			/*
				map seksjonsnummer -> kontrakter
			*/
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				let pp = contractList[r];
				let key = pp[contractIdx['fasilitetsnummer']];
				if (isInvalid(key)) {
					continue;
				}
				if (mep.has(key) == false) {
					mep.set(key, []);
				}
				mep.get(key).push(pp);
			}
			
			
			let contractMap = new Map();
			for (let r of mep.entries()) {
				
				for (let i = 0; i < r[1].length - 1; i += 1) {
					const c1 = r[1][i];
					const cNum = c1[contractIdx['løpenummer']];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[contractIdx['startdato']], oldest);
					const upper1 = dateWithDefault(c1[contractIdx['sluttdato']], newest);
					
					for (let j = i + 1; j < r[1].length; j += 1) {
						const c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[contractIdx['startdato']], oldest);
						const upper2 = dateWithDefault(c2[contractIdx['sluttdato']], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						if (contractMap.has(r[0]) == false) {
							contractMap.set(r[0], []);
						}
						contractMap.get(r[0]).push([
								c1[contractIdx['løpenummer']],
								c1[contractIdx['leietakernavn']],
								c1[contractIdx['behandlingsstatus']],
								c2[contractIdx['løpenummer']],
								c2[contractIdx['leietakernavn']],
								c2[contractIdx['behandlingsstatus']]
							]);
						break;
					}
				}
			}
			
			
			/*
				tegn og lag array
			*/
			let header = ["Fasilitet", "L\u00F8penummer 1", "Leietaker 1", "Status 1", "L\u00F8penummer 2", "Leietaker 2", "Status 2"];
			let out = [header];
			
			for (let e of contractMap.entries()) {
				for (let e2 of e[1]) {
					let r = [e[0]].concat(e2);
					out.push(r);
				}
			}
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			
			hide(spinner);
		});
	
}


function setupRentableOverlapFilter() {
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target['count'] < 2) {
						fxcd('calc').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	
	let spinner = fxcd("spinner");
	
	let rentables = fxcd("rentables");
	let rentablesList = null;
	
	rentables.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd("table");
			table.innerHTML = "";
			
			/*
				map seksjonsnummer -> liste over seksjoner
			*/
			let mep = new Map();
			for (let r = 1; r < rentablesList.length; r += 1) {
				const pp = rentablesList[r];
				const idx = rentableIdx['seksjonsnummer'];
				if (mep.has(pp[idx]) == false) {
					mep.set(pp[idx], []);
				}
				mep.get(pp[idx]).push(pp[rentableIdx['seksjonsnummer']]);
			}
			
			
			/*
				tegn og lag array
			*/
			let header = ["Seksjonsnummer", "Seksjonsnavn"];
			let out = [header];
			
			for (let e of mep.entries()) {
				if (e[1].length < 2) {
					continue;
				}
				out.push([e[0]].concat(e[1]));
			}
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende seksjoner");
			
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f = new FileReader();
			
			f.onload = () => {
					rentablesList = CSVToArray(f.result, ";");
					ready["count"] -= 1;
				};
			
			f.readAsText(rentables.files[0], "iso-8859-1");
		};
}


function setupContractOverlapFilter() {
	
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target['count'] < 2) {
						fxcd('filter').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	let i = fxcd("ignore-list");
	axcd(i, listTag("Passiv"));
	for (let e of ignoreContracts.concat(ignoreContractsAddition)) {
		axcd(i, listTag(e));
	}
	
	let spinner = fxcd("spinner");
	
	let contracts = fxcd('contracts');
	let contractList = null;
	
	contracts.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd("table");
			table.innerHTML = "";
			
			/*
				map leietakernummer -> liste over kontrakter
			*/
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				const pp = contractList[r];
				if (isInvalid(pp[contractIdx['fasilitetsnummer']]) 		//	fasilitetsnummer
						|| isInvalid(pp[contractIdx['reskontronummer']]) //	reskontronummer
						|| isInvalid(pp[contractIdx['leietakernummer']]) //	leietakernummer
						|| isInvalid(pp[contractIdx['leietakernavn']]) //	leietakernavn
						|| (ignoreContracts.concat(ignoreContractsAddition).includes(pp[contractIdx['leietakernavn']]) == true)) {
					continue;
				}
				if (mep.has(pp[contractIdx['leietakernummer']]) == false) {
					mep.set(pp[contractIdx['leietakernummer']], []);
				}
				mep.get(pp[contractIdx['leietakernummer']]).push(pp);
			}
			
			
			let contractMap = new Map();
			for (let r of mep.entries()) {
				
				for (let i = 0; i < r[1].length - 1; i += 1) {
					const c1 = r[1][i];
					const cNum = c1[contractIdx['løpenummer']];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[contractIdx['startdato']], oldest);
					const upper1 = dateWithDefault(c1[contractIdx['sluttdato']], newest);
					
					for (let j = i + 1; j < r[1].length; j += 1) {
						const c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[contractIdx['startdato']], oldest);
						const upper2 = dateWithDefault(c2[contractIdx['sluttdato']], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						if (contractMap.has(r[0]) == false) {
							contractMap.set(r[0], []);
						}
						contractMap.get(r[0]).push([
								c1[contractIdx['leietakernavn']],
								c1[contractIdx['fasilitetsnummer']],
								c1[contractIdx['behandlingsstatus']],
								c2[contractIdx['fasilitetsnummer']],
								c2[contractIdx['behandlingsstatus']]
							]);
						break;
					}
				}
			}
			
			let header = ["Akt\u00F8rnummer", "Akt\u00F8rnavn", "Fasilitet 1", "Status 1", "Fasilitet 2",  "Status 2"];
			let out = [header];
			
			for (let e of contractMap.entries()) {
				for (let e2 of e[1]) {
					let r = [e[0]].concat(e2);
					out.push(r);
				}
			}
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f = new FileReader();
			
			f.onload = () => {
					contractList = CSVToArray(f.result, ";");
					ready["count"] -= 1;
				};
			
			f.readAsText(contracts.files[0], "iso-8859-1");
		};
}

function setupKeyOverlapFilter() {
	
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target['count'] < 2) {
						fxcd('filter').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	let spinner = fxcd("spinner");
	
	let keys = fxcd('keys');
	let keyList = null;
	
	keys.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, keyOverlapFilter(keyList), "nøkler i flere seksjoner");
			
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f = new FileReader();
			
			f.onload = () => {
					keyList = CSVToArray(f.result, ";");
					ready["count"] -= 1;
				};
			
			f.readAsText(keys.files[0], "iso-8859-1");
		};
}

function unitTest() {
	if (customerOverlapTest()) {
		xc("customer overlap failed");
		return true;
	}
	if (rentableOverlapTest()) {
		xc("rentable overlap failed");
		return true;
	}
	if (contractOverlapTest()) {
		xc("contract overlap failed");
		return true;
	}
	if (keyOverlapTest()) {
		xc("key overlap failed");
		return true;
	}
	return false;
}

function customerOverlapTest() {
	let sample = [
			["Løpenummer", "Overskrift", "Ekstern ID", "Leietaker", "Nummer", "Reskontronr", "Saksbehandler", "Fra", "Til", "Sum", "Kontrakt utgår", "Regulering", "Gjengs regulering", "Fasilitetsnummer", "Fasilitet", "Eiendomsnr", "Eiendomsnavn", "Byggnr", "Byggnavn", "Kontrakttype", "Fakturatype", "Mengde", "Faktura fra", "Fakturareferanse", "E-handel faktura", "Behandlingsstatus", "Sikkerhetstype", "Sikkerhetsbeløp", "Prisperiode", "Faktureringstermin", "Terminstart", "MVA-pliktig", "Merknad", "Seksjonstype"],
			["K00006431", "Kontrakt for Arnt Barnt", "", "Arnt Barnt", 		"7037141563", "244898", "", "01.01.2008", "", "9636,86", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Sørslettveien 10 H 0202", "1180", "Åsgård", "118005", "Åsgård Sørslettveien 10", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006432", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", 						"21016729768", "236676", "", "01.01.2008", "01.01.2013", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Fjørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Fjørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006433", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", 						"21016729768", "236676", "", "01.01.2012", "", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Fjørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Fjørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006438", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", 						"21016729768", "236676", "", "01.01.2016", "01.01.2020", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620028", "24979620028 Sørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Sørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006441", "Kontrakt for Kine Trampoline", "", "Kine Trampoline", 					"1118047547", "239119", "", "01.01.2011", "01.02.2013", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620017", "24979620017 Lars Eriksens vei 20 H 0102", "1180", "Åsgård", "118002", "Åsgård Lars Eriksens vei 20", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006442", "Kontrakt for Kine Trampoline", "", "Kine Trampoline", 					"1118047547", "239119", "", "01.01.2008", "", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620017", "24979620017 Lars Eriksens vei 20 H 0102", "1180", "Åsgård", "118002", "Åsgård Lars Eriksens vei 20", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"]
		];
	//	Gategata 8 har flere kontrakter samtidig
	let wanted = [
			["Fasilitet", "L\u00F8penummer 1", "L\u00F8penummer 2", "L\u00F8penummer 3"],
			["24979620037", "K00006431", "K00006432", "K00006433"],
			["24979620037", "K00006432", "K00006433"],
			["24979620017", "K00006441", "K00006442"]
		];
	
	return compareCSV(customerOverlapFilter(sample), wanted);
}

function rentableOverlapTest() {
	let sample = [
			["Nummer", "Navn", "Merknad", "Adresse", "Fasilitet", "Eiendom", "Bygning", "Region", "Kategori bolig", "Formål", "Status utleie", "Plassering", "Standard", "Korreksjonsfaktorer", "Seksjonstype", "Mengde", "Sum", "Anskaffelsespris", "Anskaffet dato", "SSB nummer", "Antall rom", "Aktiv", "Utleibar", "Løpenummer", "Leietaker nummer", "Leietaker", "Eierform"],
			["24100610114", "Sørslettvegen 3 - Underetasje", "Leilighet i Underetasje med egen inngang på nedsiden av huset. Består av Gang, Vaskerom, Bad, Wc i eget rom ved kjøkken/stue, Kjøkken/stue og soverom. samt en gang mellom rommene.  Brannsentral for hele huset er i hovedinngang i H0101. Sikringsskap for hele huset inklusive underetasje er i mellomgang i H0101. Stoppekran Vann: ? Overrislingsanlegg - 'sprinkling' montert ok? Brannslukkere montert i boligen?  Andre etasje er stengt av med en vegg med låst dør i. Trappedør må Tjenesten få nøkkel til for å kunne nå til sikringsskap og Brannsentral! Søppel samlekontainer på øvre side av huset. Postkasse på vegg ved hovedinngang til huset.  Boligen benyttes for spesielt behov Psykiatri  Utleiepris er basert på areal for leiligheten. Strøm som er inkludert i husleien er basert på redusert areal pga. stor gang og vaskerom. Her er strøm ut fra 50 M2 ", "Sørslettvegen 3  U0101  9016 TROMSØ ", "118007 Åsgård Sørslettvegen 3", "1180 Åsgård", "118007 Åsgård Sørslettvegen 3", "", "Bolig", "", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Normal", "Billigere (Upraktisk løsning ...)", "Rus og Psykiatribolig", "64,00", "11247,00", "", "24.01.2020", "", "2", "True", "True", "K00016564", "14116645069", "Jan Pølse Skinkerud", "Leid"],
			["24100610115", "Sørslettvegen 3, H0101", "Hovedleilighet skal ikke tas i bruk i 2021  Boligen har en frittstående Garasje på nordsiden av huset Brannsentral for hele huset er i hovedinngang i H0101. Sikringsskap for hele huset inklusive underetasje er i mellomgang i H0101. Stoppekran Vannforsyning ?", "Sørslettvegen 3  Hooved etasje  H0101  9016 TROMSØ ", "118007 Åsgård Sørslettvegen 3", "1180 Åsgård", "118007 Åsgård Sørslettvegen 3", "", "Bolig", "", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Lav", "Ingen korreksjon", "Rus og Psykiatribolig", "90,00", "8723,20", "", "24.12.2019", "", "2", "True", "True", "K00016565", "K00012595", "Passiv", "Leid"],
			["24979620028", "Sørslettveien 8 U 0101", "", "Sørslettveien 8  U 0101  9016 TROMSØ ", "118006 Åsgård Sørslettveien 8", "1180 Åsgård", "118006 Åsgård Sørslettveien 8", "", "Bolig", "", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Normal", "Ingen korreksjon", "Rus og Psykiatribolig", "58,20", "9691,00", "", "", "", "2", "True", "True", "K00006433", "21016729768", "Kjell Trell Trafikkuhell", "Leid - Driftet"],
			["24979620030", "Sørslettveien 8 H 0201", "", "Sørslettveien 8  H 0201  9016 TROMSØ ", "118006 Åsgård Sørslettveien 8", "1180 Åsgård", "118006 Åsgård Sørslettveien 8", "", "Bolig", "", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Normal", "Ingen korreksjon", "Rus og Psykiatribolig", "58,30", "9696,00", "", "", "", "2", "True", "True", "K00006331", "07106638432", "Fredrik Puddingsen", "Leid - Driftet"],
			["24979620031", "Sørslettveien 8 H 0202", "", "Sørslettveien 8  H 0202  9016 TROMSØ ", "118006 Åsgård Sørslettveien 8", "1180 Åsgård", "118006 Åsgård Sørslettveien 8", "", "Bolig", "", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Normal", "Ingen korreksjon", "Rus og Psykiatribolig", "58,30", "9696,00", "", "", "", "2", "True", "True", "K00007545", "31125545206", "Kari Kanon", "Leid - Driftet"],
			["24979620028", "Lars Eriksens veg 17, H0201", "Leilighetsnr. 56. Felles trapperom. Brannslange, i gang utenfor boenhet. Vaskemaskin montert på kjøkken. Utvendig postkasse merket med leilighetsnr. Stor bod i kjeller merket med leilighetsnr. Kodelås på ytterdør og egen nøkkel til leilighet. Mulighet for parkering gjennom Tromsø Parkering.", "Lars Eriksens veg 17, H0201  9016 TROMSØ ", "117702 Lars Eriksens veg 17", "1177 Lars Eriksens veg", "117702 Lars Eriksens veg 17", "Tromsøya sør", "Bolig", "Ukrainabolig", "", "Tromsøya (minus Hamna), Tromsdalen (Tomasjordnes - Solligården)", "Normal", "Ingen korreksjon", "Flyktningebolig", "32,00", "9900,00", "", "01.11.2022", "", "2", "True", "True", "K00017044", "08030383509", "Julis Kaviartuben", "Leid", ]
		];
	//	seksjonnummer 42069 har to addresser
	let wanted = [
			["Nummer", "Navn 1", "Navn 2"],
			["24979620028", "Sørslettveien 8 U 0101", "Lars Eriksens veg 17, H0201"]
		];
	
	return compareCSV(rentableOverlapFilter(sample), wanted);
}

function contractOverlapTest() {
	let sample = [
			["Løpenummer", "Overskrift", "Ekstern ID", "Leietaker", "Nummer", "Reskontronr", "Saksbehandler", "Fra", "Til", "Sum", "Kontrakt utgår", "Regulering", "Gjengs regulering", "Fasilitetsnummer", "Fasilitet", "Eiendomsnr", "Eiendomsnavn", "Byggnr", "Byggnavn", "Kontrakttype", "Fakturatype", "Mengde", "Faktura fra", "Fakturareferanse", "E-handel faktura", "Behandlingsstatus", "Sikkerhetstype", "Sikkerhetsbeløp", "Prisperiode", "Faktureringstermin", "Terminstart", "MVA-pliktig", "Merknad", "Seksjonstype"],
			["K00006430", "Kontrakt for Arnt Barnt", "", "Arnt Barnt", "7037141563", "244898", "", "01.01.2008", "", "9636,86", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Sørslettveien 10 H 0202", "1180", "Åsgård", "118005", "Åsgård Sørslettveien 10", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006431", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", "21016729768", "236676", "", 		"01.01.2008", "", "9636,86", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Sørslettveien 10 H 0202", "1180", "Åsgård", "118005", "Åsgård Sørslettveien 10", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006432", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", "21016729768", "236676", "", 		"01.01.2008", "01.01.2012", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Fjørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Fjørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006433", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", "21016729768", "236676", "", 		"01.01.2013", "", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620037", "24979620037 Fjørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Fjørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006438", "Kontrakt for Kjell Trell Trafikkuhell", "", "Kjell Trell Trafikkuhell", "21016729768", "236676", "", 		"01.01.2016", "01.01.2020", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620028", "24979620028 Sørslettveien 8 U 0101", "1180", "Åsgård", "118006", "Åsgård Sørslettveien 8", "", "Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"],
			["K00006442", "Kontrakt for Kine Trampoline", "", "Kine Trampoline", "1118047547", "239119", "", 	"01.01.2008", "", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24979620017", "24979620017 Lars Eriksens vei 20 H 0102", "1180", "Åsgård", "118002", "Åsgård Lars Eriksens vei 20", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"]
		];
	//	bjørnar har flere kontrakter samtidig
	let wanted = [
			["Akt\u00F8rnummer", "L\u00F8penummer 1", "L\u00F8penummer 2", "L\u00F8penummer 3", "L\u00F8penummer 4"],
			["21016729768", "K00006431", "K00006432", "K00006433", "K00006438"],
			["21016729768", "K00006433", "K00006438"]
		];
	
	return compareCSV(contractOverlapFilter(sample), wanted);
}

function keyOverlapTest() {
	let sample = [
			["Nummer", "Navn", "Systemnr", "Antall nøkler", "Merknad", "Eiendomsnr", "Eiendomsnavn", "Bygningsnr", "Bygningsnavn", "Seksjonsnr", "Seksjonsnavn"],			
			["546", "Gategata 8 - Mellomdør til Underetasjen", "", "2", "SKAL IKKE UTLEVERES LEIETAKER", "1180", "Åsgård", "118007", "Gategata 8", "24100610135", "Sørslettvegen 3, H0101"],
			["546", "Sørslettvegen 3 - H0101 Reservenøkler ", "", "4", "Nøkler til hybel ved bad hovedetasjen Skal ikke utleveres", "1180", "Åsgård", "118007", "Åsgård Sørslettvegen 3", "24100610115", "Sørslettvegen 3, H0101"],
			["546", "Sørslettvegen 3 - H0101 Ytterdør", "", "4", "Hovedinngang ", "1180", "Åsgård", "118007", "Åsgård Sørslettvegen 3", "24100610115", "Sørslettvegen 3, H0101"],
			["547", "Vågvegn 21B - Leilighet", "Trioving nye ", "6", "5 i skap 18.04.23 EJH. Oppdater antall ved innlevering", "3094", "Solåsen Boligsameie - Org. 980379558", "309401", "Vågvegen 21 B", "14100616354", "Vågvegen 21 B"],
			["548", "Post - Vestregata 15, Leilighet 442, H0408", "", "4", "2 i skap 18.04.23 EJH. Oppdater antall ved innlevering", "1073", "Vestregata Heracleum", "107302", "Vestregata 9/15 Heracleum", "114611217", "Vestregata 15, Leilighet 442, H0408"],
			["548", "Vestregata 15, Leilighet 442, H0408", "XL72011 K75", "6", "3 i skap 18.04.23 EJH. Oppdater antall ved innlevering", "1073", "Vestregata Heracleum", "107302", "Vestregata 9/15 Heracleum", "114611217", "Vestregata 15, Leilighet 442, H0408"]
		];
	//	nøkkelhank nummer 546 tilhører flere seksjoner
	let wanted = [
			["Nummer", "Seksjon 1", "Seksjon 2"],
			["546", "24100610135", "24100610115"]
		];
	
	return compareCSV(wanted, keyOverlapFilter(sample));
}