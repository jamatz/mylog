// *** vviswana,        :05-05-2007:Created exportContentToZip
// *** jdelator, thpark2:03-07-2007:Created the functions of the Export/Import window

var dataStore;
var dataHandler;
var zipProg;

var MYLOG_EXPORT_TEMP_DIR = "mylog_export_content";

function showAllContent() {
    try {
        dataStore = window.arguments[0];
        dataHandler = window.arguments[1];
        var entryList = dataHandler.getAllEntries();
        if(entryList.length > 0) {
            displayResults(entryList);
        }       
        
        // See if a zip program is installed
        checkZipSH();
        zipProg = getZipUtil();
        if(zipProg == null) {
            document.getElementById('export-format').selectedIndex = 1;
        }
        else {
            document.getElementById('export-format').selectedIndex = 0;
        }
    } catch(e) {
        logMsg("Exception: " + e);
    }
}

/*
 * Make sure zip.sh is executable.
 */
function checkZipSH()
{
    if(navigator.platform != "Win32") {
        var zipScript = getFileFromExtensionDir(MYLOG_ID, "zip.sh");
        if(!zipScript.isExecutable()) {
            // try user executable first
            zipScript.permissions |= 0500;
            if(!zipScript.isExecutable()) {
            // this probably won't work anyway
            // if we don't own the file
            zipScript.permissions |= 0550;
            }
        }
    }
}

function handleContentClicked() {
// 	var menu = document.getElementById('content');
// 	var item = document.getElementById('content').selectedItem;
// 	menu.addItemToSelection(item);
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
    betterExportContent();
    
    /*var selectedItems = document.getElementById('content').selectedItems;
    var items = [];
    for(var i = 0; i < selectedItems.length; i++)
        items.push(selectedItems[i].value);	
    
    if(selectedItems.length != 0){		
        var folderPath = getFolderDialogueBox("Export Items to...");
        createDir(folderPath, "MyLog_Exported_Content")
        folderPath = folderPath + "\\MyLog_Exported_Content"; 
        saveExportXML(folderPath, items); 
        copyExportedContent(folderPath, items);	
        
        if(document.getElementById('export-format').selectedIndex == 0) {
            exportToZip(folderPath);
        }
        
        alert("Successfully copied " + selectedItems.length + " item(s).");
    }
    else {
        alert("Please select items before attempting to export.");
    }*/

}

function betterExportContent() {
    try {
        var selectedItems = document.getElementById('content').selectedItems;
        var items = [];
        for(var i = 0; i < selectedItems.length; i++) {
            items.push(selectedItems[i].value); 
            //logMsg("selecteditem:" + selectedItems[i].value + "");
        }
        
        if(selectedItems.length != 0){      
            var folderPath = getFolderDialogueBox("Export Items to...");
            var buildPath ="";
            
            if(folderPath == null){
                return 0;
            }
            
            if(folderPath.match(".zip")!=null) {
                if(zipProg == null) {
                    alert("A supported zip program was not found on your system. Please export to xml data instead.");
                    return 0;
                }
                var fileObject = pathToFileObject(folderPath);
                buildPath = fileObject.parent.path;
                buildPath = getFullFilePath(buildPath,new Array("MyLog_Exported_Content"));
            }
            else {
                buildPath = folderPath;
            }
            //buildPath = getFullFilePath(buildPath,new Array("MyLog_Exported_Content"));
            createDirectoryFromPath(buildPath);
           
            var xmlFile = betterSaveExportXML(buildPath, items); 
            var inputFiles = betterCopyExportedContent(buildPath, items); 
            inputFiles = inputFiles.concat(xmlFile);
            
            if(folderPath.match(".zip")!=null){
                exportToZip(folderPath,buildPath,inputFiles);
            }
            alert("Successfully copied " + items.length + " item(s).");
        }
        else {
            alert("Please select items before attempting to export.");
        }
    }catch(e) {
        logMsg("Exception in betterExportContent:" + e);
    }
}

function exportToZip(folderPath,buildPath,inputFiles) {
    if(zipProg != null) {
        var zipFile = folderPath;
        if(pathExists(zipFile)) {
            removePath(zipFile);
        }
        
        if(zipProg.createZip(buildPath,zipFile,inputFiles,true)) {
            removePath(buildPath); 
        }
        else {
            logMsg("Couldn't create " + zipFile);
        }
    }
}

