'use strict';


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

function addLine(e) {
	axcd(e, xcd('br'));
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
	const n = 'checkbox';
	let c = xcd('span');
	
	axcd(c, labelTag(name));
	
	c.onclick = () => {
			toggleCheckbox(name + '-' + n);
			fxcd(container).dispatchEvent(new Event('change'));
		};
	{
		let box = xcd('input');
		box.type = n;
		box.id = name + '-' + n;
		axcd(c, box);
		box.onclick = () => {
				toggleCheckbox(name + '-' + n);
			};
	}
	c.classList.add('checkbox-container');
	axcd(fxcd(container), c);
}

function mapCheckboxes(containerId) {
	let out = new Map();
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == 'div') {
			continue;
		}
		out.set(n.firstChild.innerHTML, n.lastChild.checked);
	}
	return out;
}

function setCheckboxValues(containerId, options) {
	
	for (let n of fxcd(containerId).childNodes) {
		if (n.type == 'div') {
			continue;
		}
		const label = n.firstChild.innerHTML;
		if (options.has(label)) {
			n.lastChild.checked = options.get(label);
		} else {
			n.lastChild.checked = false;
		}
	}
}

function allOrNoneBtn(buttonId, containerId, desired, allOptions) {
	fxcd(buttonId).onclick = () => {
			let m = new Map();
			for (let e of allOptions) {
				m.set(e, desired);
			}
			setCheckboxValues(containerId, m);
			fxcd(containerId).dispatchEvent(new Event('change'));
		};
}

function createCheckboxSelection(containerId, defaultsMap) {
	let i = xcd('select');
	let c = xcd('option');
	axcd(c, txcd('velg innstilling'));
	c.disabled = true;
	c.selected = 'selected';
	axcd(i, c);
	
	for (let k of defaultsMap.keys()) {
		c = xcd('option');
		axcd(c, txcd(k));
		axcd(i, c);
	}
	i.onchange = function (e) {
			setCheckboxes(containerId, defaultsMap.get(i.value));
		};
	
	let d = xcd('div');
	axcd(d, i);
	axcd(fxcd(containerId), d);
}

function populateCheckboxes(containerId, nameList, defaults) {
	fxcd(containerId).innerHTML = '';
	if (defaults != null) {
		createCheckboxSelection(containerId, defaults);
	}
	for (let c of nameList) {
		createCheckbox(containerId, c);
	}
}

function labelTag(txt) {
	let l = xcd('label');
	axcd(l, txcd(txt));
	return l;
}
function optionTag(txt, val, selected, disabled) {
	let t = xcd('option');
	axcd(t, txcd(txt));
	t.value = val;
	t.selected = selected;
	t.disabled = disabled;
	return t;
}
function fileInputTag(id) {
	let i = xcd('input');
	i.type = 'file';
	i.id = id;
	return i;
}
function listTag(txt) {
	let l = xcd('li');
	axcd(l, txcd(txt));
	return l;
}
function unorderedList(id, contents) {
	let c = fxcd(id);
	for (let e of contents) {
		axcd(c, listTag(e));
	}
}

function iframeTag(url, active) {
	let d = xcd('div');
	let i = xcd('iframe');
	i.src = url;
	axcd(d, i);
	d.classList.add('carousel-item');
	if (active == true) {
		d.classList.add('active');
	}
	return d;
}
function downloadLink(content, fileName) {
	let link = xcd('a');
	link.setAttribute('href', content);
	link.setAttribute('download', fileName);
	link.hidden = true;
	return link;
}
function downloadButton(button, content, defaultName) {
	button.onclick = () => {
			downloadCSV(content, defaultName, ';');
		};
}

function hide(elem) {
	elem.style.visibility = 'hidden';
}
function show(elem) {
	elem.style.visibility = 'visible';
}

function col4() {
	let k = xcd('div');
	k.classList.add('col-4');
	return k;
}
function carouselButton(elem, id, ctrl, cls) {
	elem.classList.add(cls);
	elem.setAttribute('data-bs-target', id);
	elem.setAttribute('data-bs-slide', ctrl);
}
function iframeCarousel(parent, id, btnCls, interval, path, urls) {
	let a = xcd('div');
	let b = null;
	
	a.classList.add('container-fluid', 'row');
	b = col4();
	carouselButton(b, '#' + id, 'prev', btnCls);
	axcd(b, txcd('\u2039'));
	b.style.textAlign = 'right';
	axcd(a, b);
	
	axcd(a, col4());
	
	b = col4();
	carouselButton(b, '#' + id, 'next', btnCls);
	axcd(b, txcd('\u203A'));
	axcd(a, b);
	
	axcd(parent, a);
	

	a = xcd('div');
	a.id = id;
	a.setAttribute('data-bs-ride', 'carousel');
	a.setAttribute('data-bs-interval', interval);
	a.classList.add('carousel', 'slide');
	
	b = xcd('div');
	b.id = 'carousel-inner';
	b.classList.add('carousel-inner');
	axcd(a, b);
	for (let i = 0; i < urls.length; i += 1) {
		axcd(b, iframeTag(path + urls[i] + '.html', i == 0));
	}
	axcd(parent, a);
}
