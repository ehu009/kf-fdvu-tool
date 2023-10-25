'use strict';

const eventName = 'dataReady';
let readyTarget = {
		fileA: 2,
		fileB: 2
	};

const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				fxcd('download').disabled = true;
				if (target['fileA'] < 1 &&  target['fileB'] < 1) {
					document.dispatchEvent(readyEvent);
				} else if (target['fileA'] < 2 &&  target['fileB'] < 2) {
					fxcd('filter').disabled = false;
				} else {
					fxcd('filter').disabled = true;
				}
				return true;
			}
	});

function filter(deviations, rentables) {
	/*
		finn alle unike relevante bygninger
	*/
	let propertyMap = new Map();
	rentables.forEach((row)  => {
			let key = row[rentableIdx['bygningsnavn']];
			if (propertyMap.has(key) == false) {
				propertyMap.set(key, 0);
			}
		});
	/*
		filtrer avvik etter bygninger
	*/
	return deviations.filter((row) => {
			return propertyMap.has(row[deviationIdx['bygningsnavn']]);
		});
}

function begin() {
	
	fileChangeEvents(['rentables', 'deviations'], ready);
	
	let spinner = fxcd('spinner');
	let inputData = null;
	
	fxcd('filter').onclick = () => {
			show(spinner);
			inputData = fileReadInput(['rentables', 'deviations'], ready);
		};
		
	document.addEventListener(eventName, () => {
			
			let btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, filter(inputData['deviations'], inputData['rentables']), 'avvik - filtrert');
			
			hide(spinner);
			
		});
}

function unitTest() {
	
	let wanted = [
			['Navn', 'Merknad', 'Prioritet', 'Tilstandsgrad', 'Konsekvensgrad', 'Kostnad', 'Ansvarlig', 'Meldt av', 'Fasilitet', 'Eiendom', 'Bygning', 'Opprettet dato', 'Registrert', 'Utbedret', 'Epost sendt', 'Fra helpdesk', 'Fra kontrollplan', 'Fag', 'Frekvens', 'NS 3451', 'NS 3454', 'Oppgave', 'Planlagt start oppgave', 'Budsjett oppgave', 'Avvikstype'],
			['Montere stikk til ventilator,nytt kjøkken i u.et.', 'Ventilator er montert.', '4', '1 - svake symptomer', '1 - små konsekvenser', '', 'Geir Frode Olsen', 'Finn Løkvoll', '118007 Åsgård Sørslettvegen 3', '1180 Åsgård', '118007 Åsgård Sørslettvegen 3', '25.11.2021', '25.11.2021', '21.01.2022', '', 'False', 'False', 'Elektriske anlegg', '', '2 Bygning', '3 DRIFTSKOSTNADER ', '', '', '0', 'Elektriske Anlegg'],
			['Montere vaskbar plate.', 'Det må monteres vaskbar plate bak komfyr, av hygieniske grunner.', '3', '1 - svake symptomer', '1 - små konsekvenser', '', 'Finn Løkvoll', 'Finn Løkvoll', '118007 Åsgård Sørslettvegen 3', '1180 Åsgård', '118007 Åsgård Sørslettvegen 3', '24.03.2020', '24.03.2020', '14.05.2021', '', 'False', 'False', 'Bygg Vedlikehold', '', '2 Bygning', '3 DRIFTSKOSTNADER ', '', '', '0', 'Bygningsmessig'],
			['Montering av nye utelys.', 'Det er behov for lys ute på nordsiden av bygget. Det blir gangvei for beboer i leilighet i underetasjen på denne siden av bygget. Skift ut de to utelysene som stå på østsiden av bygget + et nytt utelys på nordsiden.', '4', '1 - svake symptomer', '2 - middels store konsekvenser', '', 'Geir Frode Olsen', 'Finn Løkvoll', '118007 Åsgård Sørslettvegen 3', '1180 Åsgård', '118007 Åsgård Sørslettvegen 3', '15.12.2021', '15.12.2021', '', '', 'False', 'False', 'Elektriske anlegg', '', '2 Bygning', '3 DRIFTSKOSTNADER ', '', '', '0', 'Elektriske Anlegg']
		];
	
	return compareCSV(wanted, filter(deviationSample, rentableSample));
}