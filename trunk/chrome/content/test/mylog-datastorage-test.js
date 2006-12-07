function datastorage_runTests() {
	datastorage_setUp();
	testXmlDataStore();
}

function datastorage_setUp() {
}

function testXmlDataStore() {
	var msg = "testXmlDataStore";

	assertEquals(0, 0, msg + ":1");
	assertEquals(0, 1, msg + ":2");
}