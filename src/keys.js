'use strict';


const eName = 'dataReady';
let dataReadyTarget = {
		fileA: 2,
		fileB: 2
	};

const dataReadyEvent = new Event(eName);
let dataReady = new Proxy(dataReadyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				if (target['fileA'] < 2 && target['fileB'] < 2) {
					fxcd('filter').disabled = false;
					if (target['fileA'] < 1 && target['fileB'] < 1) {
						document.dispatchEvent(dataReadyEvent);
					}
				} else {
					fxcd('filter').disabled = true;
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
	
	let inputData = null;
	
	fileChangeEvents(['rentables', 'keys'], dataReady);
	
	let spinner = fxcd('spinner');
	
	fxcd('filter').onclick = () => {
			show(spinner);
			inputData = fileReadInput(['rentables', 'keys'], dataReady);
		};
	document.addEventListener(eName, () => {
			
			let btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, filter(inputData['rentables'], inputData['keysList']), 'n\u00F8kler - filtrert');
			
			hide(spinner);
		});
}


function unitTest() {
	
	let wanted = [
			['Nummer', 'Navn', 'Systemnr', 'Antall nøkler', 'Merknad', 'Eiendomsnr', 'Eiendomsnavn', 'Bygningsnr', 'Bygningsnavn', 'Seksjonsnr', 'Seksjonsnavn'],
			['546', 'Sørslettvegen 3 - H0101 - Mellomdør til Underetasjen', ' DXT 557    K2', '2', 'SKAL IKKE UTLEVERES LEIETAKER', '1180', 'Åsgård', '118007', 'Åsgård Sørslettvegen 3', '24100610115', 'Sørslettvegen 3, H0101'],
			['546', 'Sørslettvegen 3 - H0101 Reservenøkler ', '', '4', 'Nøkler til hybel ved bad hovedetasjen Skal ikke utleveres', '1180', 'Åsgård', '118007', 'Åsgård Sørslettvegen 3', '24100610115', 'Sørslettvegen 3, H0101'],
			['546', 'Sørslettvegen 3 - H0101 Ytterdør', '', '4', 'Hovedinngang ', '1180', 'Åsgård', '118007', 'Åsgård Sørslettvegen 3', '24100610115', 'Sørslettvegen 3, H0101'],
		];
		
	return compareCSV(wanted, filter(rentableSample, keySample));
}