'use strict';


function begin() {
	
	let n = parseInt(fxcd('number-select').value);
	const eventName = 'dataReady';
	let readyTarget = {
			count: n
		};
	
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					
					if (target[key] == 0) {
						document.dispatchEvent(readyEvent);
					}
					return true;
				}
		});
	
	fxcd('number-select').onchange = (evt) => {
			const s = fxcd('field');
			s.innerHTML = '';
			
			n = parseInt(evt.target.value);
			ready['count'] = n;
			
			for (let i = 1; i <= n; i += 1) {
				const line = xcd('p');
				axcd(line, txcd('Fil '+i+': '));
				addLine(line);
				axcd(line, fileInputTag('file'+i));
				axcd(s, line);
			}
		};
	
	let csvs = [];
	const spinner = fxcd('spinner');
	
	fxcd('merge').onclick = () => {
			show(spinner);
			csvs = [];
			for (let i = 1; i <= n; i += 1) {
				
				try {
					let f = new FileReader();
					f.onload = () => {
							const c = CSVToArray(f.result, ';');
							csvs.push(c);
							ready['count'] -=1;
						};
					f.readAsText(fxcd('file'+i).files[0], 'iso-8859-1');
				} catch (e) {
					ready['count'] -=1;
				}
			}
		};
	document.addEventListener(eventName, () => {
			
			const out = mergeCSV(csvs);
			const btn = fxcd('download');
			btn.disabled = false;
			downloadButton(btn, out, 'csv - sammenføyd');
			hide(spinner);
			
		});
		
}


function unitTest() {
	const csv1 = [
			['nummer', 'navn', 'sum', 'adresse'],
			['010192', 'kjeller', '729', 'alta'],
			['010193', 'bod', '729', 'alta'],
			['010194', 'stue', '729', 'alta'],
			['010195', 'loft', '729', 'alta']
		];
			
	const csv2 = [
			['nummer', 'navn', 'sum', 'adresse'],
			['010182', 'kjeller', '729', 'harstad'],
			['010183', 'bod', '729', 'harstad'],
			['010184', 'stue', '729', 'harstad'],
			['010185', 'loft', '729', 'harstad']
		];
		
	const expected = [
			['nummer', 'navn', 'sum', 'adresse'],
			['010192', 'kjeller', '729', 'alta'],
			['010193', 'bod', '729', 'alta'],
			['010194', 'stue', '729', 'alta'],
			['010195', 'loft', '729', 'alta'],
			['010182', 'kjeller', '729', 'harstad'],
			['010183', 'bod', '729', 'harstad'],
			['010184', 'stue', '729', 'harstad'],
			['010185', 'loft', '729', 'harstad']
		];
	
	return compareCSV(expected, mergeCSV([csv1, csv2]));
}