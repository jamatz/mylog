// *** jdelator, thpark2:03-07-2007:Created the functions of the Export/Import window
<script type="text/javascript" src="mylog-datastorage.js" />

function handleContentClicked() {
	var menu = document.getElementById('content');
	var item = document.getElementById('content').selectedItem;
	menu.addItemToSelection(item);
}

function displayResults(resultList) {
	clearResults();
    for(var i=0;i<resultList.length;i++) {
		var title = resultList[i].getTitle();
		var URL = resultList[i].getUrl();		
		var id = resultList[i].getId();
		document.getElementById('content').appendItem("[" + title + "] - " + URL, id);
    }
}

function clearResults() { 
	while (document.getElementById('content').getRowCount() > 0) 
		document.getElementById('content').removeItemAt(0);
}

function selectAll(){
	document.getElementById('content').selectAll();	
}

function deselectAll(){
	document.getElementById('content').clearSelection();	
}

function exportContent(){
	var selectedItems = document.getElementById('content').selectedItems;
	
	if(selectedItems.length != 0){
		var items = "";
		for(var i=0;i<selectedItems.length;i++)
			items = items + selectedItems[i].value + "\n"; //ID of the entry
		saveExportXML(selectedItems); 
	//		saveFile"exportlist.txt",items);
	}
	else
		alert("Please select items before attempting to export.");
}

function saveExportXML(exportItems){
	exportStore = new XmlDataStore();
	exportStore.setXmlFilepath("test.xml");
	exportHandler = exportStore.open();
	for(var i = 0; i < exportItems.length; i++){
		var currentItem = dataHandler.getEntry(exportItems[i].value);
		var exportTags = currentItem.getTags();
		for(var j = 0; j < exportTags.length; j++){
			exportHandler.addTag(exportTags[j]);
		}
		exportHandler.addEntry(currentItem);
	}
	exportStore.saveXML(exportHandler.getDomDoc(),"C:\\test", "test.xml");
	alert("Save successful");
	createDir("test");
}

function saveFile(fileName, content){
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath("C:\\");		             
	file.append(fileName);
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	                         .createInstance(Components.interfaces.nsIFileOutputStream);
	// use 0x02 | 0x10 to open file for appending.
	foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
	foStream.write(content, content.length);
	foStream.close();
}

function createDir(dir){
	alert(dir);
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath("C:\\");		             
	file.append(dir);
	alert(dir);
	if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
	   file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0664);
	}
	
}