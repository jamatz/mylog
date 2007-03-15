// *** ebowden2, vviswana: 03-15-2007: Added handler functions for displaying logEntry details and saving to file
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

function initializeGUI() {
	install_handlers(); // From accjax.  Who knows why?
	dataStore = new XmlDataStore();
	dataHandler = dataStore.open();
	populateTagsPopupMenu();
	populateListbox();
}

// Populates the listbox with the entries passed in via the array
// entryList.  If no array is given, we just assume all entries
// are wanted.  sortOrder is optional and currently defaults to
// "title", which sorts alphabetically ascending by title
function populateListbox(entryList, sortOrder) {
	// JavaScript doesn't support default parameter values directly.
	// Too bad, but this works.
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

function handleResultClicked(aEvent) {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	var titleTBox = document.getElementById('logEntry-title');
	var tagsTBox = document.getElementById('logEntry-tags');
	titleTBox.value = logEntry.getTitle();
	
	// Load tags
	var tags = logEntry.getTags();
	if(tags.length > 0) {
		tagsTBox.value = tags[0];
		for(var i=1;i<tags.length;i++) {
			tagsTBox.value += ", " + tags[i];
		}
	}
	
	// Show details section
	var div = document.getElementById("logEntry-details");
	var button = document.getElementById("show-logEntry-details");
	if (div.style.display=="none") {
		div.style.display ="block";
		button.label = "Hide Details";
	}
}

function handleResultDblClicked(aEvent) {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	if (aEvent.button == 0) { // left click
	//	window.openDialog("chrome://mylog/content/mylog-logEditor.xul","Log Entry Editor",
	//		"chrome",logEntry, dataStore, dataHandler);
		openTopWin(logEntry.getFilePath());
	}
}

function handleDeleteEntry() {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var success = dataHandler.removeEntry(id);
	if (success) {
		dataStore.close(dataHandler);
		deleteLocalPage(id);
		removeListboxEntry();
	}
	return success;
}

function handleSaveLogEntryDetails() {
	try {
		// Set necessary data
		var id = document.getElementById('results-listbox').selectedItem.value;
		var logEntry = dataHandler.getEntry(id);
		var titleTBox = document.getElementById('logEntry-title');
		var tagsTBox = document.getElementById('logEntry-tags');
		
		logEntry.setTitle(titleTBox.value);
		
		// Right now we're removing all current tags first, then adding whatever is in
		// the textbox, this may be inefficient so feel free to change it
		logEntry.removeTags();
		var tags = tagsTBox.value.split(",");
		for(var i=0;i<tags.length;i++) {
			logEntry.addTag(tags[i]);
		}
		
		// Need to deal with comments later
		
	
		dataHandler.close();
		dataHandler = dataStore.open();
	}catch(e) {
		logMsg("Exception occurred in handleSaveLogEntryDetails()" + e);
	}
}

function hideDetails() {
	try {
		var div = document.getElementById("logEntry-details");
		var button = document.getElementById("show-logEntry-details");
		if (div.style.display=="none") {
			div.style.display ="block";
			button.label = "Hide Details";
		}
		else {
			div.style.display ="none";
			button.label = "Show Details";
		}
	
	}catch(e) {
		logMsg("Exception occurred in hideDetails()" + e);
	}

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
	for(i=0;i<a.length;i++){
		if(!tmp.contains(a[i])){
			tmp.length+=1;
			tmp[tmp.length-1]=a[i];
		}
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
	var remainingTerms = searchString.split(/ +/);
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
	
	return splitTerms;
}

function populateTagsPopupMenu() {
	var tagNameArr = dataHandler.getAllTags();
	var tagsPopupMenu = document.getElementById("tags-popup");

	for (var i = 0; i < tagNameArr.length; i++)
	{
		//alert("Loop entered! and tag name is: " + tagNameArr[i]);
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute( "label" , tagNameArr[i]);
		menuItem.setAttribute( "value" , tagNameArr[i]);
		menuItem.setAttribute( "id" , "mylog-tag-" + tagNameArr[i]);
		menuItem.setAttribute("oncommand", "processTagSelection(this.value);");
		tagsPopupMenu.appendChild(menuItem);
	}	
}

function processTagSelection(tag) {	
	var searchBox = document.getElementById("SearchBox");
	var tagsPopupMenu = document.getElementById("tags-menu");
	var tagsCheckbox = document.getElementById("tags-checkbox");
	
	if (searchBox.value.length != 0)
		searchBox.value = searchBox.value + " ";
	searchBox.value = searchBox.value + '"' + tag + '"';
		
	tagsPopupMenu.selectedIndex = 0;
	tagsCheckbox.checked = true;
	searchBox.setSelectionRange(searchBox.value.length - tag.length - 2, searchBox.value.length);
	
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