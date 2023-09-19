"use strict";


function arrayMerge(arr1, arr2, columnName) {
	
	let out = [];
	const nameIdx1 = arr1[0].indexOf(columnName);
	const nameIdx2 = arr2[0].indexOf(columnName);
	
	let head = [];
	for (let e of arr1[0]) {
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
	
	for (let row1 = 1; row1 < arr1.length; row1 += 1) {
		let a = [];
		for (let col = 0; col < arr1[row1].length; col += 1) {
			a.push(arr1[row1][col]);
		}
		
		const current = arr1[row1][nameIdx1];
		for (let row2 = 1; row2 < arr2.length; row2 += 1) {
			
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
	
	const eventName = "dataReady";
	let readyTarget = {
			countA: 2,
			countB: 2,
			dateA: 1,
			dateB: 1
		};
		
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target["countA"] < 1 && target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target["countA"] < 1 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd("filter").disabled = false;
						} else {
							fxcd("filter").disabled = true;
						}
					}
					return true;
				}
		});
	
	
	
	{
		
		fxcd("rentables").onchange = (evt) => {
				if (evt.target.files.length < 1) {
					dataReady["fileA"] += 1;
				} else {
					dataReady["fileA"] -= 1;
				}
			};
			
		fxcd("contracts").onchange = (evt) => {
				if (evt.target.files.length < 1) {
					dataReady["fileB"] += 1;
				} else {
					dataReady["fileB"] -= 1;
				}
			};
			
		//	lossText(con);
		
	}
	
	
	let spinner = fxcd("spinner");
	
	let actives = fxcd('rentables');
	let activeList = null;
	let contracts = fxcd('contracts');
	let contractList = null;
	
	
	
	fxcd("date-to").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd("date-from").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;	
			} else {
				ready["dateA"] = 0;
			}
		};
	actives.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	contracts.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	
	
	document.addEventListener(eventName, () => {
			
			let from = fxcd("date-from");
			let to = fxcd("date-to");
			
			contractList.shift();
			activeList.shift();
			
			// lag map s.a. [(fasilitet + nummer) -> kontraktinfo]
			let mep = mapContracts(contractList, 4, 5);
			
			// legg til seksjonspris
			for (let e of activeList) {
				/*
nummer, navn, sum, aktiv
*/
				const number = e[rentableIdx['seksjonsnummer']];
				const name = e[rentableIdx['seksjonsnavn']];
				if (isInvalid(name) && isInvalid(number)) {
					continue;
				}
				const id = [number+" "+name, number];
				
				if (mep.has(id) == false) {
					let filler = new Array(5);
					filler[4] = e[rentableIdx['seksjonspris']];
					if (isInvalid(number)) {
						xc(e);
					}
					mep.set(id, [id.concat(filler)]);
					
				} else {
					if (e[rentableIdx['aktiv']] == "False" || e[rentableIdx['utleibar']] == "False") {
						mep.delete(id);
						continue;
					}
					
					for (let u of mep.get(id)) {
						if (Array.isArray(u)) {
							u.push(e[rentableIdx['seksjonspris']]);
						} else {
							xc(u, mep.get(id));
						}
					}
				}
			}
			
			
			let calced = [];
			{
				const begin = new Date(fxcd("date-from").value);
				const end = new Date(fxcd("date-to").value);
				
				let defaultBegin = new Date();
				let defaultEnd = new Date();
				defaultBegin.setFullYear(1950);
				defaultEnd.setFullYear(2090);
				
				const daysTotal = millisecondsToDays(end - begin);
				
				for (let entry of mep.entries()) {
					let vacant = daysTotal;
					let vacantLoss = 0;
					let repair = 0;
					let repairLoss = 0;
					
					let current = begin;
					let stop = end;
					
					
					while (current < stop) {
						let next = new Date(current);
						next.setMonth(next.getMonth() + 1);
						next.setDate(1);
						
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
						for (let row of entry[1]) {
							let rep = false;
							if (ignoreContracts.includes(row[0]) == true) {
								rep = true;
							}
							
							if (row[0] == "Passiv") {
								continue;
							}
							
							const from = dateWithDefault(row[1], defaultBegin);
							const to = dateWithDefault(row[2], defaultEnd);
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
								next.setMonth(next.getMonth() + 1);
								next.setDate(1);
								
								let limit = next;
								if (next >= stop) {
									limit = stop;
								}
								const monthDays = numberOfDaysInMonth(current);
								const rentDays = millisecondsToDays(limit - current);
								
								const dailySection = sPrice / monthDays;
								const dailyContract = cPrice / monthDays;
								
								
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
			
			calced.unshift(["Fasilitetsnummer", "Fasilitet", "Dager vakant", "Tap pga vakanse", "Dager vedlikehold", "Tap pga vedlikehold"]);
			
			let sum = [["Sum vakansetap", "Sum vedlikeholdstap", "Total"]];
			{
				let aggregate = [0, 0, 0];
				const lines = arrayColFilter(calced, ["Tap pga vakanse", "Tap pga vedlikehold"]);
				for (let i = 1; i < lines.length; i+= 1) {
					const vacant = stringToNumber(lines[i][0]);
					const repair = stringToNumber(lines[i][1]);
					arrayAddition([vacant, repair, vacant + repair], aggregate);
				}
				for (let n of aggregate) {
					n = numToFDVUNum(n);
				}
				sum.push(aggregate);
			}
			
			// tegn
			writeArrayToTable("table");
			writeArrayToTable("sum-table");
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, calced, "tap " + fxcd("date-from").value + " til " + fxcd("date-to").value);
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			let f1 = new FileReader();
			f1.onload = () => {
					activeList = CSVToArray(f1.result, ";");
					CSVRemoveBlanks(activeList);
					xc(activeList[0]);
					ready["countB"] -= 1;
				};
			f1.readAsText(actives.files[0], "iso-8859-1");
			
			let f2 = new FileReader();
			f2.onload = () => {
					contractList = arrayColFilter(CSVToArray(f2.result, ";"), ["Fasilitetsnummer", "Fasilitet", "Sum", "Fra", "Til", "Leietaker", "Kontrakttype"]);
					xc(contractList[0]);
					ready["countB"] -= 1;
				};
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}


/*
leietaker, fra, til, sum, fasilitetsnummer, fasilitet, kontrakttype
*/


function beginGainCalc() {
	
	const eventName = "dataReady";
	let readyTarget = {
			countB: 2,
			dateA: 1,
			dateB: 1
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target["countB"] < 1 && target["dateA"] == 0 && target["dateB"] == 0) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target["countB"] < 2 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd("filter").disabled = false;
						} else {
							fxcd("filter").disabled = true;
						}
					}
					return true;
				}
		});
	
	gainDOM();
	
	let spinner = fxcd("spinner");
	let contracts = fxcd('contracts');
	let contractList = null;
	
	fxcd("date-to").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd("date-from").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;
			} else {
				ready["dateA"] = 0;
			}
		};
	contracts.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["countB"] -= 1;
			} else {
				ready["countB"] += 1;
			}
		};
	document.addEventListener(eventName, () => {
			
			contractList.shift();
			
			
			// lag hashmap s.a. [(fasilitet + nummer) -> liste over kontrakter]
			let mep = mapContracts(contractList, contractIdx['fasilitetsnummer'], contractIdx['fasilitet']);
			
			// summér til array
			let calced = [];
			{
				const begin = new Date(fxcd("date-from").value);
				const end = new Date(fxcd("date-to").value);
				
				let defaultBegin = new Date();
				let defaultEnd = new Date();
				defaultBegin.setFullYear(1950);
				defaultEnd.setFullYear(2090);
				
				for (let entry of mep.entries()) {
					let sum = 0;
					let addition = [entry[0][1], entry[0][0]];
					
					// lag sum
					{
						for (let row of entry[1]) {
							if (ignoreContracts.includes(row[contractIdx['leietaker']]) == true) {
								continue;
							}
							if (row[contractIdx['leietaker']] == "Passiv") {
								continue;
							}
							
							const from = dateWithDefault(row[contractIdx['startdato']], defaultBegin);
							const to = dateWithDefault(row[contractIdx['sluttdato']], defaultEnd);
							if (from > end || to < begin) {
								continue;
							}
							
							const cPrice = stringToNumber(row[contractIdx['kontraktsum']]);
							
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
								next.setMonth(next.getMonth() + 1);
								next.setDate(1);
								
								let limit = next;
								if (next >= stop) {
									limit = stop;
								}
								
								const rentDays = millisecondsToDays(limit - current);
								const dailyCost = cPrice / numberOfDaysInMonth(current);
								sum += rentDays * dailyCost;
								
								current = new Date(limit);
							}
						}
						addition.push(sum);
					}
					calced.push(addition);
				}
				arraySortNumeric(calced, 0);
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
			writeArrayToTable(calced, "table");
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, calced, "inntekter - " + fxcd("date-from").value + " til " + fxcd("date-to").value);
			hide(spinner);
		});
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f2 = new FileReader();
			f2.onload = () => {
					contractList = CSVToArray(f2.result, ";");
					ready["countB"] -= 1;
				}
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}


function gainTest() {
	return true;
}

function lossTest() {
	return true;
}

function unitTest() {
	return gainTest() | lossTest();
};