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
						CSVRemoveBlanks(rentables);
						ready["countA"] -=1;
					};
				f2.onload = () => {
						deviations = CSVToArray(f2.result, ";");
						CSVRemoveBlanks(deviations);
						ready["countB"] -= 1;
					};
				
				f1.readAsText(fxcd("rentables").files[0], "iso-8859-1");
				f2.readAsText(fxcd("deviations").files[0], "iso-8859-1");
			}
			
			
			document.addEventListener(eventName, () => {
					
					
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
					let filteredDeviations = deviations.filter((row) => {
							return propertyMap.has(row[deviationIdx['bygningsnavn']]);
						});
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					downloadButton(btn, filteredDeviations, "avvik - filtrert")
					
					/*
						tegn
					*/
					let con = fxcd("result");
					con.innerHTML = "";
					filteredDeviations.forEach((deviation) => {
							let p = xcd("p");
							let out = [
									deviation[deviationIdx['avviksnavn']],
									deviation[deviationIdx['bygningsnavn']],
									deviation[deviationIdx['fasilitet']],
									deviation[deviationIdx['avviksmerknad']]
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