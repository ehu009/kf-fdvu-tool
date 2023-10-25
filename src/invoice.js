"use strict";


const eventName = "dataReady";
let readyTarget = {
		countA: 2,
		countB: 2,
		countC: 2
	};

const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				fxcd("download").disabled = true;
				if (target["countA"] < 1 && target["countB"] < 1 && target["countC"] < 1) {
					document.dispatchEvent(readyEvent);
				} else if (target["countA"] < 2 && target["countB"] < 2 && target["countC"] < 2) {
					fxcd("filter").disabled = false;
				} else {
					fxcd("filter").disabled = true;
				}
				return true;
			}
	});

function filterContracts(contracts, rentables) {
	/*
		map seksjonsnummer -> løpenumre
	*/
	
	let contractMap = mapRows(contracts, contractIdx['fasilitetsnummer']);
	
	/*
		velg kun kontrakter som tilhører gjeldende seksjoner
	*/
	let filteredContracts = [];
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
	let header = invoices.shift();
	let out = invoices.filter((invoice) => {
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
	
	let rentables = null;
	let contracts = null;
	let invoices = null;
	
	
	{
		let id = ['rentables', 'contracts', 'invoices'];
		let key = ['A', 'B', 'C'];
		for (let i = 0; i < 3; i += 1) {
			fxcd(id[i]).onchange = (evt) => {
					let n = "count" + key[i];
					if (evt.target.files.length == 0) {
						ready[n] = 2;
					} else {
						ready[n] -= 1;
					}
				};
		}
		
	}
		/*
	fxcd("rentables").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countA"] = 2;
			} else {
				ready["countA"] -= 1;
			}
		};
	fxcd("contracts").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countB"] = 2;
			} else {
				ready["countB"] -= 1;
			}
		};
	fxcd("invoices").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countC"] = 2;
			} else {
				ready["countC"] -= 1;
			}
		};
	*/
	let spinner = fxcd("spinner");
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			rentables = null;
			contracts = null;
			invoices = null;
			
			let f1 = new FileReader();
			let f2 = new FileReader();
			let f3 = new FileReader();
			
			f1.onload = () => {
					rentables = CSVToArray(f1.result, ";");
					ready["countA"] -=1;
				};
			f2.onload = () => {
					contracts = CSVToArray(f2.result, ";");
					ready["countB"] -= 1;
				};
			f3.onload = () => {
					invoices = CSVToArray(f3.result, ";");
					ready["countC"] -= 1;
				};
			
			f1.readAsText(fxcd("rentables").files[0], "iso-8859-1");
			f2.readAsText(fxcd("contracts").files[0], "iso-8859-1");
			f3.readAsText(fxcd("invoices").files[0], "iso-8859-1");
		};
			
			
	document.addEventListener(eventName, () => {
			let filteredInvoices = filterInvoices(filterContracts(contracts, rentables), invoices);
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, filteredInvoices, "fakturalinjer - filtrert");
			
			draw("result", filteredInvoices);
			hide(spinner);
		});
}

function unitTest() {
	
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023014", "Husleie mai 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", "01.05.2023", "31.05.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", "01.01.2023", "31.01.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023004", "Husleie februar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", "01.02.2023", "28.02.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "21016729768", "Kjell Trell Trafikkuhell", "236676", "K00006433", "Sørslettveien 8, U 0101", "", "Husleie", "16300", "7200979", "", "", "01.02.2023", "28.02.2023", "1", "9739,12", "9739,12", "9739,12", "", "01.01.2023", "01.01.2024", "False", "False", "False"]
		];
	
	return compareCSV(wanted, filterInvoices(filterContracts(contractSample, rentableSample), invoiceSample));
}