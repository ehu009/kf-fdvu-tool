"use strict";

/*
	seksjonsnummer i seksjon -> 0
	seksjonsnummer i kontrakter -> 13
	løpenummer i kontrakter -> 0
	løpenummer i fakturalinjer -> 5
	
*/


function fxcd(t) {
	return document.getElementById(t);
}


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
				if (target["countA"] < 2 && target["countB"] < 2 && target["countC"] < 2) {
					document.dispatchEvent(readyEvent);
				}
				return true;
			}
	});



function begin() {
	
	fxcd("filter").onclick = () => {
			
			{	// a spinner
				let s = spinnerTag("spinner");
				axcd(fxcd("result"), s);
				show(s);
			}
			
			let rentables = null;
			let contracts = null;
			let invoices = null;
			
			{
				let f1 = new FileReader();
				let f2 = new FileReader();
				let f3 = new FileReader();
				
				f1.onload = () => {
						rentables = CSVToArray(f1.result, ";");
						ready["countA"] -=1;
					};
				f1.readAsText(fxcd("rentables").files[0], "iso-8859-1");
				
				f2.onload = () => {
						contracts = CSVToArray(f2.result, ";");
						ready["countB"] -= 1;
					};
				f2.readAsText(fxcd("contracts").files[0], "iso-8859-1");
				
				f3.onload = () => {
						invoices = CSVToArray(f3.result, ";");
						ready["countC"] -= 1;
					};
				f3.readAsText(fxcd("invoices").files[0], "iso-8859-1");
				
			}
			
			
			document.addEventListener(eventName, () => {
					
					/*
						map seksjonsnummer -> løpenumre
					*/
					let contractMap = new Map();
					{
						let valIdx = 0;
						let keyIdx = 13;
						for (let i = 1; i < contracts.length; i += 1) {
							let current = contracts[i][keyIdx];
							if (isInvalid(current)) {
								continue;
							}
							current = current.trim();
							if (contractMap.has(current)) {
								contractMap.get(current).push(contracts[i]);
							} else {
								contractMap.set(current, [contracts[i]]);
							}
						}
					}
					
					
					/*
						velg kun kontrakter som tilhører gjeldende seksjoner
					*/
					let filteredContracts = [];
					contractMap.forEach((value, key) => {
							
							for (let i = 1; i < rentables.length; i += 1) {
								
								let current = rentables[i][0];
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
					
					
					/*
						velg kun fakturalinjer med løpenummer i filtrerte kontrakter
					*/
					invoices.shift();
					let filteredInvoices = invoices.filter((invoice) => {
							let current = invoice[5];
							if (isInvalid(current)) {
								return false;
							}
							current = current.trim()
							
							for (let i = 0; i < filteredContracts.length; i += 1) {
								
								let contractId = filteredContracts[i][0];
								if (isInvalid(contractId)) {
									continue;
								}
								contractId = contractId.trim()
								
								if (contractId == current) {
									return true;
								}
								
							}
							return false;
							
						});
					
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					btn.onclick = () => {
							downloadCSV(arrayToCSV(filteredInvoices,";"), "fakturalinjer - filtrert.csv");
						};
						
					
					/*
						tegn
					*/
					let con = fxcd("result");
					con.innerHTML = "";
					filteredInvoices.forEach((invoice) => {
							let p = xcd("p");
							let out = [invoice[5], invoice[6], invoice[8]];
							axcd(p, txcd(out[0]));
							addLine(p);
							axcd(p, txcd(out[1]));
							addLine(p);
							axcd(p, txcd(out[2]));
							p.style.border = "1px solid black";
							axcd(result, p);
					});
				});	
		};
}