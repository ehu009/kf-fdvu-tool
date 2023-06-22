
function dateFun (date) {
	let arr = date.split("-");
	return arr.reverse().join(".");
}
function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
}
function dateParse(s) {
	var arr = s.split(".");
	return new Date(arr.reverse());
}
function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
}
function eNumToNNum(n) {
	let u = String(n);
	return u.replace(".", ",");
}




function axcd(p, e) {
	p.appendChild(e);
}
function xcd(t) {
	return document.createElement(t);
}
function txcd(t) {
	return document.createTextNode(t);
}
function fxcd(t) {
	return document.getElementById(t);
}

function spinnerFunction(spinnerId, func) {
	let spinner = fxcd(spinnerId);
	spinner.style.visibility = "visible";
	func();
	spinner.style.visibility = "hidden";
}



function setupColumnFilter(name) {
	let c = fxcd(name + "-container");
	{
		let input = xcd("input");
		input.type = "file";
		input.id = name + "-file";
		axcd(c, input);
		axcd(c, xcd("br"));
	}
	{	
		let f = xcd("form");
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
	}
	{
		axcd(c, buttonTag(name + "-all-btn", "Velg alle", true));
		axcd(c, txcd(' '))
		axcd(c, buttonTag(name + "-none-btn", "Velg ingen", true));
	}
	{
		let e = xcd("div");
		e.id = name + "-field";
		axcd(c, e);
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
							var checkFn = function (value) {return (value == fxcd("keep-option").checked)};
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
	var readyTarget = {
			A: 1,
			B: 1,
			C: 1,
			D: 1
		};
	
	const readyEvent = new Event(eventName);
	var ready = new Proxy(readyTarget, {
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
					console.log(ready)
					return true;
				}
		});
	
	
		function radioFn() {
			ready['D'] += 1;
		}
		
	
	let c = fxcd(name + "-container");
	{
		let input = xcd("input");
		input.type = "file";
		input.id = name + "-file";
		axcd(c, input);
		axcd(c, xcd("br"));
	}
	{	
		let f = xcd("form");
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
	}
	{
		let i = fileInputTag(name + "-contrast-file");
		let s = xcd("select");
		{
		axcd(c, i);
		addLine(c);
		
		axcd(c, txcd("Konstrast-kolonne: "));
		
		s.id = name + "-contrast-column";
		axcd(s, optionTag("Velg", true, true));
		axcd(c, s);
		addLine(c);
		addLine(c);
		}
		s.onchange = function () {
				let spinner = fxcd(name + "-spinner");
				spinner.style.visibility = "visible";
				ready["C"] = 0;
				spinner.style.visibility = "hidden";
			};
			
			
		i.onchange = function (evt) {
				let spinner = fxcd(name + "-spinner");
				spinner.style.visibility = "visible";
			
				if (evt.target.files.length >= 1) {
					let r = new FileReader();
					r.onload = function(){
							s.innerHTML = "";
							axcd(s, optionTag("Velg", true, true));
							let arr = CSVToArray(r.result, ";");
							for (let e of arr[0]) {
								if (e == "") {
									continue;
								}
								axcd(s, optionTag(e, false, false));
							}
							ready['B'] = 0;
							contrastCSV = arr;
							spinner.style.visibility = "hidden";
						};
					r.readAsText(evt.target.files[0]);
									
				} else {
					ready['B'] = 1;
					spinner.style.visibility = "hidden";
				}
			};
	}
	{
		axcd(c, buttonTag(name + "-download-btn", "Last ned CSV", true));
		axcd(c, txcd(" "));
		
		axcd(c, spinnerTag(name + "-spinner"));
	}
	axcd(document.body, c);
	
	let button = fxcd(name + "-download-btn");
	let file = fxcd(name + "-file");
	file.onchange = function() {
		let spinner = fxcd(name + "-spinner");
		spinner.style.visibility = "visible";
			if (file.files.length >= 1) {
				let r = new FileReader();
				r.onload = function(){
						let arr = CSVToArray(r.result, ";");
						ready['A'] = 0;
						inputCSV = arr;
						spinner.style.visibility = "hidden";
					};
				r.readAsText(file.files[0]);
			} else {
				ready['A'] = 1;
				spinner.style.visibility = "hidden";
			}
		};
	
	document.addEventListener(eventName, () => {
			let spinner = fxcd(name + "-spinner");
			spinner.style.visibility = "visible";
			
			outputCSV = [inputCSV[0]];
			let keep = (fxcd("keep-option").checked == true);
			let filterIdx = contrastCSV[0].indexOf(fxcd(name + "-contrast-column").value);
			
			function mapArrayByIndex(arr, idx) {
				var out = new Map();
				for (let i = 1; i < arr.length; i += 1) {
					out.set(arr[i][idx], arr[i]);
				}
				return out;
			}
			
			if (keep == false) {
				let mep = mapArrayByIndex(inputCSV, filterIdx);
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
			spinner.style.visibility = "hidden";
		});
	
	
	button.onclick = function() {
			let fileInput = fxcd(name + "-file");
			downloadCSV(arrayToCSV(outputCSV,";"), fileInput.files[0].name.replace(".csv", " - filtrert.csv"));
		};
}


function arrayColFilter(array, wantedList) {
	var filterIdx = [];
	for (let col = 0; col < array[0].length; col += 1) {
		
		if (wantedList.indexOf(array[0][col]) < 0) {
			continue;
		}
		filterIdx.push(col);
	}
	
	var out = [];
	for (let row = 0; row < array.length; row += 1) {
		
		var add = [];
		for (let col = 0; col < filterIdx.length; col += 1) {
			
			add.push(array[row][filterIdx[col]]);
		}
		out.push(add);
	}
	return out;
}


function arrayMerge(arr1, arr2, columnName) {
	
	var out = [];
	var nameIdx1 = arr1[0].indexOf(columnName);
	var nameIdx2 = arr2[0].indexOf(columnName);
	
	var head = [];
	for (e of arr1[0]) {
		head.push(e);
	}
	var col;
	for (col = 0; col < arr2[0].length; col += 1) {
		if (col == nameIdx2) {
			continue;
		}
		head.push(arr2[0][col]);
	}
	out.push(head);
	
	var row1;
	for (row1 = 1; row1 < arr1.length; row1 += 1) {
		var a = [];
		for (let col = 0; col < arr1[row1].length; col += 1) {
			a.push(arr1[row1][col]);
		}
		
		var current = arr1[row1][nameIdx1];
		var row2;
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
	var table = fxcd(containerId);
	var row;
	var cell;
	
	row = xcd("tr");
	let kk = ["dager vakant", "vakansetap", "dager vedlikehold", "vedlikeholdstap", "dager passiv", "passiv kostnad", "vakanse + drift"];
	if (includeMonthName == true) {
		kk.unshift("måned");
	}
	let head2 = [];
	var head = arr[0].concat(kk);
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
	
	var monthNames = ["Januar", "Februar", "Mars", "April"];
	
	
	
	var rows = [];
	
	for (let r = 1; r < arr.length; r += 1) {
		if (map.has(arr[r][0])) {
			var months = map.get(arr[r][0]);
			for (let m = 0; m < months.length; m += 1) {
				var pt = ["", ""];
				if (m == 0) {
					pt = [arr[r][0], arr[r][1]];
				}
				if (includeMonthName == true) {
					pt.push(monthNames[m]);
				}
				rows.push(pt.concat(months[m]));
			}
		} else {
			
			for (let m = 0; m < 4; m += 1) {
				var pt = [arr[r][0], ""];
				if (m == 0) {
					pt = [arr[r][0], arr[r][1]];
				}
				if (includeMonthName == true) {
					pt.push(monthNames[m]);
				}
				rows.push(pt.concat([0,0,0,0,0,0]));
			}
		}
	}
	for (let r = 0; r < rows.length; r += 1) {
		var row = rows[r];
		
		var cls = "missing";
		var maxAllowed = nDays;
		let idx = 2;
		if (includeMonthName == true) {
			idx += 1;
		}
		if (row[idx] < maxAllowed) {
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
	
	var table = fxcd(containerId);
	var header = xcd("tr");
	for (let c = 0; c < array[0].length; c += 1) {
		var cell = xcd("th");
		axcd(cell, txcd(array[0][c]));
		axcd(header, cell);
	}
	axcd(table, header);
	
	for (let r = 1; r < array.length; r += 1) {
		
		var row = xcd("tr");
		
		for (let c = 0; c < array[r].length; c += 1) {
			var val = array[r][c];
			var cell = xcd("td");
			
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
			var cell = xcd("td");
			cell.classList.add("missing");
			axcd(row, cell);
		}
		
		axcd(table, row);
	}
}

function mapKeys(arr) {
	var out = new Map();
	
	
	for (let i = 1; i < arr.length; i += 1) {
		var row = arr[i];
		var name = row[1];
		
		if (out.has(name)) {
			var l = out.get(name);
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
	var table = fxcd(dst);
	var row;
	var cell;
	
	axcd(table, newRow(["Seksjon#", "Navn", "Nøkkelnummer"], true));
	
	var counter = new Map();
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
			var l = map.get(arr[r][0]);
			if (l == undefined) {
				continue;
			}
			for (c = 0; c < l.length; c += 1) {
				var c1 = arr[r][0];
				var c2 = arr[r][1];
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
	
	var under = 0;
	var above = 0;
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

	var boliger = 0;
	var active = 0;
	var passive = 0;
	
	for (let row = 1; row < array.length; row += 1) {
		var v = array[row][2];
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
	
	var out = [];
	out.push(arr[0]);
	
	for (let r = 1; r < arr.length; r += 1) {
		var id = arr[r][idxId];
		if (id == null || id == "" || id == " ") {
			continue;
		}
		var from = arr[r][idxLow];
		if (from != null && from != " " && from != "") {
			if (dateParse(from) > cutoffHigh) {
				continue;
			}
		}
		var to = arr[r][idxHigh];
		if (to != null && to != " " && to != "") {
			if (dateParse(to) < cutoffLow) {
				continue;
			}
		}
		out.push(arr[r]);
	}
	return out;
}

function calcDays(begin, stop, cutoffLow, cutoffHigh) {
	var start = dateParse(begin);
	
	var end = dateParse(stop);
	var l = dateParse(cutoffLow);
	var h = dateParse(cutoffHigh);
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
	
	var m = new Map();
	for (let r = 1; r < arr.length; r += 1) {
		var id = arr[r][numberIdx];
		if (m.has(id) == false) {
			m.set(id, []);
		}
		m.get(id).push(arr[r]);
	}
	return m;
}

function timeCalc(section, sPriceIdx, contract, occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh, nDays) {
	
	var start = contract[beginIdx];
	var stop = contract[endIdx];
	if (start == "" || start == " " || start == null || start == undefined) {
		start = cutoffLow;
	}
	if (stop == "" || stop == " " || stop == null || stop == undefined) {
		stop = cutoffHigh;
	}
	var duration = Math.round(calcDays(start, stop, cutoffLow, cutoffHigh));
	
	var monthCost = contract[cPriceIdx];
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
	
	var vac = 0;
	var vacLoss = 0;
	var rep = 0;
	var repLoss = 0;
	var pas = 0;
	var pasLoss = 0;
	
	var cost = Math.ceil(duration * (monthCost/nDays));
	var occupant = contract[occupantIdx];
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
	
	var out = [];
	out.push(arr[0]);
	
	var cutoffLow = dateParse(cutoffLow);
	var cutoffHigh = dateParse(cutoffHigh);
	
	for (let r = 1; r < arr.length; r += 1) {
		
		if (arr[r][12] == null || arr[r][12] == "" || arr[r][12] == " ") {
			continue;
		}
		var from = arr[r][6];
		if (from != null && from != " " && from != "") {
			if (dateParse(from).getTime() > cutoffHigh.getTime()) {
				continue;
			}
		}
		
		var to = arr[r][7];
		if (to != null && to != " " && to != "") {
			if (dateParse(to).getTime() < cutoffLow.getTime()) {
				continue;
			}
		}
		out.push(arr[r]);
	}
	return out;
}

function contractGainCalc(arr, cutoffLow, cutoffHigh) {
	var out = [["Fasilitetsnummer", "Sum"]];
	var map = new Map();
	
	for (let r = 1; r < arr.length; r += 1) {
		var fnr = arr[r][4];
		var val = stringToNumber(arr[r][3]);
		if (arr[r][0] == "Passiv" || arr[r][0] == "Driftsadministrasjonen") {
			val = -1;
			map.set(fnr, -1);
		}
		
		var from = arr[r][1];
		var to = arr[r][2];
		if (from == null || from == " " || from == "")
		{
			arr[r][1] = cutoffLow;
		}
		if (to == null || to == " " || to == "")
		{
			arr[r][2] = cutoffHigh;
		}
		
		var days = calcDays(arr[r][1], arr[r][2], cutoffLow, cutoffHigh);
		let nDays = dateParse(cutoffHigh) - dateParse(cutoffLow);
		nDays /= Math.round(1000*60*60*24);
		if (!map.has(fnr)) {
			map.set(fnr, (days*val/30));
		} else {
			var s = map.get(fnr);
			s += (days*val/30);
			map.set(fnr, s);
		}
	}
	map.forEach(function(v, k) {
			
			out.push([k, v]);
		});
	return out;
}


function contractLossCalc2(arr, nameIdx, sPriceIdx, map, occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh) {
	
	var out = new Map();
	for (let r = 1; r < arr.length; r += 1) {
		
		var p;
		try {
			p = stringToNumber(arr[r][sPriceIdx]);
		}
		catch(f) {
			p = 0;
		}
		let nDays = dateParse(cutoffHigh) - dateParse(cutoffLow);
		nDays /= Math.round(1000*60*60*24);
		
		var j = [nDays, p, 0, 0, 0, 0];
		if (map.has(arr[r][nameIdx])) {
			var contracts = map.get(arr[r][nameIdx]);
			for (let c = 0; c < contracts.length; c += 1) {
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, cutoffLow, cutoffHigh, nDays), j);
			}
		}
		out.set(arr[r][nameIdx], [j]);
	}
	return out;
}

function contractLossCalc(arr, nameIdx, sPriceIdx, map, occupantIdx, beginIdx, endIdx, cPriceIdx) {
	
	var out = new Map();
	for (let r = 1; r < arr.length; r += 1) {
		
		var p;
		try {
			p = stringToNumber(arr[r][sPriceIdx]);
		}
		catch(f) {
			p = 0;
		}
		
		var j = [31, p, 0, 0, 0, 0];
		var f = [28, p, 0, 0, 0, 0];
		var m = [31, p, 0, 0, 0, 0];
		var a = [30, p, 0, 0, 0, 0];
		
		if (map.has(arr[r][nameIdx])) {
			
			var contracts = map.get(arr[r][nameIdx]);
			
			for (let c = 0; c < contracts.length; c += 1) {
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, "01.01.2023", "01.02.2023", 31), j);
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, "01.02.2023", "01.03.2023", 28), f);
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, "01.03.2023", "01.04.2023", 31), m);
				arrayAddition(timeCalc(arr[r], sPriceIdx, contracts[c], occupantIdx, beginIdx, endIdx, cPriceIdx, "01.04.2023", "01.05.2023", 30), a);
			}
		}
		out.set(arr[r][nameIdx], [j, f, m, a]);
	}
	return out;
}

