// *** ebowden2, jamatz: 02-13-2007: Initial creation of mylogsidebar.js, filled with one simple function to populate the sidebar's listbox.
// *** ebowden2, jamatz: 02-22-2007: Updated the searchboxCallback function for improved search capabilities.
// *** ebowden2, jamatz: 02-22-2007: Created helper function parseSearchTerms to tokenize search string
// *** ebowden2, jamatz: 02-23-2007: Significantly improved searchboxCallback function; should refactor a bit and extract out most of it to another method.  Some known bugs are also present and will be addressed soon.

function initializeGUI() {
	populateTagsPopupMenu();
	populateListbox();
	//populateTagsPopupMenu();
}

function populateListbox() {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var entryList = dataHandler.getAllEntries();
	
	clearListbox();
	for (var i = 0; i < entryList.length; i++) {
		document.getElementById('results-listbox').appendItem(entryList[i].getTitle(), entryList[i].getId());
	}
	dataStore.close(dataHandler);
}

function clearListbox() {
	while (document.getElementById('results-listbox').getRowCount() > 0) {
		document.getElementById('results-listbox').removeItemAt(0);
	}
}

function handleResultClicked() {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
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
function searchboxCallback(searchTerms) {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();

	var theTerms = splitSearchTerms(searchTerms);
	if (theTerms.length == 0) {
		populateListbox();
		return;
	}
	
	var positiveMatches = [];
	var negativeMatches = [];
	var finalMatches = [];
	
	// Get the first set of positive matches, corresponding to the first positive search term.
	var termIndex = 0;
	while((theTerms[termIndex].charAt(0) == "-") && (termIndex < theTerms.length)) termIndex++;
	if (termIndex < theTerms.length) {
		if (document.getElementById("title-checkbox").checked) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "title"));
		}
		if (document.getElementById("tags-checkbox").checked) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "tag"));
		}
		if (document.getElementById("comments-checkbox").checked) {
			positiveMatches = positiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "comment"));
		}
		positiveMatches = unique(positiveMatches);
	}

	
	// Now, loop over the rest of the positive terms, ANDing the resulting arrays with
	// our first results array.
	var nextPositiveMatches = [];
	for (termIndex = 1; termIndex < theTerms.length; termIndex++) {
		if (theTerms[termIndex].charAt(0) != "-") {
			if (document.getElementById("title-checkbox").checked) {
				nextPositiveMatches = nextPositiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "title"));
			}
			if (document.getElementById("tags-checkbox").checked) {
				nextPositiveMatches = nextPositiveMatches.concat(dataHandler.findEntries(theTerms[termIndex], "tag"));
			}
			if (document.getElementById("comments-checkbox").checked) {
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
			if (document.getElementById("title-checkbox").checked) {
				negativeMatches = negativeMatches.concat(dataHandler.findEntries(theTerms[termIndex].substring(1), "title"));
			}
			if (document.getElementById("tags-checkbox").checked) {
				negativeMatches = negativeMatches.concat(dataHandler.findEntries(theTerms[termIndex].substring(1), "tag"));
			}
			if (document.getElementById("comments-checkbox").checked) {
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
	
	
	// Display the matches in the listbox.
	clearListbox();
	for (var i = 0; i < finalMatches.length; i++) {
		document.getElementById('results-listbox').appendItem(finalMatches[i].getTitle(), finalMatches[i].getId());
	}
	dataStore.close(dataHandler);
}

// Returns a string array of individual search terms.
function splitSearchTerms(searchTerms) {
	if (searchTerms == null) {
		return null;
	}

	var splitTerms = [];
	
	// Grab all the quoted terms first. If there's a - sign, keep it.
	var quotedTermsGrabbingRegex = new RegExp("-*\".*?\"", "g");
	var nextTerm, firstHalf, secondHalf;
	var nextTerms = [];
	while (nextTerms = searchTerms.match(quotedTermsGrabbingRegex)) {
		if (nextTerm = nextTerms[0]) {
			splitTerms.push(nextTerm.replace(/\"/g, ""));
			firstHalf = searchTerms.substring(0, searchTerms.indexOf(nextTerm));
			secondHalf = searchTerms.substring(searchTerms.indexOf(nextTerm) + nextTerm.length, searchTerms.length);
			searchTerms = firstHalf + secondHalf;
		}
	}
	
	// Now add in the remaining search terms, stripping off + signs, - signs, empty strings, and single quotes.
	var remainingTerms = searchTerms.split(/ +/);
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

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
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
	
	dataStore.close(dataHandler);
	
}

function processTagSelection(tag) {	
	var searchBox = document.getElementById("SearchBox");
	
	if (searchBox.value.length != 0)
		searchBox.value = searchBox.value + " ";
	searchBox.value = searchBox.value + '"' + tag + '"';
		
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