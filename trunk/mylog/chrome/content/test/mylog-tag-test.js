var dataStore;
var dataHandler;

function tag_runTests() {
	tag_setUp();
	testGetAllTags();
	testTagSearch();
	dataHandler.close();
}

function tag_setUp() {
	dataStore = new XmlDataStore();
	dataHandler = dataStore.open();
}

function testGetAllTags() {
	var msg = "testGetAlltags";

	var tags = dataHandler.getAllTags();
	var correctTags = ["blah", "Google", "blank"];
	var passed = 1;
	for (var i = 0; i < Math.max(tags.length, correctTags.length); i++) {
		var ret = assertEquals(tags[i], correctTags[i], msg + "tag " + i);
		if (!ret) {
			passed = 0;
		}
	}
	if (passed) {
		alert("testGetAllTags passed.");
	} else {
		alert("testGetAllTags failed.");
	}
}

function testTagSearch() {
	var keyword = "blah";
	var correctEntryList = [0, 2, 3];
	var testNum = 1;
	testOneTagSearch(keyword, correctEntryList, testNum);

	keyword = "Google";
	correctEntryList = [1];
	testNum++;
	testOneTagSearch(keyword, correctEntryList, testNum);

	keyword = "blank";
	correctEntryList = [];
	testNum++;
	testOneTagSearch(keyword, correctEntryList, testNum);
}

function testOneTagSearch(keyword, correctEntryList, testNum) {
	var msg = "testTagSearch: tsst" + testNum;
	var passed = 1;
	var entryList = dataHandler.findEntries(keyword,"tag");
	for (var i=0; i < Math.max(entryList.length, correctEntryList.length); i++) {
		var ret = assertEquals(entryList[i].getId(), correctEntryList[i], msg);
		if (!ret) {
			passed = 0;
		}
	}
	if (passed) {
		alert("testTagSearch test " + testNum + "passed");
	} else {
		alert("testTagSearch test " + testNum + "failed");
	}
}