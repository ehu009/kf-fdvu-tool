'use strict';



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
				if ((row[rentableIdx['aktiv']] == 'False')
						|| (row[rentableIdx['utleibar' == 'False']])) {
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
				const start = dateWithDefault(row[contractIdx['startdato']], defaultBegin);
				const stop = dateWithDefault(row[contractIdx['sluttdato']], defaultEnd);
				
				return temporalOverlap(begin, end, start, stop);
			});
		filteredContracts.unshift(header);
	}
	
	const out = [];
	const m = mapRows(filteredContracts, contractIdx['fasilitetsnummer']);
	
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
			
			let diff = 0;
			if (!isInvalid(acqPrice)) {
				diff = acqPrice - rentPrice;
			}
			
			if (m.has(key)) {
				m.get(key).filter((row) => {
						const building = row[contractIdx['bygningsnummer']].trim() +' '+ row[contractIdx['bygningsnavn']].trim();
						return building == rentable[rentableIdx['fasilitet']].trim();
					}).forEach((row) => {
					
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
								const dailyContract = stringToNumber(row[contractIdx['kontraktsum']]) / monthDays;
								
								const rentDays = millisecondsToDays(limit - current);
								
								if (ignoreContracts.includes(row[contractIdx['leietakernavn']])) {
									daysRepair += rentDays;
									repair += rentDays * dailySection;
								} else {
									daysVacant -= rentDays;
									vacancy -= rentDays * dailyContract;
								}
								
								current = new Date(limit);
							}
						});
			}
			
			const add = [key, rentable[rentableIdx['seksjonsnavn']], daysVacant, vacancy, daysRepair, repair, diff];
			for (let i = 2; i < add.length; i += 1) {
				add[i] = numToFDVUNum(add[i]);
			}
			out.push(add);
		});
	
	out.unshift(['Seksjonsnummer', 'Navn', 'Dager vakant', 'Vakansetap', 'Dager vedlikehold', 'Vedlikeholdstap', 'Anskaffelse minus seksjonspris']);
	
	return out;
}

function beginLoss() {
	
	const eventName = 'dataReady';
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
					fxcd('download').disabled = true;
					
					if (target['fileA'] < 1 && target['fileB'] < 1) {
						document.dispatchEvent(readyEvent);
					} else {
						if (target['fileA'] < 2 && target['fileB'] < 2 && target['dateA'] < 1 && target['dateB'] < 1) {
							fxcd('filter').disabled = false;
						} else {
							fxcd('filter').disabled = true;
						}
					}
					return true;
				}
		});
	
	unorderedList('ignore-list', ignoreContracts);
	
	fileChangeEvents(['rentables', 'contracts'], ready);
	
	
	const spinner = fxcd('spinner');
	
	let inputData = null;
	
	{
		let tmp = new Date();
		let field = fxcd('end');
		tmp.setDate(1);
		field.value = tmp.toISOString().split('T')[0];
		field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready['dateB'] = 1;
			} else {
				ready['dateB'] = 0;
			}
		};
		
		field = fxcd('begin');
		tmp.setDate(0);
		tmp.setDate(1);
		field.value = tmp.toISOString().split('T')[0];
		field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready['dateA'] = 1;
			} else {
				ready['dateA'] = 0;
			}
		};
	}
	
	document.addEventListener(eventName, () => {
			
			const from = new Date(fxcd('begin').value);
			const to = new Date(fxcd('end').value);
			
			const btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, calcLoss(from, to, inputData['contracts'], inputData['rentables']), 'tap ' + fxcd('begin').value + ' til ' + fxcd('end').value);
			hide(spinner);
		});
	
	fxcd('filter').onclick = () => {
			show(spinner);
			inputData = fileReadInput(['rentables', 'contracts'], ready);
		};
}



function lossTest() {
	
	const begin = fdvuDateToDate('01.01.2008');
	const end = fdvuDateToDate('01.02.2008');
	
	const contracts = contractSample.concat([
			['K00006443', 'Kontrakt for Driftsadministrasjonen', '', 'Driftsadministrasjonen', '1118047541', '239119', '', '', '10.01.2008', '9739,12', '01.01.3000', '01.01.2024', '01.01.2025', '24100610114', '24100610114 Sørslettvegen 3 - Underetasje', '1180', 'Åsgård', '118002', 'Åsgård Lars Eriksens vei 20', '', 'Etterskudd Agresso', '1', '', 'Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.', '', 'Løpende', '', '0', 'Månedlig', 'Månedlig', 'Januar', 'False', '', 'Rus og Psykiatribolig']
		]);
	
	const wanted = [
			['Seksjonsnummer', 'Navn', 'Dager vakant', 'Vakansetap', 'Dager vedlikehold', 'Vedlikeholdstap', 'Anskaffelse minus seksjonspris'],
			['24100610114', 'Sørslettvegen 3 - Underetasje', '21', numToFDVUNum(21*(11247/31)), '10', numToFDVUNum(10*(11247/31)), '0'],
			['24100610115', 'Sørslettvegen 3, H0101', '31', '8723,2', '0', '0', '0'],
			['24979620028', 'Sørslettveien 8 U 0101', '0', '-48,1200000000008', '0', '0', '0'],
			['24979620029', 'Sørslettveien 8 U 0102', '31', '9691', '0', '0', '0'],
			['24979620030', 'Sørslettveien 8 H 0201', '0', '-48,44000000000051', '0', '0', '0'],
			['24979620031', 'Sørslettveien 8 H 0202', '31', '9696', '0', '0', '5304']
		];
	let pp = calcLoss(begin, end, contracts, rentableSample)
	xc(wanted)
	xc(pp)
	return compareCSV(wanted, pp);
}

function unitTest() {
	return lossTest();
};