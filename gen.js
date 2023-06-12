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
	
	
	populateCheckboxes(name + "-field", options, null);
	allOrNoneBtn(name + "-all-btn", name + "-field", true, options);
	allOrNoneBtn(name + "-none-btn", name + "-field", false, options);
	
	
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
										downloadCSV(arrayToCSV(arrayFilter(arr, wanted),";"), fileInput.files[0].name.replace(".csv", " - filtrert.csv"));
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


function calcDays(begin, stop, cutoffLow, cutoffHigh) {
	var start = dateParse(begin).getTime();
	var end = dateParse(stop).getTime();
	var l = cutoffLow.getTime();
	var h = cutoffHigh.getTime();
	if (start <  l) {
		start = l;
	}
	if (end > h) {
		end = h;
	}
	return (Math.round(end - start) / (1000 * 60 * 60 * 24));
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

function contractCalc(arr, cutoffLow, cutoffHigh) {
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
			
			
			var c = contractCalc(arrayColFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
			
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