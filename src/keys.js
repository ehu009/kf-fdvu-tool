"use strict";


function mapKeys(arr) {
	let out = new Map();
	for (let i = 1; i < arr.length; i += 1) {
		const row = arr[i];
		const key = row[keyIdx['seksjonsnummer']];
		const val = row[keyIdx['hanknummer']];
		if (out.has(key) == false) {
			out.set(key, [val]);
		}
		let l = out.get(key);
		if (l.includes(val) == false) {
			l.push(val);
		}
	}
	return out;
}


function drawKeys(arr, map, dst) {
	let table = fxcd(dst);
	let row;
	let cell;
	table.innerHTML = "";
	axcd(table, newRow(["Seksjonsnummer", "Seksjonsnavn", "N\u00F8kkelnummer"], true));
	
	let counter = new Map();
	let out = [arr[0].concat(["N\u00F8klerinos"])];
	for (let r = 1; r < arr.length; r += 1) {
		
		let rentableNumber = arr[r][rentableIdx['seksjonsnummer']];
		if (map.has(rentableNumber) == false) {
			row = newRow([rentableNumber, arr[r][rentableIdx['seksjonsnavn']]], false);
			
			cell = xcd("td");
			axcd(cell, txcd(""));
			cell.classList.add("missing");
			axcd(row, cell);
			axcd(table, row);
		} else {
			const l = map.get(rentableNumber);
			if (isInvalid(l)) {
				continue;
			}
			for (let c = 0; c < l.length; c += 1) {
				let c1 = rentableNumber;
				let c2 = arr[r][rentableIdx['seksjonsnavn']];
				if (c > 0) {
					c1 = "";
					c2 = "";
				}
				if (counter.has(l[c]) == false) {
					counter.set(l[c], true);
				}
				row = newRow([c1, c2, l[c]], false);
				axcd(table, row);
			}
			out.push(arr[r].concat(l));
		}
	}
	return out;
}

function setupKeyFilter() {
	const name = 'keys';
	const eName = "dataReady";
	let dataReadyTarget = {
			fileA: 1,
			fileB: 1,
			count: 2
		};
	
	const dataReadyEvent = new Event(eName);
	let dataReady = new Proxy(dataReadyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					if (target["fileA"] <= 0 && target["fileB"] <= 0) {
						fxcd(name + "-calc-btn").disabled = false;
					} else {
						fxcd(name + "-calc-btn").disabled = true;
					}
					if (target["count"] <= 0) {
						target["count"] = 0;
						document.dispatchEvent(dataReadyEvent);
					}
					return true;
				}
		});
	
	let con = xcd("h2");
	axcd(con, txcd("Filtrer n\u00F8kler basert p\u00E5 seksjon"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		rentablesText(name + "-container");
		addLine(con);
		let i = fileInputTag(name + "-rentables-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		keysText(name + "-container");
		addLine(con);
	
		i = fileInputTag(name + "-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		/*
		let t;
		{
			t = name+"-radio-all";
			i = radioButtonTag(t, "key-radio", "key-radio-list-all", true);
			axcd(con, i);
			i = labelTag(t, "List alle");
			axcd(con, i);
			addLine(con);
			i.onclick = () => {
				let r = fxcd(name+"-radio-all");
				r.checked = true;
			}
			
			t = name+"-radio-dupes";
			i = radioButtonTag(t, "key-radio", "key-radio-list-dupes", false);
			axcd(con, i);
			i = labelTag(t, "Tilh\u00F8rer flere seksjoner");
			axcd(con, i);
			addLine(con);
			i.onclick = () => {
				let r = fxcd(name+"-radio-dupes");
				r.checked = true;
			}
			
			t = name+"-radio-inactive";
			i = radioButtonTag(t, "key-radio", "key-radio-list-inactive", false);
			axcd(con, i);
			i = labelTag(t, "Tilh\u00F8rer inaktive boliger");
			axcd(con, i);
			addLine(con);
			i.onclick = () => {
				let r = fxcd(name+"-radio-inactive");
				r.checked = true;
			}
		}*/
		
		
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
		i = xcd("table");
		i.id = name + "-table";
		axcd(con, i);
	}
	
	fxcd(name + "-rentables-file").onchange = (evt) => {
			if (evt.target.files.length < 1) {
				dataReady["fileB"] += 1;
			} else {
				dataReady["fileB"] -= 1;
			}
		};
	fxcd(name + "-file").onchange = (evt) => {
			if (evt.target.files.length < 1) {
				dataReady["fileA"] += 1;
			} else {
				dataReady["fileA"] -= 1;
			}
		};
	
	fxcd(name + "-calc-btn").onclick = () => {
			let spinner = fxcd(name + "-spinner");
			show(spinner);
			
			let rentables = fxcd(name + '-rentables-file');
			let rentablesList = null;
			let keys = fxcd(name + '-file');
			let keysList = null;
			
			document.addEventListener(eName, () => {
					let mep;
					
					/*
					// finn filtreringsmodus
					let opt = 0; // anta feil
					opt += fxcd(name + "-radio-all").checked * 1;
					opt += fxcd(name + "-radio-dupes").checked * 2;
					opt += fxcd(name + "-radio-inactive").checked * 4;
					*/
					
					let fname = "n\u00F8kler - filtrert";
					
					let c;
					/*
					switch (opt) {
						
						case 1:*/
						mep = mapKeys(keysList);
						c = drawKeys(rentablesList, mep, name + "-table");
						/*
						break;
						
						case 2:
						fname += " duplikater";
						
						break;
						
						case 4:
						fname += " inaktive";
						
						break;
					}*/
					let btn = fxcd(name + "-download-btn");
					btn.disabled = false;
					downloadButton(btn, c, fname);
					hide(spinner);
				});
			
			let f1 = new FileReader();
			f1.onload = () => {
					rentablesList = CSVToArray(f1.result, ";");
					CSVRemoveBlanks(rentablesList);
					dataReady["count"] -= 1;
				};
			f1.readAsText(rentables.files[0], "iso-8859-1");
			
			let f2 = new FileReader();
			f2.onload = () => {
					keysList = CSVToArray(f2.result, ";");
					CSVRemoveBlanks(keysList);
					dataReady["count"] -= 1;
				};
			f2.readAsText(keys.files[0], "iso-8859-1");
			
		};
}