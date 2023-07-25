"use strict";

function CSVToArray( strData, strDelimiter ){
	
	strDelimiter = (strDelimiter || ",");
	let objPattern = new RegExp(
			(
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			"gi"
			);

	let arrData = [[]];
	let arrMatches = null;

	while (arrMatches = objPattern.exec( strData )){
		let strMatchedDelimiter = arrMatches[ 1 ];
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
			){
			arrData.push( [] );
		}

		let strMatchedValue;
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
			let row = [];
			for(let c = 0; c < rowArray.length; c += 1) {
				let f = rowArray[c];
				if ((f == undefined) == false) {
					if (isNaN(f)) {
						if (isNaN(parseFloat(f.replaceAll(",", ".")/2)) == true) {
							if (f[0] == "-" || f[0] == "=") {
								f = "'" + rowArray[c] + "'";
							}
						}
					}
					f = encodeURIComponent(f);
				} else {
					f = "";
				}
				
				row.push(f);
			}
			out += row.join(separator) + "\r\n";
		});
	return out;
}

function downloadCSV(csvContent, fileName) {
	let link = xcd("a");
	link.setAttribute("href", csvContent);
	link.setAttribute("download", fileName);
	link.hidden = true;
	axcd(document.body, link);

	link.click();
}