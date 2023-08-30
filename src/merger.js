"use strict";


function begin() {
	
	fxcd("number-select").onchange = (evt) => {
			let s = fxcd("field");
			s.innerHTML = "";
			
			let n = parseInt(evt.target.value);
			
			for (let i = 1; i <= n; i += 1) {
				let line = xcd("p");
				axcd(line, txcd("Fil "+i+": "));
				addLine(line);
				axcd(line, fileInputTag("file"+i));
				axcd(s, line);
			}
		}
	
	
	fxcd("merge").onclick = () => {
			
			let n = parseInt(fxcd("number-select").value);
			const eventName = "dataReady";
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
			
			let csvs = [];
			{
				for (let i = 1; i <= n; i += 1) {
					
					try {
						let f = new FileReader();
						f.onload = () => {
								let c = CSVToArray(f.result, ";");
								CSVRemoveBlanks(c);
								csvs.push(c);
								ready["count"] -=1;
							};
						f.readAsText(fxcd("file"+i).files[0], "iso-8859-1");
					}
					catch (e) {
						ready["count"] -=1;
					}
				}
			}
			
			document.addEventListener(eventName, () => {
					let out = csvs[0];
					
					for (let i = 1; i < csvs.length; i += 1) {
						csvs[i].shift();
						out = out.concat(csvs[i]);
					}
					
					hide(fxcd("spinner"));
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					downloadButton(btn, out, "csv - sammenføyd");
					/*
					btn.onclick = () => {
							downloadCSV(arrayToCSV(out,";"), "csv - sammenføyd.csv");
						};
						*/
				});
		};
}