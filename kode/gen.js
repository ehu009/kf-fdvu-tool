
function dateToFVDUDate (date) {
	let arr = date.split("-");
	return arr.reverse().join(".");
}
function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
}
function parseDate(s) {
	let arr = s.split(".");
	return new Date(arr.reverse());
}
function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
}
function numToFDVUNum(n) {
	let u = String(n);
	return u.replace(".", ",");
}

function setupColumnFilter(name) {
	let c = fxcd(name + "-container");
	{
		let f = xcd("input");
		f.type = "file";
		f.id = name + "-file";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		f = xcd("form");
		let l = labelTag("remove-option", "Filtrer bort");
		axcd(f, radioButtonTag("remove-option", "radio-val", "remove", true));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = function () {
				toggleCheckbox("remove-option");
			};
		
		l = labelTag("keep-option", "Behold");
		axcd(f, radioButtonTag("keep-option", "radio-val", "keep", false));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = function () {
				toggleCheckbox("keep-option");
			};
		axcd(c, f);
		
		axcd(c, buttonTag(name + "-all-btn", "Velg alle", true));
		axcd(c, txcd(' '))
		axcd(c, buttonTag(name + "-none-btn", "Velg ingen", true));
		
		f = xcd("div");
		f.id = name + "-field";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		axcd(c, buttonTag(name + "-download", "Last ned CSV", true));
		axcd(c, txcd(" "));
		
		axcd(c, spinnerTag(name + "-spinner"));
	}
	
	axcd(document.body, c);
	
	let button = fxcd(name + "-download");
	let file = fxcd(name + "-file");
	file.onchange = function() {
			spinnerFunction(name + "-spinner", function() {
					button.disabled = true;
					if (file.files.length >= 1) {
						spinnerFunction(name + "-spinner", function() {
								let r = new FileReader();
								r.onload = function(){
										let arr = CSVToArray(r.result, ";");
										let options = arr[0];
										populateCheckboxes(name + "-field", options, null);
										allOrNoneBtn(name + "-all-btn", name + "-field", true, options);
										allOrNoneBtn(name + "-none-btn", name + "-field", false, options);
										fxcd(name+"-all-btn").disabled = false;
										fxcd(name+"-none-btn").disabled = false;
										button.disabled = false;
									};
								r.readAsText(file.files[0]);
							});
					} else {
						fxcd(name + "-field").innerHTML = "";
						fxcd(name+"-all-btn").disabled = true;
						fxcd(name+"-none-btn").disabled = true;
					}
				});
		};
	
	button.onclick = function() {
			spinnerFunction(name + "-spinner", function() {
					let r = new FileReader();
					let fileInput = fxcd(name + "-file");
					r.onload = function(){
							let arr = CSVToArray(r.result, ";");
							let wanted = [];
							function checkFn (value) {
								return (value == fxcd("keep-option").checked)
							}
							for (let e of mapCheckboxes(name + "-field").entries()) {
								if (checkFn(e[1]) == true) {
									wanted.push(e[0]);
								}
							}
							downloadCSV(arrayToCSV(arrayColFilter(arr, wanted),";"), fileInput.files[0].name.replace(".csv", " - filtrert.csv"));
						};
					r.readAsText(fileInput.files[0]);
				});
		};
}