function extractZipFile(zipFile) {
    var xmlFile = null;
 
    try {
        var parentDir = pathToFileObject(zipFile).parent.path;
        var tempDir = getFullFilePath(parentDir,new Array(MYLOG_EXPORT_TEMP_DIR));
        createDirectoryFromPath(tempDir);
        
        var zipReader = Components.classes["@mozilla.org/libjar/zip-reader;1"]
            .createInstance(Components.interfaces.nsIZipReader);        
        zipReader.init(pathToFileObject(zipFile));
        zipReader.open();
        var iter = zipReader.findEntries("*");
        var counter =0;
        while(iter.hasMoreElements()) {
            var zipEntry = iter.getNext();
            if(zipEntry instanceof Components.interfaces.nsIZipEntry) {
                var paths = zipEntry.name.split("/");
                var destFileObject = pathToFileObject(tempDir);
                for(var i=0;i<paths.length - 1;i++) {
                    destFileObject.append(paths[i]);
                    //logMsg("creating directory:" + destFileObject.path);
                    createDirectory(destFileObject);
                }
                
                var destFilename = getFullFilePath(tempDir,paths);
                if(destFilename.match("exported.xml")!=null) {
                    xmlFile = destFilename;
                }
                //logMsg("zip file:" + destFilename);
                if(!pathExists(destFilename)){
                    zipReader.extract(zipEntry.name,pathToFileObject(destFilename));
                }
            }
        }
        zipReader.close();
        
        if(xmlFile == null) {
            throw("Exception in extractZipFile: exported.xml not found in archive!");
        }
    }
    catch(e){
        logMsg("Exception in extractZipFile:" + e);
        throw(e);
    }
    
    return xmlFile;
}

function importContent(){
    betterImportContent();
// 	var XMLPath = getXMLBox("Select the folder where export.xml is located");
// 	var folderPath = XMLPath.substr(0,XMLPath.lastIndexOf("\\"));
// 	var profileDir = getProfileDirectory();
// 
// 	var importDataStore = new XmlDataStore();
// 	var importDataHandler = importDataStore.openLocal(XMLPath);
// 	var oldIDs = [];
// 	var newIDs = [];
// 	var entries = importDataHandler.getAllEntries();
// 	for(var i = 0; i < entries.length; i++){
// 		oldIDs.push(entries[i].getId());		
// 		var newID = dataHandler.addPredefinedEntry(entries[i],profileDir);
// 		newIDs.push(newID);
// 	}
// 	//alert("Grabbed " + entries.length + " items.");
// 	copyImportedContent(folderPath, oldIDs,newIDs);
// 	//alert("Copied");
// 	dataStore.close(dataHandler);
// 	dataHandler = dataStore.open();
// 	var entryList = dataHandler.getAllEntries();
// 	if(entryList.length > 0) {
// 		displayResults(entryList);
// 	}
// 	alert("Successfully copied "+ entries.length + " items.");
}

function betterImportContent() {
    var tempDir;
    var importStore;
    var useZip = false;
    var XMLPath;
    var importHandler;
    
    try {
        useZip = false;
        XMLPath = getXMLBox("Select export.xml or .zip file");
        
        // If the filename is null, then don't continue
        if(XMLPath == null) { 
            return 0;
        }
        
        if(XMLPath.match(".zip") != null) {
            XMLPath = extractZipFile(XMLPath);
            useZip = true;
        }
        
        // Now extract all LogEntries and copy over to the regular datastore
        tempDir =  pathToFileObject(XMLPath).parent.path;
        importStore = new XmlDataStore();
        importHandler = importStore.openLocal(XMLPath);
        importedEntries = importHandler.getAllEntries();
       
        importStore.close(importHandler);
        addImportedEntries(importedEntries,tempDir);
        //logMsg("import xml: " + XMLPath);
        
        var entryList = dataHandler.getAllEntries();
        if(entryList.length > 0) {
            displayResults(entryList);
        }
        alert("Imported " + importedEntries.length + " entries.");
    }catch(e){ 
        logMsg("Exception in betterImportContent: " +e);
        alert("Problem occurred during importing. Operation aborted. Look at error console for any output..");
    } finally {
        // If a zip file was used make sure to remove the temporary directory
        if((useZip) && (XMLPath != null)) {
            if(pathExists(tempDir)){
                //logMsg("removing path: " + tempDir);
                removePath(tempDir);
            }
        }
    }
}

