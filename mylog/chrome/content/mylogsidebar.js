// *** vviswana, bcho2: 04-17-2007: Modified the editing of tags and function removeTagFromEntry()
// *** bearly, jamatz: 04-01-2007: Fixed search() and processTagSelection()
// *** ebowden2, vviswana: 04-01-2007: Added uniqueTags and trimString as helper functions
// *** ebowden2, vviswana: 03-15-2007: Added handler functions for displaying logEntry details and saving to file.
// *** ebowden2, jamatz: 02-13-2007: Initial creation of mylogsidebar.js, filled with one simple function to populate the sidebar's listbox.
// *** ebowden2, jamatz: 02-22-2007: Updated the searchboxCallback function for improved search capabilities.
// *** ebowden2, jamatz: 02-22-2007: Created helper function parseSearchTerms to tokenize search string
// *** ebowden2, jamatz: 02-23-2007: Significantly improved searchboxCallback function; should refactor a bit and extract out most of it to another method.  Some known bugs are also present and will be addressed soon.
// *** ebowden2, jamatz: 02-24-2007: Made the dataStore and handlers global, since practically every function uses them and it's silly to keep opening and closing the store.  Refactored a bit.  Fixed a display bug.  Results are now displayed alphabetically by title by default.  Need to clean up the init code and add a close function to do clean-up when the sidebar is closed.
// *** ebowden2, jamatz: 03-07-2007: Added the createThumbnail function for creating and saving a thumbnail image of a logged page for use in the preview area of the sidebar.
// *** ebowden2, jamatz: 03-08-2007: Fixed up createThumbnail a bit, added real support for getting the ID of the page.


// Globals
var dataStore;
var dataHandler;

var showingSearchByContent = false;

var previousQuery = "";
var editingId;
var resultIndex;

var currComments = new Array();
var newComments = new Array();

function initializeGUI() {
	dataStore = new XmlDataStore();
	dataHandler = dataStore.open();
	populateTagsPopupMenu();
	populateListbox();
	
	clearComments(document.getElementById("comments-details-box"));
}

function toggleAndLogEntry() {
	toggleSidebar('viewMyLogSidebar');
	showLogEntryPage();
}

function showLogEntryPage(id) {
	try {
		if ((typeof(id) == "undefined") && (content.document.URL == 'about:blank')) {
			return 0;
		}
	
		document.getElementById("searchPage-box").hidden = true;
		document.getElementById("logPage-box").hidden = false;
	
		populateNewEntry(id);
	}catch(e) {
		logMsg("Exception in showLogEntryPage():" + e);
	}
}

function populateNewEntry (id) {
	try {
		editingId = id;
		logBoxClearTags();
		
		delete newComments;
		delete curComments;
		newComments = new Array();
		curComments = new Array();
		
		clearComments(document.getElementById("comments-box"));
		if (typeof(id) == "undefined") { // New Entry
			var title  = content.document.title;
			document.getElementById("logEntry-title").value = title;
			var url = content.document.location;
			document.getElementById("logEntry-url").value = url;
		} else {
			var logEntry = dataHandler.getEntry(id);
			document.getElementById("logEntry-title").value = logEntry.getTitle();
			document.getElementById("logEntry-url").value = logEntry.getUrl();
			logBoxPopulateTags(logEntry);
			logBoxPopulateComments(logEntry);
		}
	} catch(e) {
		logMsg("Exception in populateNewEntry():" + e);
	}
}

function logBoxPopulateTags(logEntry) {
	var tagsBox =  document.getElementById('logEntry-tags');
	
	var tags = logEntry.getTags();
	if(tags.length > 0) {
		for(var i=0;i<tags.length;i++) {
			tagsBox.appendItem(tags[i],tags[i]);
		}	
	}
}

function searchBoxPopulateTags(logEntry) {
	var tagsBox =  document.getElementById('logEntry-details-tags');
	
	var tags = logEntry.getTags();
	if(tags.length > 0) {
		for(var i=0;i<tags.length;i++) {
			tagsBox.appendItem(tags[i],tags[i]);
		}	
	}
}

function logBoxClearTags() {
	clearTagsBox(document.getElementById('logEntry-tags'));
}

function searchBoxClearTags() {
	clearTagsBox(document.getElementById('logEntry-details-tags'));
}

