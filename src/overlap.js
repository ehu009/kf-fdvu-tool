"use strict";

let ignoreContractsAddition = ["Omsorgstjenesten S\u00F8r\u00F8ya",
		"Enhet for psykisk helse og rus, avdeling Ankeret v/Heidi H\u00F8ie",
		"Enhet for psykisk helse og rus, avdeling Bølgen",
		"Stiftelsen Kommunale Boliger",
		"Flyktningtjenesten Privatinnleide",
		"Tildelingskontoret"
	];


function setupCustomerOverlapFilter() {
	const name = 'overlap';
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['count'] < 2) {
						fxcd(name + '-calc-btn').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	let con = xcd("h2");
	axcd(con, txcd("Seksjoner med overlappende kontrakter"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		let i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
	
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	fxcd(name + "-calc-btn").onclick = () => {
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
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			/*
				map seksjonsnummer -> kontrakter
			*/
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				let pp = contractList[r];
				let key = pp[13];
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
					const cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[7], oldest);
					const upper1 = dateWithDefault(c1[8], newest);
					
					for (let j = i + 1; j < r[1].length; j += 1) {
						const c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[7], oldest);
						const upper2 = dateWithDefault(c2[8], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						if (contractMap.has(r[0]) == false) {
							contractMap.set(r[0], []);
						}
						contractMap.get(r[0]).push([c1[0], c1[3], c1[25], c2[0], c2[3], c2[25]]);
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
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			hide(spinner);
		});	
	
}

function setupContractOverlapFilter() {
	const name = 'overlap';
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['count'] < 2) {
						fxcd(name + '-calc-btn').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
		
	let con = xcd("h2");
	axcd(con, txcd("Akt\u00F8rer med samtidige kontrakter i flere seksjoner"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		let i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		defaultButtonTags(name);
		addLine(con);
		addLine(con);
		
		axcd(con, txcd("Ignorerer kontrakter der leietaker heter en av f\u00F8lgende:"));
		
		i = xcd("ul");
		for (let e of ignoreContracts.concat(ignoreContractsAddition)) {
			axcd(i, listTag(e));
		}
		axcd(con, i);
		
		addLine(con);
		axcd(con, xcd("hr"));
	
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	contracts.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			/*
				map leietakernummer -> liste over kontrakter
			*/
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				const pp = contractList[r];
				if (isInvalid(pp[13]) 		//	fasilitetsnummer
						|| isInvalid(pp[5]) //	reskontronummer
						|| isInvalid(pp[4]) //	leietakernummer
						|| isInvalid(pp[3]) //	leietakernavn
						|| (ignoreContracts.concat(ignoreContractsAddition).includes(pp[3]) == true)) {
					continue;
				}
				if (mep.has(pp[4]) == false) {
					mep.set(pp[4], []);
				}
				mep.get(pp[4]).push(pp);
			}
			
			let contractMap = new Map();
			for (let r of mep.entries()) {
				
				for (let i = 0; i < r[1].length - 1; i += 1) {
					const c1 = r[1][i];
					const cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[7], oldest);
					const upper1 = dateWithDefault(c1[8], newest);
					
					for (let j = i + 1; j < r[1].length; j += 1) {
						const c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[7], oldest);
						const upper2 = dateWithDefault(c2[8], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						if (contractMap.has(r[0]) == false) {
							contractMap.set(r[0], []);
						}
						contractMap.get(r[0]).push([c1[3], c1[13], c1[25], c2[13], c2[25]]);
						break;
					}
				}
			}
			
			let header = ["Akt\u00F8rnummer", "Aktørnavn", "Fasilitet 1", "Status 1", "Fasilitet 2",  "Status 2"];
			let out = [header];
			axcd(table, newRow(header, true, ""));
			
			for (let e of contractMap.entries()) {
				for (let e2 of e[1]) {
					let r = [e[0]].concat(e2);
					out.push(r);
					axcd(table, newRow(r, false, ""));
				}
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			
			hide(spinner);
		});	
	fxcd(name + "-calc-btn").onclick = () => {
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
	const name = 'overlap';
	
	const eventName = "dataReady";
	let readyTarget = {
			count: 2,
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['count'] < 2) {
						fxcd(name + '-calc-btn').disabled = false;
						if (target["count"] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
		
	let con = xcd("h2");
	axcd(con, txcd("Seksjoner med samme seksjonsnummer"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		axcd(con, txcd("Liste over alle seksjoner:"));
		addLine(con);
		
		let i = fileInputTag(name + "-rentables-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		defaultButtonTags(name);
		addLine(con);
		addLine(con);
		
		axcd(con, xcd("hr"));
	
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let rentables = fxcd(name + '-rentables-file');
	let rentablesList = null;
	
	rentables.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["count"] -= 1;
			} else {
				ready["count"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			/*
				map leietakernummer -> liste over kontrakter
			*/
			let mep = new Map();
			for (let r = 1; r < rentablesList.length; r += 1) {
				const pp = rentablesList[r];
				if (mep.has(pp[0]) == false) {
					mep.set(pp[0], []);
				}
				mep.get(pp[0]).push(pp[1]);
			}
			
			
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
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende seksjoner");
			
			hide(spinner);
		});	
	fxcd(name + "-calc-btn").onclick = () => {
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