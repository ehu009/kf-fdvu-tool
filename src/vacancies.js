"use strict";




function filter(owner, rentablesList) {
	const out = [];
	
	return out;
}

function setupVacancyFilter() {
	
}


function vacancyTest() {
	let owner = "BK";
	const rentables = [];
	
	const wanted1 = [];
	const wanted2 = [];
	
	let out = true;
	out = out & compareCSV(wanted1, filter(owner, rentables));
	
	owner = "KF";
	out = out & compareCSV(wanted2, filter(owner, rentables));
	
	return out;
}


function unitTest() {
	return vacancyTest();
};