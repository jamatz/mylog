// *** ebowden2, jamatz: 02-13-2007: Initial creation of mylogsidebar.js, filled with one simple function to populate the sidebar's listbox.
// *** ebowden2, jamatz: 02-22-2007: Updated the searchboxCallback function for improved search capabilities.
// *** ebowden2, jamatz: 02-22-2007: Created helper function parseSearchTerms to tokenize search string
// *** ebowden2, jamatz: 02-23-2007: Significantly improved searchboxCallback function; should refactor a bit and extract out most of it to another method.  Some known bugs are also present and will be addressed soon.
// *** ebowden2, jamatz: 02-24-2007: Made the dataStore and handlers global, since practically every function uses them and it's silly to keep opening and closing the store.  Refactored a bit.  Fixed a display bug.  Results are now displayed alphabetically by title by default.  Need to clean up the init code and add a close function to do clean-up when the sidebar is closed.

// Globals
var dataStore;
var dataHandler;

function initializeGUI() {
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

function handleResultClicked() {
	var id = document.getElementById('results-listbox').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	window.openDialog("chrome://mylog/content/mylog-logEditor.xul","Log Entry Editor",
		"chrome",logEntry, dataStore, dataHandler);
	openTopWin(logEntry.getFilePath());

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


function takePreviewScreenshot() {
	

}

function drawAll() {

	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);
		mainWindow.document.getElementById("browser-stack").flex = 0;
	mainWindow.document.getElementById("canvas-box").hidden = false;
	//var w = mainWindow.document.innerWidth;
	//var h = mainWindow.document.getElementById("content").innerHeight;
	var w = 800;
	var h = 600;
	//alert('w is ' + w);
  //var container = mainWindow.document.getElementById("win"); //we changed win
  //var canvasW = container.boxObject.width;
  ///var scale = canvasW/w;
  //var canvasH = Math.round(h*scale);
  //var canvasH = container.boxObject.height;

	var canvasW = w;
	var canvasH = h;


	
	var canvas = mainWindow.document.getElementById("browser-canvas");
  canvas.style.width = canvasW+"px";
  canvas.style.height = canvasH+"px";
  canvas.width = canvasW;
  canvas.height = canvasH;
  
  
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.save();
  ctx.scale(canvasW/w, canvasH/h);
  ctx.drawWindow(content, 0, 0, w, h, "rgb(0,0,0)");
  ctx.restore();
  
 

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


/*function update(theWindow) {

  var w = content.innerWidth + content.scrollMaxX;
  var h = content.innerHeight + content.scrollMaxY;
  if (w > 10000) w = 10000;
  if (h > 10000) h = 10000;
var childNodes = document.documentElement.childNodes;
for (var i = 0; i < childNodes.length; i++) {
  var child = childNodes[i];
  alert(child);
  // do something with child
}
	if (theWindow.parent.getElementById("main-window")) alert ('the window.parenet');
  var container = document.getElementById("win");
  var canvasW = container.boxObject.width;
  var scale = canvasW/w;
  var canvasH = Math.round(h*scale);

  var canvas = theWindow.document.getElementById("browser-canvas");
  alert(canvas.toString());
  canvas.style.width = canvasW+"px";
  canvas.style.height = canvasH+"px";
  canvas.width = canvasW;
  canvas.height = canvasH;
  var ctx = canvas.getContext("2d");
  ctx.fillRect(25,25,100,100);
 // ctx.clearRect(0, 0, canvasW, canvasH);
 // ctx.save();
 // ctx.scale(canvasW/w, canvasH/h);
 // ctx.drawWindow(content, 0, 0, w, h, "rgb(0,0,0)");
 // ctx.restore();
}*/

/*var NavLoadObserver = {
  observe: function(aWindow)
  {
    update();
  }
};

function start() {
  var obs = Components.classes["@mozilla.org/observer-service;1"].
    getService(Components.interfaces["nsIObserverService"]);
  obs.addObserver(NavLoadObserver, "EndDocumentLoad", false);
}

window.addEventListener("load", start, false);

*/