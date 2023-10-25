"use strict";



function calcLoss(begin, end, contracts, rentables) {
	const nDays = millisecondsToDays(end - begin);
	
	const defaultBegin = new Date();
	const defaultEnd = new Date();
	defaultBegin.setFullYear(1950);
	defaultEnd.setFullYear(2090);
	
	let filteredRentables;
	let filteredContracts;
	
	{
		let header = rentables.shift();
		filteredRentables = rentables.filter((row) => {
				if ((row[rentableIdx['aktiv']] == "False")
						|| (row[rentableIdx['utleibar' == "False"]])) {
					return false;
				}
				return true;
			});
		rentables.unshift(header);
		
		header = contracts.shift();
		filteredContracts = contracts.filter((row) => {
				if (isInvalid(row[contractIdx['leietakernavn']])) {
					return false;
				}
				let start = dateWithDefault(row[contractIdx['startdato']], defaultBegin);
				let stop = dateWithDefault(row[contractIdx['sluttdato']], defaultEnd);
				
				return temporalOverlap(begin, end, start, stop);
			});
		filteredContracts.unshift(header);
	}
	
	let out = [];
	let m = mapRows(filteredContracts, contractIdx['fasilitetsnummer']);
	
	filteredRentables.forEach((rentable) => {
			const key = rentable[rentableIdx['seksjonsnummer']];
			
			const acqPrice = stringToNumber(rentable[rentableIdx['anskaffelsespris']]);
			const rentPrice = stringToNumber(rentable[rentableIdx['seksjonspris']]);
			
			let vacancy = 0;
			let daysVacant = nDays;
			let repair = 0;
			let daysRepair = 0;
			let start = new Date(begin);
			
			while (start < end) {
				let next = new Date(start);
				next.setMonth(next.getMonth() + 1);
				next.setDate(1);
				
				let limit = next;
				if (next > stop) {
					limit = stop;
				}
				vacancy += (millisecondsToDays(limit - start) * rentPrice) / numberOfDaysInMonth(start);
				start = new Date(limit);
			}
			
			let diff = acqPrice - rentPrice;
			if (isNaN(acqPrice)) {
				diff = 0;
			}
			
			if (m.has(key)) {
				for (let row of m.get(key)) {
					
					const from = dateWithDefault(row[contractIdx['startdato']], defaultBegin);
					const to = dateWithDefault(row[contractIdx['sluttdato']], defaultEnd);
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
							endDate.setDate(endDate.getDate()+1);
						}
						
						stop = new Date(endDate);
					}
					
					while (current < stop) {
						
						let next = new Date(current);
						next.setMonth(next.getMonth() + 1);
						next.setDate(1);
						
						let limit = next;
						if (next > stop) {
							limit = stop;
						}
						const monthDays = numberOfDaysInMonth(current);
						const dailySection = rentPrice / monthDays;
						
						const rentDays = millisecondsToDays(limit - current);
						vacancy -= rentDays * dailySection;
						daysVacant -= rentDays;
						
						if (ignoreContracts.includes(row[contractIdx['leietakernavn']])) {
							daysRepair += rentDays;
							repair += rentDays * dailySection;
						}
						
						current = new Date(limit);
					}
				}
			}
			
			let add = [key, rentable[rentableIdx['seksjonsnavn']], daysVacant, vacancy, daysRepair, repair, diff]
			for (let i = 2; i < add.length; i += 1) {
				add[i] = numToFDVUNum(add[i]);
			}
			out.push(add);
		});
	
	out.unshift(["Seksjonsnummer", "Navn", "Dager vakant", "Vakansetap", "Dager vedlikehold", "Vedlikeholdstap", "Differanse"]);
	
	return out;
}

function beginLoss() {
	
	const eventName = "dataReady";
	let readyTarget = {
			fileA: 2,
			fileB: 2,
			dateA: 1,
			dateB: 1
		};
		
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					
					if (target["fileA"] < 1 && target["fileB"] < 1) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target["fileA"] < 2 && target["fileB"] < 2 && target["dateA"] < 1 && target["dateB"] < 1) {
							fxcd("filter").disabled = false;
						} else {
							fxcd("filter").disabled = true;
						}
					}
					return true;
				}
		});
	
	
	
	{
		fileChangeEvents(['rentables', 'contracts'], ready);
		
		let l = fxcd("ignore-list");
		for (let e of ignoreContracts) {
			axcd(l, listTag(e));
		}
		
	}
	
	
	let spinner = fxcd("spinner");
	
	let actives = fxcd('rentables');
	let activeList = null;
	let contracts = fxcd('contracts');
	let contractList = null;
	
	
	
	fxcd("end").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	fxcd("begin").onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;
			} else {
				ready["dateA"] = 0;
			}
		};
	actives.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["fileA"] -= 1;
			} else {
				ready["fileA"] += 1;
			}
		};
	contracts.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["fileB"] -= 1;
			} else {
				ready["fileB"] += 1;
			}
		};
	
	
	document.addEventListener(eventName, () => {
			
			let from = new Date(fxcd("begin").value);
			let to = new Date(fxcd("end").value);
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, calcLoss(from, to, contractList, activeList), "tap " + fxcd("begin").value + " til " + fxcd("end").value);
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f1 = new FileReader();
			let f2 = new FileReader();
			
			f1.onload = () => {
					activeList = CSVToArray(f1.result, ";");
					CSVRemoveBlanks(activeList);
					ready["fileA"] -= 1;
				};
			f2.onload = () => {
					contractList = CSVToArray(f2.result, ";");
					CSVRemoveBlanks(contractList);
					ready["fileB"] -= 1;
				};
			
			f1.readAsText(actives.files[0], "iso-8859-1");
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
}



function lossTest() {
	
	const begin = fdvuDateToDate("01.01.2008");
	const end = fdvuDateToDate("01.02.2008");
	
	const contracts = contractSample.concat([
			["K00006443", "Kontrakt for Driftsadministrasjonen", "", "Driftsadministrasjonen", "1118047541", "239119", "", "", "10.01.2008", "9739,12", "01.01.3000", "01.01.2024", "01.01.2025", "24100610114", "24100610114 Sørslettvegen 3 - Underetasje", "1180", "Åsgård", "118002", "Åsgård Lars Eriksens vei 20", "", "Etterskudd Agresso", "1", "", "Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.", "", "Løpende", "", "0", "Månedlig", "Månedlig", "Januar", "False", "", "Rus og Psykiatribolig"]
		]);
	
	const wanted = [
			["Seksjonsnummer", "Navn", "Dager vakant", "Vakansetap", "Dager vedlikehold", "Vedlikeholdstap", "Differanse"],
			["24100610114", "Sørslettvegen 3 - Underetasje", "21", numToFDVUNum(21*(11247/31)), "10", numToFDVUNum(10*(11247/31)), "0"],
			["24100610115", "Sørslettvegen 3, H0101", "31", "8723,2", "0", "0", "0"],
			["24979620028", "Sørslettveien 8 U 0101", "0", "0", "0", "0", "0"],
			["24979620029", "Sørslettveien 8 U 0102", "31", "9691", "0", "0", "0"],
			["24979620030", "Sørslettveien 8 H 0201", "0", "0", "0", "0", "0"],
			["24979620031", "Sørslettveien 8 H 0202", "31", "9696", "0", "0", "5304"]
		];
	
	return compareCSV(wanted, calcLoss(begin, end, contracts, rentableSample));
}

function unitTest() {
	return lossTest();
};