function clearTagsBox(tagsBox) {
	while (tagsBox.getRowCount() > 0) {
		tagsBox.removeItemAt(0);
	}

}
function logBoxPopulateComments(logEntry) {
	try {
		var commentsBox = document.getElementById("comments-box");
		curComments = logEntry.getComments();
		populateCommentsBox(commentsBox,logEntry);
	}catch(e) {
		logMsg("Exception in logBoxPopulateComments():" + e);
	}

}

function searchBoxPopulateComments(theEntry) {
	try {
		var commentsBox = document.getElementById("comments-details-box");
		populateCommentsBox(commentsBox,theEntry);
	}catch(e) {
		logMsg("Exception in searchBoxPopulateComments():" + e);
	}
}



function clearComments(commentsBox) {
	try {
		while (commentsBox.childNodes.length > 0) {
			commentsBox.removeChild(commentsBox.childNodes[0]);
		}
	} catch(e) {
		logMsg("Exception in clearComments():" + e);
	}
}

function populateCommentsBox(commentsBox,theEntry) {
	try {
		clearComments(commentsBox);
		
		var dateNode;
		var commentNode;
		var commentArray = theEntry.getComments();
		for (var i = 0; i < commentArray.length; i++) {
			dateNode = document.createElement("description");
			dateNode.setAttribute("id", "comdate-" + theEntry.getId() + "-" + i);
			dateNode.appendChild(document.createTextNode(commentArray[i].getDateString()));
			commentsBox.appendChild(dateNode);
			commentNode = document.createElement("description");
			commentNode.setAttribute("id", "comcom-" + theEntry.getId() + "-" + i);
			commentNode.appendChild(document.createTextNode(commentArray[i].getContent()));
			commentsBox.appendChild(commentNode);
		}
	} catch(e) {
		logMsg("Exception in populateCommentsBox():" + e);
	}
}

function showSearchEntryPage(id) {
	try {
		document.getElementById("searchPage-box").hidden = false;
		document.getElementById("logPage-box").hidden = true;
		searchboxCallback(document.getElementById("SearchBox").value);
	
		searchBoxClearTags();
		document.getElementById("logEntry-search-details").hidden = "true";
		var foundEntry = false;
		var counter = 0;
		var resultsBox = document.getElementById('results-listbox');
		/*while((counter < resultsBox.getRowCount()) && (foundEntry == false)) {
			//alert("id: " + id + ",current: " + resultsBox.getItemAtIndex(counter).value);
			if(resultsBox.getItemAtIndex(counter).value == id) {
				foundEntry = true;
			}
			counter++;
		}
		
		//alert("Found: " + foundEntry);
		if(foundEntry == true) {
			//alert("selecting");
			resultsBox.timedSelect(resultsBox.getItemAtIndex(counter - 1),10);
		}
		
		if(typeof(resultIndex != "undefined")) {
			//resultsBox.selectItemRange(resultsBox.getItemAtIndex(resultIndex),resultsBox.getItemAtIndex(resultIndex));
			resultsBox.selectAll();
		}*/
		
		
		
	} catch(e) {
		logMsg("Exception in showSearchEntryPage():" + e);
	}
}


function handleDeleteLogEntryTag() {
	alert("");

}

// Populates the listbox with the entries passed in via the array
// entryList.  If no array is given, we just assume all entries
// are wanted.  sortOrder is optional and currently defaults to
// "title", which sorts alphabetically ascending by title
function populateListbox(entryList, sortOrder) {
	// JavaScript doesn't support default parameter values directly.
	// Too bad, but this works.
	//alert("entryList is: " + entryList);
	//alert("sortOrder is: " + sortOrder);
	if (typeof(entryList) == "undefined")
		entryList = dataHandler.getAllEntries();
	if (typeof(sortOrder) == "undefined")
		sortOrder = "title";
	
	
	clearListbox();
	if (sortOrder == "title") {
		entryList = entryList.sort(compareTitles);
	}
	for (var i = 0; i < entryList.length; i++) {
		document.getElementById('results-listbox').appendItem(entryList[i].getTitle(), entryList[i].getId());
	}
}

function handleShowAddComment() {
	document.getElementById("add-comment-container").hidden = false;
	document.getElementById("add-comment-button").hidden = true;
}

