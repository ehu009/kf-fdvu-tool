
const ignoreContracts = ["Driftsadministrasjonen", "Driftsavdelingen", "Troms\u00F8 kommune v/ Byggforvaltningen", "Drift Leide Boliger", "Stiftelsen Kommunale Boliger"];



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
			set: function (target, key, value) {
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
			
		f.onchange = function (evt) {
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


function arrayMerge(arr1, arr2, columnName) {
	
	let out = [];
	let nameIdx1 = arr1[0].indexOf(columnName);
	let nameIdx2 = arr2[0].indexOf(columnName);
	
	let head = [];
	for (e of arr1[0]) {
		head.push(e);
	}
	let col;
	for (col = 0; col < arr2[0].length; col += 1) {
		if (col == nameIdx2) {
			continue;
		}
		head.push(arr2[0][col]);
	}
	out.push(head);
	
	let row1;
	for (row1 = 1; row1 < arr1.length; row1 += 1) {
		let a = [];
		for (let col = 0; col < arr1[row1].length; col += 1) {
			a.push(arr1[row1][col]);
		}
		
		let current = arr1[row1][nameIdx1];
		let row2;
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


function beginLoss() {
	let name = 'loss';
	let eventName = "dataReady";
	let readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
		
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target["countA"] < 1 && target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target["countA"] < 1 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd(name + "-calc-btn").disabled = false;
						} else {
							fxcd(name + "-calc-btn").disabled = true;
						}
					}
					return true;
				}
		});
	
	let con = xcd("h2");
	axcd(con, txcd("Vakanse og tap"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		rentablesText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		let i = fileInputTag(name + "-rentables-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = () => { if (i.files.length < 1) { dataReady["fileA"] += 1; } else { dataReady["fileA"] -= 1; } };
		
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		i.onchange = () => { if (i.files.length < 1) { dataReady["fileB"] += 1; } else { dataReady["fileB"] -= 1; } };
		
		axcd(con, txcd("Velg tidsspenn:"));
		addLine(con);
	
		axcd(con, txcd("Fra "));
		i = dateFieldTag(name + "-date-from")
		i.value="2023-01-01"
		
		axcd(con, i);
		axcd(con, txcd(" Inntil "));
		i = dateFieldTag(name + "-date-to")
		i.value="2023-03-01"
		axcd(con, i);
		addLine(con);
		addLine(con);
	
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
		
		lossText(con);
		
		i = xcd("table");
		i.id = name + "-result-table";
		axcd(i, lossSumHeader());
		axcd(con, i);
		axcd(con, xcd("hr"));
		
		axcd(con, lossLegend());
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	
	let spinner = fxcd(name + "-spinner");
	
	let actives = fxcd(name + '-rentables-file');
	let activeList = null;
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	
	
	fxcd(name + "-date-to").onchange = function (evt) {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd(name + "-date-from").onchange = function (evt) {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;	
			} else {
				ready["dateA"] = 0;
			}
		};
	actives.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	
	
	document.addEventListener(eventName, () => {
			
			let from = fxcd(name + "-date-from");
			let to = fxcd(name + "-date-to");
			
			contractList.shift();
			activeList.shift();
			
			// lag map s.a. [(fasilitet + nummer) -> kontraktinfo]
			let mep = mapContracts(contractList, 4, 5);
			
			// legg til seksjonspris
			for (let e of activeList) {
				
				let number = e[0]
				let name = e[1]
				if (isInvalid(name) && isInvalid(number)) {
					continue;
				}
				let id = [number+" "+name, number];
				
				if (mep.has(id) == false) {
					let filler = new Array(5);
					filler[4] = e[2];
					if (isInvalid(number)) {
						xc(e)
					}
					mep.set(id, [id.concat(filler)]);
					
				} else {
					if (e[3] == "False") {
						mep.delete(id);
						continue;
					}
					
					for (let u of mep.get(id)) {
						if (Array.isArray(u)) {
							u.push(e[2])
						} else {
							xc(u, mep.get(id));
						}
					}
				}
			}
			
			
			let calced = [];
			{
				let begin = new Date(fxcd(name + "-date-from").value);
				let end = new Date(fxcd(name + "-date-to").value);
				
				let defaultBegin = new Date();
				let defaultEnd = new Date();
				defaultBegin.setFullYear(1950);
				defaultEnd.setFullYear(2090);
				
				let daysTotal = millisecondsToDays(end - begin);
				
				for (entry of mep.entries()) {
					let vacant = daysTotal;
					let vacantLoss = 0;
					let repair = 0;
					let repairLoss = 0;
					
					let current = begin;
					let stop = end;
					
					while (current < stop) {
						let next = new Date(current);
						next.setMonth(next.getMonth() + 1)
						next.setDate(1)
						
						let limit = next;
						if (next > stop) {
							limit = stop;
						}
						if (isInvalid(entry[1][0][7]) == false) {
							vacantLoss += (millisecondsToDays(limit - current) * stringToNumber(entry[1][0][7])) / numberOfDaysInMonth(current);
						}
						current = new Date(limit);
					}
					
					
					// lag sum
					{
						for (row of entry[1]) {
							let rep = false;
							if (ignoreContracts.includes(row[0]) == true) {
								rep = true;
							}
							
							if (row[0] == "Passiv") {
								continue;
							}
							
							let from = dateWithDefault(row[1], defaultBegin);
							let to = dateWithDefault(row[2], defaultEnd);
							if (from > end || to < begin) {
								continue;
							}
							
							let cPrice = 0;
							let sPrice = 0;
							{
								if (isInvalid(row[3]) == false) {
									cPrice = stringToNumber(row[3]);
								}
								if (isInvalid(row[7]) == false) {
									cPrice = stringToNumber(row[7]);
								}
							}
							
							{
								let beginDate = begin;
								if (from > begin) {
									beginDate = from;
								}
								current = new Date(beginDate);
								
								let endDate = end;
								if (to < end) {
									endDate = to;
								}
								stop = new Date(endDate);
							}
							
							while (current < stop) {
								
								let next = new Date(current);
								next.setMonth(next.getMonth() + 1)
								next.setDate(1)
								
								let limit = next;
								if (next >= stop) {
									limit = stop;
								}
								let monthDays = numberOfDaysInMonth(current);
								let rentDays = millisecondsToDays(limit - current);
								
								let dailySection = sPrice / monthDays;
								let dailyContract = cPrice / monthDays;
								
								
								if (cPrice != 0) {
									vacantLoss -= rentDays * dailyContract;
								} else {
									vacantLoss -= rentDays * dailySection;
								}
								
								vacant -= rentDays;
								if (rep == true) {
									repair += rentDays;
									if (cPrice != 0) {
										repairLoss += rentDays * dailyContract;
									} else {
										repairLoss += rentDays * dailySection;
									}
								}
								
								current = new Date(limit);
							}
						}
					}
					
					calced.push([entry[0][1], entry[0][0], vacant, numToFDVUNum(vacantLoss), repair, numToFDVUNum(repairLoss)]);
				}
			}
			
			calced.unshift(["Fasilitetsnummer", "Fasilitet", "Dager vakant", "Tap pga vakanse", "Dager vedlikehold", "Tap pga vedlikehold"])
			
			// tegn
			writeArrayToTable(calced, name + "-calc-table");
			
			
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = () => { downloadCSV(arrayToCSV(calced,";"), "tap " + fxcd(name + "-date-from").value + " til " + fxcd(name + "-date-to").value + ".csv"); };
			
			spinner.style.visibility = "hidden";
		});
	
	fxcd(name + "-calc-btn").onclick = () => {
			spinner.style.visibility = "visible";
			let f1 = new FileReader();
			f1.onload = () => {
					activeList = arrayColFilter(CSVToArray(f1.result, ";"), ["Navn", "Nummer", "Sum", "Aktiv"]);
					ready["countB"] -= 1;
				};
			f1.readAsText(actives.files[0], "iso-8859-1");
			
			let f2 = new FileReader();
			f2.onload = () => {
					contractList = arrayColFilter(CSVToArray(f2.result, ";"), ["Fasilitetsnummer", "Fasilitet", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
					ready["countB"] -= 1;
				};
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}

function mapContracts(arr, numberIdx, nameIdx) {
	let mep = new ListMap();
	for (let c of arr) {
		let name = c[nameIdx];
		let number = c[numberIdx];
		if (isInvalid(name) && isInvalid(number)) {
			continue;
		}
		
		let key = [name, number];
		if (mep.has(key) == false) {
			mep.set(key, [c]);
		} else {
			let r = mep.get(key)
			r.push(c)
		}
	}
	return mep;
}


function beginGainCalc() {
	let name = 'gains';
	
	let eventName = "dataReady";
	let readyTarget = {
			countB: 2,
			dateA: 1,
			dateB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target["countB"] < 2 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd(name + "-calc-btn").disabled = false;
						} else {
							fxcd(name + "-calc-btn").disabled = true;
						}
					}
					return true;
				}
		});
	
	gainDOM(name);
	
	let spinner = fxcd(name + "-spinner");
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	fxcd(name + "-date-to").onchange = function (evt) {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd(name + "-date-from").onchange = function (evt) {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;
			} else {
				ready["dateA"] = 0;
			}
		};
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["countB"] -= 1;
			} else {
				ready["countB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			contractList.shift();
			
			// lag hashmap s.a. [(fasilitet + nummer) -> liste over kontrakter]
			let mep = mapContracts(contractList, 4, 5);
			
			// summér til array
			let calced = [];
			{
				let begin = new Date(fxcd(name + "-date-from").value);
				let end = new Date(fxcd(name + "-date-to").value);
				
				let defaultBegin = new Date();
				let defaultEnd = new Date();
				defaultBegin.setFullYear(1950);
				defaultEnd.setFullYear(2090);
				
				for (entry of mep.entries()) {
					let sum = 0;
					let addition = [entry[0][1], entry[0][0]];
					
					// lag sum
					{
						for (row of entry[1]) {
							if (ignoreContracts.includes(row[0]) == true) {
								continue;
							}
							if (row[0] == "Passiv") {
								continue;
							}
							
							let from = dateWithDefault(row[1], defaultBegin);
							let to = dateWithDefault(row[2], defaultEnd);
							if (from > end || to < begin) {
								continue;
							}
							
							let cPrice = stringToNumber(row[3]);
							
							let current;
							let stop;
							{
								let beginDate = begin;
								if (from > begin) {
									beginDate = from;
								}
								current = new Date(beginDate);
								
								let endDate = end;
								if (to < end) {
									endDate = to;
								}
								stop = new Date(endDate);
							}
							
							while (current < stop) {
								
								let next = new Date(current);
								next.setMonth(next.getMonth() + 1)
								next.setDate(1);
								
								let limit = next;
								if (next >= stop) {
									limit = stop;
								}
								
								let rentDays = millisecondsToDays(limit - current);
								let dailyCost = cPrice / numberOfDaysInMonth(current);
								sum += rentDays * dailyCost;
								
								current = new Date(limit);
							}
							
							
						}
						addition.push(sum);
					}
					calced.push(addition);
				}
			}
			
			// regn total og konvertér til komma-desimaler
			let total = 0;
			{
				for (let e of calced) {
					let v = e[1];
					total += v;
					e[1] = numToFDVUNum(v);
				}
			}
			
			// legg til header
			calced.unshift(["Fasilitetnummer", "Navn", "Sum"]);
			
			// tegn
			writeArrayToTable(calced, name + "-calc-table");
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = () => { downloadCSV(arrayToCSV(calced,";"), "inntekter - " + fxcd(name + "-date-from").value + " til " + fxcd(name + "-date-to").value + ".csv"); };
			
			spinner.style.visibility = "hidden";
		});	
	fxcd(name + "-calc-btn").onclick = () => {
			spinner.style.visibility = "visible";
			
			let f2 = new FileReader();
			f2.onload = () => {
					let from = dateToFdvuDate(fxcd(name + "-date-from").value);
					let to = dateToFdvuDate(fxcd(name + "-date-to").value);
					
					contractList = arrayColFilter(CSVToArray(f2.result, ";"), ["Fasilitetsnummer", "Fasilitet", "Sum", "Fra", "Til", "Leietaker"]);
					ready["countB"] -= 1;
				}
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}


function setupCustomerOverlapFilter() {
	let name = 'overlap';
	
	let eventName = "dataReady";
	let readyTarget = {
		
			countB: 1,
			dateA: 1,
			dateB: 1,
			fileB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['fileB'] < 1) {
						fxcd(name + '-calc-btn').disabled = false;
					}
					
					if (target["countB"] < 1) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	let con = xcd("h2");
	axcd(con, txcd("Seksjoner med overlappende kontrakter"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
	
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["fileB"] -= 1;
			} else {
				ready["fileB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				let pp = contractList[r];
				if ((pp[13] == undefined) || (ignoreContracts.includes(pp[3]) == true)) {
					continue;
				}
				if (mep.has(pp[13]) == false) {
					mep.set(pp[13], []);
				}
				mep.get(pp[13]).push(pp);
			}
			
			let out = [];
			for (let r of mep.entries()) {
				let hoink = false;
				for (let i = 0; i < r[1].length; i += 1) {
					let c1 = r[1][i];
					let cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					let lower1 = dateWithDefault(c1[7], oldest);
					let upper1 = dateWithDefault(c1[8], newest);
					
					for (let j = i; j < r[1].length; j += 1) {
						let c2 = r[1][j];
						
						let lower2 = dateWithDefault(c2[7], oldest);
						let upper2 = dateWithDefault(c2[8], newest);
						
						if (upper1 < lower2 || lower1 > upper2) {
							continue;
						}
						hoink = true;
						out.push(r[0]);
						break;
					}
					if (hoink == true) {
						break;
					}
				}
			}

			for (let e of out) {
				axcd(table, newRow([e], false, ""));
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = () => { downloadCSV(arrayToCSV(out,";"), "overlappende aktører.csv"); };
			spinner.style.visibility = "hidden";
		});	
	fxcd(name + "-calc-btn").onclick = () => {
			spinner.style.visibility = "visible";
			let f2 = new FileReader();
			f2.onload = () => { contractList = CSVToArray(f2.result, ";"); ready["countB"] -= 1; }
			
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}

function setupRentableOverlapFilter() {
	let name = 'overlap';
	
	let eventName = "dataReady";
	let readyTarget = {
		
			countB: 1,
			dateA: 1,
			dateB: 1,
			fileB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: function (target, key, value) {
					target[key] = value;
					fxcd(name + "-download-btn").disabled = true;
					if (target['fileB'] < 1) {
						fxcd(name + '-calc-btn').disabled = false;
					}
					
					if (target["countB"] < 1) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	let con = xcd("h2");
	axcd(con, txcd("Akt\u00F8rer med samtidige kontrakter i flere seksjoner"));
	axcd(document.body, con);
	
	con = xcd("div");
	con.id = name + "-container";
	con.classList.add("cont");
	axcd(document.body, con);
	{
		contractsText(name + "-container");
		axcd(con, txcd(":"));
		addLine(con);
		
		i = fileInputTag(name + "-contracts-file");
		axcd(con, i);
		addLine(con);
		addLine(con);
		
		defaultButtonTags(name);
		addLine(con);
		axcd(con, xcd("hr"));
	
		i = xcd("table");
		i.id = name + "-calc-table";
		axcd(con, i);
	}
	
	let spinner = fxcd(name + "-spinner");
	
	let contracts = fxcd(name + '-contracts-file');
	let contractList = null;
	
	contracts.onchange = function (evt) {
			if (evt.target.files.length > 0) {
				ready["fileB"] -= 1;
			} else {
				ready["fileB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			let table = fxcd(name + "-calc-table");
			table.innerHTML = "";
			
			let mep = new Map();
			for (let r = 1; r < contractList.length; r += 1) {
				let pp = contractList[r];
				if (isInvalid(pp[13])
						|| isInvalid(pp[5])
						|| isInvalid(pp[4])
						|| isInvalid(pp[3])
						|| (ignoreContracts.includes(pp[2]) == true)) {
					continue;
				}
				if (mep.has(pp[4]) == false) {
					mep.set(pp[4], []);
				}
				mep.get(pp[4]).push(pp);
			}
			
			let out = [];
			for (let r of mep.entries()) {
				let hoink = false;
				if (r[1].length < 2) {
					continue;
				}
				let occ = [];
				for (let i = 0; i < r[1].length; i += 1) {
					occ.push(0);
				}
				
				for (let i = 0; i < r[1].length; i += 1) {
					let c1 = r[1][i];
					let cNum = c1[0];
					
					let oldest = new Date();
					let newest = new Date();
					oldest.setFullYear(1950);
					newest.setFullYear(2050);
					
					let lower1 = dateWithDefault(c1[7], oldest);
					let upper1 = dateWithDefault(c1[8], newest);
					if (lower1 == upper1) {
						continue;
					}
					for (let j = i+1; j < r[1].length; j += 1) {
						let c2 = r[1][j];
						
						let lower2 = dateWithDefault(c2[7], oldest);
						let upper2 = dateWithDefault(c2[8], newest);
						if (lower2 == upper2) {
							continue;
						}
						if (upper1 <= lower2 || lower1 >= upper2) {
							continue;
						}
						
						occ[i] += 1;
						occ[j] += 1;
					}
				}
				
				let row = [];
				for (let i = 0; i < r[1].length; i += 1) {
					if (occ[i] > 0) {
						row.push(r[1][i]);
					}
				}
				out.push(row);
			}
			axcd(table, newRow(["Akt\u00F8r", "Seksjon", "Fra", "Til"], true, ""));
			
			for (let e of out) {
				
				for (let row = 0; row < e.length; row += 1) {
					let r = e[row];
					let ll = [r[4], r[13], r[7], r[8]];
					if (row > 0) {
						ll[0] = "";
					}
					if (r[7] == undefined) {
						ll[2] = "-";
					}
					if (r[8] == undefined) {
						ll[3] = "-";
					}
					axcd(table, newRow(ll, false, ""));
				}
			}
			
			let btn = fxcd(name + "-download-btn");
			btn.disabled = false;
			btn.onclick = () => { downloadCSV(arrayToCSV(out,";"), "overlappende kontrakter.csv"); };
			
			spinner.style.visibility = "hidden";
		});	
	fxcd(name + "-calc-btn").onclick = () => {
			spinner.style.visibility = "visible";
			let f2 = new FileReader();
			f2.onload = () => { contractList = CSVToArray(f2.result, ";"); ready["countB"] -= 1; }
			
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}
	