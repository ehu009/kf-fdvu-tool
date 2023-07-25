"use strict";

function setupColumnFilter() {
	let name = 'col-filter';
	
	let c = xcd("h2");
	axcd(c, txcd("Filtrer kolonner i CSV-dokument"));
	axcd(document.body, c);
	
	c = xcd("div");
	c.id = name + "-container";
	c.classList.add("cont");
	axcd(document.body, c);
	
	{
		let f = xcd("input");
		f.type = "file";
		f.id = name + "-file";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		f = xcd("form");
		let l = labelTag("remove-option", "Filtrer bort");
		axcd(f, radioButtonTag("remove-option", "radio-val", "remove", true));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = () => { toggleCheckbox("remove-option"); };
		
		l = labelTag("keep-option", "Behold");
		axcd(f, radioButtonTag("keep-option", "radio-val", "keep", false));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = () => { toggleCheckbox("keep-option"); };
		axcd(c, f);
		
		axcd(c, buttonTag(name + "-all-btn", "Velg alle", true));
		axcd(c, txcd(' '));
		axcd(c, buttonTag(name + "-none-btn", "Velg ingen", true));
		
		f = xcd("div");
		f.id = name + "-field";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		axcd(c, buttonTag(name + "-download", "Last ned CSV", true));
		axcd(c, txcd(" "));
		
		axcd(c, spinnerTag(name + "-spinner"));
	}
	
	axcd(document.body, c);
	
	let button = fxcd(name + "-download");
	let file = fxcd(name + "-file");
	file.onchange = () => {
			spinnerFunction (name + "-spinner", () => {
					button.disabled = true;
					if (file.files.length >= 1) {
						spinnerFunction (name + "-spinner", () => {
								let r = new FileReader();
								r.onload = () => {
										let arr = CSVToArray(r.result, ";");
										let options = arr[0];
										populateCheckboxes(name + "-field", options, null);
										allOrNoneBtn(name + "-all-btn", name + "-field", true, options);
										allOrNoneBtn(name + "-none-btn", name + "-field", false, options);
										fxcd(name+"-all-btn").disabled = false;
										fxcd(name+"-none-btn").disabled = false;
										button.disabled = false;
									};
								r.readAsText(file.files[0], "iso-8859-1");
							});
					} else {
						fxcd(name + "-field").innerHTML = "";
						fxcd(name+"-all-btn").disabled = true;
						fxcd(name+"-none-btn").disabled = true;
					}
				});
		};
	
	button.onclick = () => {
			spinnerFunction (name + "-spinner", () => {
					let r = new FileReader();
					let fileInput = fxcd(name + "-file");
					r.onload = () => {
							let arr = CSVToArray(r.result, ";");
							
							let wanted = [];
							for (let e of mapCheckboxes(name + "-field").entries()) {
								if ((e[1] == fxcd("keep-option").checked) == true) {
									wanted.push(e[0]);
								}
							}
							downloadCSV(arrayToCSV(arrayColFilter(arr, wanted),";"), fileInput.files[0].name.replace(".csv", " - filtrert.csv"));
						};
					r.readAsText(fileInput.files[0], "iso-8859-1");
				});
		};
}


function setupRowFilter() {
	let name = 'keys';
	let inputCSV = null;
	let contrastCSV = null;
	let outputCSV = null;
	
	let eventName = "dataReady";
	let readyTarget = {
			A: 1,
			B: 1,
			C: 1,
			D: 1
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
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
					return true;
				}
		});
	
	
	function radioFn() {
		ready['D'] += 1;
	}
		
	let c = xcd("h2");
	axcd(c, txcd("Filtrer rader i CSV-dokument"));
	axcd(document.body, c);
	
	c = xcd("div");
	c.id = name + "-container";
	c.classList.add("cont");
	axcd(document.body, c);
	
	{
		let f = xcd("input");
		f.type = "file";
		f.id = name + "-file";
		axcd(c, f);
		axcd(c, xcd("br"));
		
		f = xcd("form");
		let l = labelTag("remove-option", "Filtrer bort");
		axcd(f, radioButtonTag("remove-option", "radio-val", "remove", true));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = () => { toggleCheckbox("remove-option"); radioFn(); };
		
		l = labelTag("keep-option", "Behold");
		axcd(f, radioButtonTag("keep-option", "radio-val", "keep", false));
		axcd(f, l);
		axcd(f, xcd("br"));
		l.onclick = () => { toggleCheckbox("keep-option"); radioFn(); };
		axcd(c, f);
		
		f = fileInputTag(name + "-contrast-file");
		l = xcd("select");
		
		axcd(c, f);
		addLine(c);
		
		axcd(c, txcd("Konstrast-kolonne: "));
		
		l.id = name + "-contrast-column";
		axcd(l, optionTag("Velg", true, true));
		axcd(c, l);
		addLine(c);
		addLine(c);
		
		let spinner = fxcd(name + "-spinner");
		l.onchange = () => { spinnerFunction (name + "-spinner", () => { ready["C"] = 0; }); };
			
		f.onchange = (evt) => {
				spinnerFunction (name + "-spinner", () => {
						if (evt.target.files.length >= 1) {
							let r = new FileReader();
							r.onload = () => {
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
					});
			};
		axcd(c, buttonTag(name + "-download-btn", "Last ned CSV", true));
		axcd(c, txcd(" "));
		
		axcd(c, spinnerTag(name + "-spinner"));
	}
	axcd(document.body, c);
	
	let button = fxcd(name + "-download-btn");
	let file = fxcd(name + "-file");
	file.onchange = () => {
		spinnerFunction (name + "-spinner", () => {
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
			});
		};
	
	document.addEventListener(eventName, () => {
			spinnerFunction (name + "-spinner", () => {
					outputCSV = [inputCSV[0]];
					
					let filterIdx = contrastCSV[0].indexOf(fxcd(name + "-contrast-column").value);
					if (fxcd("keep-option").checked == false) {
						let mep = new Map();
						for (let i = 1; i < inputCSV.length; i += 1) {
							mep.set(inputCSV[i][filterIdx], inputCSV[i]);
						}
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
				});
		});
	
	button.onclick = () => { downloadCSV(arrayToCSV(outputCSV,";"), fxcd(name + "-file").files[0].name.replace(".csv", " - filtrert.csv")); };
}