'use strict';

function CSVToArray(strData, strDelimiter) {
	
	strDelimiter = (strDelimiter || ',');
	let objPattern = new RegExp(
			(
				"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				"([^\"\\" + strDelimiter + "\\r\\n]*))"
			),
			'gi'
		);

	const arrData = [[]];
	let arrMatches = null;

	while (arrMatches = objPattern.exec(strData)) {
		const strMatchedDelimiter = arrMatches[1];
		if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
			arrData.push([]);
		}

		let strMatchedValue;
		if (arrMatches[2]) {
			strMatchedValue = arrMatches[2].replace(new RegExp("''", 'g'), "'");
		} else {
			strMatchedValue = arrMatches[3];
		}
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	CSVRemoveBlanks(arrData);
	return arrData;
}

function arrayToCSV(arr, separator) {
	let out = 'data:text/csv;charset=utf-8,';
	arr.forEach((rowArray) => {
			const row = [];
			for (let c = 0; c < rowArray.length; c += 1) {
				let f = rowArray[c];
				if ((f == undefined) == false) {
					if (isNaN(f)) {
						if (isNaN(parseFloat(f.replaceAll(',', '.')/2)) == true) {
							if (f[0] == '-' || f[0] == '=') {
								f = "'" + rowArray[c] + "'";
							}
						}
					}
					f = encodeURIComponent(f);
				} else {
					f = '';
				}
				
				row.push(f);
			}
			out += row.join(separator) + '\r\n';
		});
	return out;
}

function CSVRemoveBlanks(csv) {
	for (let j = csv.length - 1; j >= 0; j -= 1) {
		if (csv[j].length == 1 || csv[j].length == 0) {
			csv.splice(j,1);
		} else {
			let empty = csv[j].length;
			for (let k = 0; k < csv[j].length; k += 1) {
				if (isInvalid(csv[j][k])) {
					empty -= 1;
				} else {
					break;
				}
			}
			if (empty == 0) {
				csv.splice(j,1);
			}
		}
	}
}

function mergeCSV(csvList) {
	let out = csvList[0];
	for (let i = 1; i < csvList.length; i += 1) {
		csvList[i].shift();
		out = out.concat(csvList[i]);
	}
	return out;
}

function downloadCSV(csvContent, defaultName, separator) {
	let fname = prompt('Oppgi filnavn for lagring', defaultName);
	if (fname != null) {
		fname = fname.replace('.csv', '');
		const link = downloadLink(arrayToCSV(csvContent, separator), fname + '.csv');
		axcd(document.body, link);
		link.click();
	}
}
