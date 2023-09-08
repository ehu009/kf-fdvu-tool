"use strict";

const eventName = "dataReady";
let readyTarget = {
		countA: 2,
		countB: 2,
		dateA: 1,
		dateB: 1,
		bool: false
	};
const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				
				let b = target["bool"];
				fxcd(name + "download").disabled = true;
				fxcd("begin").disabled = true;
				fxcd("end").disabled = true;
				if (b) {
					fxcd("begin").disabled = false;
					fxcd("end").disabled = false;
				}
				
				if (target["countA"] < 1 && target["countB"] < 1) {
					if (!b
							|| (b && target["dateA"] == 0 && target["dateB"] == 0)) {
						document.dispatchEvent(readyEvent);
					}
					// else {
					//document.dispatchEvent(readyEvent);
					//}
				} else {
					let btn = fxcd("filter");
					if (target["countA"] < 2 && target["countB"] < 2) {
						if (!b 
								|| (target["dateA"] < 1 && target["dateB"] < 1)) {
							btn.disabled = false;
						}
					//	else {
					//		btn.disabled = false;
					//	}
					} else {
						btn.disabled = true;
					}
				}
				return true;
			}
	});

function fieldEvents() {
	let field = fxcd("begin");
	/*
		dates
	*/
	field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateA"] = 1;
			} else {
				ready["dateA"] = 0;
			}
		};
	field = fxcd("end");
	field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready["dateB"] = 1;
			} else {
				ready["dateB"] = 0;
			}
		};
	/*
		date checkbox
	*/
	field = fxcd("timefilter");
	field.onclick = (evt) => {
			ready["bool"] = evt.target.checked;
		};
	/*
		files
	*/
	field = fxcd("rentables");
	field.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["countA"] -= 1;
			} else {
				ready["countA"] += 1;
			}
		};
	field = fxcd("contracts");
	field.onchange = (evt) => {
			if (evt.target.files.length > 0) {
				ready["countB"] -= 1;
			} else {
				ready["countB"] += 1;
			}
		};	
}


function begin() {
	
	let spinner = fxcd("spinner");
	
	fieldEvents();
	
	let rentablesList = null;
	let contractList = null;
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			rentablesList = null;
			contractList = null;
			let rentables = fxcd("rentables");
			let contracts = fxcd("contracts");
			
			let f1 = new FileReader();
			let f2 = new FileReader();
			
			f1.onload = () => {
					rentablesList = CSVToArray(f1.result, ";");
					CSVRemoveBlanks(rentablesList);
					ready["countA"] -= 1;
				}
			f1.readAsText(rentables.files[0], "iso-8859-1");
				
			
			f2.onload = () => {
					contractList = CSVToArray(f2.result, ";");
					CSVRemoveBlanks(contractList);
					ready["countB"] -= 1;
				}
			f2.readAsText(contracts.files[0], "iso-8859-1");
		};
	
	document.addEventListener(eventName, () => {
			const begin = new Date(fxcd("begin").value);
			const end = new Date(fxcd("end").value);			
			let defaultBegin = new Date();
			let defaultEnd = new Date();
			defaultBegin.setFullYear(1950);
			defaultEnd.setFullYear(2090);
			
			let header = contractList.shift();
			contractList = contractList.filter( (contract) => {
					//	tidsfilter
					if (ready["bool"]) {
						if (end < dateWithDefault(contract[contractIdx['startdato']], defaultBegin)
								|| begin >= dateWithDefault(contract[contractIdx['sluttdato']], defaultEnd)) {
							return false;
						}
					}
					//	lokasjonsfilter
					for (let i = 1; i < rentablesList.length; i += 1) {
						return (contract[contractIdx["fasilitetsnummer"]] == rentablesList[i][rentableIdx["seksjonsnummer"]]);
					}
					return false;
				});
			contractList.unshift(header);
			
			
			let btn = fxcd("download");
			btn.disabled = false;
			
			let fname = "kontrakter hos seksjoner";
			if (fxcd("timefilter").checked) {
				fname += " - " + fxcd("begin").value + " til " + fxcd("end").value;
			}
			downloadButton(btn, contractList, fname);
			
			hide(spinner);
		});	
	
}