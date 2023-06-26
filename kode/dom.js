


function axcd(p, e) {
	p.appendChild(e);
}
function xcd(t) {
	return document.createElement(t);
}
function txcd(t) {
	return document.createTextNode(t);
}
function fxcd(t) {
	return document.getElementById(t);
}

function line() {
	return xcd("br");
}
function addLine(e) {
	axcd(e, line());
}
function newRow(content, header, className) {
	let r = xcd("tr");
	for (let i = 0; i < content.length; i += 1) {
		let c = xcd("td");
		if (header == true) {
			c = xcd("th");
		}
		if (i > 1) {
			if (className != "") {
				c.classList.add(className);
			}
		}
		axcd(c, txcd(content[i]));
		axcd(r, c);
	}
	return r;
}

function toggleCheckbox(id) {
	let b = fxcd(id);
	if (b.checked == true) {
		b.checked = false;
	} else if (b.checked == false) {
		b.checked = true;
		return;
	}
}

function createCheckbox(container, name) {
	let n = "checkbox";
	let c = xcd("span");
	{
		let label = xcd("label");
		axcd(label, txcd(name));
		label.onclick = function () {
				toggleCheckbox(name + "-" + n);
			};
		axcd(c, label);
	}
	{
		let box = xcd("input");
		box.type = n;
		box.id = name + "-" + n;
		axcd(c, box);
	}
	c.classList.add("checkbox-container");
	axcd(fxcd(container), c);
}

function mapCheckboxes(containerId) {
	let out = new Map();	
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == "div") {
			continue;
		}
		let label = n.firstChild.innerHTML;
		let value = n.lastChild.checked;
		out.set(label, value);
	}
	return out;
}

function setCheckboxValues(containerId, options) {
	
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == "div") {
			continue;
		}
		let label = n.firstChild.innerHTML;
		if (options.has(label)) {
			n.lastChild.checked = options.get(label);
		} else {
			n.lastChild.checked = false;
		}
	}
}

function allOrNoneBtn(buttonId, containerId, desired, allOptions) {
	fxcd(buttonId).onclick = function () {
			let m = new Map();
			for (let e of allOptions) {
				m.set(e, desired);
			}
			setCheckboxValues(containerId, m);
		};
}

function createCheckboxSelection (containerId, defaultsMap) {
	let i = xcd("select");
	let c = xcd("option");
	axcd(c, txcd("velg innstilling"));
	c.disabled = true;
	c.selected = "selected";
	axcd(i, c);
	
	for (let k of defaultsMap.keys()) {
		c = xcd("option");
		axcd(c, txcd(k));
		axcd(i, c);
	}
	i.onchange = function(e) {
			setCheckboxes(containerId, defaultsMap.get(i.value));
		};
	
	let d = xcd("div");
	axcd(d, i);
	axcd(fxcd(containerId), d);
}

function populateCheckboxes(containerId, nameList, defaults) {
	fxcd(containerId).innerHTML = "";
	if (defaults != null) {
		createCheckboxSelection(containerId, defaults);
	}
	for (let c of nameList) {
		createCheckbox(containerId, c);
	}
}
function radioButtonTag(id, name, value, checked)
{
	let i = xcd("input");
	i.type = "radio";
	i.id = id;
	i.name = name;
	i.value = value;
	if (checked == true) {
		i.checked = checked;
	}
	return i;
}
function labelTag(target, txt) {
	let l = xcd("label");
	l.for = target;
	axcd(l, txcd(txt));
	return l;
}
function optionTag(txt, selected, disabled) {
	let t = xcd("option");
	axcd(t, txcd(txt));
	t.selected = selected;
	t.disabled = disabled;
	return t;
}
function fileInputTag(id) {
	let i = xcd("input");
	i.type = "file";
	i.id = id;
	return i;
}
function buttonTag(buttonId, txt, disabled) {
	let b = xcd("button");
	b.disabled = disabled;
	b.type = "button";
	b.id = name + buttonId;
	axcd(b, txcd(txt));
	return b;
}
function spinnerTag(spinnerId) {
	let b = xcd("div");
	b.classList.add("spinning");
	b.id = spinnerId;
	axcd(b, txcd("⚙"));
	return b;
}
function dateFieldTag(id) {
	let i = xcd("input");
	i.id = id;
	i.type = "date";
	return i;
}
function listTag(txt) {
	let l = xcd("ul");
	axcd(l, txcd(txt));
	return l;
}
function iframeTag(url, active) {
	let d = xcd("div");
	let i = xcd("iframe");
	i.src = url;
	axcd(d, i);
	d.classList.add("carousel-item");
	if (active == true) {
		d.classList.add("active");
	}
	return d;
}
function lossSumHeader() {
	return newRow(["Sum - dager vakant", "Sum - vakansetap", "Sum - dager hos drift", "Sum - tap pga drift", "Sum - dager passiv", "Sum - passiv kostnad", "Sum - Vakanse + Drift"], true, "");
}
function gainSumHeader() {
	return newRow(["Sum av ikke-passive boliger", "Sum av passive boliger", "Totalsum - inntekter"], true, "");
}
function defaultButtonTags(name) {
	let con = fxcd(name + "-container");
	let b = buttonTag(name + "-calc-btn", "Lag flett", true);
	axcd(con, b);
	axcd(con, txcd(" "));
	
	b = buttonTag(name + "-download-btn", "Last ned CSV", true);
	axcd(con, b);
	axcd(con, txcd(" "));
	
	b = spinnerTag(name + "-spinner");
	axcd(con, b);
}

