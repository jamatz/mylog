// *** bearly, vviswana: 03-07-2007: Initial creation. Added fileToString, stringToFile, logMsg, and createDirectory.

// fileObject is an nsIFile
function fileToString(fileObject) {
	var data = "";
	try {
		// Read file to string (data)
	
		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
								.createInstance(Components.interfaces.nsIFileInputStream);
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
								.createInstance(Components.interfaces.nsIScriptableInputStream);
		fstream.init(fileObject, -1, 0, 0);
		sstream.init(fstream); 
	
		var str = sstream.read(4096);
		while (str.length > 0) {
		  data += str;
		  str = sstream.read(4096);
		}
	
		sstream.close();
		fstream.close();
		return data;
	}	catch(e) {
		logMsg("Exception caught in fileToString(): " + e);
		return "";
	}
}

function stringToFile(fileObject,dataString) {
	try {
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		                         .createInstance(Components.interfaces.nsIFileOutputStream);
		
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(fileObject, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		foStream.write(dataString, dataString.length);
		foStream.close();
	} catch(e) {
		logMsg("Exception caught in stringToFile(): " + e);
		return "";
	}
}

// dirObject is an nsIFile object
// Directory will only be created if it doesn't already exist
function createDirectory(dirObject) {
	try {
		if( !dirObject.exists() || !dirObject.isDirectory() ) {   // if it doesn't exist, create
		  dirObject.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0700);
		}
	}catch(e) {
		logMsg("Exception caught in createDirectory(): " + e);
	}
}

function logMsg(msg) {
	try {
	  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                                 .getService(Components.interfaces.nsIConsoleService);
	  consoleService.logStringMessage(msg);
	}catch(e) {
		alert("Exception caught in logMsg(): " + e);
	}
}