function handleAddComment() {
	try {
		// Set necessary data
		/*var id = document.getElementById('results-listbox').selectedItem.value;
		var logEntry = dataHandler.getEntry(id);
		var newComment = document.getElementById("add-comment-box").value;
		logEntry.addComment(newComment);
		dataHandler.replaceEntry(logEntry); 
		searchBoxPopulateComments(logEntry); */
		
		var dateVar = new Date();
		var newComment = new Comment(document.getElementById("add-comment-box").value,dateVar);
		newComments.push(newComment);
		
		var commentsBox = document.getElementById("comments-box");
		var dateNode = document.createElement("description");
		dateNode.setAttribute("id", "comdate-0");
		dateNode.appendChild(document.createTextNode(newComment.getDateString()));
		commentsBox.appendChild(dateNode);

		var commentNode = document.createElement("description");
		commentNode.setAttribute("id", "comcom-0");
		commentNode.appendChild(document.createTextNode(newComment.getContent()));
		commentsBox.appendChild(commentNode);
		
		/*document.getElementById("add-comment-box").value = "";
		document.getElementById("add-comment-container").hidden = true;
		document.getElementById("add-comment-button").hidden = false; */
		
		document.getElementById("add-comment-box").value = "";
	}
	catch(e) {
		logMsg("Exception occurred in handleAddComment()" + e);
	}
}

// Case-insensitive title compare helper function.
function compareTitles(a, b) {
	if (a.getTitle().toLowerCase() >= b.getTitle().toLowerCase()) {
		return 1;
	}
	else {
		return -1;
	}
}


function clearListbox() {
	while (document.getElementById('results-listbox').getRowCount() > 0) {
		document.getElementById('results-listbox').removeItemAt(0);
	}
}

function removeListboxEntry() {
	var listboxItem = document.getElementById('results-listbox').getSelectedItem(0);
	var listboxItemId = document.getElementById('results-listbox').getIndexOfItem(listboxItem);
	document.getElementById('results-listbox').removeItemAt(listboxItemId);
}

function removeListboxEntries() {
	var resultsBox = document.getElementById('results-listbox');
	var selection = new Array();
	selection = resultsBox.selectedItems;
	while(selection.length > 0) {
		var index = resultsBox.getIndexOfItem(selection[0]);
		resultsBox.removeItemAt(index);
	}
}

function handleResultClicked(aEvent) {
	try {
		var id = document.getElementById('results-listbox').selectedItem.value;
		
		var div = document.getElementById("logEntry-search-details");
		
		var logEntry = dataHandler.getEntry(id);
		
	    var titleTBox = document.getElementById('logEntry-details-title');
	    var urlTBox = document.getElementById('logEntry-details-url');
	  	var urlLabel = document.getElementById('logEntry-details-url-link');
		titleTBox.value = logEntry.getTitle();
	
		urlTBox.value = logEntry.getUrl();
		
		// Load tags
		searchBoxPopulateTags(logEntry);
		
		// Load comments
		searchBoxPopulateComments(logEntry);
		
		loadThumbnail(id);
		
		div.hidden = false;
	}catch(e) {
		logMsg("Exception found in handleResultClicked():" + e);
	}
}

function handleResultDblClicked(aEvent) {
	if (aEvent.button == 0) { // left click
		//handleViewLocalCopy();
		handleViewWebPage();
	}
}

function handleEditEntry() {
	var id = document.getElementById('results-listbox').selectedItem.value;
	resultIndex = document.getElementById('results-listbox').selectedIndex;
	
	showLogEntryPage(id);
}

function handleViewWebPage() {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	openTopWin(logEntry.getUrl());
}

function handleViewLocalCopy() {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	openTopWin(logEntry.getFilePath());
}

function handleDeleteEntry() {
	var success = false;
	var answer = confirm("Are you sure you want to delete this entry?");
	if (answer){
		try {
			var selection = document.getElementById('results-listbox').selectedItems;
			for (var i = 0;i<selection.length;i++) {
	      		success = dataHandler.removeEntry(selection[i].value);
	      		if(success) {
	      			deleteLocalPage(selection[i].value);
	      		}
	   		}
			if (success) {
				dataStore.close(dataHandler);
				removeListboxEntries();
				var ctx = document.getElementById('preview-canvas').getContext('2d');
				ctx.clearRect(0,0,160,120);
				document.getElementById('logEntry-title').value = "";
			}
		} catch(e) {
			logMsg("Exception occurred in handleDeleteEntry: " + e);
		}
	}

	
	document.getElementById("logEntry-search-details").hidden = "true";
	return success;
}

