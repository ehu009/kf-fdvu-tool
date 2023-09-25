"use strict";

function setupColumnFilter() {
	
	let button = fxcd("download");
	let file = fxcd("file");
	let spinner = fxcd("spinner");
	file.onchange = () => {
			show(spinner);
			button.disabled = true;
			if (file.files.length >= 1) {
				spinnerFunction ("spinner", () => {
						let r = new FileReader();
						r.onload = () => {
								let arr = CSVToArray(r.result, ";");
								const options = arr[0];
								populateCheckboxes("field", options, null);
								allOrNoneBtn("all-btn", "field", true, options);
								allOrNoneBtn("none-btn", "field", false, options);
								fxcd("all-btn").disabled = false;
								fxcd("none-btn").disabled = false;
								button.disabled = false;
							};
						r.readAsText(file.files[0], "iso-8859-1");
					});
			} else {
				fxcd("field").innerHTML = "";
				fxcd("all-btn").disabled = true;
				fxcd("none-btn").disabled = true;
			}
			hide(spinner);
		};
	
	button.onclick = () => {
			show(spinner);
			let r = new FileReader();
			let fileInput = fxcd("file");
			r.onload = () => {
					let arr = CSVToArray(r.result, ";");
					
					let wanted = [];
					for (let e of mapCheckboxes("field").entries()) {
						if ((e[1] == fxcd("keep-option").checked) == true) {
							wanted.push(e[0]);
						}
					}
					downloadCSV(arrayToCSV(arrayColFilter(arr, wanted),";"), fileInput.files[0].name.replace(".csv", " - filtrert.csv"));
				};
			r.readAsText(fileInput.files[0], "iso-8859-1");
			hide(spinner);
		};
}


function setupRowFilter() {
	let inputCSV = null;
	let contrastCSV = null;
	let outputCSV = null;
	
	const eventName = "dataReady";
	let readyTarget = {
			A: 1,
			B: 1,
			C: 1
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					
					if (target["A"]  < 1 && target["B"]  < 1 && target["C"] < 1) {
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
		
	fxcd("contrast-file").onchange = (evt) => {
			show(spinner);
			if (evt.target.files.length >= 1) {
				let r = new FileReader();
				r.onload = () => {
						let l = fxcd("contrast-column");
						l.innerHTML = "";
						axcd(l, optionTag("Velg", true, true));
						let arr = CSVToArray(r.result, ";");
						for (let e of arr[0]) {
							if (isInvalid(e)) {
								continue;
							}
							axcd(l, optionTag(e, false, false));
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
			outputCSV = [inputCSV[0]];
			
			const filterIdx = contrastCSV[0].indexOf(fxcd("contrast-column").value);
			if (fxcd("keep-option").checked == false) {
				let mep = new Map();
				for (let i = 1; i < inputCSV.length; i += 1) {
					mep.set(inputCSV[i][filterIdx], inputCSV[i]);
				}
				for (let i = 1; i < contrastCSV.length; i += 1) {
					const f = contrastCSV[i][filterIdx];	
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
			hide(spinner);
		});
	
	button.onclick = () => {
			downloadCSV(arrayToCSV(outputCSV,";"), fxcd("file").files[0].name.replace(".csv", " - filtrert.csv"));
		};
}

function testRowFilter() {
	/*
	let csv = [["col a", "col b", "col c"],
			["1234", "1235", "1236"], 
			["1134", "1135", "1136"], 
			["1580", "1580", "1580"]
		];
	
	let q1 = arrayColFilter(csv, ["col a", "col b"]);
	let q2 = arrayColFilter(csv, ["col b", "col c"]);
	
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
	
	let err = false;
	for (let r = 0; r < q1.length; r += 1) {
		for (let c = 0; c < q1[r].length; c += 1) {
			if (q1[r][c] != wanted1[r][c]) {
				err = true;
				break;
			}
		}
		if (err) {
			break;
		}
	}
	for (let r = 0; r < q2.length; r += 1) {
		for (let c = 0; c < q2[r].length; c += 1) {
			if (q2[r][c] != wanted2[r][c]) {
				err = true;
				break;
			}
		}
		if (err) {
			break;
		}
	}
	return err;
	*/
	return true;
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
	