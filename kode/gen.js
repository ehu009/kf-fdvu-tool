function CSVToArray( strData, strDelimiter ){
	
	strDelimiter = (strDelimiter || ",");
	var objPattern = new RegExp(
			(
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
			);

	var arrData = [[]];
	var arrMatches = null;

	while (arrMatches = objPattern.exec( strData )){
		var strMatchedDelimiter = arrMatches[ 1 ];
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
			){
			arrData.push( [] );
		}

		var strMatchedValue;
		if (arrMatches[ 2 ]){
			strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);
		} else {
			strMatchedValue = arrMatches[ 3 ];
		}
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}
	return( arrData );
}

function arrayToCSV(arr, separator) {
	let out = "data:text/csv;charset=utf-8,";
	arr.forEach(function(rowArray) {
				out += rowArray.join(separator) + "\r\n";
			});
	return out;
}

function downloadCSV(csvContent, fileName) {
	
	var encodedUri = encodeURI(csvContent);
	var link = xcd("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", fileName);
	link.hidden = true;
	document.body.appendChild(link);

	link.click();
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



function toggleCheckbox(id) {
	let b = fxcd(id);
	if (b.checked == true) {
		b.checked = false;
	} else if (b.checked == false) {
		b.checked = true;
		return;
	}
}

function createCheckbox(container, name) {
	let n = "checkbox";
	let c = xcd("span");
	{
		let label = xcd("label");
		label.appendChild(txcd(name));
		label.onclick = function () {
					toggleCheckbox(name + "-" + n);
				}
		c.appendChild(label);
	}
	{
		let box = xcd("input");
		box.type = n;
		box.id = name + "-" + n;
		c.appendChild(box);
	}
	c.classList.add("checkbox-container");
	fxcd(container).appendChild(c);
}

function mapCheckboxes(containerId) {
	let out = new Map();	
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == "div") {
			continue;
		}
		let label = n.firstChild.innerHTML;
		let value = n.lastChild.checked;
		out.set(label, value);
	}
	return out;
}

function setCheckboxValues(containerId, options) {
	
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == "div") {
			continue;
		}
		let label = n.firstChild.innerHTML;
		if (options.has(label)) {
			n.lastChild.checked = options.get(label);
		} else {
			n.lastChild.checked = false;
		}
	}
}

function allOrNoneBtn(buttonId, containerId, desired, allOptions) {
	let button = fxcd(buttonId).onclick = function () {
		let m = new Map();
		for (let e of allOptions) {
			m.set(e, desired);
		}
		setCheckboxValues(containerId, m);
	}
}

function createCheckboxSelection (containerId, defaultsMap) {
	let i = xcd("select");
	let c = xcd("option");
	c.appendChild(txcd("velg innstilling"));
	c.disabled = true;
	c.selected = "selected"
	i.appendChild(c);
	
	for (let k of defaultsMap.keys()) {
		c = xcd("option");
		c.appendChild(txcd(k));
		i.appendChild(c);
	}
	i.onchange = function(e) {
				setCheckboxes(containerId, defaultsMap.get(i.value))
			}
	
	let d = xcd("div");
	d.appendChild(i);
	fxcd(containerId).appendChild(d);
}

function populateCheckboxes(containerId, nameList, defaults) {
	fxcd(containerId).innerHTML = "";
	if (defaults != null) {
		createCheckboxSelection(containerId, defaults);
	}
	for (let c of nameList) {
		createCheckbox(containerId, c);
	}
}