function handleSaveLogEntryDetails() {
	try {
		var id = editingId;
		// Set necessary data
		//var id = document.getElementById('results-listbox').selectedItem.value;
		var logEntry;
	
		if(typeof(id) == "undefined") {
			logEntry = new LogEntry();
		}
		else {
			logEntry = dataHandler.getEntry(id);
		}
		
		var titleTBox = document.getElementById('logEntry-title');
		var urlTBox = document.getElementById('logEntry-url');
		var tagsTBox = document.getElementById('logEntry-tags');
		var tags = new Array();
		
		logEntry.setTitle(titleTBox.value);
		logEntry.setUrl(urlTBox.value);
	
		// Right now we're removing all current tags first, then adding whatever is in
		// the textbox, this may be inefficient so feel free to change it
		logEntry.removeTags();
		
		for(var i=0;i<tagsTBox.getRowCount();i++) {
			var item = tagsTBox.getItemAtIndex(i);
			tags.push(item.value);
		}
		tags = uniqueTags(tags);
		for(var i=0;i<tags.length;i++) {
			if (typeof(tags[i]) != "undefined") {
				logEntry.addTag(tags[i]);
			}
		}
		
		for(var i=0;i<newComments.length;i++) {
			logEntry.addCommentObject(newComments[i]);
		}
		
		if(typeof(id) == "undefined") {
			dataHandler.addEntry(logEntry,content.document);
			createThumbnail(content.document, logEntry.getId());
		}
		else {
			dataHandler.replaceEntry(logEntry);
		}
		dataStore.close(dataHandler);
		dataHandler = dataStore.open();
		
		id = logEntry.getId();
		// Return to search page if this was a new entry
		// I THINK WE RETURN REGARDLESS
		showSearchEntryPage(id);
	}
	catch(e) {
		logMsg("Exception occurred in handleSaveLogEntryDetails()" + e);
	}
}

function handleCancelLogPage() {
	showSearchEntryPage(editingId);
}

function handleDetails() {
	try {
		var div = document.getElementById("logEntry-details");
		var button = document.getElementById("toolbarDetails");
		var saveButton = document.getElementById("toolbarSave");
		if ((!div.style) || (div.style.display == "none")) {
			div.style.display ="block";
			saveButton.hidden = false;
			button.tooltiptext = "&mylogsidebar.toolbarHideDetails;";
			button.image = "chrome://mylog/skin/2uparrow.png";
		} else {
			div.style.display ="none";
			saveButton.hidden = true;
			button.tooltiptext = "&mylogsidebar.toolbarShowDetails;";
			button.image = "chrome://mylog/skin/2downarrow.png";
		}
	
	}catch(e) {
		logMsg("Exception occurred in hideDetails()" + e);
	}

}

function removeTagsFromEntry() {
	var tagsBox =  document.getElementById('logEntry-tags');
	var selection = tagsBox.selectedItems;
	while(selection.length > 0) {
		var index = tagsBox.getIndexOfItem(selection[0]);
		tagsBox.removeItemAt(index);
	}
}


function showOrHideAddTag() {
	var addTagBox =  document.getElementById("logEntry-tags-add");
	addTagBox.hidden = !(addTagBox.hidden);
}

// Code from:  http://www.developersdex.com/gurus/articles/276.asp?Page=3
// This extends the built-in JavaScript Array class to have an intersection method,
// useful for searches.
Array.prototype.intersection = function(arr2)	{
	var returnArray = new Array(); var y = 0;
	for(var x=0;x<this.length;x++)	{
		if(arr2.contains(this[x]))	{
			returnArray[y++] = this[x];
		}}	return y==0?null:returnArray;
}

Array.prototype.contains = function(r)	{
	for(var x=0;x<this.length;x++)	{
		if(this[x].getId()==r.getId())	{
			return true;
		}}	return false; 
}

// Code from:  http://dev.kanngard.net/Permalinks/ID_20030114184548.html
function unique(a) {
	tmp = new Array(0);
	try {
		
		for(i=0;i<a.length;i++){
			if(!tmp.contains(a[i])){
				tmp.length+=1;
				tmp[tmp.length-1]=a[i];
			}
		}
	}
	catch(e) {
		logMsg("Exception in unique: " + e);
	}
		
	return tmp;
}

function uniqueTags(a) {
	tmp = new Array(0);
	try {
		
		for(i=0;i<a.length;i++){
			if(tmp.indexOf(a[i]) == -1){
				tmp.length+=1;
				tmp[tmp.length-1]=a[i];
			}
		}
	}
	catch(e) {
		logMsg("Exception in uniqueTags: " + e);
	}
		
	return tmp;
}

