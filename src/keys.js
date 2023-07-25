"use strict";

function mapKeys(arr) {
	let out = new Map();
	for (let i = 1; i < arr.length; i += 1) {
		let row = arr[i];
		let name = row[1];
		
		if (out.has(name)) {
			let l = out.get(name);
			if (l.includes(row[0]) == false) {
				l.push(row[0]);
			}
		} else {
			out.set(name, [row[0]]);
		}
	}
	return out;
}

function drawKeys(arr, map, dst) {
	let table = fxcd(dst);
	let row;
	let cell;
	
	axcd(table, newRow(["Seksjonsnummer", "Aktiv", "N\u00F8kkelnummer"], true));
	
	let counter = new Map();
	let out = [arr[0].concat(["N\u00F8klerinos"])];
	for (let r = 1; r < arr.length; r += 1) {
		
		if (map.has(arr[r][0] == false)) {
			row = newRow([arr[r][0], arr[r][1]], false);
			
			cell = xcd("td");
			axcd(cell, txcd(""));
			cell.classList.add("missing");
			axcd(row, cell);
			axcd(table, row);
		} else {
			let l = map.get(arr[r][0]);
			if (isInvalid(l)) {
				continue;
			}
			for (c = 0; c < l.length; c += 1) {
				let c1 = arr[r][0];
				let c2 = arr[r][1];
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
	let name = 'keys';
	let eName = "dataReady";
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
	axcd(con, txcd("N\u00F8kler"));
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
			t.innerHTML = "";
			let spinner = fxcd(name + "-spinner");
			spinner.style.visibility = "visible";
			
			let rentables = fxcd(name + '-rentables-file');
			let rentablesList = null;
			let keys = fxcd(name + '-file');
			let keysList = null;
			
			document.addEventListener(eName, () => {
					let mep = mapKeys(filtered);
					let c = drawKeys(rentablesList, mep, name + "-table");
					
					let btn = fxcd(name + "-download-btn");
					btn.disabled = false;
					btn.onclick = () => { downloadCSV(arrayToCSV(c, ";"), "n\u00F8kler.csv"); };
					
					spinner.style.visibility = "hidden";
				});
			
			let f1 = new FileReader();
			f1.onload = () => { rentablesList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Kategori bolig", "Aktiv", "Utleibar"]); dataReady["count"] -= 1; };
			f1.readAsText(rentables.files[0], "iso-8859-1");
			
			let f2 = new FileReader();
			f2.onload = () => { keysList = arrayColFilter(CSVToArray(f2.result, ";"), ["Nummer", "Seksjonsnr"]); dataReady["count"] -= 1; };
			f2.readAsText(keys.files[0], "iso-8859-1");
			
		}
}