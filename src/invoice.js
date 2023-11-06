'use strict';


const eventName = 'dataReady';
let readyTarget = {
		fileA: 2,
		fileB: 2,
		fileC: 2
	};

const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				fxcd('download').disabled = true;
				if (target['fileA'] < 1 && target['fileB'] < 1 && target['fileC'] < 1) {
					document.dispatchEvent(readyEvent);
				} else if (target['fileA'] < 2 && target['fileB'] < 2 && target['fileC'] < 2) {
					fxcd('filter').disabled = false;
				} else {
					fxcd('filter').disabled = true;
				}
				return true;
			}
	});

function filterContracts(contracts, rentables) {
	/*
		map seksjonsnummer -> løpenumre
	*/
	
	const contractMap = mapRows(contracts, contractIdx['fasilitetsnummer']);
	
	/*
		velg kun kontrakter som tilhører gjeldende seksjoner
	*/
	const filteredContracts = [];
	contractMap.forEach((value, key) => {
			
			for (let i = 1; i < rentables.length; i += 1) {
				
				let current = rentables[i][rentableIdx['seksjonsnummer']];
				if (isInvalid(current)) {
					continue;
				}
				current = current.trim();
				
				if (current == key) {
					for (let e of value) {
						filteredContracts.push(e);
					}
				}
			}
		});
	return filteredContracts;
}

function filterInvoices(contracts, invoices) {
	/*
		velg kun fakturalinjer med løpenummer i filtrerte kontrakter
	*/
	const header = invoices.shift();
	const out = invoices.filter((invoice) => {
			let current = invoice[invoiceIdx['løpenummer']];
			if (isInvalid(current)) {
				return false;
			}
			current = current.trim();
			
			for (let i = 0; i < contracts.length; i += 1) {
				
				let contractId = contracts[i][contractIdx['løpenummer']];
				if (isInvalid(contractId)) {
					continue;
				}
				contractId = contractId.trim();
				
				if (contractId == current) {
					return true;
				}
				
			}
			return false;
			
		});
	out.unshift(header);
	return out;
}

function begin() {
	
	let inputData = null;
	
	fileChangeEvents(['rentables', 'contracts', 'invoices'], ready);
	
	const spinner = fxcd('spinner');
	
	fxcd('filter').onclick = () => {
			show(spinner);
			fileReadInput(['rentables', 'contracts', 'invoices'], ready);
		};
			
			
	document.addEventListener(eventName, () => {
			const filteredInvoices = filterInvoices(filterContracts(inputData['contracts'], inputData['rentables']), inputData['invoices']);
			
			const btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, filteredInvoices, 'fakturalinjer - filtrert');
			
			hide(spinner);
		});
}

function unitTest() {
	
	const wanted = [
			['År/serienummer', 'Faktura', 'Nummer', 'Leietaker', 'Reskontronr', 'Løpenummer', 'Fasilitet', 'Ordrenummer', 'Tekst', 'Konto', 'Varenr', 'Lønnsart', 'Tilleggsinfo 1', 'Fra dato', 'Til dato', 'Mengde', 'Pris', 'Sum', 'Sum+MVA', 'Rabatt', 'Regulert den', 'Neste regulering', 'MVA-pliktig', 'Manuell', 'Sluttoppgjør'],
			['2023014', 'Husleie mai 2023', '7106638432', 'Fredrik Puddingsen', '236249', 'K00006331', 'Sørslettveien 8, H 0201', '', 'Husleie', '16300', '7200979', '', '', '01.05.2023', '31.05.2023', '1', '9744,44', '9744,44', '9744,44', '', '01.01.2023', '01.01.2024', 'False', 'False', 'False'],
			['2023001', 'Husleie januar 2023', '7106638432', 'Fredrik Puddingsen', '236249', 'K00006331', 'Sørslettveien 8, H 0201', '', 'Husleie', '16300', '7200979', '', '', '01.01.2023', '31.01.2023', '1', '9744,44', '9744,44', '9744,44', '', '01.01.2023', '01.01.2024', 'False', 'False', 'False'],
			['2023004', 'Husleie februar 2023', '7106638432', 'Fredrik Puddingsen', '236249', 'K00006331', 'Sørslettveien 8, H 0201', '', 'Husleie', '16300', '7200979', '', '', '01.02.2023', '28.02.2023', '1', '9744,44', '9744,44', '9744,44', '', '01.01.2023', '01.01.2024', 'False', 'False', 'False'],
			['2023001', 'Husleie januar 2023', '21016729768', 'Kjell Trell Trafikkuhell', '236676', 'K00006433', 'Sørslettveien 8, U 0101', '', 'Husleie', '16300', '7200979', '', '', '01.02.2023', '28.02.2023', '1', '9739,12', '9739,12', '9739,12', '', '01.01.2023', '01.01.2024', 'False', 'False', 'False']
		];
	
	return compareCSV(wanted, filterInvoices(filterContracts(contractSample, rentableSample), invoiceSample));
}