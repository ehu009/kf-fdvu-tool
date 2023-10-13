"use strict";


function filter(arr, idx1, idx2, mode, date1, date2) {
	
	const begin = new Date(date1);
	begin.setHours(0)
	
	let defaultBegin = new Date();
	let defaultEnd = new Date();
	defaultBegin.setFullYear(1950);
	defaultEnd.setFullYear(2090);
	
	let header = arr.shift();
	let out = arr.filter( (row) => {
			
			let dateA = dateWithDefault(row[idx1], defaultBegin)
			let dateB = dateWithDefault(row[idx2], defaultEnd); 
			
			if (mode == "før" || mode == "etter") {
				return ((mode == "før") & ((dateB < begin) || (dateA < begin))) | ((mode == "etter") & ((begin < dateB) || (begin < dateA)));
			} else {
				if (mode == "eksakt") {
					if ((dateB <= begin) || (dateA >= begin)) {
						return false;
					}
					return true;
				}
				
				const end = new Date(date2);
				if (mode == "mellom") {
					if (((end >= dateA) && (end <= dateB)) || ((begin >= dateA) && (begin <= dateB))) {
						return true;
					}
				}
				if (mode == "utenfor") {
					if ((dateA > end) || (dateB < begin)) {
						return true;
					}
				}
			}
			return false;
		});
	out.unshift(header);
	arr.unshift(header);
	
	return out;
}

function begin() {
	
	
	const eName = "dataReady";
	let dataReadyTarget = {
			file: 1,
			mode: 1
			
		};

	const dataReadyEvent = new Event(eName);
	let dataReady = new Proxy(dataReadyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					
					
					return true;
				}
		});
		
	
	
	fxcd("mode-select").onchange = (evt) => {
			let v = evt.target.value;
			if (v == "Før" || v == "Etter") {
				fxcd("end").disabled = true;
			} else {
				if (v == "Eksakt") {
					fxcd("end").disabled = true;
				} else {
					fxcd("end").disabled = false;
				}
			}
			dataReady['mode'] -= 1;
		};
	
	
}

function unitTest() {
	return testExact() | testBefore() | testAfter() | testBetween() | testOutside();
}

function testExact() {
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023011", "Husleie april 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "16300", "7200973", "", "", 			"01.05.2023", "31.05.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", 				"01.05.2023", "31.05.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7037141563", "Arnt Barnt", "244898", "K00006431", "Sørslettveien 10, H 0202", "", "Husleie", "16300", "7200979", "", "", 	"01.05.2023", "31.05.2023", "1", "9636,86", "9636,86", "9636,86", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "11118047356", "Martin Kattepus", "244909", "K00006444", "Lars Eriksens vei 20, U 0102", "", "Husleie", "16300", "7200979", "", "", 	"01.05.2023", "31.05.2023", "1", "9650,71", "9650,71", "9650,71", "", "01.01.2023", "01.01.2024", "False", "False", "False"]
		];
	let date = "2023-05-15";
	
	return compareArrays(wanted, filter(invoiceSample, invoiceIdx['fra dato'], invoiceIdx['til dato'], "eksakt", date, null));
}

function testBefore() {
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023004", "Husleie februar 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "16300", "7200973", "", "",			"01.03.2023", "31.03.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "",			"01.01.2023", "31.01.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023004", "Husleie februar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "",			"01.02.2023", "28.02.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023008", "Husleie mars 2023", "26106847818", "Arne Bjarne Tjarne", "223299", "K00006421", "Nordslettveien 14, H 0102", "", "Husleie", "16300", "7200979", "", "", 	"01.03.2023", "31.03.2023", "1", "9804,1", "9804,1", "9804,1", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "7037141563", "Arnt Barnt", "244898", "K00006431", "Sørslettveien 10, H 0202", "", "Husleie", "16300", "7200979", "", "", "01.01.2023", "31.01.2023", "1", "9636,86", "9636,86", "9636,86", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "21016729768", "Kjell Trell Trafikkuhell", "236676", "K00006433", "Sørslettveien 8, U 0101", "", "Husleie", "16300", "7200979", "", "", 		"01.02.2023", "28.02.2023", "1", "9739,12", "9739,12", "9739,12", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
		];
	let date = "2023-04-01";
	
	return compareArrays(wanted, filter(invoiceSample, invoiceIdx['fra dato'], invoiceIdx['til dato'], "før", date, null));
}