// Called after every timeout period on the search box, or if the user hits the return key.
function searchboxCallback(searchString) {
	var commentsSearchBool = document.getElementById("comments-checkbox").checked;
	var tagsSearchBool = document.getElementById("tags-checkbox").checked;
	var titleSearchBool = document.getElementById("title-checkbox").checked;
	
	var matches = search(searchString, titleSearchBool, tagsSearchBool, commentsSearchBool);

	populateListbox(matches);
}

// Takes the search string and searches the appropriate fields with it, returning an array of matching entries.
// If called with an empty search string, we simply return an array of all entries.
function search(searchString, titleSearchBool, tagsSearchBool, commentsSearchBool) {
	var theTerms = splitSearchString(searchString);
	if (theTerms.length == 0) {
		var allEntries = dataHandler.getAllEntries();
		return allEntries;
	}
	
	var positiveMatches = [];
	var negativeMatches = [];
	var finalMatches = [];

	
	// Get the first set of positive matches, corresponding to the first positive search term.
	var termIndex = 0;
	while((theTerms[termIndex].charAt(0) == "-") && (termIndex < theTerms.length)) termIndex++;
	if (termIndex < theTerms.length) {
		if (titleSearchBool) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "title"));
		}
		if (tagsSearchBool) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "tag"));
		}
		if (commentsSearchBool) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "comment"));
		}
		positiveMatches = unique(positiveMatches);
	}

	
	// Now, loop over the rest of the positive terms, ANDing the resulting arrays with
	// our first results array.
	var nextPositiveMatches = [];
	for (termIndex = 1; termIndex < theTerms.length; termIndex++) {
		if (theTerms[termIndex].charAt(0) != "-") {
			if (titleSearchBool) {
				nextPositiveMatches = nextPositiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "title"));
			}
			if (tagsSearchBool) {
				nextPositiveMatches = nextPositiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "tag"));
			}
			if (commentsSearchBool) {
				nextPositiveMatches = nextPositiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "comment"));
			}
			nextPositiveMatches = unique(nextPositiveMatches);
			positiveMatches = positiveMatches.intersection(nextPositiveMatches);
			if (positiveMatches == null)
				return [];
			nextPositiveMatches = [];
		}
	}
	
	// Get negative matches.
	for (termIndex = 0; termIndex < theTerms.length; termIndex++) {
		if (theTerms[termIndex].charAt(0) == "-") {
			if (titleSearchBool) {
				negativeMatches = negativeMatches.concat(dataHandler.findEntries(theTerms[termIndex].substring(1), "title"));
			}
			if (tagsSearchBool) {
				negativeMatches = negativeMatches.concat(dataHandler.findEntries(theTerms[termIndex].substring(1), "tag"));
			}
			if (commentsSearchBool) {
				negativeMatches = negativeMatches.concat(dataHandler.findEntries(theTerms[termIndex].substring(1), "comment"));
			}
			negativeMatches = unique(negativeMatches);
		}
	}

	// Subtract the negative matches from the positive matches; put the result
	// in finalMatches.
	var foundNegativeMatch;
	for (var posIndex = 0; posIndex < positiveMatches.length; posIndex++) {
		foundNegativeMatch = false;
		for (var negIndex = 0; negIndex < negativeMatches.length; negIndex++) {
			if (positiveMatches[posIndex].getId() == negativeMatches[negIndex].getId()) {
				foundNegativeMatch = true;
				break;
			}
		}
		if (!foundNegativeMatch) {
			finalMatches.push(positiveMatches[posIndex]);
		}
	}
	
	// finalMatches should now have all final matches.
	return finalMatches;
}