function setupColumnFilter(name) {
	let c = fxcd(name + "-container");
	{
		let input = xcd("input");
		input.type = "file";
		input.id = name + "-file";
		c.appendChild(input);
		c.appendChild(xcd("br"));
	}
	{	
		let f = xcd("form");
		
		let i = xcd("input");
		i.type = "radio";
		i.id = name + "-remove";
		i.name = name + "-option";
		i.value = "remove";
		i.checked = true;
		
		let l = xcd("label");
		l.for = name + "-remove";
		l.appendChild(txcd("Filtrer bort"));
		f.appendChild(i);
		f.appendChild(l);
		f.appendChild(xcd("br"));
		l.onclick = function () {
			toggleCheckbox(name + "-remove");
		}
		
		i = xcd("input");
		i.type = "radio";
		i.id = name + "-keep";
		i.name = name + "-option";
		i.value = "keep";
		
		l = xcd("label");
		l.for = name + "-keep";
		l.appendChild(txcd("Behold"));
		f.appendChild(i);
		f.appendChild(l);
		f.appendChild(xcd("br"));
		l.onclick = function () {
			toggleCheckbox(name + "-keep");
		}
		c.appendChild(f);
	}
	{
		function btn(idSuffix, txt) {
			let b = xcd("button");
			b.type = "button";
			b.disabled = true;
			b.id = name + idSuffix;
			b.appendChild(txcd(txt));
			return b;
		}
		
		c.appendChild(btn("-all-btn", "Velg alle"));
		c.appendChild(txcd(' '))
		c.appendChild(btn("-none-btn", "Velg ingen"));
	}
	{
		let e = xcd("div");
		e.id = name + "-field";
		c.appendChild(e);
		c.appendChild(xcd("br"));
		
		e = xcd("button");
		e.id = name + "-download";
		e.type="button";
		e.disabled = true;
		e.appendChild(txcd("Last ned CSV"));
		c.appendChild(e);
		c.appendChild(txcd(" "));
		
		e = xcd("div");
		e.id = name + "-spinner";
		e.classList.add("spinning");
		e.appendChild(txcd("⚙"));
		c.appendChild(e);
	}
	
	document.body.appendChild(c)
	
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
										var checkFn = function (value) {return (value == fxcd(name + "-keep").checked)};
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
		out.push(add)
	}
	return out;
}


function arrayMerge(arr1, arr2, columnName) {
	
	var out = [];
	var nameIdx1 = arr1[0].indexOf(columnName);
	var nameIdx2 = arr2[0].indexOf(columnName);
	
	var head = []
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
	var head = arr[0].concat(kk)
	for (let c = 0; c < head.length; c += 1) {
		if (c == 2) {
			continue;
		}
		cell = xcd("th");
		cell.appendChild(txcd(head[c]));
		row.appendChild(cell);
		head2.push(head[c]);
	}
	table.appendChild(row);
	
	var monthNames = ["Januar", "Februar", "Mars", "April"];
	
	function newRow(content, className) {
		var r = xcd("tr");
		for (let i = 0; i < content.length; i += 1) {
			var c = xcd("td");
			if (i > 1) {
				if (className != "") {
					c.classList.add(className);
				}
			}
			c.appendChild(txcd(content[i]));
			r.appendChild(c);
		}
		return r;
	}
	
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
		table.appendChild(newRow(row, cls));
	}
	
	
	return [head2].concat(rows);
	
}

function writeArrayTo(array, containerId) {
	
	var table = fxcd(containerId);
	var header = xcd("tr");
	for (let c = 0; c < array[0].length; c += 1) {
		var cell = xcd("th");
		cell.appendChild(txcd(array[0][c]));
		header.appendChild(cell);
	}
	table.appendChild(header);
	
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
			
			cell.appendChild(txcd(val));
			row.appendChild(cell);
		}
		if (array[r].length < 3) {
			var cell = xcd("td");
			cell.classList.add("missing");
			row.appendChild(cell);
		}
		
		table.appendChild(row);
	}
}

