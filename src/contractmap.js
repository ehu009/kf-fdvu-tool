'use strict';

const eventName = 'dataReady';
let readyTarget = {
		fileA: 2,
		fileB: 2,
		dateA: 1,
		dateB: 1,
		bool: false
	};
const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				if (key == 'bool') {
					fxcd('begin').disabled = false;
					fxcd('end').disabled = false;
					if (value == false) {
						fxcd('begin').disabled = true;
						fxcd('end').disabled = true;
					}
				}
				const b = target['bool'];
				fxcd(name + 'download').disabled = true;
				
				if (target['fileA'] < 1 && target['fileB'] < 1) {
					if (!b || (b && target['dateA'] == 0 && target['dateB'] == 0)) {
						document.dispatchEvent(readyEvent);
					}
				} else {
					const btn = fxcd('filter');
					if (target['fileA'] < 2 && target['fileB'] < 2) {
						if (!b || (target['dateA'] < 1 && target['dateB'] < 1)) {
							btn.disabled = false;
						}
					} else {
						btn.disabled = true;
					}
				}
				return true;
			}
	});

function fieldEvents() {
	let field = fxcd('begin');
	/*
		dates
	*/
	field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready['dateA'] = 1;
			} else {
				ready['dateA'] = 0;
			}
		};
	field = fxcd('end');
	field.onchange = (evt) => {
			if (isInvalid(evt.target.value)) {
				ready['dateB'] = 1;
			} else {
				ready['dateB'] = 0;
			}
		};
	/*
		date checkbox
	*/
	field = fxcd('timefilter');
	field.onclick = (evt) => {
			ready['bool'] = evt.target.checked;
		};
	/*
		files
	*/
	
	fileChangeEvents(['rentables', 'contracts'], ready);
	
}

function filter(contractList, rentablesList) {
	const begin = new Date(fxcd('begin').value);
	const end = new Date(fxcd('end').value);
	let defaultBegin = new Date();
	let defaultEnd = new Date();
	defaultBegin.setFullYear(1950);
	defaultEnd.setFullYear(2090);
	
	const header = contractList.shift();
	const out = contractList.filter((c) => {
			//	tidsfilter
			if (ready['bool']) {
				if (dateWithDefault(c[contractIdx['startdato']], defaultBegin) > end
						|| dateWithDefault(c[contractIdx['sluttdato']], defaultEnd) < begin) {
					return false;
				}
			}
			//	lokasjonsfilter
			for (let i = 1; i < rentablesList.length; i += 1) {
				
				if (c[contractIdx['fasilitetsnummer']] == rentablesList[i][rentableIdx['seksjonsnummer']]) {
					if (c[contractIdx['bygningsnummer']] == rentablesList[i][rentableIdx['bygningsnummer']]) {
						return true;
					}
				}
			}
			return false;
		});
	out.unshift(header);
	contractList.unshift(header);
	return out;
}

function begin() {
	
	const spinner = fxcd('spinner');
	
	fieldEvents();
	
	let inputData = null;
	
	fxcd('filter').onclick = () => {
			show(spinner);
			inputData = fileReadInput(['contracts', 'rentables'], ready);
		};
	
	document.addEventListener(eventName, () => {
			
			const out = filter(inputData['contracts'], inputData['rentables']);
			
			const btn = fxcd('download');
			btn.disabled = false;
			let fname = 'kontrakter hos seksjoner';
			if (fxcd('timefilter').checked) {
				fname += ' - fra ' + fxcd('begin').value + ' til ' + fxcd('end').value;
			}
			downloadButton(btn, out, fname);
			
			hide(spinner);
		});
	
}

function unitTest() {
	
	const wanted = [
			['Løpenummer', 'Overskrift', 'Ekstern ID', 'Leietaker', 'Nummer', 'Reskontronr', 'Saksbehandler', 'Fra', 'Til', 'Sum', 'Kontrakt utgår', 'Regulering', 'Gjengs regulering', 'Fasilitetsnummer', 'Fasilitet', 'Eiendomsnr', 'Eiendomsnavn', 'Byggnr', 'Byggnavn', 'Kontrakttype', 'Fakturatype', 'Mengde', 'Faktura fra', 'Fakturareferanse', 'E-handel faktura', 'Behandlingsstatus', 'Sikkerhetstype', 'Sikkerhetsbeløp', 'Prisperiode', 'Faktureringstermin', 'Terminstart', 'MVA-pliktig', 'Merknad', 'Seksjonstype'],
			['K00006331', 'Kontrakt for Fredrik Puddingsen', '', 'Fredrik Puddingsen', '7106638432', '236249', '', '01.01.2008', '', '9744,44', '31.12.3000', '01.01.2024', '01.01.2025', '24979620030', '24979620030 Sørslettveien 8 H 0201', '1180', 'Åsgård', '118006', 'Åsgård Sørslettveien 8', '', 'Etterskudd Agresso', '', '', 'Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.', '', 'Løpende', '', '0', 'Månedlig', 'Månedlig', 'Januar', 'False', '', 'Rus og Psykiatribolig'],
			['K00006433', 'Kontrakt for Kjell Trell Trafikkuhell', '', 'Kjell Trell Trafikkuhell', '21016729768', '236676', '', '01.01.2008', '', '9739,12', '01.01.3000', '01.01.2024', '01.01.2025', '24979620028', '24979620028 Sørslettveien 8 U 0101', '1180', 'Åsgård', '118006', 'Åsgård Sørslettveien 8', '', 'Agresso', '1', '', 'Husleie indeksreguleres et år etter kontrakten starter, deretter årlig.', '', 'Løpende', '', '0', 'Månedlig', 'Månedlig', 'Januar', 'False', '', 'Rus og Psykiatribolig']
		];
	
	return compareCSV(wanted, filter(contractSample, rentableSample));
}