function setupRowFilter(name) {
	
	let inputCSV = null;
	let contrastCSV = null;
	let outputCSV = null;
	
	let eventName = "dataReady";
	let readyTarget = {
			A: 1,
			B: 1,
			C: 1,
			D: 1
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					
					if (fxcd("keep-option").checked == false && fxcd("remove-option").checked == false) {
						target['D'] = 0;
					}
					
					if (target['D'] > 0 && (target["A"]  < 1 && target["B"]  < 1 && target["C"] < 1)) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target['A'] > 0) {
							inputCSV = null;
						}
						if (target['B'] > 0) {
							contrastCSV = null;
						}
						fxcd(name + "-download-btn").disabled = true;
						outputCSV = null;
					}
					return true;
				}
		});
	
	
	function radioFn() {
		ready['D'] += 1;
	}
		
	
	let c = fxcd(name + "-container");
	{
		let f = xcd("input");
		f.type = "file";
		f.id = name + "-file";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		f = xcd("form");
		let l = labelTag("remove-option", "Filtrer bort");
		axcd(f, radioButtonTag("remove-option", "radio-val", "remove", true));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = function () {
				toggleCheckbox("remove-option");
				radioFn();
			};
		l = labelTag("keep-option", "Behold");
		axcd(f, radioButtonTag("keep-option", "radio-val", "keep", false));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = function () {
				toggleCheckbox("keep-option");
				radioFn();
			};
		axcd(c, f);
		
		f = fileInputTag(name + "-contrast-file");
		l = xcd("select");
		
		axcd(c, f);
		addLine(c);
		
		axcd(c, txcd("Konstrast-kolonne: "));
		
		l.id = name + "-contrast-column";
		axcd(l, optionTag("Velg", true, true));
		axcd(c, l);
		addLine(c);
		addLine(c);
		
		let spinner = fxcd(name + "-spinner");
		l.onchange = function () {
				spinnerFunction(name + "-spinner", function() {
						ready["C"] = 0;
					});
			};
			
		f.onchange = function (evt) {
				spinnerFunction(name + "-spinner", function () {
						if (evt.target.files.length >= 1) {
							let r = new FileReader();
							r.onload = function(){
									l.innerHTML = "";
									axcd(l, optionTag("Velg", true, true));
									let arr = CSVToArray(r.result, ";");
									for (let e of arr[0]) {
										if (e == "") {
											continue;
										}
										axcd(l, optionTag(e, false, false));
									}
									contrastCSV = arr;
									ready['B'] = 0;
								};
							r.readAsText(evt.target.files[0]);
											
						} else {
							ready['B'] = 1;
						//	spinner.style.visibility = "hidden";
						}
					});
			};
		axcd(c, buttonTag(name + "-download-btn", "Last ned CSV", true));
		axcd(c, txcd(" "));
		
		axcd(c, spinnerTag(name + "-spinner"));
	}
	axcd(document.body, c);
	
	let button = fxcd(name + "-download-btn");
	let file = fxcd(name + "-file");
	file.onchange = function() {
		spinnerFunction(name + "-spinner", function () {
				if (file.files.length >= 1) {
					let r = new FileReader();
					r.onload = function(){
							let arr = CSVToArray(r.result, ";");
							ready['A'] = 0;
							inputCSV = arr;
							//spinner.style.visibility = "hidden";
						};
					r.readAsText(file.files[0]);
				} else {
					ready['A'] = 1;
					//spinner.style.visibility = "hidden";
				}
			});
		};
	
	document.addEventListener(eventName, () => {
			spinnerFunction(name + "-spinner", function () {
				outputCSV = [inputCSV[0]];
				
				let filterIdx = contrastCSV[0].indexOf(fxcd(name + "-contrast-column").value);
				if (fxcd("keep-option").checked == false) {
					let mep = new Map();
					for (let i = 1; i < inputCSV.length; i += 1) {
						mep.set(inputCSV[i][filterIdx], inputCSV[i]);
					}
					for (let i = 1; i < contrastCSV.length; i += 1) {
						let f = contrastCSV[i][filterIdx];	
						mep.delete(f);
					}
					for (let e of mep.entries()) {
						outputCSV.push(e[1]);
					}
				} else {
					for (let i = 1; i < contrastCSV.length; i += 1) {
						for (let j = 1; j < inputCSV.length; j += 1) {						
							if (inputCSV[j][filterIdx] == contrastCSV[i][filterIdx]) {
								outputCSV.push(inputCSV[j]);
							}
						}
					}
				}
					
				button.disabled = false;
			});
		});
	
	button.onclick = function() {
			downloadCSV(arrayToCSV(outputCSV,";"), fxcd(name + "-file").files[0].name.replace(".csv", " - filtrert.csv"));
		};
}


function arrayColFilter(array, wantedList) {
	let filterIdx = [];
	for (let col = 0; col < array[0].length; col += 1) {
		
		if (wantedList.indexOf(array[0][col]) < 0) {
			continue;
		}
		filterIdx.push(col);
	}
	
	let out = [];
	for (let row = 0; row < array.length; row += 1) {
		
		let add = [];
		for (let col = 0; col < filterIdx.length; col += 1) {
			
			add.push(array[row][filterIdx[col]]);
		}
		out.push(add);
	}
	return out;
}


