"use strict";

function setupColumnFilter() {
	
	let button = fxcd("download");
	let file = fxcd("file");
	let spinner = fxcd("spinner");
	
	let inputCSV = null;
	let outputCSV = null;
	
	let wanted = [];
		
	const eventName = "dataReady";
	let readyTarget = {
			A: 1,
			B: 0
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					if (target["A"]  < 1) {
						outputCSV = arrayColFilter(inputCSV, wanted);
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	fxcd("field").onchange = () => {
			spinnerFunction("spinner", () => {
					wanted = [];
					for (let e of mapCheckboxes("field").entries()) {
						if ((e[1] == fxcd("keep-option").checked) == true) {
							wanted.push(e[0]);
						}
					}
					ready["B"] += 1;
		});
		};
	
	file.onchange = () => {
			show(spinner);
			inputCSV = null;
			button.disabled = true;
			if (file.files.length >= 1) {
				let r = new FileReader();
				r.onload = () => {
						inputCSV = CSVToArray(r.result, ";");
						const options = inputCSV[0];
						
						populateCheckboxes("field", options, null);
						allOrNoneBtn("all-btn", "field", true, options);
						allOrNoneBtn("none-btn", "field", false, options);
						fxcd("all-btn").disabled = false;
						fxcd("none-btn").disabled = false;
						button.disabled = false;
						ready['A'] -= 1;
						
					};
				r.readAsText(file.files[0], "iso-8859-1");
				
					
			} else {
				fxcd("field").innerHTML = "";
				fxcd("all-btn").disabled = true;
				fxcd("none-btn").disabled = true;
				ready['A'] += 1;
				hide(spinner);
			}
			
		};
	
	
	document.addEventListener(eventName, () => {
		button.disabled = false;
		
			downloadButton(button, outputCSV, fxcd("file").files[0].name.replace(".csv", " - filtrert.csv"));
			hide(spinner);
		});
}


function arrayRowFilter(inputCSV, idIdx, filterCSV, filterIdx, keepOpt) {
	let output = [inputCSV[0]];
	for (let i = 1; i < inputCSV.length; i += 1) {
		
		const a = inputCSV[i][idIdx];
		let found = false;
		
		for (let j = 0; j < filterCSV.length; j += 1) {
			const b = filterCSV[j][filterIdx];
			if (a == b) {
				found = true;
				break;
			}
		}
		if ((found && keepOpt) || (!found && !keepOpt)) {
			output.push(inputCSV[i]);
		}
	}
	return output;
}

function setupRowFilter() {
	let inputCSV = null;
	let contrastCSV = null;
	let outputCSV = null;
	
	const eventName = "dataReady";
	let readyTarget = {
			A: 1,
			B: 1,
			C: 1,
			D: 1,
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					
					if (target["A"]  < 1 && target["B"]  < 1 && target["C"] < 1 && target["D"] < 1) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target['A'] > 0) {
							inputCSV = null;
						}
						if (target['B'] > 0) {
							contrastCSV = null;
						}
						fxcd("download").disabled = true;
						outputCSV = null;
					}
					return true;
				}
		});
	
		
	let spinner = fxcd("spinner");
	fxcd("contrast-column").onchange = () => {
			show(spinner);
			ready["C"] = 0;
			hide(spinner);
		};
	fxcd("id-column").onchange = () => {
			show(spinner);
			ready["D"] = 0;
			hide(spinner);
		};	
	
	fxcd("contrast-file").onchange = (evt) => {
			show(spinner);
			if (evt.target.files.length >= 1) {
				let r = new FileReader();
				r.onload = () => {
						let l = fxcd("contrast-column");
						l.innerHTML = "";
						axcd(l, optionTag("Velg", -1, true, true));
						let arr = CSVToArray(r.result, ";");
						
						for (let i = 0; i < arr[0].length; i += 1) {
							const e = arr[0][i];
							if (isInvalid(e)) {
								continue;
							}
							axcd(l, optionTag(e, i, false, false));
						}
						contrastCSV = arr;
						ready['B'] = 0;
					};
				r.readAsText(evt.target.files[0], "iso-8859-1");
								
			} else {
				ready['B'] = 1;
			}
			hide(spinner);
		};
		
	let button = fxcd("download");
	let file = fxcd("file");
	file.onchange = () => {
			show(spinner);
			if (file.files.length >= 1) {
				let r = new FileReader();
				r.onload = () => {
						let arr = CSVToArray(r.result, ";");
						
						let l = fxcd("id-column");
						l.innerHTML = "";
						axcd(l, optionTag("Velg", -1, true, true));
						
						for (let i = 0; i < arr[0].length; i += 1) {
							const e = arr[0][i];
							if (isInvalid(e)) {
								continue;
							}
							axcd(l, optionTag(e, i, false, false));
						}
						
						ready['A'] = 0;
						inputCSV = arr;
					};
				r.readAsText(file.files[0], "iso-8859-1");
			} else {
				ready['A'] = 1;
			}
			hide(spinner);
		};
	
	document.addEventListener(eventName, () => {
			show(spinner);
			
			const idIdx = parseInt(fxcd("id-column").value);
			const filterIdx = parseInt(fxcd("contrast-column").value);
			const keep = fxcd("keep-option").checked;
			
			outputCSV = arrayRowFilter(inputCSV, idIdx, contrastCSV, filterIdx, keep);
			
			button.disabled = false;
			downloadButton(button, outputCSV, fxcd("file").files[0].name.replace(".csv", " - filtrert.csv"))
			hide(spinner);
		});
}


function testRowFilter() {
	
	const csv = [["fisk", "col a", "col b", "col c"],
			["7", "1234", "1235", "1236"], 
			["9", "1134", "1135", "1136"], 
			["0", "1134", "13", "2136"], 
			["1", "1134", "35", "1236"], 
			["2", "1580", "1580", "1580"]
		];
	const filter1 = [["col a", "col b", "col c"],
			["1134", "1135", "1136"]
		];
	const filter2 = [["fisk", "col a", "col c"],
			["1", "1134", "1236"]
		];
	
	const wanted1 = [["fisk", "col a", "col b", "col c"],
			["9", "1134", "1135", "1136"], 
			["0", "1134", "13", "2136"], 
			["1", "1134", "35", "1236"]
		];
	const wanted2 = [["fisk", "col a", "col b", "col c"],
			["7", "1234", "1235", "1236"],
			["1", "1134", "35", "1236"]
		];
	
	if (compareArrays(wanted1, arrayRowFilter(csv, 1, filter1, 0, true))) {
		return true;
	}
	if (compareArrays(wanted2, arrayRowFilter(csv, 3, filter2, 2, true))) {
		return true;
	}
	return false;
}

function testColFilter() {
	
	let csv = [["col a", "col b", "col c"],
			["1234", "1235", "1236"], 
			["1134", "1135", "1136"], 
			["1580", "1580", "1580"]
		];
	
	let wanted1 = [["col a", "col b"],
			["1234", "1235"],
			["1134", "1135"],
			["1580", "1580"],
		];
	let wanted2 = [["col b", "col c"],
			["1235", "1236"], 
			["1135", "1136"], 
			["1580", "1580"]
		];
	
	if (compareArrays(wanted1, arrayColFilter(csv, ["col a", "col b"]))) {
		return true;
	}
	if (compareArrays(wanted2, arrayColFilter(csv, ["col b", "col c"]))) {
		return true;
	}
	return false;
}

function unitTest () {
	return (testColFilter() | testRowFilter());
}
	