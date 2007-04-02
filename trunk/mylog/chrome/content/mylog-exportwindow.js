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
	var items = [];
	for(var i = 0; i < selectedItems.length; i++)
		items.push(selectedItems[i].value);	
	if(selectedItems.length != 0){		
		var folderPath = getFolderDialogueBox("Export Items to...");
		folderPath = folderPath + "\\MyLog_Exported_Content"; 
		saveExportXML(folderPath, items); 
		copyExportedContent(folderPath, items);	
	}
	else
		alert("Please select items before attempting to export.");
}

function importContent(){
	var XMLPath = getXMLBox("Select the folder where export.xml is located");
	var importDataStore = new XmlDataStore();
	var importDataHandler = importDataStore.openLocal(XMLPath);
	var entries = importDataHandler.getAllEntries();
	var oldIDs = [];
	var newIDs = [];
	var profileDir = getProfileDirectory();
	for(var i = 0; i < entries.length; i++){
		oldIDs.push(entries[i].getId());		
		var newID = dataHandler.addPredefinedEntry(entries[i],profileDir);
		newIDs.push(newID);
	}
	dataStore.close(dataHandler);
	dataHandler = dataStore.open();
	copyImportedContent(folderPath, oldIDs,newIDs);
	var entryList = dataHandler.getAllEntries();
	if(entryList.length > 0) {
		displayResults(entryList);
	}
}

function saveExportXML(folderPath, exportItems){
	exportStore = new XmlDataStore();
	exportStore.setXmlFilepath("exported.xml");
	exportHandler = exportStore.open();	
	for(var i = 0; i < exportItems.length; i++){
		var currentItem = dataHandler.getEntry(exportItems[i]);
		var exportTags = currentItem.getTags();
		exportHandler.addPredefinedEntry(currentItem,"exported");
		for(var j =0; j < exportTags.length; j++)
			exportHandler.addTag(exportTags[j]);
	}
	createDir(folderPath,"");
	exportStore.saveXML(exportHandler.getDomDoc(),folderPath, "exported.xml");
}

function copyImportedContent(folderPath, oldIDs, newIDs){
	var profileDir = getProfileDirectory();	
	for(var i = 0; i < oldIDs.length; i++){
		var data = readFile(folderPath + "\\" + + i + ".html");
		writeBinaryFile(data,profileDir + "\\extensions\\mylog\\" + newIDs[i] + ".html");
		var files = getAllFilesInDir(folderPath + "\\" + i,"local");		
		for(var j = 0; j < files.length; j++){
			data = readFile(files[j].path);
			writeBinaryFileInProfile(data,newIDs[i],files[j].leafName);	
		}
	}
}

function copyExportedContent(folderPath, exportItems){
	for(var i = 0; i < exportItems.length; i++){
		var data = readPage(exportItems[i] + ".html");
		saveFile(folderPath,i + ".html",data);
		var files = getAllFilesInDir(exportItems[i],"profile");		
		for(var j = 0; j < files.length; j++){
			data = readFile(files[j].path);
			writeBinaryFile(data,folderPath + "\\" + i + "\\" + files[j].leafName);
		}
	}
}

function saveFile(path,fileName, content){
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);		             
	file.append(fileName);
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	                         .createInstance(Components.interfaces.nsIFileOutputStream);
	// use 0x02 | 0x10 to open file for appending.
	foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
	foStream.write(content, content.length);
	foStream.close();
}

function writeBinaryFile(data,path){
	var aFile = Components.classes["@mozilla.org/file/local;1"]
	                      .createInstance(Components.interfaces.nsILocalFile);
	aFile.initWithPath(path);
	aFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);
	var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
	                       .createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(aFile, 0x04 | 0x08 | 0x20, 664, 0); // write, create, truncate
	stream.write(data, data.length);
	if (stream instanceof Components.interfaces.nsISafeOutputStream) {
	    stream.finish();
	} else {
	    stream.close();
	}
	
}

function writeBinaryFileInProfile(data,path,fileName){
    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
         .getService(Components.interfaces.nsIProperties)
         .get("ProfD", Components.interfaces.nsIFile);
    dir.append("extensions");
    dir.append("mylog");
    dir.append(path);
    dir.append(fileName);
	dir.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);
	var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
	                       .createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(dir, 0x04 | 0x08 | 0x20, 664, 0); // write, create, truncate
	stream.write(data, data.length);
	if (stream instanceof Components.interfaces.nsISafeOutputStream) {
	    stream.finish();
	} else {
	    stream.close();
	}	
}

function createDir(initPath,dir){
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(initPath);
	file.append(dir);
	if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
	   file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0664);
	}
	
}

function getAllFilesInDir(path,dirLocation){
	if(dirLocation == "profile"){
		var dir = Components.classes["@mozilla.org/file/directory_service;1"]
	                 .getService(Components.interfaces.nsIProperties)
	                 .get("ProfD", Components.interfaces.nsIFile);
	    dir.append("extensions");
	    dir.append("mylog");
		dir.append(path);    
	} else {
		var dir = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
		dir.initWithPath(path);		             
	}
	var entries = dir.directoryEntries;
	var array = [];
	while(entries.hasMoreElements()){
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  array.push(entry);
	}
	return array;
}

function readFile(filePath){
	
	var file = Components.classes["@mozilla.org/file/local;1"]
	                        .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(filePath);
	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                        .createInstance(Components.interfaces.nsIFileInputStream);
	istream.init(file, -1, -1, false);
	
	var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
	                        .createInstance(Components.interfaces.nsIBinaryInputStream);
	bstream.setInputStream(istream);
	var bytes = bstream.readBytes(bstream.available());
	
	return bytes;
}

function getFolderDialogueBox(dialogText){
	nsIFilePicker = Components.interfaces.nsIFilePicker;	
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		           .createInstance(nsIFilePicker);
	fp.init(window, dialogText, nsIFilePicker.modeGetFolder);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK){
	  //var file = fp.file;
	  return fp.file.path;
	}
}

function getXMLBox(dialogText){
	nsIFilePicker = Components.interfaces.nsIFilePicker;	
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		           .createInstance(nsIFilePicker);
	fp.init(window, dialogText, nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterXML);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK){
	  return fp.file.path;
	}
}

function getProfileDirectory(){
	var dir = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("ProfD", Components.interfaces.nsIFile);
    return dir.path;       
}