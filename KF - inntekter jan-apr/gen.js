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

function arrayFilter(array, wantedList) {
	
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
	console.log(head)
	
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
			activeList = arrayFilter(CSVToArray(f1.result, ";"), ["Nummer", "Navn"]);
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
			
			
			var c = contractCalc(arrayFilter(contractFilter(CSVToArray(f2.result, ";"), from, to), ["Fasilitetsnummer", "Sum", "Fra", "Til", "Leietaker"]), from, to);
			
			contractList = c
			ready["count"] -= 1;
		}
	f2.readAsText(contracts.files[0]);
	
}