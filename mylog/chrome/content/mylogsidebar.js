// *** ebowden2, jamatz: 02-13-2007: Initial creation of mylogsidebar.js, filled with one simple function to populate the sidebar's listbox.

function populateListbox() {

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var entryList = dataHandler.getAllEntries();
	
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

function searchboxCallback(searchTerm) {

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var entryList = dataHandler.findEntries(searchTerm,"title");
	
	clearListbox();
	for (var i = 0; i < entryList.length; i++) {
		document.getElementById('results-listbox').appendItem(entryList[i].getTitle());
	}
	dataStore.close(dataHandler);
	
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
	alert('w is ' + w);
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