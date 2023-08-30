"use strict";

function setupCustomerOverlapFilter() {
	const name = 'overlap';
	
	const eventName = "dataReady";
	let readyTarget = {
			countB: 1,
			dateA: 1,
			dateB: 1,
			fileB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['fileB'] < 1) {
						fxcd(name + '-calc-btn').disabled = false;
					}
					
					if (target["countB"] < 1) {
						document.dispatchEvent(readyEvent);
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
				ready["fileB"] -= 1;
			} else {
				ready["fileB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				let pp = contractList[r];
				if ((pp[13] == undefined) || (ignoreContracts.includes(pp[3]) == true)) {
					continue;
				}
				if (mep.has(pp[13]) == false) {
					mep.set(pp[13], []);
				}
				mep.get(pp[13]).push(pp);
			}
			
			let out = [];
			for (let r of mep.entries()) {
				let hoink = false;
				for (let i = 0; i < r[1].length; i += 1) {
					const c1 = r[1][i];
					const cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[7], oldest);
					const upper1 = dateWithDefault(c1[8], newest);
					
					for (let j = i; j < r[1].length; j += 1) {
						const c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[7], oldest);
						const upper2 = dateWithDefault(c2[8], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						hoink = true;
						out.push(r[0]);
						break;
					}
					if (hoink == true) {
						break;
					}
				}
			}

			for (let e of out) {
				axcd(table, newRow([e], false, ""));
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende aktører");
			//btn.onclick = () => { downloadCSV(arrayToCSV(out,";"), "overlappende aktører.csv"); };
			hide(spinner);
		});	
	fxcd(name + "-calc-btn").onclick = () => {
			show(spinner);
			let f2 = new FileReader();
			f2.onload = () => { contractList = CSVToArray(f2.result, ";"); ready["countB"] -= 1; };
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}

function setupRentableOverlapFilter() {
	const name = 'overlap';
	
	const eventName = "dataReady";
	let readyTarget = {
			countB: 1,
			dateA: 1,
			dateB: 1,
			fileB: 1
		};
		
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['fileB'] < 1) {
						fxcd(name + '-calc-btn').disabled = false;
					}
					
					if (target["countB"] < 1) {
						document.dispatchEvent(readyEvent);
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
				ready["fileB"] -= 1;
			} else {
				ready["fileB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				const pp = contractList[r];
				if (isInvalid(pp[13])
						|| isInvalid(pp[5])
						|| isInvalid(pp[4])
						|| isInvalid(pp[3])
						|| (ignoreContracts.includes(pp[2]) == true)) {
					continue;
				}
				if (mep.has(pp[4]) == false) {
					mep.set(pp[4], []);
				}
				mep.get(pp[4]).push(pp);
			}
			
			let out = [];
			for (let r of mep.entries()) {
				let hoink = false;
				if (r[1].length < 2) {
					continue;
				}
				let occ = [];
				for (let i = 0; i < r[1].length; i += 1) {
					occ.push(0);
				}
				
				for (let i = 0; i < r[1].length; i += 1) {
					const c1 = r[1][i];
					const cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					const lower1 = dateWithDefault(c1[7], oldest);
					const upper1 = dateWithDefault(c1[8], newest);
					if (lower1 == upper1) {
						continue;
					}
					for (let j = i+1; j < r[1].length; j += 1) {
						let c2 = r[1][j];
						
						const lower2 = dateWithDefault(c2[7], oldest);
						const upper2 = dateWithDefault(c2[8], newest);
						if (lower2 == upper2) {
							continue;
						}
						if (upper1 <= lower2 || lower1 >= upper2) {
							continue;
						}
						
						occ[i] += 1;
						occ[j] += 1;
					}
				}
				
				let row = [];
				for (let i = 0; i < r[1].length; i += 1) {
					if (occ[i] > 0) {
						row.push(r[1][i]);
					}
				}
				out.push(row);
			}
			axcd(table, newRow(["Akt\u00F8r", "Seksjon", "Fra", "Til"], true, ""));
			
			for (let e of out) {
				
				for (let row = 0; row < e.length; row += 1) {
					const r = e[row];
					let ll = [r[4], r[13], r[7], r[8]];
					if (row > 0) {
						ll[0] = "";
					}
					if (r[7] == undefined) {
						ll[2] = "-";
					}
					if (r[8] == undefined) {
						ll[3] = "-";
					}
					axcd(table, newRow(ll, false, ""));
				}
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende kontrakter");
			//btn.onclick = () => { downloadCSV(arrayToCSV(out,";"), "overlappende kontrakter.csv"); };
			
			hide(spinner);
		});	
	fxcd(name + "-calc-btn").onclick = () => {
			show(spinner);
			let f2 = new FileReader();
			f2.onload = () => { contractList = CSVToArray(f2.result, ";"); ready["countB"] -= 1; };
			
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}
	