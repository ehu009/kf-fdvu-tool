

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
	{
		let key = ['A', 'B', 'C', 'D'];
		let id = ['rentables', 'contracts', 'facilities', 'estates'];
		for (let i = 0; i < 4; i += 1) {
			fxcd(id[i]).onchange = (evt) => {
					let n = 'file' + key[i];
					if (evt.target.files.length < 1) {
						ready[n] -= 1;
					} else {
						ready[n] = 2;
					}
				};
		}
		/*
		fxcd('rentables').onchange = (evt) => {
				if (evt.target.files.length < 1) {
					ready['fileA'] -= 1;
				} else {
					ready['fileA'] = 2;
				}
			};
		fxcd('contracts').onchange = (evt) => {
				if (evt.target.files.length < 1) {
					ready['fileB'] -= 1;
				} else {
					ready['fileB'] = 2;
				}
			};
		fxcd('facilities').onchange = (evt) => {
				if (evt.target.files.length < 1) {
					ready['fileC'] -= 1;
				} else {
					ready['fileC'] = 2;
				}
			};
		fxcd('estates').onchange = (evt) => {
				if (evt.target.files.length < 1) {
					ready['fileD'] -= 1;
				} else {
					ready['fileD'] = 2;
				}
			};
			*/
	}
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