function mapKeys(arr) {
	var out = new Map();
	
	
	for (let i = 1; i < arr.length; i += 1) {
		var row = arr[i];
		var name = row[1];
		
		if (out.has(name)) {
			var l = out.get(name)
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
	
	row = xcd("tr");
	cell = xcd("th");
	cell.appendChild(txcd("Seksjon#"));
	row.appendChild(cell);
	cell = xcd("th");
	cell.appendChild(txcd("Navn"));
	row.appendChild(cell);
	cell = xcd("th");
	cell.appendChild(txcd("Nøklerinos"));
	row.appendChild(cell);
	table.appendChild(row);
	
	var counter = new Map();
	let out = [arr[0].concat(["Nøklerinos"])];
	for (let r = 1; r < arr.length; r += 1) {
		
		if (map.has(arr[r][0] == false)) {
			row = xcd("tr");
			cell = xcd("td");
			cell.appendChild(txcd(arr[r][0]));
			row.appendChild(cell);
			cell = xcd("td");
			cell.appendChild(txcd(arr[r][1]));
			row.appendChild(cell);
			cell = xcd("td");
			cell.appendChild(txcd(""));
			cell.classList.add("missing");
			row.appendChild(cell);
			table.appendChild(row);
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
				
				row = xcd("tr");
				cell = xcd("td");
				cell.appendChild(txcd(c1));
				row.appendChild(cell);
				cell = xcd("td");
				cell.appendChild(txcd(c2));
				row.appendChild(cell);
				cell = xcd("td");
				cell.appendChild(txcd(l[c]));
				row.appendChild(cell);
				table.appendChild(row);
			}
			out.push(arr[r].concat(l))
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


function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
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
	
	var row = xcd("tr");
	var cell = xcd("td");
	cell.appendChild(txcd(boliger));
	row.appendChild(cell);
	var cell = xcd("td");
	cell.appendChild(txcd(passive));
	row.appendChild(cell)
	cell = xcd("td");
	cell.appendChild(txcd(active));
	row.appendChild(cell);
	cell = xcd("td");/*
	cell.appendChild(txcd(active/4));
	row.appendChild(cell);*/
	fxcd(containerId).appendChild(row);
}


function dateParse(s) {
	var arr = s.split(".")
	return new Date(arr.reverse());
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

function arrayAddition(src, dst) {
	for (let c = 0; c < src.length; c += 1) {
		dst[c] += src[c];
	}
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
	
	var cost = Math.ceil(duration * (monthCost/nDays))
	var occupant = contract[occupantIdx];
	if (["Driftsadministrasjonen", "Tromsø kommune v/Byggforvaltningen", "Drift Leide Boliger", "Stiftelsen Kommunale Boliger"].includes(occupant)) {
		rep += duration;
		repLoss += cost;
	} else if (occupant == "Passiv") {
		pas += duration;
		pasLoss += cost;
	} //else {
		vac -= duration;
		vacLoss -= cost;
	//}
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
		jT.push(jT[1]+jT[3])
		arrayAddition(e[1][1], fT);
		fT.push(fT[1]+fT[3])
		arrayAddition(e[1][2], mT);
		mT.push(mT[1]+mT[3])
		arrayAddition(e[1][3], aT);
		aT.push(aT[1]+aT[3])
		out.set(e[0], [jT, fT, mT, aT]);
	}
	return out;
}


function monthLossCalc(map) {
	var out = new Map();
	
	for (let e of map.entries()) {
		var jT = [0, 0, 0, 0, 0, 0];
		arrayAddition(e[1][0], jT);
		jT.push(jT[1]+jT[3])
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

function eNumToNNum(n) {
				let u = String(n);
				return u.replace(".", ",");
			}

function semaphore(name) {
	var readyTarget = {
			count: 2
		};
	const readyEvent = new Event(name);
	var ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					
					if (target[key] == 0) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	return ready;
}

function ensureDates(fromId, toId, buttonId) {
	let from = fxcd(fromId);
	let to = fxcd(toId);
	let btn = fxcd(buttonId);
	from.onchange = function () {
		if (to.value != "") {
			btn.disabled = false;
		} else {
			btn.disabled = true;
		}
	}
	to.onchange = function () {
		if (from.value != "") {
			btn.disabled = false;
		} else {
			btn.disabled = true;
		}
	}
}

function dateFun (date) {
	let arr = date.split("-");
	return arr.reverse().join(".");
}

function beginLoss(calcTable, resultTable) {
	let spinner = fxcd("loss-spinner");
	
	var actives = fxcd('active-file');
	var activeList = null;
	var contracts = fxcd('all-contract-file');
	var contractMap = null;
	
	var from = fxcd("date-from");
	var to = fxcd("date-to");
	
	let eventName = "dataReady";
	var readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
	const readyEvent = new Event(eventName);
	const enableEvent = new Event("calcEnable");
	var ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					if (target["countA"] < 1 && target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if( target["countA"] < 1 && target["dateA"] < 1 && target["dateB"] == 0) {
							document.dispatchEvent(enableEvent);
						} else {
							fxcd("loss-btn").disabled = true;
						}
					}
					return true;
				}
		});
	
	fxcd("date-to").onchange = function () {
		if (fxcd("date-to").value == "") {
			ready["dateB"] = 1;
		} else {
		ready["dateB"] -= 1;
		}
	};
	fxcd("date-from").onchange = function () {
		if (fxcd("date-from").value == "") {
		ready["dateA"] = 1;	
		} else {
		ready["dateA"] -= 1;
		}
	};
	actives.onchange = function () {
		if (actives.files.length > 0) {
			ready["countA"] -= 1;
		} else {
			ready["countA"] += 1;
		}
	}
	contracts.onchange = function () {
		if (contracts.files.length > 0) {
			ready["countA"] -= 1;
		} else {
			ready["countA"] += 1;
		}
	}
	document.addEventListener("calcEnable", () => {
		fxcd("loss-btn").disabled = false;
	});
	
	
	
	document.addEventListener(eventName, () => {
			from = dateFun(from.value);
			to = dateFun(to.value);
			var A = activeList;
			var B = contractMap;
			
			var perSection = contractLossCalc2(A, 0, 2, B, 0, 1, 2, 3, from, to);
			var monthly = monthLossCalc(perSection);
			
			let nDays = dateParse(to) - dateParse(from);
			nDays /= Math.round(1000*60*60*24);
			
			let vv = drawSections(activeList, monthly, calcTable, false, nDays);
			
			function fjott (arr, map, containerId) {
				
				var table = fxcd(containerId);
				var row;
				var cell;
				
				function newRow(content, className) {
					var r = xcd("tr");
					for (let i = 0; i < content.length; i += 1) {
						var c = xcd("td");
						if (i > 1) {
							if (className != "") {
								c.classList.add(className);
							}
						}
						c.appendChild(txcd(content[i]));
						r.appendChild(c);
					}
					return r;
				}
				
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
				
				rows.push(j)//, f, m, a)
				for (let r = 0; r < rows.length; r += 1) {
					row = rows[r];
					table.appendChild(newRow(row, ""));
				}
			}
			
			fjott(activeList, monthly, resultTable);
			
			for (let r = 1; r < vv.length; r += 1) {
				let row = vv[r];
				for (let c = 2; c < row.length; c += 1) {
					row[c] = eNumToNNum(row[c]);
				}
			}
			
			let btn = fxcd("download-loss-btn");
			btn.disabled = false;
			btn.onclick = function () {
						downloadCSV(arrayToCSV(vv,";"), "tap " + fxcd("date-from").value + " til " + fxcd("date-to").value + ".csv");
					};
			spinner.style.visibility = "hidden";
		});
	
	fxcd("loss-btn").onclick = function () {
	spinner.style.visibility = "visible";
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Sum"]);
			ready["countB"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			var filter1 = timeFilter(CSVToArray(f2.result, ";"), new Date(from), new Date(to), 6, 7, 12);
			var filter2 = arrayColFilter(filter1, ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
			contractMap =  mapContracts(filter2, 0, 1, 2, 3, 4, 5, from, to);
			ready["countB"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	}
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
				
				function newRow(content, className) {
					var r = xcd("tr");
					for (let i = 0; i < content.length; i += 1) {
						var c = xcd("td");
						if (i > 1) {
							if (className != "") {
								c.classList.add(className);
							}
						}
						c.appendChild(txcd(content[i]));
						r.appendChild(c);
					}
					return r;
				}
				
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
					table.appendChild(newRow(row, ""));
				}
				table.appendChild(newRow(["", "", "", "", "", "", "", ""], ""));
				table.appendChild(newRow(totals), "");
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

function beginGainCalc(calcTable, resultTable, spinnerId) {
	let spinner = fxcd(spinnerId);
	spinner.style.visibility = "visible";
	
	let eventName = "dataReady";
	let ready = semaphore(eventName);
	
	var actives = fxcd('active-file');
	var activeList = null;
	var contracts = fxcd('all-contract-file');
	var contractList = null;
	
	document.addEventListener(eventName, () => {
			
			var A = activeList;
			var B = contractList;
			
			A[0][0] = "Fasilitetsnummer";
			B[0][1] = "Sum inntekter";
			var result = arrayMerge(A, B, "Fasilitetsnummer");
			
			writeArrayTo(result, calcTable);
			writeEndResult(result, resultTable);
			
			for (let r = 1; r < result.length; r += 1) {
				let row = result[r];
				for (let c = 2; c < row.length; c += 1) {
					row[c] = eNumToNNum(row[c]);
				}
			}
			
			let btn = fxcd("download-calc-btn");
			btn.disabled = false;
			btn.onclick = function () {
						downloadCSV(arrayToCSV(result,";"), "inntekter " + fxcd("date-from").value + " til " + fxcd("date-to").value + ".csv");
					};
			spinner.style.visibility = "hidden";
		});	
	
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
			ready["count"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			
			var from = fxcd("date-from").value;
			var to = fxcd("date-to").value;
			from = dateFun(from);
			to = dateFun(to);
			
			var c = contractGainCalc(arrayColFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
			
			contractList = c
			ready["count"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	
}
function line() {
	return xcd("br");
}
function setupKeyFilter(name){
	
	let eName = "dataReady";
	var dataReadyTarget = {
			fileA: 1,
			fileB: 1
		};
	const dataReadyEvent = new Event(eName);
	var dataReady = new Proxy(dataReadyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					if (target["fileA"] <= 0 && target["fileB"] <= 0) {
						document.dispatchEvent(dataReadyEvent);
					}
					return true;
				}
		});
	document.addEventListener(eName, () => {
		fxcd(name + "-calc-btn").disabled = false;
	});
	
	let con = fxcd(name + "-container");
	{
		con.appendChild(txcd("Liste over alle "));
		let tmp = xcd("i");
		tmp.appendChild(txcd("aktive"));
		con.appendChild(tmp);
		
		con.appendChild(txcd(" bolig-seksjoner av kategori "));
		tmp = xcd("i");
		tmp.appendChild(txcd("eid"));
		con.appendChild(tmp);
		
		con.appendChild(txcd(" eller "));
		tmp = xcd("i");
		tmp.appendChild(txcd("Kommunalt foretak - KF"));
		con.appendChild(tmp);
		
		con.appendChild(txcd(":"));
		con.appendChild(line());
		{
			let i = xcd("input");
			i.type = "file";
			i.id = name + "-rentables-file";
			con.appendChild(i);
			con.appendChild(line());
			con.appendChild(line());
			i.onchange = function () {
				if (i.files.length < 1) {
					dataReady["fileA"] += 1;
				} else {
					dataReady["fileA"] -= 1;
				}
			}
		}
	}
	{
		con.appendChild(txcd("Liste over "));
		let tmp = xcd("b");
		tmp.appendChild(txcd("alle"));
		con.appendChild(tmp);
		con.appendChild(txcd(" nøkler:"));
		con.appendChild(line());
		{
			let i = xcd("input");
			i.type = "file";
			i.id = name + "-file";
			con.appendChild(i);
			con.appendChild(line());
			con.appendChild(line());
			i.onchange = function () {
				
				if (i.files.length < 1) {
					dataReady["fileB"] += 1;
				} else {
					dataReady["fileB"] -= 1;
				}
			}
		}
	}
	{
		let b = xcd("button");
		b.disabled = true;
		b.type = "button";
		b.id = name + "-calc-btn";
		
		b.appendChild(txcd("Lag flett"));
		con.appendChild(b);
		con.appendChild(txcd(" "));
		
		b = xcd("button");
		b.disabled = true;
		b.type = "button";
		b.id = name + "-download-btn";
		b.appendChild(txcd("Last ned CSV"));
		
		con.appendChild(b);
		con.appendChild(txcd(" "));
		
		b = xcd("div");
		b.classList.add("spinning");
		b.id = name + "-spinner";
		b.appendChild(txcd("⚙"));
		con.appendChild(b);
		con.appendChild(line());
	}
	con.appendChild(xcd("hr"));
	let t = xcd("table");
	t.id = name + "-table";
	con.appendChild(t);
	
	fxcd(name + "-calc-btn").onclick = function () {
			t.innerHTML = "";
			let spinner = fxcd(name + "-spinner");
			spinner.style.visibility = "visible";
			
			let readyEventName = "dataReady";
			let ready = semaphore(readyEventName);
			
			var rentables = fxcd(name + '-rentables-file');
			var rentablesList = null;
			var keys = fxcd(name + '-file');
			var keysMap = null;
			
			
			
			document.addEventListener(readyEventName, () => {
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
					ready["count"] -= 1;
				}
			f1.readAsText(rentables.files[0]);
			
			var f2 = new FileReader();
			f2.onload = function(){
					var arr = CSVToArray(f2.result, ";");
					var filtered = arrayColFilter(arr, ["Nummer", "Seksjonsnr"]);
					keysMap = mapKeys(filtered);
					ready["count"] -= 1;
				}
			f2.readAsText(keys.files[0]);
			
		}
	
	
	
}