function spanSandwich (e, txt1, txt2, cls) {
	axcd(e, txcd(txt1));
	let s = xcd("span");
	s.classList.add(cls);
	axcd(s, txcd(txt2));
	axcd(e, s);
	axcd(e, txcd("."));
	addLine(e);
}
function lossLegend() {
	let b = xcd("b");
	spanSandwich(b, "Gul markering er brukt når ", "bolig har vært vakant hele perioden", "missing");
	spanSandwich(b, "Oransje markering er brukt når en seksjon ", "har overlappende kontrakter", "double");
	addLine(b);
	return b;
}
function gainLegend() {
	let b = xcd("b");
	spanSandwich(b, "Rød markering er brukt når ", "kontrakt mangler pris", "danger");
	spanSandwich(b, "Gul markering er brukt når ", "bolig har vært vakant hele perioden", "missing");
	let s = xcd("span");
	axcd(s, txcd("Passiv kontrakt og Driftskontrakt"));
	s.classList.add("passive");
	axcd(b, s);
	axcd(b, txcd(" er markert i grønt."));
	addLine(b);
	return b;
}

function keysText(containerId) {
	let con = fxcd(containerId);
	axcd(con, txcd("Liste over "));
	let tmp = xcd("b");
	axcd(tmp, txcd("alle"));
	axcd(con, tmp);
	axcd(con, txcd(" nøkler:"));
}
function lossText(con){
	axcd(con, txcd("Tap for vakanse og vedlikehold beregnes separat."));
	addLine(con);
	
	axcd(con, txcd("Tap regnes ut fra seksjonspris ved vakanse, og fra kontraktpris ved vedlikehold eller passiv kontrakt - dermed vil tap være negativt hvis kontraktpris er høyere enn seksjonspris."));
	addLine(con);
	
	axcd(con, txcd("I vedlikehold medregnes kontrakter der leietaker heter en av følgende:"));
	addLine(con);
	
	i = xcd("ul");
	for (let e of ["Driftsadministrasjonen", "Driftsavdelingen", "Tromsø kommune v/ Byggforvaltningen", "Drift Leide Boliger", "Stiftelsen Kommunale Boliger"]) {
		axcd(i, listTag(e));
	}
	axcd(con, i);
	axcd(con, txcd("Perioder som har overlappende kontrakter gir misvisende resultat, og regnes ikke med i summeringer."));
	addLine(con);
	axcd(con, txcd("Passive kontrakter regnes ikke som vedlikehold- eller utleiekontrakter."));
	
}
function contractsText(containerId) {
	let con = fxcd(containerId);
	axcd(con, txcd("Liste over "));
	let b = xcd("b");
	axcd(b, txcd("alle"));
	axcd(con, b);
	axcd(con, txcd(" utleiekontrakter"));
}
function rentablesText(containerId) {
	let con = fxcd(containerId);
	axcd(con, txcd("Liste over alle "));
	let tmp = xcd("i");
	axcd(tmp,txcd("aktive"));
	axcd(con,tmp);
	
	axcd(con, txcd(" bolig-seksjoner av kategori "));
	tmp = xcd("i");
	axcd(tmp, txcd("eid"));
	axcd(con, tmp);
	
	axcd(con, txcd(" eller "));
	tmp = xcd("i");
	axcd(tmp, txcd("Kommunalt foretak - KF"));
	axcd(con, tmp);
}
function spinnerFunction(spinnerId, func) {
	let spinner = fxcd(spinnerId);
	spinner.style.visibility = "visible";
	func();
	spinner.style.visibility = "hidden";
}
function col4 () {
	let k = xcd("div");
	k.classList.add("col-4");
	return k;
}
function carouselButton(elem, id, ctrl, cls) {
	elem.classList.add(cls);
	elem.setAttribute("data-bs-target", id);
	elem.setAttribute("data-bs-slide", ctrl);
}
function iframeCarousel(parent, id, btnCls, interval, path, urls) {
	let a = xcd("div");
	let b = null;
	
	a.classList.add("container-fluid", "row");
	b = col4();
	carouselButton(b, "#" + id, "prev", btnCls);
	axcd(b, txcd("‹"));
	axcd(a, b);
	
	axcd(a, col4());
	
	b = col4();
	carouselButton(b, "#" + id, "next", btnCls);
	axcd(b, txcd("›"));
	axcd(a, b);
	
	axcd(parent, a);


	a = xcd("div");
	a.id = id;
	a.setAttribute("data-bs-ride", "carousel");
	a.setAttribute("data-bs-interval", interval);
	a.classList.add("carousel", "slide");
	
	b = xcd("div");
	b.id = "carousel-inner";
	b.classList.add("carousel-inner");
	axcd(a, b);
	
	for (let i = 0; i < urls.length; i += 1) {
		axcd(b, iframeTag(path + urls[i] + ".html", i == 0));
	}
	axcd(parent, a);
}