// Returns a string array of individual search terms.
function splitSearchString(searchString) {

	if (typeof(searchString) == "undefined") {
		return null;
	}
	
	if (searchString == null) {
		return null;
	}

	var splitTerms = [];
	
	// Grab all the quoted terms first. If there's a - sign, keep it.
	var quotedTermsGrabbingRegex = new RegExp("-*\".*?\"", "g");
	var nextTerm, firstHalf, secondHalf;
	var nextTerms = [];
	while (nextTerms = searchString.match(quotedTermsGrabbingRegex)) {
		if (nextTerm = nextTerms[0]) {
			splitTerms.push(nextTerm.replace(/\"/g, ""));
			firstHalf = searchString.substring(0, searchString.indexOf(nextTerm));
			secondHalf = searchString.substring(searchString.indexOf(nextTerm) + nextTerm.length, searchString.length);
			searchString = firstHalf + secondHalf;
		}
	}
	// Now add in the remaining search terms, stripping off + signs, - signs, empty strings, and single quotes.
	searchString = searchString.replace(/\+/g,"");
	searchString = searchString.replace(/-+/g,"-");
	var remainingTerms = searchString.split(/ +/);
	var debug = "";
	for( var i = 0; i < remainingTerms.length; i++){
		debug = debug + remainingTerms[i] + "\n";
	}	

	if (remainingTerms) {
		for (var i = 0; i < remainingTerms.length; i++) {
			if (remainingTerms[i].charAt(0) == "+") {
				remainingTerms[i] = remainingTerms[i].substring(1, remainingTerms[i].length);
			}
			if ((remainingTerms[i] != "") && (remainingTerms[i] != "-") && (remainingTerms[i] != "+") && (remainingTerms[i] != "\"") && (remainingTerms[i] != "'")) {
				splitTerms.push(remainingTerms[i]);
			}
		}
	}
	var debug = "";
	for( var i = 0; i < splitTerms.length; i++){
		debug = debug + splitTerms[i] + "\n";
	}	

	return splitTerms;
}

function populateTagsPopupMenu() {
	try {
		var tagNameArr = dataHandler.getAllTags();
		var tagsPopupMenu = document.getElementById("tags-popup");
		var logEntryTagsPopup = document.getElementById("logEntry-tags-popup");
		
		// Append Create New Tag item to the LogEntry tags popup in the details section
		var menuItem2 = document.createElement("menuitem");
		var menuItem;
		menuItem2.setAttribute( "label" , "Create New Tag");
		menuItem2.setAttribute( "value" , "new tag");
		menuItem2.setAttribute("oncommand", "processLogEntryTagSelection(this.value);");
		logEntryTagsPopup.appendChild(menuItem2);
		
		for (var i = 0; i < tagNameArr.length; i++)
		{
			//alert("Loop entered! and tag name is: " + tagNameArr[i]);
			menuItem = document.createElement("menuitem");
			menuItem2 = document.createElement("menuitem");
			menuItem.setAttribute( "label" , tagNameArr[i]);
			menuItem.setAttribute( "value" , tagNameArr[i]);
			menuItem.setAttribute( "id" , "mylog-tag-" + tagNameArr[i]);
			menuItem.setAttribute("oncommand", "processTagSelection(this.value);");
			
			menuItem2.setAttribute( "label" , tagNameArr[i]);
			menuItem2.setAttribute( "value" , tagNameArr[i]);
			menuItem2.setAttribute( "id" , "mylog-tag-details" + tagNameArr[i]);
			menuItem2.setAttribute("oncommand", "processLogEntryTagSelection(this.value);");
			
			tagsPopupMenu.appendChild(menuItem);
			logEntryTagsPopup.appendChild(menuItem2);
		}	
	} catch(e) {
		logMsg("Exception in populateTagsPopup(): " + e);
	}
}

function processTagSelection(tag) {	
	var searchBox = document.getElementById("SearchBox");
	var tagsPopupMenu = document.getElementById("tags-menu");
	var tagsCheckbox = document.getElementById("tags-checkbox");
	
	if (searchBox.value.length != 0)
		searchBox.value = searchBox.value + " ";
	searchBox.value = searchBox.value + '"' + tag + '"';
	
	searchboxCallback(searchBox.value);
		
	tagsPopupMenu.selectedIndex = 0;
	tagsCheckbox.checked = true;
	searchBox.setSelectionRange(searchBox.value.length - tag.length - 2, searchBox.value.length);
 
}

function processLogEntryTagSelection(tag) {
	var tag = document.getElementById("mylog-tags").value
	if (tag == "new tag")
	{
		tag = createTag();
		if (tag == null) {
			return;
		}
		
		var logEntryTagsPopup = document.getElementById("logEntry-tags-popup");
		var tagsPopupMenu = document.getElementById("tags-popup");
		var menuItem = document.createElement("menuitem");
		var menuItem2 = document.createElement("menuitem");
		menuItem.setAttribute( "label" , tag);
		menuItem.setAttribute( "value" , tag);
		menuItem.setAttribute( "id" , "mylog-tag-details-" + tag);
		menuItem.setAttribute("oncommand","processLogEntryTagSelection(this.value);");
		
		menuItem2.setAttribute( "label" , tag);
		menuItem2.setAttribute( "value" , tag);
		menuItem2.setAttribute( "id" , "mylog-tag-" + tag);
		menuItem2.setAttribute("oncommand","processTagSelection(this.value);");
		
		// Put into current tags
		logEntryTagsPopup.appendChild(menuItem);
		tagsPopupMenu.appendChild(menuItem2);
	}
	
	// Only add if it doesn't already exist
	var entryTagList = document.getElementById("logEntry-tags");
	var exists = false;
	var counter = 0;
	while((counter < entryTagList.getRowCount()) && (exists == false)) {
		if(entryTagList.getItemAtIndex(counter).value == tag) {
			exists = true;
		}
		counter++;
	}
	
	if(exists == false) {
		entryTagList.appendItem(tag,tag);
	}
}

function createTag() {
	var ret = false;
	var tag = "";
	try{
		tag = prompt("Enter new tag name:", "");
		if (tag == null) {
			return null;
		}
		ret = dataHandler.addTag(tag);
		dataStore.close(dataHandler);
		dataHandler = dataStore.open();
	} catch(e) {
		logMsg("Exception in createTag():" + e);	
	}
	
	if (ret) {
		return tag;
	}
}

function createThumbnail(doc, id) {
  var widthToCapture = content.innerWidth + content.scrollMaxX;
  var heightToCapture = Math.round(widthToCapture * 0.75);
  var scaleFactor = 400.0 / widthToCapture;
  
  var heightOfPreview = Math.round(heightToCapture * scaleFactor);
  var heightOfTransparentSection = 300 - heightOfPreview;
  var yOffset;
  if (heightOfTransparentSection > 0) {
  	yOffset = Math.round(heightOfTransparentSection / 2);
  }
  else {
  	yOffset = 0;
  }
 
  //var container = doc.getElementById("sidebarWindow");
  var canvasW = 400;
  var canvasH = 300;

  var canvas = document.getElementById("create-thumbnail-canvas");
  canvas.style.width = canvasW+"px";
  canvas.style.height = canvasH+"px";
  canvas.width = canvasW;
  canvas.height = canvasH;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.save();
  ctx.scale(scaleFactor, scaleFactor);
  ctx.drawWindow(content, 0, yOffset, widthToCapture, heightToCapture, "rgba(0,0,0,0)");
  ctx.restore();
  
  var dataurl = canvas.toDataURL(); 
	
  var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
       
  file.append("extensions");
  file.append("mylog");
  file.append(id + "-preview.png");
  
  var uri  = Components.classes['@mozilla.org/network/standard-url;1'].createInstance(Components.interfaces.nsIURI); 
  var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(Components.interfaces.nsIWebBrowserPersist); 
  uri.spec = dataurl;
  persist.saveURI(uri, null, null, null, null, file);
  
  return file;
}

function handleSearchByContentClick() {
	var query = prompt("Search by Content:", previousQuery);
	if ((query == null) || (query == ""))
		return;
	
	previousQuery = query;
	handleSearchContentRequest(query);
}

function handleSearchContentRequest(query) {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	dataHandler.findEntries(query,"content");
	showResultsPage();
}

function loadThumbnail(id) {
	var ctx = document.getElementById('preview-canvas').getContext('2d');
	
    var img = new Image();
    img.onload = function(){
    	ctx.drawImage(img,0,0,180,135);
    }
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
  	file.append("extensions");
	file.append("mylog");
	file.append(id + "-preview.png");
    img.src = "file:///" + file.path;
}

function handleCommentsTreeSelection() {
	var tree = document.getElementById("comments-tree");
	tree.startEditing(0,0);
	/*var start = new Object();
	var end = new Object();
	var numRanges = tree.view.selection.getRangeCount();

	for (var t = 0; t < numRanges; t++){
		tree.view.selection.getRangeAt(t,start,end);
		tree.startEditing(start.value, 1);
		//for (var v = start.value; v <= end.value; v++){
		//	alert("Item " + v + " is selected.");
		//}
	}
	alert ("huh?");
	*/
}

function trimString(str) {
	while(str.charAt(0) == (" ")) {
		str = str.substring(1);
	}
	
	while(str.charAt(str.length -1) == " ") {
		str = str.substring(0,str.length-1);
	}
	
	return str;
}