function arrayMerge(arr1, arr2, columnName) {
	
	let out = [];
	let nameIdx1 = arr1[0].indexOf(columnName);
	let nameIdx2 = arr2[0].indexOf(columnName);
	
	let head = [];
	for (e of arr1[0]) {
		head.push(e);
	}
	let col;
	for (col = 0; col < arr2[0].length; col += 1) {
		if (col == nameIdx2) {
			continue;
		}
		head.push(arr2[0][col]);
	}
	out.push(head);
	
	let row1;
	for (row1 = 1; row1 < arr1.length; row1 += 1) {
		let a = [];
		for (let col = 0; col < arr1[row1].length; col += 1) {
			a.push(arr1[row1][col]);
		}
		
		let current = arr1[row1][nameIdx1];
		let row2;
		for (row2 = 1; row2 < arr2.length; row2 += 1) {
			
			if (arr2[row2][nameIdx2] != current) {
				continue;
			}
			for (let col = 0; col < arr2[row2].length; col += 1) {
				
				if (col == nameIdx2) {
					continue;
				}
				a.push(arr2[row2][col]);
			}
			
			break;
		}
		out.push(a);
	}
	return out;
}



function drawSections(arr, map, containerId, includeMonthName, nDays) {
	let table = fxcd(containerId);
	let row;
	let cell;
	
	row = xcd("tr");
	let kk = ["dager vakant", "vakansetap", "dager vedlikehold", "vedlikeholdstap", "dager passiv", "passiv kostnad", "vakanse + drift"];
	if (includeMonthName == true) {
		kk.unshift("måned");
	}
	let head2 = [];
	let head = arr[0].concat(kk);
	for (let c = 0; c < head.length; c += 1) {
		if (c == 2) {
			continue;
		}
		cell = xcd("th");
		axcd(cell, txcd(head[c]));
		axcd(row, cell);
		head2.push(head[c]);
	}
	axcd(table, row);
	
	let monthNames = ["Januar", "Februar", "Mars", "April"];
	let rows = [];
	
	for (let r = 1; r < arr.length; r += 1) {
		
		let months = map.get(arr[r][0]);
		for (let m = 0; m < months.length; m += 1) {
			let pt = ["", ""];
			let cat = months[m];
			if (map.has(arr[r][0]) == false) {
				pt = [arr[r][0], ""];
				cat = [0,0,0,0,0,0];
			}
			
			if (m == 0) {
				pt = [arr[r][0], arr[r][1]];
			}
			if (includeMonthName == true) {
				pt.push(monthNames[m]);
			}
			rows.push(pt.concat(cat));
		}
	}
	for (let r = 0; r < rows.length; r += 1) {
		let row = rows[r];
		
		let cls = "missing";
		let idx = 2;
		if (includeMonthName == true) {
			idx += 1;
		}
		if (row[idx] < nDays) {
			cls = "";
			if (row[idx] < 0) {
				cls = "double";
			}
		}
		axcd(table, newRow(row, false, cls));
	}
	return [head2].concat(rows);
}

function writeArrayTo(array, containerId) {
	
	let table = fxcd(containerId);
	let header = xcd("tr");
	for (let c = 0; c < array[0].length; c += 1) {
		let cell = xcd("th");
		axcd(cell, txcd(array[0][c]));
		axcd(header, cell);
	}
	axcd(table, header);
	
	for (let r = 1; r < array.length; r += 1) {
		let row = xcd("tr");
		
		for (let c = 0; c < array[r].length; c += 1) {
			let val = array[r][c];
			let cell = xcd("td");
			
			if (c == 2) {
				if (val < 0) {
					cell.classList.add("passive");
					val = null;
				}
				if (val == 0 || val == null) {
					cell.classList.add("danger");
				}
			}
			
			axcd(cell, txcd(val));
			axcd(row, cell);
		}
		if (array[r].length < 3) {
			let cell = xcd("td");
			cell.classList.add("missing");
			axcd(row, cell);
		}
		
		axcd(table, row);
	}
}

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
	
	axcd(table, newRow(["Seksjon#", "Navn", "Nøkkelnummer"], true));
	
	let counter = new Map();
	let out = [arr[0].concat(["Nøklerinos"])];
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
			if (l == undefined) {
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
	
	let under = 0;
	let above = 0;
	for (let k of counter.keys()) {
		if (k < "800") {
			under += 1;
		} else {
			above += 1;
		}
	}
	console.log("under: " + under + ", over: " + above);
	return out;
}

