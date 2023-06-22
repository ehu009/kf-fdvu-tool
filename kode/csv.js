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
			let row = [];
			for(let c = 0; c < rowArray.length; c += 1) {
				let f = rowArray[c];
				if ((f == undefined) == false) {
					if (isNaN(parseFloat(f.replaceAll(",", ".")/2)) == true) {
						if (f[0] == "-" || f[0] == "=") {
							f = "'" + rowArray[c] + "'";
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
	var link = xcd("a");
	link.setAttribute("href", csvContent);
	link.setAttribute("download", fileName);
	link.hidden = true;
	axcd(document.body, link);

	link.click();
}