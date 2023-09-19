"use strict";

const eventName = "dataReady";
let readyTarget = {
		countA: 2,
		countB: 2
	};

const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				fxcd("download").disabled = true;
				if (target["countA"] < 1 &&  target["countB"] < 1) {
					document.dispatchEvent(readyEvent);
				} else if (target["countA"] < 2 &&  target["countB"] < 2) {
					fxcd("filter").disabled = false;
				} else {
					fxcd("filter").disabled = true;
				}
				return true;
			}
	});
function filter(deviations, rentables) {
	/*
		finn alle relevante bygninger
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
	
	let rentables = null;
	let deviations = null;
	
	fxcd("filter").disabled = true;
	
	fxcd("rentables").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countA"] = 2;
			} else {
				ready["countA"] -= 1;
			}
		};
		
	fxcd("deviations").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countB"] = 2;
			} else {
				ready["countB"] -= 1;
			}
		};
	
	fxcd("filter").onclick = () => {
			let spinner = fxcd("spinner");
			show(spinner);
			{
				let f1 = new FileReader();
				let f2 = new FileReader();
				
				rentables = null;
				deviations = null;
				
				f1.onload = () => {
						rentables = CSVToArray(f1.result, ";");
						ready["countA"] -=1;
					};
				f2.onload = () => {
						deviations = CSVToArray(f2.result, ";");
						ready["countB"] -= 1;
					};
				
				f1.readAsText(fxcd("rentables").files[0], "iso-8859-1");
				f2.readAsText(fxcd("deviations").files[0], "iso-8859-1");
			}
			
			
			document.addEventListener(eventName, () => {
					
					let dev = filter(deviations, rentables);
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					downloadButton(btn, dev, "avvik - filtrert")
					
					/*
						tegn
					*/
					let con = fxcd("result");
					con.innerHTML = "";
					dev.forEach((d) => {
							let p = xcd("p");
							let out = [
									d[deviationIdx['avviksnavn']],
									d[deviationIdx['bygningsnavn']],
									d[deviationIdx['fasilitet']],
									d[deviationIdx['avviksmerknad']]
								];
							axcd(p, txcd(out[0]));
							addLine(p);
							axcd(p, txcd(out[1] + ":  " + out[2]));
							addLine(p);
							axcd(p, txcd(out[3]));
							p.style.border = "1px solid black";
							axcd(con, p);
						});
					hide(spinner);
					
				});	
		};
}

function unitTest() {
	
	let f = filter(deviationSample, rentableSample);
	
	let wanted = [
			["Navn", "Merknad", "Prioritet", "Tilstandsgrad", "Konsekvensgrad", "Kostnad", "Ansvarlig", "Meldt av", "Fasilitet", "Eiendom", "Bygning", "Opprettet dato", "Registrert", "Utbedret", "Epost sendt", "Fra helpdesk", "Fra kontrollplan", "Fag", "Frekvens", "NS 3451", "NS 3454", "Oppgave", "Planlagt start oppgave", "Budsjett oppgave", "Avvikstype"],
			["Montere stikk til ventilator,nytt kjøkken i u.et.", "Ventilator er montert.", "4", "1 - svake symptomer", "1 - små konsekvenser", "", "Geir Frode Olsen", "Finn Løkvoll", "118007 Åsgård Sørslettvegen 3", "1180 Åsgård", "118007 Åsgård Sørslettvegen 3", "25.11.2021", "25.11.2021", "21.01.2022", "", "False", "False", "Elektriske anlegg", "", "2 Bygning", "3 DRIFTSKOSTNADER ", "", "", "0", "Elektriske Anlegg"],
			["Montere vaskbar plate.", "Det må monteres vaskbar plate bak komfyr, av hygieniske grunner.", "3", "1 - svake symptomer", "1 - små konsekvenser", "", "Finn Løkvoll", "Finn Løkvoll", "118007 Åsgård Sørslettvegen 3", "1180 Åsgård", "118007 Åsgård Sørslettvegen 3", "24.03.2020", "24.03.2020", "14.05.2021", "", "False", "False", "Bygg Vedlikehold", "", "2 Bygning", "3 DRIFTSKOSTNADER ", "", "", "0", "Bygningsmessig"],
			["Montering av nye utelys.", "Det er behov for lys ute på nordsiden av bygget. Det blir gangvei for beboer i leilighet i underetasjen på denne siden av bygget. Skift ut de to utelysene som stå på østsiden av bygget + et nytt utelys på nordsiden.", "4", "1 - svake symptomer", "2 - middels store konsekvenser", "", "Geir Frode Olsen", "Finn Løkvoll", "118007 Åsgård Sørslettvegen 3", "1180 Åsgård", "118007 Åsgård Sørslettvegen 3", "15.12.2021", "15.12.2021", "", "", "False", "False", "Elektriske anlegg", "", "2 Bygning", "3 DRIFTSKOSTNADER ", "", "", "0", "Elektriske Anlegg"],
		];
	
	let err = false;
	let k = 0;
	for (let i = 0; i < f.length; i+= 1) {
		for (let c = 0; c < f[i].length; c += 1) {
			let current = f[i][c];
			let want = wanted[i][c];
			if (current != want) {
				err = true;
				xc(current, want);
				break;
			}
		}
		if (err) {
			break;
		}
	}
	return err;
}