function writeEndResult(array, containerId) {

	let boliger = 0;
	let active = 0;
	let passive = 0;
	
	for (let row = 1; row < array.length; row += 1) {
		let v = array[row][2];
		if (v != null) {
			if (v >= 0) {
				boliger += 1;
			} else {
				passive += 1;
			}
			active += array[row][2];
		}
	}
	axcd(fxcd(containerId), newRow([boliger, passive, active], false));
}


function timeFilter(arr, cutoffLow, cutoffHigh, idxLow, idxHigh, idxId) {
	
	let out = [];
	out.push(arr[0]);
	
	for (let r = 1; r < arr.length; r += 1) {
		let id = arr[r][idxId];
		if (id == null || id == "" || id == " ") {
			continue;
		}
		let from = arr[r][idxLow];
		if (from != null && from != " " && from != "") {
			if (parseDate(from) > cutoffHigh) {
				continue;
			}
		}
		let to = arr[r][idxHigh];
		if (to != null && to != " " && to != "") {
			if (parseDate(to) < cutoffLow) {
				continue;
			}
		}
		out.push(arr[r]);
	}
	return out;
}

function calcDays(begin, stop, cutoffLow, cutoffHigh) {
	let start = parseDate(begin);
	
	let end = parseDate(stop);
	let l = parseDate(cutoffLow);
	let h = parseDate(cutoffHigh);
	if (start > h) {
		return 0;
	}
	if (end < l) {
		return 0;
	}
	if (start <  l) {
		start = l;
	}
	if (end > h) {
		end = h;
	}
	return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function mapContracts(arr, occupantIdx, beginIdx, endIdx, priceIdx, numberIdx, typeIdx) {
	
	let m = new Map();
	for (let r = 1; r < arr.length; r += 1) {
		let id = arr[r][numberIdx];
		if (m.has(id) == false) {
			m.set(id, []);
		}
		m.get(id).push(arr[r]);
	}
	return m;
}

function timeCalc(section, sPriceIdx, contract, occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh, nDays) {
	
	let start = contract[beginIdx];
	let stop = contract[endIdx];
	if (start == "" || start == " " || start == null || start == undefined) {
		start = cutoffLow;
	}
	if (stop == "" || stop == " " || stop == null || stop == undefined) {
		stop = cutoffHigh;
	}
	let duration = Math.round(calcDays(start, stop, cutoffLow, cutoffHigh));
	
	let monthCost = contract[cPriceIdx];
	if (monthCost == "" || monthCost == " " || monthCost == undefined || monthCost == null) {
		monthCost = section[sPriceIdx];
		if (monthCost == "" || monthCost == " " || monthCost == undefined || monthCost == null) {
			monthCost = 0;
		} else {
			monthCost = stringToNumber(section[sPriceIdx]);
		}
	} else {
		monthCost = stringToNumber(contract[cPriceIdx]);
	}
	
	let vac = 0;
	let vacLoss = 0;
	let rep = 0;
	let repLoss = 0;
	let pas = 0;
	let pasLoss = 0;
	
	let cost = Math.ceil(duration * (monthCost/nDays));
	let occupant = contract[occupantIdx];
	if (["Driftsadministrasjonen", "Tromsø kommune v/Byggforvaltningen", "Drift Leide Boliger", "Stiftelsen Kommunale Boliger"].includes(occupant)) {
		rep += duration;
		repLoss += cost;
	} else if (occupant == "Passiv") {
		pas += duration;
		pasLoss += cost;
	}
	vac -= duration;
	vacLoss -= cost;
	return [vac, vacLoss, rep, repLoss, pas, pasLoss];
}

function contractFilter(arr, cutoffLow, cutoffHigh) {
	
	let out = [arr[0]];
	
	cutoffLow = parseDate(cutoffLow);
	cutoffHigh = parseDate(cutoffHigh);
	
	for (let r = 1; r < arr.length; r += 1) {
		
		if (arr[r][12] == null || arr[r][12] == "" || arr[r][12] == " ") {
			continue;
		}
		let from = arr[r][6];
		if (from != null && from != " " && from != "") {
			if (parseDate(from).getTime() > cutoffHigh.getTime()) {
				continue;
			}
		}
		
		let to = arr[r][7];
		if (to != null && to != " " && to != "") {
			if (parseDate(to).getTime() < cutoffLow.getTime()) {
				continue;
			}
		}
		out.push(arr[r]);
	}
	return out;
}

function contractGainCalc(arr, cutoffLow, cutoffHigh) {
	let out = [["Fasilitetsnummer", "Sum"]];
	let map = new Map();
	
	for (let r = 1; r < arr.length; r += 1) {
		let fnr = arr[r][4];
		let val = stringToNumber(arr[r][3]);
		if (arr[r][0] == "Passiv" || arr[r][0] == "Driftsadministrasjonen") {
			val = -1;
			map.set(fnr, -1);
		}
		
		let from = arr[r][1];
		let to = arr[r][2];
		if (from == null || from == " " || from == "")
		{
			arr[r][1] = cutoffLow;
		}
		if (to == null || to == " " || to == "")
		{
			arr[r][2] = cutoffHigh;
		}
		
		let days = calcDays(arr[r][1], arr[r][2], cutoffLow, cutoffHigh);
		if (!map.has(fnr)) {
			map.set(fnr, (days*val/30));
		} else {
			let s = map.get(fnr);
			s += (days*val/30);
			map.set(fnr, s);
		}
	}
	map.forEach(function(v, k) {
			
			out.push([k, v]);
		});
	return out;
}


function contractLossCalc(arr, nameIdx, sPriceIdx, map, occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh) {
	
	let out = new Map();
	for (let r = 1; r < arr.length; r += 1) {
		
		let p;
		try {
			p = stringToNumber(arr[r][sPriceIdx]);
		}
		catch(f) {
			p = 0;
		}
		let nDays = parseDate(cutoffHigh) - parseDate(cutoffLow);
		nDays /= Math.round(1000*60*60*24);
		
		let j = [nDays, p, 0, 0, 0, 0];
		if (map.has(arr[r][nameIdx])) {
			let contracts = map.get(arr[r][nameIdx]);
			for (let c = 0; c < contracts.length; c += 1) {
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh, nDays), j);
			}
		}
		out.set(arr[r][nameIdx], [j]);
	}
	return out;
}


