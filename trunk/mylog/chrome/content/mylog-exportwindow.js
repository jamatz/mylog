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
		createDir(folderPath, "MyLog_Exported_Content")
		folderPath = folderPath + "\\MyLog_Exported_Content"; 
		saveExportXML(folderPath, items); 
		alert("Saved XML");
		copyExportedContent(folderPath, items);	
		alert("Copied Content");
		alert("Successfully copied " + selectedItems.length + " item(s).");
	}
	else
		alert("Please select items before attempting to export.");
}

function importContent(){

	var XMLPath = getXMLBox("Select the folder where export.xml is located");
	var folderPath = XMLPath.substr(0,XMLPath.lastIndexOf("\\"));
	var profileDir = getProfileDirectory();

	var importDataStore = new XmlDataStore();
	var importDataHandler = importDataStore.openLocal(XMLPath);
	alert("Opened import XML file");
	var oldIDs = [];
	var newIDs = [];
	var entries = importDataHandler.getAllEntries();
	for(var i = 0; i < entries.length; i++){
		oldIDs.push(entries[i].getId());		
		var newID = dataHandler.addPredefinedEntry(entries[i],profileDir);
		newIDs.push(newID);
	}
	alert("Grabbed " + entries.length + " items.");
	copyImportedContent(folderPath, oldIDs,newIDs);
	dataStore.close(dataHandler);
	dataHandler = dataStore.open();
	var entryList = dataHandler.getAllEntries();
	if(entryList.length > 0) {
		displayResults(entryList);
	}
	alert("Successfully copied "+ entries.length + " items.");
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
	exportStore.saveXML(exportHandler.getDomDoc(),folderPath, "exported.xml");
}

function copyExportedContent(folderPath, exportItems){
	var profileDir = getProfileDirectory();	
	var myLogDir = profileDir + "\\extensions\\mylog\\";
	for(var i = 0; i < exportItems.length; i++){
		alert("Copying items of ID " + exportItems[i]);
		var data = readFile(myLogDir + exportItems[i] + ".html");		
		var files = getAllFilesInDirectory(myLogDir + "\\" + exportItems[i] + "\\");
		alert(files);
		data = updateFileReferences(data, exportItems[i], i, files);
		writeBinaryFile(data, folderPath + "\\" + i + ".html");
		var directory = myLogDir + exportItems[i] + "\\";
		recursiveCopyAllFiles(folderPath + "\\" + i, directory);		
	}
}

function copyImportedContent(folderPath, oldIDs, newIDs){
	var profileDir = getProfileDirectory();	
	var myLogDir = profileDir + "\\extensions\\mylog\\";
	for(var i = 0; i < oldIDs.length; i++){
		alert("Copying items of ID " + oldIDs[i]);
		alert(folderPath + "\\" + oldIDs[i] + ".html");
		var data = readFile(folderPath + "\\" + oldIDs[i] + ".html");
		var files = getAllFilesInDirectory(folderPath + "\\" + oldIDs[i] + "\\");
		data = updateFileReferences(data, oldIDs[i], newIDs[i], files);
		writeBinaryFile(data, myLogDir + newIDs[i] + ".html");
		var directory = folderPath + "\\" + oldIDs[i] + "\\";
		recursiveCopyAllFiles(myLogDir + "\\" + newIDs[i], directory);		
	}
}

function updateFileReferences(dataString, oldID, newID, files) {
	if (files != null) {
		for (var i=0; i < files.length; i++) {
			var oldString = oldID + files[i];
			var newString = newID + files[i];
			var parsedString = null;
			while (dataString != parsedString){
				parsedString = dataString;
				dataString = dataString.replace(oldString, newString);
			}
		}
	}
	return dataString;
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

function getProfileDirectory(){
	var dir = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("ProfD", Components.interfaces.nsIFile);
    return dir.path;       
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

function recursiveCopyAllFiles(targetFolder, sourceFolder){
	var dirs = getAllDirectoriesInDir(sourceFolder);		
	for(var j = 0; j < dirs.length; j++){
		createDir(targetFolder, dirs[j]);
		recursiveCopyAllFiles(targetFolder + "\\" + dirs[j], sourceFolder + "\\" + dirs[j]);
	}
	var files = getAllFilesInDir(sourceFolder);		
	for(var j = 0; j < files.length; j++){
		data = readFile(files[j].path);
		writeBinaryFile(data, targetFolder + "\\" + files[j].leafName);
	}
	
}

function getAllFilesInDir(path){
	
	var dir = Components.classes["@mozilla.org/file/local;1"]
	             .createInstance(Components.interfaces.nsILocalFile);
	dir.initWithPath(path);
	var entries = dir.directoryEntries;
	var array = [];
	while(entries.hasMoreElements()){
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  if(!entry.isDirectory())
		  array.push(entry);
	}
	return array;
	
}

function getAllDirectoriesInDir(path){
	var dir = Components.classes["@mozilla.org/file/local;1"]
	             .createInstance(Components.interfaces.nsILocalFile);
	dir.initWithPath(path);
	var thisPath = dir.path;		             	
	var entries = dir.directoryEntries;
	var dirs = [];
	while(entries.hasMoreElements()){
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  if(entry.isDirectory()){
		dirs.push(entry.leafName);
	  }
	}

	return dirs;

}

function getAllFilesInDirectory(path){
	
	var array = [];
	return getAllFilesInRelativePath(path, "", array)
	
}

function getAllFilesInRelativePath(path, relativePath, files){
	
	var dir = Components.classes["@mozilla.org/file/local;1"]
	             .createInstance(Components.interfaces.nsILocalFile);
	dir.initWithPath(path);
	var thisPath = dir.path;		             	
	var entries = dir.directoryEntries;
	//recurse on directories
	while(entries.hasMoreElements()){
	  var entry = entries.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  if(entry.isDirectory()){
	  	getAllFilesInRelativePath(path + "\\" + entry.leafName, relativePath + "/" + entry.leafName, files);
	  }
	}
	var entries2 = dir.directoryEntries;
	//add files to array
	while(entries2.hasMoreElements()){
	  var entry = entries2.getNext();
	  entry.QueryInterface(Components.interfaces.nsIFile);
	  if(!entry.isDirectory()){
		files.push(relativePath + "/" + entry.leafName);
	  }
	}
	return files;
	
}

function getFolderDialogueBox(dialogText){
	nsIFilePicker = Components.interfaces.nsIFilePicker;	
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		           .createInstance(nsIFilePicker);
	fp.init(window, dialogText, nsIFilePicker.modeGetFolder);
	fp.appendFilters(nsIFilePicker.filterAll | nsIFilePicker.filterText);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK){
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
