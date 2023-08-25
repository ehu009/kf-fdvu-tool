"use strict";


function begin() {
	
	fxcd("number-select").onchange = (evt) => {
		let s = fxcd("field");
		s.innerHTML = "";
		
		let n = parseInt(evt.target.value);
		
		for (let i = 1; i <= n; i += 1) {
			let line = xcd("p");
			axcd(line, txcd("Fil "+i+": "));
			axcd(line, fileInputTag("file"+i));
			axcd(s, line)
		}
	}
	
	
	fxcd("merge").onclick = () => {
			
			{	// a spinner
				let s = spinnerTag("spinner");
				axcd(fxcd("result"), s);
				show(s);
			}
			
			
			let n = parseInt(fxcd("number-select").value);
			const eventName = "dataReady";
			let readyTarget = {count: n};
			
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
			let q = 0;
			{
				for (let i = 1; i <= n; i += 1) {
					
					try {
						let f = new FileReader();
						f.onload = () => {
								let c = CSVToArray(f.result, ";");
								xc(c)
								for (let j = c.length - 1; j >= 0; j -= 1) {
									if (c[j].length == 1 || c[j].length == 0) {
										xc(c.splice(j,1))
									} else {
										let empty = c[j].length;
										for (let k = 0; k < c[j].length; k += 1) {
											if (isInvalid(c[j][k])) {
												empty -= 1;
											}
										}
										if (empty == 0) {
											c.splice(j,1)
										}
									}
								}
								
								csvs.push(c)
								ready["count"] -=1;
							};
						f.readAsText(fxcd("file"+i).files[0], "iso-8859-1");
					}
					catch (e) {
						q += 1
						ready["count"] -=1;
					}
				}
			}
			
			document.addEventListener(eventName, () => {
					let out = csvs[0]
					xc(q)
					
					xc(out)
					for (let i = 1; i < csvs.length; i += 1) {
						csvs[i].shift()
						xc(csvs[i])
						out = out.concat(csvs[i]);
					}
					xc(out)
					
					hide(fxcd("spinner"));
					
					/*
						tillat nedlasting
					*/
					let btn = fxcd("download");
					btn.disabled = false;
					btn.onclick = () => {
							downloadCSV(arrayToCSV(out,";"), "csv - sammenføyd.csv");
						};
						
				});
		};
}