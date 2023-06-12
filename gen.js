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
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", fileName);
	link.hidden = true;
	document.body.appendChild(link); // Required for FF

	link.click(); // This will download the data file named "my_data.csv".
}





function spinnerFunction(spinnerId, func) {
	let spinner = document.getElementById(spinnerId);
	spinner.style.visibility = "visible";
	func();
	spinner.style.visibility = "hidden";
}



function toggleCheckbox(id) {
	let b = document.getElementById(id);
	if (b.checked == true) {
		b.checked = false;
	} else if (b.checked == false) {
		b.checked = true;
		return;
	}
}

function createCheckbox(container, name) {
	let n = "checkbox";
	let c = document.createElement("span");
	{
		let label = document.createElement("label");
		label.appendChild(document.createTextNode(name));
		label.onclick = function () {
					toggleCheckbox(name + "-" + n);
				}
		c.appendChild(label);
	}
	{
		let box = document.createElement("input");
		box.type = n;
		box.id = name + "-" + n;
		c.appendChild(box);
	}
	c.classList.add("checkbox-container");
	document.getElementById(container).appendChild(c);
}

function mapCheckboxes(containerId) {
	let out = new Map();	
	for (let n of document.getElementById(containerId).childNodes) {
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
	
	for (let n of document.getElementById(containerId).childNodes) {
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
	let button = document.getElementById(buttonId).onclick = function () {
		let m = new Map();
		for (let e of allOptions) {
			m.set(e, desired);
		}
		setCheckboxValues(containerId, m);
	}
}

function createCheckboxSelection (containerId, defaultsMap) {
	let i = document.createElement("select");
	let c = document.createElement("option");
	c.appendChild(document.createTextNode("velg innstilling"));
	c.disabled = true;
	c.selected = "selected"
	i.appendChild(c);
	
	for (let k of defaultsMap.keys()) {
		c = document.createElement("option");
		c.appendChild(document.createTextNode(k));
		i.appendChild(c);
	}
	i.onchange = function(e) {
				setCheckboxes(containerId, defaultsMap.get(i.value))
			}
	
	let d = document.createElement("div");
	d.appendChild(i);
	document.getElementById(containerId).appendChild(d);
}

function populateCheckboxes(containerId, nameList, defaults) {
	if (defaults != null) {
		createCheckboxSelection(containerId, defaults);
	}
	for (let c of nameList) {
		createCheckbox(containerId, c);
	}
}

function setupColumnFilter(name, options)	{
	let c = document.getElementById(name + "-container");
	{
		let input = document.createElement("input");
		input.type = "file";
		input.id = name + "-file";
		c.appendChild(input);
		c.appendChild(document.createElement("br"));
	}
	{	
		let f = document.createElement("form");
		
		let i = document.createElement("input");
		i.type = "radio";
		i.id = name + "-remove";
		i.name = name + "-option";
		i.value = "remove";
		i.checked = true;
		
		let l = document.createElement("label");
		l.for = name + "-remove";
		l.appendChild(document.createTextNode("Filtrer bort"));
		f.appendChild(i);
		f.appendChild(l);
		f.appendChild(document.createElement("br"));
		//
		
		i = document.createElement("input");
		i.type = "radio";
		i.id = name + "-keep";
		i.name = name + "-option";
		i.value = "keep";
		
		l = document.createElement("label");
		l.for = name + "-keep";
		l.appendChild(document.createTextNode("Behold"));
		f.appendChild(i);
		f.appendChild(l);
		f.appendChild(document.createElement("br"));
		
		c.appendChild(f);
	}
	{
		let b = document.createElement("button");
		b.type = "button";
		b.id = name + "-all-btn";
		b.appendChild(document.createTextNode("Velg alle"));
		c.appendChild(b);
		
		b = document.createElement("button");
		b.type = "button";
		b.id = name + "-none-btn";
		b.appendChild(document.createTextNode("Velg ingen"));
		c.appendChild(b);
	}
	{
		let e = document.createElement("div");
		e.id = name + "-field";
		c.appendChild(e);
		
		e = document.createElement("button");
		e.id = name + "-download";
		e.type="button";
		e.disabled = true;
		e.appendChild(document.createTextNode("Generer og last ned"));
		c.appendChild(e);
		c.appendChild(document.createTextNode(" "));
		
		e = document.createElement("div");
		e.id = name + "-spinner";
		e.classList.add("spinning");
		e.appendChild(document.createTextNode("⚙"));
		c.appendChild(e);
	}
	
	document.body.appendChild(c)
	
	let file = document.getElementById(name + "-file");
	file.onchange = function() {
		console.log("boif")
		
					if (file.files.length < 1) {
						return;
					}
					spinnerFunction(name + "-spinner", function() {
								let r = new FileReader();
								r.onload = function(){
											let arr = CSVToArray(r.result, ";");
											let options = arr[0];
											populateCheckboxes(name + "-field", options, null);
											allOrNoneBtn(name + "-all-btn", name + "-field", true, options);
											allOrNoneBtn(name + "-none-btn", name + "-field", false, options);
										};
								r.readAsText(file.files[0]);
							});
				};
	
	
	let button = document.getElementById(name + "-download");
	document.getElementById(name + "-file").onchange = function() {
				if (document.getElementById(name + "-file").files.length == 0) {
					button.disabled = true;
				} else {
					button.disabled = false;
				}
			};
	
	button.onclick = function() {
				spinnerFunction(name + "-spinner", function() {
							let r = new FileReader();
							let fileInput = document.getElementById(name + "-file");
							r.onload = function(){
										let arr = CSVToArray(r.result, ";");
										let wanted = [];
										var checkFn = function (value) {return (value == document.getElementById(name + "-keep").checked)};
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


function drawSections(arr, map, containerId) {
	
	var table = document.getElementById(containerId);
	var row;
	var cell;
	
	row = document.createElement("tr");
	var head = arr[0].concat(["måned", "dager vakant", "vakansetap", "dager vedlikehold", "vedlikeholdstap", "dager passiv", "passiv kostnad", "vakanse + drift"])
	for (let c = 0; c < head.length; c += 1) {
		if (c == 2) {
			continue;
		}
		cell = document.createElement("th");
		cell.appendChild(document.createTextNode(head[c]));
		row.appendChild(cell);
	}
	table.appendChild(row);
	
	var monthNames = ["Januar", "Februar", "Mars", "April"];
	
	function newRow(content, className) {
		var r = document.createElement("tr");
		for (let i = 0; i < content.length; i += 1) {
			var c = document.createElement("td");
			if (i > 1) {
				if (className != "") {
					c.classList.add(className);
				}
			}
			c.appendChild(document.createTextNode(content[i]));
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
				pt.push(monthNames[m]);
				rows.push(pt.concat(months[m]));
			}
		} else {
			
			for (let m = 0; m < 4; m += 1) {
				var pt = [arr[r][0], ""];
				if (m == 0) {
					pt = [arr[r][0], arr[r][1]];
				}
				pt.push(monthNames[m]);
				rows.push(pt.concat([0,0,0,0,0,0]));
			}
		}
	}
	for (let r = 0; r < rows.length; r += 1) {
		var row = rows[r];
		
		var cls = "missing";
		var maxAllowed = 31;
		switch(row[2]) {
			case "Februar":
			maxAllowed = 28;
			break;
			case "April":
			maxAllowed = 30;
			break;
		}
		if (row[3] < maxAllowed) {
			
			cls = "";
			if (row[3] < 0) {
				cls = "double";
			}
		}
		
		table.appendChild(newRow(row, cls));
	}
}

function writeArrayTo(array, containerId) {
	
	var table = document.getElementById(containerId);
	var header = document.createElement("tr");
	for (let c = 0; c < array[0].length; c += 1) {
		var cell = document.createElement("th");
		cell.appendChild(document.createTextNode(array[0][c]));
		header.appendChild(cell);
	}
	table.appendChild(header);
	
	for (let r = 1; r < array.length; r += 1) {
		
		var row = document.createElement("tr");
		
		for (let c = 0; c < array[r].length; c += 1) {
			var val = array[r][c];
			var cell = document.createElement("td");
			
			if (c == 2) {
				//val = stringToNumber(val);
				if (val < 0) {
					cell.classList.add("passive");
					val = null;
				}
				if (val == 0 || val == null) {
					cell.classList.add("danger");
				}
			}
			
			cell.appendChild(document.createTextNode(val));
			row.appendChild(cell);
		}
		if (array[r].length < 3) {
			var cell = document.createElement("td");
			cell.classList.add("missing");
			//cell.appendChild(document.createTextNode());
			row.appendChild(cell);
		}
			
			
			
			
				/*
		if (array[r].length < 4) {
			var cell = document.createElement("td");
			cell.appendChild(document.createTextNode(array[r][2]));
			cell.classList.add("missing");
			row.appendChild(cell);
		}*/
		
		
		
		//color green
		
		
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
	var table = document.getElementById(dst);
	var row;
	var cell;
	console.log(map)
	row = document.createElement("tr");
	cell = document.createElement("th");
	cell.appendChild(document.createTextNode("Seksjon#"));
	row.appendChild(cell);
	cell = document.createElement("th");
	cell.appendChild(document.createTextNode("Navn"));
	row.appendChild(cell);
	cell = document.createElement("th");
	cell.appendChild(document.createTextNode("Nøkler"));
	row.appendChild(cell);
	table.appendChild(row);
	
	var counter = new Map();
	
	for (let r = 1; r < arr.length; r += 1) {
		
		if (map.has(arr[r][0] == false)) {
			row = document.createElement("tr");
			cell = document.createElement("td");
			cell.appendChild(document.createTextNode(arr[r][0]));
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.appendChild(document.createTextNode(arr[r][1]));
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.appendChild(document.createTextNode(""));
			cell.classList.add("missing");
			row.appendChild(cell);
			table.appendChild(row);
		} else {
			var l = map.get(arr[r][0]);
			if (l == undefined) {
				continue;
				console.log(arr[r])
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
				
				row = document.createElement("tr");
				cell = document.createElement("td");
				cell.appendChild(document.createTextNode(c1));
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.appendChild(document.createTextNode(c2));
				row.appendChild(cell);
				cell = document.createElement("td");
				cell.appendChild(document.createTextNode(l[c]));
				row.appendChild(cell);
				table.appendChild(row);
			}
			
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
	console.log("under: "+under+", above: "+above)
}


function stringToNumber(s) {
	return parseInt(s.replace(",", "."));
}

function writeEndResult(array, containerId) {

	var boliger = 0;
	var active = 0;
	var passive = 0;
	console.log(array.length)
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
	
	var row = document.createElement("tr");
	var cell = document.createElement("td");
	cell.appendChild(document.createTextNode(boliger));
	row.appendChild(cell);
	var cell = document.createElement("td");
	cell.appendChild(document.createTextNode(passive));
	row.appendChild(cell)
	cell = document.createElement("td");
	cell.appendChild(document.createTextNode(active));
	//cell.appendChild(document.createTextNode(contract));
	row.appendChild(cell);
	cell = document.createElement("td");
	cell.appendChild(document.createTextNode(active/4));
	row.appendChild(cell);
	document.getElementById(containerId).appendChild(row);
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
	console.log(arr)
	var map = new Map();
	
	for (let r = 1; r < arr.length; r += 1) {
		var fnr = arr[r][4];
		var val = stringToNumber(arr[r][3]);
		if (arr[r][0] == "Passiv" || arr[r][0] == "Driftsadministrasjonen") {
			val = -1;
			//if (!map.has(fnr)) {
				map.set(fnr, -1);
			/*
			} else {
				var s = map.get(fnr);
				s += (days*val/30);
				map.set(fnr, s);
			}*/
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
		
		
		var days = calcDays(arr[r][1], arr[r][2], dateParse(cutoffLow), dateParse(cutoffHigh));
		console.log("days: "+days);
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
			
			//out.set(arr[r][nameIdx], [j, f, m, a]);
		//} else {
			//
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

function totalResultCalc(months, header) {
	var t = [0, 0, 0, 0, 0, 0];
	arrayAddition(months[0], t);
	arrayAddition(months[1], t);
	arrayAddition(months[2], t);
	arrayAddition(months[3], t);
	
	t.unshift("");
	return t;
}


function attachNames(arr, map) {
	var out = [arr[0].concat(["måned", "dager vakant", "vakansetap", "dager vedlikehold", "vedlikeholdstap", "dager passiv", "passiv kostnad"])];
	var monthNames = ["Januar", "Februar", "Mars", "April"]
	for (let r = 1; r < arr.length; r += 1) {
		var add = [];
		if (map.has(arr[r][0])) {
			var l = map.get(arr[r][0]);
			for (let c = 0; c < l.length; c += 1) {
				add.push([monthNames[c]].concat(l[c]));
			}
		}
		out.push([arr[r][0], arr[r][1], add])
	}
	return out;
}
	
function attachMonthNames(monthly) {
	var out = [];
	var monthNames = ["Januar", "Februar", "Mars", "April"]
	for (let r = 0; r < monthly.length; r += 1) {
		var row = [monthNames[r]];
		for (let c = 0; c < monthly[r].length; c += 1) {
			row.push(monthly[r][c]);
		}
		out.push(row);
	}
	return out;
}


function beginLoss(calcTable, resultTable) {
	
	var readyTarget = {
			count:2
		};
	const readyEvent = new Event("dataReady");
	var ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					
					if (target[key] == 0) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	var actives = document.getElementById('active-file');
	var activeList = null;
	var contracts = document.getElementById('all-contract-file');
	var contractMap = null;
	
	
	document.addEventListener("dataReady", () => {
			var A = activeList;
			var B = contractMap;
			
			var perSection = contractLossCalc(A, 0, 2, B, 0, 1, 2, 3);
			var monthly = monthResultCalc(perSection);
			drawSections(activeList, monthly, calcTable);
			
			
			function fjott (arr, map, containerId) {
				
				var table = document.getElementById(containerId);
				var row;
				var cell;
				
				/*
				row = document.createElement("tr");
				var head = arr[0].concat(["måned", "dager vakant", "vakansetap", "dager vedlikehold", "vedlikeholdstap", "dager passiv", "passiv kostnad", "vakanse + drift"])
				for (let c = 0; c < head.length; c += 1) {
					if (c == 2) {
						continue;
					}
					cell = document.createElement("th");
					cell.appendChild(document.createTextNode(head[c]));
					row.appendChild(cell);
				}
				table.appendChild(row);
				*/
				var monthNames = ["Januar", "Februar", "Mars", "April"];
				
				function newRow(content, className) {
					var r = document.createElement("tr");
					for (let i = 0; i < content.length; i += 1) {
						var c = document.createElement("td");
						if (i > 1) {
							if (className != "") {
								c.classList.add(className);
							}
						}
						c.appendChild(document.createTextNode(content[i]));
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
					console.log(row)
					table.appendChild(newRow(row, ""));
				}
				
				
				table.appendChild(newRow(["", "", "", "", "", "", "", ""], ""));
				table.appendChild(newRow(totals), "");
				
				
				
				
				
			}
			
			fjott(activeList, monthly, resultTable)
			
			
			
			/*
			var total = totalResultCalc(activeList, monthly)
			
			
			drawTotals(monthsWithNames, total, resultTable);
			*/
			//console.log(monthsWithNames)
		});
	
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn", "Sum"]);
			ready["count"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			var filter1 = timeFilter(CSVToArray(f2.result, ";"), new Date("2023 01 01"), new Date("2023 05 01"), 6, 7, 12);
			var filter2 = arrayFilter(filter1, ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
			contractMap =  mapContracts(filter2, 0, 1, 2, 3, 4, 5);
			ready["count"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	
}

function beginGainCalc(calcTable, resultTable) {
	
	var readyTarget = {
			count:2
		};
	const readyEvent = new Event("dataReady");
	
	
	var actives = document.getElementById('active-file');
	var activeList = null;
	var contracts = document.getElementById('all-contract-file');
	var contractList = null;
	
	var ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					
					if (target[key] == 0) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	document.addEventListener("dataReady", () => {
			var A = activeList;
			var B = contractList;
			
			A[0][0] = "Fasilitetsnummer";
			//A[0][2] = "Seksjon pris";
			B[0][1] = "Sum inntekter";
			var result = arrayMerge(A, B, "Fasilitetsnummer");
			
			writeArrayTo(result, calcTable);
			let btn = document.getElementById("download-calc-btn");
			btn.disabled = false;
			btn.onclick = function () {
						downloadCSV(arrayToCSV(result,";"), "inntekter " + document.getElementById("date-from").value + " til " + document.getElementById("date-to").value + ".csv");
					};
			
			writeEndResult(result, resultTable);
			
		});	
	
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
			ready["count"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			
			var from = document.getElementById("date-from").value;
			var to = document.getElementById("date-to").value;
			
			function fun (date) {
				let arr = date.split("-");
				return arr.reverse().join(".");
			}
			from = fun(from);
			to = fun(to);
			
			
			var c = contractGainCalc(arrayColFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
			
			contractList = c
			ready["count"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	
}

function beginKeys(calcTable, resultTable) {
	
	var readyTarget = {
			count:2
		};
	const readyEvent = new Event("dataReady");
	var ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					
					if (target[key] == 0) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	var actives = document.getElementById('active-file');
	var activeList = null;
	var keys = document.getElementById('key-file');
	var keysMap = null;
	
	
	document.addEventListener("dataReady", () => {
			var A = activeList;
			var B = keysMap;
			
			drawKeys(A, B, calcTable);
		});
	
	var f1 = new FileReader();
	f1.onload = function(){
			activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
			ready["count"] -= 1;
		}
	f1.readAsText(actives.files[0]);
	
	var f2 = new FileReader();
	f2.onload = function(){
			var arr = CSVToArray(f2.result, ";");
			var filtered = arrayColFilter(arr, ["Nummer", "Seksjonsnr"]);
			keysMap = mapKeys(filtered);
			ready["count"] -= 1;
		}
	f2.readAsText(keys.files[0]);
	
}