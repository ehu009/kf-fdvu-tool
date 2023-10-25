"use strict";


const eName = "dataReady";
let dataReadyTarget = {
		fileA: 1,
		fileB: 1,
		count: 2
	};

const dataReadyEvent = new Event(eName);
let dataReady = new Proxy(dataReadyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				if (target["fileA"] <= 0 && target["fileB"] <= 0) {
					fxcd("filter").disabled = false;
				} else {
					fxcd("filter").disabled = true;
				}
				if (target["count"] <= 0) {
					target["count"] = 0;
					document.dispatchEvent(dataReadyEvent);
				}
				return true;
			}
	});
	
function filter(rentables, keys) {
	
	let header = keys.shift();
	keys.unshift(header);
	
	let out = keys.filter((key) => {
			for (let rentable of rentables) {
				if (rentable[rentableIdx['seksjonsnummer']] == key[keyIdx['seksjonsnummer']]) {
					return true;
				}
			}
			return false;
		});
	out.unshift(header);
	
	return out;
}

function setupKeyFilter() {
	
	let rentables = fxcd('rentables');
	let keys = fxcd('keys');
	let rentablesList = null;
	let keysList = null;
	
	
	fileChangeEvents(['rentables', 'keys'], ['fileA', 'fileB'], dataReady);
	
	/*
	rentables.onchange = (evt) => {
			if (evt.target.files.length < 1) {
				dataReady["fileB"] += 1;
			} else {
				dataReady["fileB"] -= 1;
			}
		};
	keys.onchange = (evt) => {
			if (evt.target.files.length < 1) {
				dataReady["fileA"] += 1;
			} else {
				dataReady["fileA"] -= 1;
			}
		};
	*/
	let spinner = fxcd("spinner");
	
	fxcd("filter").onclick = () => {
			show(spinner);
			
			let f1 = new FileReader();
			let f2 = new FileReader();
			
			rentablesList = null;
			keysList = null;
			
			f1.onload = () => {
					rentablesList = CSVToArray(f1.result, ";");
					dataReady["count"] -= 1;
				};
			f2.onload = () => {
					keysList = CSVToArray(f2.result, ";");
					dataReady["count"] -= 1;
				};
			
			f1.readAsText(rentables.files[0], "iso-8859-1");
			f2.readAsText(keys.files[0], "iso-8859-1");
		};
	document.addEventListener(eName, () => {
			
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, filter(rentablesList, keysList), "n\u00F8kler - filtrert");
			
			hide(spinner);
		});
}


function unitTest() {
	
	let wanted = [
			["Nummer", "Navn", "Systemnr", "Antall nøkler", "Merknad", "Eiendomsnr", "Eiendomsnavn", "Bygningsnr", "Bygningsnavn", "Seksjonsnr", "Seksjonsnavn"],
			["546", "Sørslettvegen 3 - H0101 - Mellomdør til Underetasjen", " DXT 557    K2", "2", "SKAL IKKE UTLEVERES LEIETAKER", "1180", "Åsgård", "118007", "Åsgård Sørslettvegen 3", "24100610115", "Sørslettvegen 3, H0101"],
			["546", "Sørslettvegen 3 - H0101 Reservenøkler ", "", "4", "Nøkler til hybel ved bad hovedetasjen Skal ikke utleveres", "1180", "Åsgård", "118007", "Åsgård Sørslettvegen 3", "24100610115", "Sørslettvegen 3, H0101"],
			["546", "Sørslettvegen 3 - H0101 Ytterdør", "", "4", "Hovedinngang ", "1180", "Åsgård", "118007", "Åsgård Sørslettvegen 3", "24100610115", "Sørslettvegen 3, H0101"],
		];
		
	return compareCSV(wanted, filter(rentableSample, keySample));
}