function addImportedEntries(entries,folderPath){
//     dataStore = new XmlDataStore();
//     dataHandler = dataStore.open();

    for(var i=0;i<entries.length;i++){
        var filepath = getFullFilePath(folderPath,new Array(entries[i].getId() + ".html"));
        entries[i].setFilePath(filepath);
//         // The filepath will point to the extension directory
//         var filepath = copyPage(filepath, id);
//         logEntry.setFilePath(filepath);
        dataHandler.addPredefinedEntry(entries[i]);
    }

    dataStore.close(dataHandler);
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

function betterSaveExportXML(folderPath, exportItems){
    var xmlFile = "";    
    try {
        xmlFile = getFullFilePath(folderPath,new Array("exported.xml"));
        //logMsg("xml file: " + xmlFile);
        
        exportStore = new XmlDataStore();
        //exportStore.setXmlFilepath(filePath);
        exportHandler = exportStore.open(); 
        exportHandler.exportTo(xmlFile,exportItems);
        exportStore.close(exportHandler);
        xmlFile = "exported.xml";
    }catch(e) {
        logMsg("Exception in betterSaveExportXML:" + e);
    }
    
    return xmlFile;
}

function copyExportedContent(folderPath, exportItems){
	var profileDir = getProfileDirectory();	
    var myLogDir = profileDir + "\\extensions\\mylog\\";
	for(var i = 0; i < exportItems.length; i++){
		createDir(folderPath, i);
		var data = readFile(myLogDir + exportItems[i] + ".html");		
		var files = getAllFilesInDirectory(myLogDir + "\\" + exportItems[i] + "\\");
		data = updateFileReferences(data, exportItems[i], i, files);
		writeBinaryFile(data, folderPath + "\\" + i + ".html");
		var directory = myLogDir + exportItems[i] + "\\";
		recursiveCopyAllFiles(folderPath + "\\" + i, directory);		
		var pngData = readFile(myLogDir + exportItems[i] + "-preview.png");		
		writeBinaryFile(pngData, folderPath + "\\" + i + "-preview.png");

	}
}

function betterCopyExportedContent(folderPath, exportItems){
    var profileDir = getProfileDirectory(); 
    var myLogDir = getFullFilePath(profileDir,new Array("extensions","mylog"));
    var destDir = folderPath;
    var inputFiles = new Array();
    var inputFile = "";
    //logMsg("destDir:" + destDir);
    for(var i = 0; i < exportItems.length; i++){
        //logMsg("Item[" + i + "]: " + exportItems[i]);
        inputFile = getFullFilePath(myLogDir,new Array(exportItems[i] + ".html"));
        inputFiles.push(exportItems[i] + ".html");
        copyFilePath(inputFile,destDir);
        
        inputFile = getFullFilePath(myLogDir,new Array(exportItems[i] + ""));
        inputFiles.push(exportItems[i] + "");
        copyFilePath(inputFile,destDir);
        
        inputFile = getFullFilePath(myLogDir,new Array(exportItems[i] + "-preview.png"));
        inputFiles.push(exportItems[i] + "-preview.png");
        copyFilePath(inputFile,destDir); 
    }
    
    return inputFiles;
}

function copyImportedContent(folderPath, oldIDs, newIDs){
	var profileDir = getProfileDirectory();	
	var myLogDir = profileDir + "\\extensions\\mylog\\";
	for(var i = 0; i < oldIDs.length; i++){
		var data = readFile(folderPath + "\\" + oldIDs[i] + ".html");
		var files = getAllFilesInDirectory(folderPath + "\\" + oldIDs[i] + "\\");
		data = updateFileReferences(data, oldIDs[i], newIDs[i], files);
		writeBinaryFile(data, myLogDir + newIDs[i] + ".html");
		var directory = folderPath + "\\" + oldIDs[i] + "\\";
		recursiveCopyAllFiles(myLogDir + "\\" + newIDs[i], directory);		
		var pngData = readFile(folderPath + "\\" + oldIDs[i] + "-preview.png");
		writeBinaryFile(pngData, myLogDir + newIDs[i] + "-preview.png");
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



function createDir(initPath,dir){
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(initPath);
	file.append(dir);
	if( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
	   file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0700);
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
	if(dir.isDirectory())
		var entries = dir.directoryEntries;
	else
		return files;
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
	
    var useZip = false;
    if(document.getElementById('export-format').selectedIndex == 0) {
        useZip = true;
    }   
    
    if(useZip) {
        fp.init(window, dialogText, nsIFilePicker.modeSave);
        fp.appendFilter("Zip File (*.zip)","*.zip");
    }
    else {
        fp.init(window, dialogText, nsIFilePicker.modeGetFolder);
        fp.appendFilters(nsIFilePicker.filterAll);
    }
    
	var rv = fp.show();
	if ((rv == nsIFilePicker.returnOK) || (rv==nsIFilePicker.returnReplace)){
	  return fp.file.path;
	}
    
    return null;
}

function getXMLBox(dialogText){
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		           .createInstance(nsIFilePicker);
	fp.init(window, dialogText, nsIFilePicker.modeOpen);
    fp.appendFilter("All Supported","*.zip;*.xml");   
	fp.appendFilters(nsIFilePicker.filterXML);
    fp.appendFilter("Zip File (*.zip)","*.zip");   
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK){
	  return fp.file.path;
	}
  
    return null;
}
