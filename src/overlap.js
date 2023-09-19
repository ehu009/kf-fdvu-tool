"use strict";

let ignoreContractsAddition = ["Omsorgstjenesten S\u00F8r\u00F8ya",
		"Enhet for psykisk helse og rus, avdeling Ankeret v/Heidi H\u00F8ie",
		"Enhet for psykisk helse og rus, avdeling B\u00F8lgen",
		"Stiftelsen Kommunale Boliger",
		"Flyktningtjenesten Privatinnleide",
		"Tildelingskontoret"
	];


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
			let f2 = new FileReader();
			f2.onload = () => {
				contractList = CSVToArray(f2.result, ";");
				CSVRemoveBlanks(contractList);
				ready["count"] -= 1;
			};
			f2.readAsText(contracts.files[0], "iso-8859-1");
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
			axcd(table, newRow(header, true, ""));
			
			for (let e of contractMap.entries()) {
				for (let e2 of e[1]) {
					let r = [e[0]].concat(e2);
					out.push(r);
					axcd(table, newRow(r, false, ""));
				}
			}
			
			show(fxcd("table-container"));
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			hide(spinner);
		});	
	
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
		
		
	{
		
		let i = fxcd("ignore-list");
		for (let e of ignoreContracts.concat(ignoreContractsAddition)) {
			axcd(i, listTag(e));
		}
		
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
			axcd(table, newRow(header, true, ""));
			
			for (let e of contractMap.entries()) {
				for (let e2 of e[1]) {
					let r = [e[0]].concat(e2);
					out.push(r);
					axcd(table, newRow(r, false, ""));
				}
			}
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			
			show(fxcd("table-container"));
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			let f2 = new FileReader();
			f2.onload = () => {
					contractList = CSVToArray(f2.result, ";");
					CSVRemoveBlanks(contractList);
					ready["count"] -= 1;
				};
			
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
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
			axcd(table, newRow(header, true, ""));
			
			for (let e of mep.entries()) {
				if (e[1].length < 2) {
					continue;
				}
				out.push([e[0]].concat(e[1]));
				let r = xcd("tr");
				let d = xcd("td");
				axcd(d, txcd(e[0]));
				axcd(r, d);
				d = xcd("td");
				for (let r of e[1]) {
					axcd(d, txcd(r));
					addLine(d);
				}
				axcd(r, d);
				axcd(table, r);
			}
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende seksjoner");
			
			show(fxcd("table-container"));
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			let f2 = new FileReader();
			f2.onload = () => {
					rentablesList = CSVToArray(f2.result, ";");
					CSVRemoveBlanks(rentablesList);
					ready["count"] -= 1;
				};
			
			f2.readAsText(rentables.files[0], "iso-8859-1");
		};
}