function monthResultCalc(map) {
	var out = new Map();
	
	for (let e of map.entries()) {
		var jT = [0, 0, 0, 0, 0, 0];
		var fT = [0, 0, 0, 0, 0, 0];
		var mT = [0, 0, 0, 0, 0, 0];
		var aT = [0, 0, 0, 0, 0, 0];
	
		arrayAddition(e[1][0], jT);
		jT.push(jT[1]+jT[3]);
		arrayAddition(e[1][1], fT);
		fT.push(fT[1]+fT[3]);
		arrayAddition(e[1][2], mT);
		mT.push(mT[1]+mT[3]);
		arrayAddition(e[1][3], aT);
		aT.push(aT[1]+aT[3]);
		out.set(e[0], [jT, fT, mT, aT]);
	}
	return out;
}


function monthLossCalc(map) {
	var out = new Map();
	
	for (let e of map.entries()) {
		var jT = [0, 0, 0, 0, 0, 0];
		arrayAddition(e[1][0], jT);
		jT.push(jT[1]+jT[3]);
		out.set(e[0], [jT]);
	}
	return out;
}

function totalResultCalc(months, header) {
	var t = [0, 0, 0, 0, 0, 0];
	arrayAddition(months[0], t);
	t.unshift("");
	return t;
}



function beginLoss(name) {
	
	let eventName = "dataReady";
	var readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
		
	const readyEvent = new Event(eventName);
	var ready = new Proxy(readyTarget, {
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
		{
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
		}
	}
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		{
			let i = fileInputTag(name + "-contracts-file");
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
		}
	}
	{
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
	}
	{
		axcd(con, txcd("Tap for vakanse og vedlikehold beregnes separat."));
		addLine(con);
		
		axcd(con, txcd("Tap regnes ut fra seksjonspris ved vakanse, og fra kontraktpris ved vedlikehold eller passiv kontrakt - dermed vil tap være negativt hvis kontraktpris er høyere enn seksjonspris."));
		addLine(con);
		
		axcd(con, txcd("I vedlikehold medregnes kontrakter der leietaker heter en av følgende:"));
		addLine(con);
		
		let l = xcd("ul");
		for (let e of ["Driftsadministrasjonen", "Driftsavdelingen", "Tromsø kommune v/ Byggforvaltningen", "Drift Leide Boliger", "Stiftelsen Kommunale Boliger"]) {
			axcd(l, listTag(e));
		}
		axcd(con, l);
		
		axcd(con, txcd("Perioder som har overlappende kontrakter gir misvisende resultat, og regnes ikke med i summeringer."));
		addLine(con);
		
		axcd(con, txcd("Passive kontrakter regnes ikke som vedlikehold- eller utleiekontrakter."));
	}
	{
		let t = xcd("table");
		t.id = name + "-result-table";
		axcd(t, lossSumHeader());
		axcd(con, t);
		axcd(con, xcd("hr"));
	}
	{
		axcd(con, lossLegend());
		let t = xcd("table");
		t.id = name + "-calc-table";
		axcd(con, t);
	}
	
	
	let spinner = fxcd(name + "-spinner");
	
	var actives = fxcd(name + '-rentables-file');
	var activeList = null;
	var contracts = fxcd(name + '-contracts-file');
	var contractMap = null;
	
	var from = fxcd(name + "-date-from");
	var to = fxcd(name + "-date-to");
	
	
	
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
			from = dateFun(from.value);
			to = dateFun(to.value);
			var A = activeList;
			var B = contractMap;
			
			var perSection = contractLossCalc2(A, 0, 2, B, 0, 1, 2, 3, from, to);
			var monthly = monthLossCalc(perSection);
			
			let nDays = dateParse(to) - dateParse(from);
			nDays /= Math.round(1000*60*60*24);
			fxcd(name + "-calc-table").innerHTML = "";
			let vv = drawSections(activeList, monthly, name + "-calc-table", false, nDays);
			
			
			function fjott (arr, map, containerId) {
				
				var table = fxcd(containerId);
				table.innerHTML = "";
				axcd(table, lossSumHeader());
				
				var row;
				var cell;
				var rows = [];
				var j = [0,0,0,0,0,0,0];
				function addLine(src, dst) {
					if (src[1] >= 0){
						arrayAddition(src, dst);
					}
				}
				
				for (let r = 1; r < arr.length; r += 1) {
					
					if (map.has(arr[r][0])) {
						var months = map.get(arr[r][0]);
						addLine(months[0], j);
					} else {
						var empty = [0,0,0,0,0,0];
						arrayAddition(empty, j);
					}
				}
				
				var totals = [0, 0, 0, 0, 0, 0, 0];
				arrayAddition(j, totals);
				
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
					row[c] = eNumToNNum(row[c]);
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
			var f1 = new FileReader();
			f1.onload = function(){
					activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Sum"]);
					ready["countB"] -= 1;
				};
			f1.readAsText(actives.files[0]);
			
			var f2 = new FileReader();
			f2.onload = function(){
					var filter1 = timeFilter(CSVToArray(f2.result, ";"), new Date(from), new Date(to), 6, 7, 12);
					var filter2 = arrayColFilter(filter1, ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
					contractMap =  mapContracts(filter2, 0, 1, 2, 3, 4, 5, from, to);
					ready["countB"] -= 1;
				};
			f2.readAsText(contracts.files[0]);
		};
}

function beginOldLoss(calcTable, resultTable, spinnerId) {
	let spinner = fxcd(spinnerId);
	spinner.style.visibility = "visible";
	let eventName = "dataReady";
	let ready = semaphore(eventName);
	
	
	var actives = fxcd('active-file');
	var activeList = null;
	var contracts = fxcd('all-contract-file');
	var contractMap = null;
	
	
	document.addEventListener(eventName, () => {
			var A = activeList;
			var B = contractMap;
			
			var perSection = contractLossCalc(A, 0, 2, B, 0, 1, 2, 3);
			var monthly = monthResultCalc(perSection);
			drawSections(activeList, monthly, calcTable, true, 0);
			
			
			function fjott (arr, map, containerId) {
				
				var table = fxcd(containerId);
				var row;
				var cell;
				
				var monthNames = ["Januar", "Februar", "Mars", "April"];
				
				
				
				var rows = [];
				var j = [0,0,0,0,0,0,0];
				var f = [0,0,0,0,0,0,0];
				var m = [0,0,0,0,0,0,0];
				var a = [0,0,0,0,0,0,0];
				function addLine(src, dst) {
					if (src[1] >= 0){
						arrayAddition(src, dst);
					}
				}
				
				for (let r = 1; r < arr.length; r += 1) {
					
					if (map.has(arr[r][0])) {
						var months = map.get(arr[r][0]);
						addLine(months[0], j);
						addLine(months[1], f);
						addLine(months[2], m);
						addLine(months[3], a);
					} else {
						var empty = [0,0,0,0,0,0];
						arrayAddition(empty, j);
						arrayAddition(empty, f);
						arrayAddition(empty, m);
						arrayAddition(empty, a);
					}
				}
				
				var totals = [0, 0, 0, 0, 0, 0, 0];
				arrayAddition(j, totals);
				arrayAddition(f, totals);
				arrayAddition(m, totals);
				arrayAddition(a, totals);
				totals.unshift("Sum");
				
				j.unshift("Januar");
				f.unshift("Februar");
				m.unshift("Mars");
				a.unshift("April");
				
				rows.push(j, f, m, a)
				for (let r = 0; r < rows.length; r += 1) {
					row = rows[r];
					axcd(table, newRow(row, false, ""));
				}
				axcd(table, newRow(["", "", "", "", "", "", "", ""], false, ""));
				axcd(table, newRow(totals), false, "");
			}
			
			fjott(activeList, monthly, resultTable)
			
	spinner.style.visibility = "hidden";
		});
	
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Sum"]);
			ready["count"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			var filter1 = timeFilter(CSVToArray(f2.result, ";"), new Date("2023 01 01"), new Date("2023 05 01"), 6, 7, 12);
			var filter2 = arrayColFilter(filter1, ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
			contractMap =  mapContracts(filter2, 0, 1, 2, 3, 4, 5);
			ready["count"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	
}

function beginGainCalc(name) {
	
	
	let eventName = "dataReady";
	var readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
	const readyEvent = new Event(eventName);
	var ready = new Proxy(readyTarget, {
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
		{
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
		}
	}
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		{
			let i = fileInputTag(name + "-contracts-file");
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
		}
	}
	{
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
	}
	{
		let t = xcd("table");
		t.id = name + "-result-table";
		axcd(t, gainSumHeader());
		axcd(con, t);
		axcd(con, xcd("hr"));
	}
	{
		axcd(con, gainLegend());
		let t = xcd("table");
		t.id = name + "-calc-table";
		axcd(con, t);
	}
	
	
	
	let spinner = fxcd(name + "-spinner");
	
	
	var actives = fxcd(name + '-rentables-file');
	var activeList = null;
	var contracts = fxcd(name + '-contracts-file');
	var contractList = null;
	
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
			var A = activeList;
			var B = contractList;
			
			let table = fxcd(name + "-result-table");
			table.innerHTML = "";
			axcd(table, gainSumHeader());
			table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			A[0][0] = "Fasilitetsnummer";
			B[0][1] = "Sum inntekter";
			var result = arrayMerge(A, B, "Fasilitetsnummer");
			
			writeArrayTo(result, name + "-calc-table");
			writeEndResult(result, name + "-result-table");
			
			for (let r = 1; r < result.length; r += 1) {
				let row = result[r];
				for (let c = 2; c < row.length; c += 1) {
					row[c] = eNumToNNum(row[c]);
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
			var f1 = new FileReader();
			f1.onload = function(){
					activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
					ready["countB"] -= 1;
				}
			f1.readAsText(actives.files[0]);
			
			var f2 = new FileReader();
			f2.onload = function(){
					
					var from = fxcd(name + "-date-from").value;
					var to = fxcd(name + "-date-to").value;
					from = dateFun(from);
					to = dateFun(to);
					
					var c = contractGainCalc(arrayColFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
					
					contractList = c;
					ready["countB"] -= 1;
				}
			f2.readAsText(contracts.files[0]);
		};
}

function setupKeyFilter(name){
	
	let eName = "dataReady";
	var dataReadyTarget = {
			fileA: 1,
			fileB: 1,
			count: 2
		};
	
	const dataReadyEvent = new Event(eName);
	var dataReady = new Proxy(dataReadyTarget, {
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
		{
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
		}
	}
	{
		keysText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		{
			let i = fileInputTag(name + "-file");
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
		}
	}
	defaultButtonTags(name);
	addLine(con);
	axcd(con, xcd("hr"));
	let t = xcd("table");
	t.id = name + "-table";
	axcd(con, t);
	
	fxcd(name + "-calc-btn").onclick = function () {
			t.innerHTML = "";
			let spinner = fxcd(name + "-spinner");
			spinner.style.visibility = "visible";
			
			var rentables = fxcd(name + '-rentables-file');
			var rentablesList = null;
			var keys = fxcd(name + '-file');
			var keysMap = null;
			
			document.addEventListener(eName, () => {
					var A = rentablesList;
					var B = keysMap;
					
					let c = drawKeys(A, B, name + "-table");
					let btn = fxcd(name + "-download-btn");
					btn.disabled = false;
					btn.onclick = function () {
							downloadCSV(arrayToCSV(c, ";"), "nøkler.csv");
						};
					spinner.style.visibility = "hidden";
				});
			
			var f1 = new FileReader();
			f1.onload = function(){
					rentablesList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Kategori bolig", "Aktiv", "Utleibar"]);
					dataReady["count"] -= 1;
				}
			f1.readAsText(rentables.files[0]);
			
			var f2 = new FileReader();
			f2.onload = function(){
					var arr = CSVToArray(f2.result, ";");
					var filtered = arrayColFilter(arr, ["Nummer", "Seksjonsnr"]);
					keysMap = mapKeys(filtered);
					dataReady["count"] -= 1;
				}
			f2.readAsText(keys.files[0]);
			
		}
}
