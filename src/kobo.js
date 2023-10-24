
function begin() {

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