// *** ebowden2, jamatz: 02-13-2007: Initial creation of mylogsidebar.js, filled with one simple function to populate the sidebar's listbox.

function populateListbox() {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var entryList = dataHandler.getAllEntries();
	for (var i = 0; i < entryList.length; i++) {
		document.getElementById('results-list').appendItem(entryList[i].getTitle());
	}
}