function monthLossCalc(map) {
	let out = new Map();
	
	for (let e of map.entries()) {
		let jT = [0, 0, 0, 0, 0, 0];
		arrayAddition(e[1][0], jT);
		jT.push(jT[1]+jT[3]);
		out.set(e[0], [jT]);
	}
	return out;
}


function beginLoss(name) {
	
	let eventName = "dataReady";
	let readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
		
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target["countA"] < 1 && target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if( target["countA"] < 1 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd(name + "-calc-btn").disabled = false;
						} else {
							fxcd(name + "-calc-btn").disabled = true;
						}
					}
					return true;
				}
		});
	
	let con = fxcd(name + "-container");
	{
		rentablesText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		let i = fileInputTag(name + "-rentables-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = function () {
				if (i.files.length < 1) {
					dataReady["fileA"] += 1;
				} else {
					dataReady["fileA"] -= 1;
				}
			};
		
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = function () {
				if (i.files.length < 1) {
					dataReady["fileB"] += 1;
				} else {
					dataReady["fileB"] -= 1;
				}
			};
		
		axcd(con, txcd("Velg tidsspenn:"));
		addLine(con);
	
		axcd(con, txcd("Fra "));
		axcd(con, dateFieldTag(name + "-date-from"));
		axcd(con, txcd(" Inntil "));
		axcd(con, dateFieldTag(name + "-date-to"));
		addLine(con);
		addLine(con);
	
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
		
		lossText(con);
		
		i = xcd("table");
		i.id = name + "-result-table";
		axcd(i, lossSumHeader());
		axcd(con, i);
		axcd(con, xcd("hr"));
		
		axcd(con, lossLegend());
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	
	let spinner = fxcd(name + "-spinner");
	
	let actives = fxcd(name + '-rentables-file');
	let activeList = null;
	let contracts = fxcd(name + '-contracts-file');
	let contractMap = null;
	
	let from = fxcd(name + "-date-from");
	let to = fxcd(name + "-date-to");
	
	
	
	fxcd(name + "-date-to").onchange = function (evt) {
			if (evt.target.value == "") {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd(name + "-date-from").onchange = function (evt) {
			if (evt.target.value == "") {
				ready["dateA"] = 1;	
			} else {
				ready["dateA"] = 0;
			}
		};
	actives.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	
	
	document.addEventListener(eventName, () => {
			from = dateToFVDUDate(from.value);
			to = dateToFVDUDate(to.value);
			
			let perSection = contractLossCalc(activeList, 0, 2, contractMap, 0, 1, 2, 3, from, to);
			let monthly = monthLossCalc(perSection);
			
			let nDays = parseDate(to) - parseDate(from);
			nDays /= Math.round(1000*60*60*24);
			fxcd(name + "-calc-table").innerHTML = "";
			let vv = drawSections(activeList, monthly, name + "-calc-table", false, nDays);
			
			
			function fjott (arr, map, containerId) {
				
				let table = fxcd(containerId);
				table.innerHTML = "";
				axcd(table, lossSumHeader());
				
				let row;
				let cell;
				let rows = [];
				let j = [0,0,0,0,0,0,0];
				function addLine(src, dst) {
					if (src[1] >= 0){
						arrayAddition(src, dst);
					}
				}
				
				for (let r = 1; r < arr.length; r += 1) {
					
					if (map.has(arr[r][0])) {
						let months = map.get(arr[r][0]);
						addLine(months[0], j);
					} else {
						arrayAddition([0,0,0,0,0,0], j);
					}
				}
				
				rows.push(j);
				for (let r = 0; r < rows.length; r += 1) {
					row = rows[r];
					axcd(table, newRow(row, false, ""));
				}
			}
			
			fjott(activeList, monthly, name + "-result-table");
			
			for (let r = 1; r < vv.length; r += 1) {
				let row = vv[r];
				for (let c = 2; c < row.length; c += 1) {
					row[c] = numToFDVUNum(row[c]);
				}
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = function () {
					downloadCSV(arrayToCSV(vv,";"), "tap " + fxcd(name + "-date-from").value + " til " + fxcd(name + "-date-to").value + ".csv");
				};
			spinner.style.visibility = "hidden";
		});
	
	fxcd(name + "-calc-btn").onclick = function () {
			spinner.style.visibility = "visible";
			let f1 = new FileReader();
			f1.onload = function(){
					activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Sum"]);
					ready["countB"] -= 1;
				};
			f1.readAsText(actives.files[0]);
			
			let f2 = new FileReader();
			f2.onload = function(){
					let filter1 = timeFilter(CSVToArray(f2.result, ";"), new Date(from), new Date(to), 6, 7, 12);
					let filter2 = arrayColFilter(filter1, ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
					contractMap =  mapContracts(filter2, 0, 1, 2, 3, 4, 5, from, to);
					ready["countB"] -= 1;
				};
			f2.readAsText(contracts.files[0]);
		};
}


function beginGainCalc(name) {
	
	
	let eventName = "dataReady";
	let readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target["countA"] < 1 && target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
						fxcd(name + "-calc-btn").disabled = false;
					} else {
						if( target["countA"] < 1 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd(name + "-calc-btn").disabled = false;
						} else {
							fxcd(name + "-calc-btn").disabled = true;
						}
					}
					return true;
				}
		});
	let con = fxcd(name + "-container");
	{
		rentablesText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		let i = fileInputTag(name + "-rentables-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = function () {
				if (i.files.length < 1) {
					dataReady["fileA"] += 1;
				} else {
					dataReady["fileA"] -= 1;
				}
			};
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = function () {
				if (i.files.length < 1) {
					dataReady["fileB"] += 1;
				} else {
					dataReady["fileB"] -= 1;
				}
			};
		
		axcd(con, txcd("Velg tidsspenn:"));
		addLine(con);
	
		axcd(con, txcd("Fra "));
		axcd(con, dateFieldTag(name + "-date-from"));
		axcd(con, txcd(" Inntil "));
		axcd(con, dateFieldTag(name + "-date-to"));
		addLine(con);
		addLine(con);
	
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
		
		i = xcd("table");
		i.id = name + "-result-table";
		axcd(i, gainSumHeader());
		axcd(con, i);
		axcd(con, xcd("hr"));
		
		axcd(con, gainLegend());
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let actives = fxcd(name + '-rentables-file');
	let activeList = null;
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	fxcd(name + "-date-to").onchange = function (evt) {
			if (evt.target.value == "") {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd(name + "-date-from").onchange = function (evt) {
			if (evt.target.value == "") {
				ready["dateA"] = 1;
			} else {
				ready["dateA"] = 0;
			}
		};
	actives.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			let A = activeList;
			let B = contractList;
			
			let table = fxcd(name + "-result-table");
			table.innerHTML = "";
			axcd(table, gainSumHeader());
			table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			A[0][0] = "Fasilitetsnummer";
			B[0][1] = "Sum inntekter";
			let result = arrayMerge(A, B, "Fasilitetsnummer");
			
			writeArrayTo(result, name + "-calc-table");
			writeEndResult(result, name + "-result-table");
			
			for (let r = 1; r < result.length; r += 1) {
				let row = result[r];
				for (let c = 2; c < row.length; c += 1) {
					row[c] = numToFDVUNum(row[c]);
				}
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = function () {
					downloadCSV(arrayToCSV(result,";"), "inntekter " + fxcd(name + "-date-from").value + " til " + fxcd(name + "-date-to").value + ".csv");
				};
			spinner.style.visibility = "hidden";
		});	
	fxcd(name + "-calc-btn").onclick = function() {
			spinner.style.visibility = "visible";
			let f1 = new FileReader();
			f1.onload = function(){
					activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
					ready["countB"] -= 1;
				}
			f1.readAsText(actives.files[0]);
			
			let f2 = new FileReader();
			f2.onload = function(){
					
					let from = dateToFVDUDate(fxcd(name + "-date-from").value);
					let to = dateToFVDUDate(fxcd(name + "-date-to").value);
					
					contractList = contractGainCalc(arrayColFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
					ready["countB"] -= 1;
				}
			f2.readAsText(contracts.files[0]);
		};
}

function setupKeyFilter(name){
	
	let eName = "dataReady";
	let dataReadyTarget = {
			fileA: 1,
			fileB: 1,
			count: 2
		};
	
	const dataReadyEvent = new Event(eName);
	let dataReady = new Proxy(dataReadyTarget, {
			set: function (target, key, value) {
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
	
	let con = fxcd(name + "-container");
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
	
	fxcd(name + "-rentables-file").onchange = function (evt) {
			if (evt.target.files.length < 1) {
				dataReady["fileB"] += 1;
			} else {
				dataReady["fileB"] -= 1;
			}
		};
	fxcd(name + "-file").onchange = function (evt) {
		if (evt.target.files.length < 1) {
			dataReady["fileA"] += 1;
		} else {
			dataReady["fileA"] -= 1;
		}
	};
	
	fxcd(name + "-calc-btn").onclick = function () {
			t.innerHTML = "";
			let spinner = fxcd(name + "-spinner");
			spinner.style.visibility = "visible";
			
			let rentables = fxcd(name + '-rentables-file');
			let rentablesList = null;
			let keys = fxcd(name + '-file');
			let keysMap = null;
			
			document.addEventListener(eName, () => {
				
					let c = drawKeys(rentablesList, keysMap, name + "-table");
					let btn = fxcd(name + "-download-btn");
					btn.disabled = false;
					btn.onclick = function () {
							downloadCSV(arrayToCSV(c, ";"), "nøkler.csv");
						};
					spinner.style.visibility = "hidden";
				});
			
			let f1 = new FileReader();
			f1.onload = function(){
					rentablesList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Kategori bolig", "Aktiv", "Utleibar"]);
					dataReady["count"] -= 1;
				}
			f1.readAsText(rentables.files[0]);
			
			let f2 = new FileReader();
			f2.onload = function(){
					let arr = CSVToArray(f2.result, ";");
					let filtered = arrayColFilter(arr, ["Nummer", "Seksjonsnr"]);
					keysMap = mapKeys(filtered);
					dataReady["count"] -= 1;
				}
			f2.readAsText(keys.files[0]);
			
		}
}
