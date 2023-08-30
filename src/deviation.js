"use strict";

const eventName = "dataReady";
let readyTarget = {
		countA: 2,
		countB: 2,
		countC: 2
	};

const readyEvent = new Event(eventName);
let ready = new Proxy(readyTarget, {
		set: (target, key, value) => {
				target[key] = value;
				fxcd("download").disabled = true;
				if (target["countA"] < 1 && target["countB"] < 1 && target["countC"] < 1) {
					document.dispatchEvent(readyEvent);
				} else if (target["countA"] < 2 && target["countB"] < 2 && target["countC"] < 2) {
					fxcd("filter").disabled = false;
				} else {
					fxcd("filter").disabled = true;
				}
				return true;
			}
	});



function begin() {
	
	let rentables = null;
	let buildings = null;
	let deviations = null;
	
	fxcd("filter").disabled = true;
	
	fxcd("rentables").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countA"] = 2;
			} else {
				ready["countA"] -= 1;
			}
		};
	fxcd("buildings").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countB"] = 2;
			} else {
				ready["countB"] -= 1;
			}
		};
	fxcd("deviations").onchange = (evt) => {
			if (evt.target.files.length == 0) {
				ready["countC"] = 2;
			} else {
				ready["countC"] -= 1;
			}
		};
	
	
	
	fxcd("filter").onclick = () => {
			
			{
				let f1 = new FileReader();
				let f2 = new FileReader();
				let f3 = new FileReader();
				
				rentables = null;
				buildings = null;
				deviations = null;
				
				f1.onload = () => {
						rentables = CSVToArray(f1.result, ";");
						CSVRemoveBlanks(rentables);
						ready["countA"] -=1;
					};
				f2.onload = () => {
						buildings = CSVToArray(f2.result, ";");
						CSVRemoveBlanks(buildings);
						ready["countB"] -= 1;
					};
				f3.onload = () => {
						deviations = CSVToArray(f3.result, ";");
						CSVRemoveBlanks(deviations);
						ready["countC"] -= 1;
					};
				
				f1.readAsText(fxcd("rentables").files[0], "iso-8859-1");
				f2.readAsText(fxcd("buildings").files[0], "iso-8859-1");
				f3.readAsText(fxcd("deviations").files[0], "iso-8859-1");
			}
			
			
			document.addEventListener(eventName, () => {
					let output = [];
					
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					btn.onclick = () => {
							downloadCSV(arrayToCSV(output,";"), "avvik - filtrert.csv");
						};
						
					
					/*
						tegn
					*/
					let con = fxcd("result");
					con.innerHTML = "";
					output.forEach((deviation) => {
							let p = xcd("p");
							let out = [deviation[5], deviation[6], deviation[8]];
							axcd(p, txcd(out[0]));
							addLine(p);
							axcd(p, txcd(out[1]));
							addLine(p);
							axcd(p, txcd(out[2]));
							p.style.border = "1px solid black";
							axcd(con, p);
						});
				});	
		};
}