function testAfter() {
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023011", "Husleie april 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "16300", "7200973", "", "", 			"01.05.2023", "31.05.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023024", "Husleie august 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "11246", "7200973", "", "",			"01.09.2023", "30.09.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", 				"01.05.2023", "31.05.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023011", "Husleie april 2023", "26106847818", "Arne Bjarne Tjarne", "223299", "K00006421", "Nordslettveien 14, H 0102", "", "Husleie", "16300", "7200979", "", "", 	"01.04.2023", "30.04.2023", "1", "9804,1", "9804,1", "9804,1", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7037141563", "Arnt Barnt", "244898", "K00006431", "Sørslettveien 10, H 0202", "", "Husleie", "16300", "7200979", "", "", 	"01.05.2023", "31.05.2023", "1", "9636,86", "9636,86", "9636,86", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "11118047356", "Martin Kattepus", "244909", "K00006444", "Lars Eriksens vei 20, U 0102", "", "Husleie", "16300", "7200979", "", "", 	"01.05.2023", "31.05.2023", "1", "9650,71", "9650,71", "9650,71", "", "01.01.2023", "01.01.2024", "False", "False", "False"]
		];
	let date = "2023-04-01";
	
	return compareArrays(wanted, filter(invoiceSample, invoiceIdx['fra dato'], invoiceIdx['til dato'], "etter", date, null));
}

function testBetween() {
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023004", "Husleie februar 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "16300", "7200973", "", "",			"01.03.2023", "31.03.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023004", "Husleie februar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "",			"01.02.2023", "28.02.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023008", "Husleie mars 2023", "26106847818", "Arne Bjarne Tjarne", "223299", "K00006421", "Nordslettveien 14, H 0102", "", "Husleie", "16300", "7200979", "", "", 	"01.03.2023", "31.03.2023", "1", "9804,1", "9804,1", "9804,1", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "21016729768", "Kjell Trell Trafikkuhell", "236676", "K00006433", "Sørslettveien 8, U 0101", "", "Husleie", "16300", "7200979", "", "", 		"01.02.2023", "28.02.2023", "1", "9739,12", "9739,12", "9739,12", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
		];
	let begin = "2023-02-01";
	let end = "2023-03-15";
	
	return compareArrays(wanted, filter(invoiceSample, invoiceIdx['fra dato'], invoiceIdx['til dato'], "mellom", begin, end));
}
function testOutside() {
	let wanted = [
			["År/serienummer", "Faktura", "Nummer", "Leietaker", "Reskontronr", "Løpenummer", "Fasilitet", "Ordrenummer", "Tekst", "Konto", "Varenr", "Lønnsart", "Tilleggsinfo 1", "Fra dato", "Til dato", "Mengde", "Pris", "Sum", "Sum+MVA", "Rabatt", "Regulert den", "Neste regulering", "MVA-pliktig", "Manuell", "Sluttoppgjør"],
			["2023011", "Husleie april 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "16300", "7200973", "", "", 				"01.05.2023", "31.05.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023024", "Husleie august 2023", "5027122363", "Øivind Etternavn", "243042", "K00004833", "Nedre Storvollen 22", "", "Husleie", "11246", "7200973", "", "", 				"01.09.2023", "30.09.2023", "1", "8712", "8712", "8712", "", "01.11.2021", "", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", 					"01.05.2023", "31.05.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "7106638432", "Fredrik Puddingsen", "236249", "K00006331", "Sørslettveien 8, H 0201", "", "Husleie", "16300", "7200979", "", "", 				"01.01.2023", "31.01.2023", "1", "9744,44", "9744,44", "9744,44", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023011", "Husleie april 2023", "26106847818", "Arne Bjarne Tjarne", "223299", "K00006421", "Nordslettveien 14, H 0102", "", "Husleie", "16300", "7200979", "", "", 		"01.04.2023", "30.04.2023", "1", "9804,1", "9804,1", "9804,1", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "7037141563", "Arnt Barnt", "244898", "K00006431", "Sørslettveien 10, H 0202", "", "Husleie", "16300", "7200979", "", "", 		"01.05.2023", "31.05.2023", "1", "9636,86", "9636,86", "9636,86", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023001", "Husleie januar 2023", "7037141563", "Arnt Barnt", "244898", "K00006431", "Sørslettveien 10, H 0202", "", "Husleie", "16300", "7200979", "", "", 	"01.01.2023", "31.01.2023", "1", "9636,86", "9636,86", "9636,86", "", "01.01.2023", "01.01.2024", "False", "False", "False"],
			["2023014", "Husleie mai 2023", "11118047356", "Martin Kattepus", "244909", "K00006444", "Lars Eriksens vei 20, U 0102", "", "Husleie", "16300", "7200979", "", "", 		"01.05.2023", "31.05.2023", "1", "9650,71", "9650,71", "9650,71", "", "01.01.2023", "01.01.2024", "False", "False", "False"]
		];
	let begin = "2023-02-01";
	let end = "2023-03-15";
	
	return compareArrays(wanted, filter(invoiceSample, invoiceIdx['fra dato'], invoiceIdx['til dato'], "utenfor", begin, end));
}
