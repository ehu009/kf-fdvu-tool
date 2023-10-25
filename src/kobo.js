

function generate(rentables, contracts, facilities, estates) {
	
}


function begin() {
	
	const eventName = "dataReady";
	let readyTarget = {
			fileA: 2,
			fileB: 2,
			fileC: 2,
			fileD: 2
		};
	const readyEvent = new Event(eventName);
	let ready = new Proxy(readyTarget, {
			set: (target, key, value) => {
					target[key] = value;
					fxcd("download").disabled = true;
					if (target['fileA'] < 2 && target['fileB'] < 2 && target['fileC'] < 2 && target['fileD'] < 2) {
						fxcd('filter').disabled = false;
						if (target['fileA'] < 1 && target['fileB'] < 1 && target['fileC'] < 1 && target['fileD'] < 1) {
							document.dispatchEvent(readyEvent);
						}
					}
					return true;
				}
		});
	
	fileChangeEvents(['rentables', 'contracts', 'facilities', 'estates'], ['fileA', 'fileB', 'fileC', 'fileD'], ready);
	
	let inputData = null;
	let spinner = fxcd('spinner');
	document.addEventListener(eventName, () => {
			
			let out = generate(inputData['rentables'], inputData['contracts'], inputData['facilities'], inputData['estates']);
			let btn = fxcd("download");
			btn.disabled = false;
			downloadButton(btn, out, "overlappende matrikkelnumre");
			
			hide(spinner);
		});
	
	fxcd("filter").onclick = () => {
			inputData = {};
			show(spinner);
			let key = ['A', 'B', 'C', 'D'];
			let id = ['rentables', 'contracts', 'facilities', 'estates'];
			
			for (let i = 0; i < 4; i += 1) {
				let e = fxcd(id[i]);
				
				let f = new FileReader();
				f.onload = () => {
						let l = CSVToArray(f.result, ";");
						CSVRemoveBlanks(l);
						inputData[id[i]] = l;
						ready["file" + key[i]] -= 1;
					};
				f.readAsText(e.files[0], "iso-8859-1");
			}
		};
}

function unitTest() {
	let q = false;
	
	if (testEstateConnectivity()) {
		xc("estate failed");
		q = true;
	}
	if (testContractConnectivity()) {
		xc("contract failed")
		q = true;
	}
	if (testFacilityConnectivity()) {
		xc("facility failed");
		q = true;
	}
	if (testAddressParse()) {
		xc("address failed");
		q = true;
	}
	if (testRoomNumberParse()) {
		xc("room number failed");
		q = true;
	}
	
	return q;
}

function testEstateConnectivity() {
	
	return true;
}

function testContractConnectivity() {
	
	return true;
}

function testFacilityConnectivity() {
	
	return true;
}

function testAddressParse() {
	
	return true;
}

function testRoomNumberParse() {
	
	return true;
}