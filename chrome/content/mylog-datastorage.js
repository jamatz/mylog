// *** vviswana: 05-06-2007: Modified addPredefinedEntry so that it's no longer stupid.
// *** vviswana: 05-02-2007: Added a counter member to DataHandler to keep track of the number of entries in memory. This is in hopes to
// ***                       support a kind of "roll-back" feature for the database
// *** bearly, thpark2: 04-15-2007: Modified close to add support for Unicode characters.
// *** ebowden2, jamatz: 03-08-2007: Modified addEntry to add support for storing .png previews of entries.  Also added a "preview" tag to the XML file output for the path to the preview .png file.
// *** vviswana, bearly: 03-07-2007: Added content searching into findEntries. Also added helper functions,_searchContent and saveResultsPage, to actually search through the saved  pages and also display the results, respectively. Also refactored _readXmlFile to use fileToString(). Added showResultsPage() to display search by content results.                                 
// *** ebowden2, jamatz: 02-23-2007: Changed the findEntries function so it now searchs on a case-insensitive basis.  Firefox does not support the XPath 2.0 lower-case() function, so this is done using translate() instead, with associated possible bugs when non-English-alphabet characters are encountered.  Should work for most cases, though.
// *** bearly, vviswana: 02-13-2007: Modified addEntry to return id.  Added savePage function.
// *** groupmeeting: 02-12-2007: refactored to use refactored Comment object


/* INTERFACES */

//function DataStore() {
//	this.open = open;
//	this.close = close;
//
//	// Public methods
//	function open() { return handler }
//	function close(handler) {}
//}
//
//function DataHandler() {
//	this.addEntry = addEntry;
//	this.replaceEntry = replaceEntry;
//	this.removeEntry = removeEntry;
//	this.getEntry = getEntry;
//
//	function addEntry(logEntry) {}
//	function replaceEntry(logEntry) {}
//	function removeEntry(logEntry) {}
//	function getEntry(id) { return logEntry }
//}

// Revision History
// Authors                                              Date            Comment
// Vinayak Viswanathan - observer, Thomas Park - coder  12/7/2006       Adding functionality to search through comments
// Vinayak Viswanathan - coder, Thomas Park - observer  12/7/2006       Added _readXmlFileNew()
//                                                                      Uses XmlHttpRequest() (in our opinion it is simpler)
// Brian Cho and Soumi Sinha							12/1/2006		Initial creation


/* IMPLEMENTATIONS */
// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function XmlDataStore() {
	this.open = open;
	this.openLocal = openLocal;
	this.close = close;
	this.saveXML = saveXML;
	this.readXML = readXML;   
	this.setXmlFilepath = setXmlFilepath;
	
	// Private members
	var _xmlFilepath = getFullFilePath(getProfileDirectory(),new Array("mylog_data.xml"));

	// Public methods
	function open() {
        var doc = _readXmlFile();      
		var handler = new XmlDataHandler();
		handler.setDomDoc(doc);
		return handler;
	}
	
	function openLocal(filePath){
        _xmlFilepath = filePath;   
        //logMsg("filepath in open: " + _xmlFilepath);
// 		var doc = readXML(filePath);      
        var doc = _readXmlFile();      
        var handler = new XmlDataHandler();
        handler.setDomDoc(doc);
        return handler;
	}

	function close(handler) {
		var doc = handler.getDomDoc();
		_saveXmlFile(doc);
		
		// The handler has been saved, so it is no longer dirty
		handler.setDirty(0);
		handler.removeTemporaryEntry();
	}

	function readXML(filePath) {
		var doc;
		var file = Components.classes["@mozilla.org/file/local;1"]
	                        .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(filePath);
		if (!file.exists()) {
			alert("File doesn't exist");
		} else {
			var data = "";
			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			                        .createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
			                        .createInstance(Components.interfaces.nsIScriptableInputStream);
			fstream.init(file, -1, 0, 0);
			sstream.init(fstream); 
			
			var str = sstream.read(4096);
			while (str.length > 0) {
			  data += str;
			  str = sstream.read(4096);
			}
			
			sstream.close();
			fstream.close();
			var domParser = new DOMParser();
			doc = domParser.parseFromString(data, "text/xml");
		}
		return doc;
    }

	// Created by Vinayak Viswanathan and Thomas Park on December 7.
    function _readXmlFileNew() {
        //_xmlFilepath = "chrome://mylog/content/mylog_data.xml";
        var req = new XMLHttpRequest();
        
        // We're appending the chrome uri to avoid breaking anything that needs
        // the filepath to be hardcoded...this is a bad thing
        req.open("GET", "chrome://mylog/content/" + _xmlFilepath, false); 
        req.send(null);
        // print the name of the root element or error message
        var doc = req.responseXML;
        return doc;
    }

	// Created by Brian Cho and Jesus DeLaTorre on December 8.
	//   Should be used for testing purposes only.
	//
	// filename is a file in the user's firefox profile directory
	function setXmlFilepath(filename) {
		_xmlFilepath = filename;
	}

	// Private methods
	function _readXmlFile() {
		var doc;
		var file =  Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
                     
		file.initWithPath(_xmlFilepath);
		// alert(file.path);
		if (!file.exists()) {
			// alert("File doesn't exist");
			doc = document.implementation.createDocument("", "", null);
			var rootElem = doc.createElement("mylog");
			var entriesElem = doc.createElement("entries");
			var tagsElem = doc.createElement("tags");
			entriesElem.setAttribute("counter", "0");
			doc.appendChild(rootElem);
			rootElem.appendChild(entriesElem);
			rootElem.appendChild(tagsElem);
		} else {
			// alert("File exists");
			var data = fileToString(file);

			// Parse string (data) to DOM object
			var domParser = new DOMParser();
			doc = domParser.parseFromString(data, "text/xml");
		}
		// print the name of the root element or error message
		// alert(doc.documentElement.nodeName == "parsererror" ? "error while parsing" : doc.documentElement.nodeName);

		return doc;
	}

	function _saveXmlFile(doc) {
		// Also save the tags.xml
		var file =  Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
                     
        //logMsg("Output file: " + _xmlFilepath);
        file.initWithPath(_xmlFilepath);

		var serializer = new XMLSerializer();
		// The actual string that is written to file
		var data = serializer.serializeToString(doc);
		
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
								 .createInstance(Components.interfaces.nsIFileOutputStream);

		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		/*
		foStream.write(data, data.length);
		//serializer.serializeToStream(doc, foStream, "");
		foStream.close();
		* */
		
		var charset = "UTF-8"; // Can be any character encoding name that Mozilla supports

		var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		                   .createInstance(Components.interfaces.nsIConverterOutputStream);
		
		// This assumes that fos is the nsIOutputStream you want to write to
		os.init(foStream, charset, 4096, "?".charCodeAt(0));
		
		os.writeString(data);
		
		os.close();
	}
	
	function saveXML(doc,dir,fileName) {
		// Also save the tags.xml
		var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(dir);
		file.append(fileName);
		alert(file.path);
		var serializer = new XMLSerializer();
		// The actual string that is written to file
		var data = serializer.serializeToString(doc);
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
								 .createInstance(Components.interfaces.nsIFileOutputStream);
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		foStream.write(data, data.length);
		foStream.close();
		
	}
}

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function XmlDataHandler() {
	var _doc;
	var _entryCounter;
	var _dirtyBit;
	var _tempEntry = null;

	this.getAllTags = getAllTags;
	this.addTag = addTag;
	this.addEntry = addEntry;
	this.addPredefinedEntry = addPredefinedEntry;
	this.addTemporaryEntry = addTemporaryEntry;
	this.saveTemporaryEntry = saveTemporaryEntry;
	this.removeTemporaryEntry = removeTemporaryEntry;
	this.getTemporaryEntry = getTemporaryEntry;
	
	this.replaceEntry = replaceEntry;
	this.removeEntry = removeEntry;
	this.removeTag = removeTag;
	this.getEntry = getEntry;
	this.findEntries = findEntries;
	this.getAllEntries = getAllEntries;
	this.setDirty = setDirty;

	this.getDomDoc = getDomDoc;
	this.setDomDoc = setDomDoc;
    this.getEntryCounter = getEntryCounter;
    
    this.exportTo = exportTo;
    
    //Created December 6th by Josh Matz and Eric Bluhm
	//getAllTags returns an array holding all the tags currently in _doc
	function getAllTags() {

		var existingTags = new Array();  //Array of strings
		for (var i = 0; i<_doc.getElementsByTagName("tag").length; i++) {			
			existingTags.push(_doc.getElementsByTagName("tag")[i].getAttribute("name"));
		}

		return existingTags;
	}

	//Created December 6th by Josh Matz and Eric Bluhm
	//addTag recieves a tag and writes it into _doc
	//returns true if the tag has been added, otherwise false
	function addTag(tag) {

		if (tag == "") {
			return false;
		}
	
		var existingTags = new Array();  //Array of strings
		existingTags = getAllTags();

		for (var i = 0; i<existingTags.length; i++) {
			if(tag == existingTags[i]) {
				return false;
			}
		}
				
		var tagElem = _doc.createElement("tag");
		tagElem.setAttribute("name", tag);
		_doc.getElementsByTagName("tags")[0].appendChild(tagElem);
		
		_dirtyBit = 1;
		return true;
	}
	
	function addEntry(logEntry, doc) {
		if(_tempEntry != null) {
			throw("MyLog: dataHandler.addEntry cannot be called if there is a temporary entry still saved");
		}
	
		var idstr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
		var id = idstr * 1;
		logEntry.setId(id);
		var counter = id + 1;
		_doc.getElementsByTagName("entries")[0].setAttribute("counter", counter.toString());
		if(typeof(doc) != "undefined"){
			var file = savePage(doc, id);
			logEntry.setFilePath(file.path);
		}
		var entryElem = _createDomNode(logEntry);
		_doc.getElementsByTagName("entries")[0].appendChild(entryElem);
		return id;
	}
	
	function addPredefinedEntry(logEntry) {
		if(_tempEntry != null) {
			throw("MyLog: dataHandler.addPredefinedEntry cannot be called if there is a temporary entry still saved");
		}
		
		var idstr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
		var id = idstr * 1;
		logEntry.setId(id);
        
        var filepath = copyPage(logEntry.getFilePath(),id);
        logEntry.setFilePath(filepath);
        
        // Make sure to add any tags that don't exist in the database
        var newTags = logEntry.getTags();
        for(var i=0;i<newTags.length;i++){
            addTag(newTags[i]);
        }
        
		var counter = id + 1;
		_doc.getElementsByTagName("entries")[0].setAttribute("counter", counter.toString());
		var entryElem = _createDomNode(logEntry);
		_doc.getElementsByTagName("entries")[0].appendChild(entryElem); 
		return id;
	}

	function addTemporaryEntry(logEntry, doc) {
		try {
			if(_tempEntry != null) {
				throw("MyLog: dataHandler.addTemporaryEntry cannot be called if there is a temporary entry still saved");
			}
		
			var idstr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
			var id = idstr * 1;
			logEntry.setId(id);
           
			if(typeof(doc) != "undefined"){
				var file = savePage(doc, id);
				logEntry.setFilePath(file.path);
            }
            _tempEntry = logEntry.clone();   
			//logMsg("tempEntry.id=" + _tempEntry.getId());
		} catch(e) {
			logMsg("MyLog exception:" + e);
		}
	}
	
	function saveTemporaryEntry() {
		if(_tempEntry != null) {
		
// 			if(typeof(logEntry) != "undefined") {
// 				if(logEntry.getId() != _tempEntry.getId()) {
// 					throw("saveTemporaryEntry(): The LogEntry  objects do not match!");
// 				}
// 				_tempEntry = logEntry;
// 			}
			
			var entryElem = _createDomNode(_tempEntry);
			var counter = _tempEntry.getId() + 1;
			_doc.getElementsByTagName("entries")[0].appendChild(entryElem);
			_doc.getElementsByTagName("entries")[0].setAttribute("counter", counter.toString());
		
			delete _tempEntry;
			_tempEntry = null;
		}
	}

	function removeTemporaryEntry() {
		if(_tempEntry != null) {
			deleteLocalPage(_tempEntry.getId());
			delete _tempEntry;
			_tempEntry = null;
		}
	}

	function getTemporaryEntry() {
		return _tempEntry;
	}

	// Created by Brian Cho and Jesus DeLaTorre on December 4.
	function replaceEntry(logEntry) {
		var oldNode;
		var newNode = _createDomNode(logEntry);

		var entriesNode = _doc.getElementsByTagName("entries")[0];

		var idstr = logEntry.getId();
		var xpathStr = "/mylog/entries/entry[@id = "+ idstr +"]";
		var xpathRetriever = new XpathRetriever(_doc, xpathStr);
		var oldNode = xpathRetriever.getNext();
		
		if (oldNode) {
			entriesNode.replaceChild(newNode, oldNode);
		} else {
			dump("replaceEntry: No previous node");
		}
	}

	function removeEntry(id) {
		var entriesNode = _doc.getElementsByTagName("entries")[0];

		var xpathStr = "/mylog/entries/entry[@id = "+ id +"]";
		var xpathRetriever = new XpathRetriever(_doc, xpathStr);

		var oldNode = xpathRetriever.getNext();
		if (oldNode) {
			entriesNode.removeChild(oldNode);
			return true;
		} else 
			return false;

	}

	function removeTag(tag) {
		try {
			var tagsNode = _doc.getElementsByTagName("tags")[0];
			
			var xpathStr = "/mylog/tags/tag[@name = '"+ tag +"']";
			var xpathRetriever = new XpathRetriever(_doc, xpathStr);
			var oldNode = xpathRetriever.getNext();
			if (oldNode) {
				tagsNode.removeChild(oldNode);
				return true;
			} else 
				return false;
		} catch(e) {
			logMsg("XmlDataHandler::removeTag(): " + e);
			return false;
		}
	}

	// argument id is an int (not a string!)
	function getEntry(id) {
		var idstr = id.toString();
		var xpathStr = "/mylog/entries/entry[@id = "+ idstr +"]";
		var xpathRetriever = new XpathRetriever(_doc, xpathStr);
		var thisNode = xpathRetriever.getNext();
		if (thisNode) {
			var logEntry = new LogEntry();
			logEntry.setFromDomNode(thisNode);
			return logEntry;
		} else 
			return false;		
	}

	function setDirty(dirtyBit) {
		_dirtyBit = dirtyBit;
	}

    function getEntryCounter(){
        var counterstr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
        var counter = idstr * 1;
        return counter;
    }
    
	// Modified by Vinayak Viswanathan and Thomas Park on December 7.
    function findEntries(keyword,searchType) {
    	try {
	        var doSearch = true;
			var xpathStr = "";
	
			if(searchType == "tag") {
				xpathStr = "/mylog/entries/entry[count(entrytags/entrytag[contains(@name,'"+keyword+"')]) > 0]";
	        } else if(searchType == "comment"){
				xpathStr = "/mylog/entries/entry[count(comments/comment[contains(.,'" + keyword + "')]) > 0]";  
	        } else if(searchType == "content") {
	        	return _searchContent(keyword);
	        } else {
				xpathStr = "/mylog/entries/entry[contains(translate("+searchType+", 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), translate('"+keyword+"', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'))]";
	      	}
	        
            //logMsg("XpathStr: " + xpathStr);
            
			var entryResults = new Array();
			if(doSearch == true) {
				var xpathRetriever = new XpathRetriever(_doc, xpathStr);
				var thisNode = xpathRetriever.getNext();
				while (thisNode) {
					var logEntry = new LogEntry();
					logEntry.setFromDomNode(thisNode);
					entryResults.push(logEntry);
					thisNode = xpathRetriever.getNext();
				}
			}
			return entryResults;
    	} catch (e) {
    		logMsg("Exception caught in findEntries(): " + e);
    	}
	}

	// Created by Brian Cho and Soumi Sinha on December 9, 2006.
	function getAllEntries() {
        var doSearch = true;
        
		var xpathStr = "/mylog/entries/entry";
		var xpathRetriever = new XpathRetriever(_doc, xpathStr);

		var thisNode = xpathRetriever.getNext();
		var entryResults = new Array();
		while (thisNode) {
			var logEntry = new LogEntry();
			logEntry.setFromDomNode(thisNode);
			entryResults.push(logEntry);
			thisNode = xpathRetriever.getNext();
		}
		return entryResults;

	}

    // This function exports the entries given by entryIds to outfile
    function exportTo(outFile,entryIds) {
        try {
            var doc = document.implementation.createDocument("", "", null);
            var rootElem = doc.createElement("mylog");
            var entriesElem = doc.createElement("entries");
            doc.appendChild(rootElem);
            rootElem.appendChild(entriesElem);
            
            for(var i=0;i<entryIds.length;i++){
                var entry = getEntry(entryIds[i]);
                var entryElem = _createDomNode(entry);
                doc.getElementsByTagName("entries")[0].appendChild(entryElem);
            }
        
            var file =  Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
                        
            //logMsg("Export file: " + outFile);
            file.initWithPath(outFile);
    
            var serializer = new XMLSerializer();
            var data = serializer.serializeToString(doc);
            
            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                    .createInstance(Components.interfaces.nsIFileOutputStream);
    
            var charset = "UTF-8"; // Can be any character encoding name that Mozilla supports
    
            var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                            .createInstance(Components.interfaces.nsIConverterOutputStream);
            // use 0x02 | 0x10 to open file for appending.
            foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
        
            // This assumes that fos is the nsIOutputStream you want to write to
            os.init(foStream, charset, 4096, "?".charCodeAt(0));
            os.writeString(data);
            os.close();
        }catch(e) {
            logMsg("Exception in exportTo:" + e);
        }
    }

	// Modified by Brian Cho and Jesus DeLaTorre on December 4.
	function _createDomNode(logEntry) {
		var id = logEntry.getId();
		var url = logEntry.getUrl();
		var title = logEntry.getTitle();
		var filepath = logEntry.getFilePath(); // TODO: actually get a filepath (once we save an actual file)
		var previewFilePath = logEntry.getPreviewFilePath();
		var tags = logEntry.getTags();
		var comments = logEntry.getComments();

		var entryElem = _doc.createElement("entry");
		var entryTagsElem = _doc.createElement("entrytags");
		var titleElem = _doc.createElement("title");
		var urlElem = _doc.createElement("url");
		var filepathElem = _doc.createElement("filepath");
		var previewFilePathElem = _doc.createElement("preview");
		var commentsElem = _doc.createElement("comments");
		entryElem.setAttribute("id", id.toString());

		var titleElemText = _doc.createTextNode(title);
		var urlElemText = _doc.createTextNode(url);
		var filepathElemText = _doc.createTextNode(filepath);
		var previewFilePathElemText = _doc.createTextNode(previewFilePath);

		titleElem.appendChild(titleElemText);
		entryElem.appendChild(titleElem);
		urlElem.appendChild(urlElemText);
		entryElem.appendChild(urlElem);
		filepathElem.appendChild(filepathElemText);
		previewFilePathElem.appendChild(previewFilePathElemText);
		entryElem.appendChild(filepathElem);

		// Add all tags
		for (var i = 0; i < tags.length; i++) {
			var thisEntryTagElem = _doc.createElement("entrytag");
			thisEntryTagElem.setAttribute("name", tags[i]);
			entryTagsElem.appendChild(thisEntryTagElem);
		}
		entryElem.appendChild(entryTagsElem);

		// Add all comments
		for (var i = 0; i < comments.length; i++) {
			var thisCommentElem = _doc.createElement("comment");
			thisCommentElem.setAttribute("time", comments[i].getTimeString()); // TODO: shouldn't save this
			thisCommentElem.setAttribute("date", comments[i].getDateParsableString());
			thisCommentElem.appendChild(_doc.createTextNode(comments[i].getContent()));
			commentsElem.appendChild(thisCommentElem);
		}
		entryElem.appendChild(commentsElem);

		return entryElem;
	}

	function getDomDoc() {
		return _doc;
	}

	function setDomDoc(doc) {
		_doc = doc;
		
		var counterStr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
		var counter = counterStr * 1;
		_entryCounter = counter;
	}

	function _searchContent(keyword) {
		try {
			var snippetSize = 70;
			var snippetStart = 0;
			var entries = getAllEntries();
			var resEntries = new Array();
			var resSnippets = new Array();
		
			for(var i=0;i<entries.length;i++) {
				var filepath = entries[i].getFilePath();
				var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(filepath);
				
				var fileString = fileToString(file);
				
				// replace anything in and including "<*>" with " "
				var fileString = fileString.replace(/<(.|\n|\r|\u2028|\u2029)*?>/gi, "");
//				fileString = fileString.replace(/<\/?[^>]+(>|$)/g, "");
//				fileString = fileString.replace(/</g,"&lt;");
//				fileString = fileString.replace(/>/g,"&gt;");
				
				var keyRe = new RegExp("(" + keyword + ")","i");
				var pos = fileString.search(keyRe);
				if(pos >= 0) {
					snippetStart = pos - snippetSize;
					if(snippetStart < 0) {
						snippetStart = 0;
					}
					
					resEntries.push(entries[i]);
					var snippet = fileString.substr(snippetStart,snippetSize*2 + keyword.length);
					
					// Add the bold html tag (<b>) to the keyword
					var actualWord = keyRe.exec(snippet);
					var re = new RegExp("" + actualWord[0] + "","ig");
					snippet = snippet.replace(re,"<b>" + actualWord[0] + "</b>");
					resSnippets.push(snippet);
				}
			}
			
			saveResultsPage(keyword,resEntries,resSnippets);
			
			return resEntries;
		} catch(e) {
			logMsg('Encountered LogEntry::_searchContent() exception:' + e);
		}
	}
}

function XpathRetriever(dom, xpathString) {
	var _nsResolver = document.createNSResolver( dom.ownerDocument == null ?  dom.documentElement : dom.ownerDocument.documentElement );
	var _resultsIter = document.evaluate(xpathString, 
		dom, 
		_nsResolver,
		XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
	null );

	this.getNext = getNext;
	
	function getNext() {
		try {
			var thisNode = _resultsIter.iterateNext();
			return thisNode;
		} catch (e) {
			logMsg( 'XpathRetriever Exception: ' + e );
		}
	}
}
function savePage(doc, id) {
	try
	{
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
        file.append("extensions");
        file.append("mylog");
        file.append(id + ".html");
        
        var dir = Components.classes["@mozilla.org/file/directory_service;1"]
             .getService(Components.interfaces.nsIProperties)
             .get("ProfD", Components.interfaces.nsIFile);
        dir.append("extensions");
        dir.append("mylog");
     	createDirectory(dir);
        dir.append(id);
        createDirectory(dir);
        
		var saver =  Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
			.createInstance(Components.interfaces.nsIWebBrowserPersist); 
		saver.saveDocument(doc, file, dir, null, null, null);
		return file;
	} catch (e) {
		logMsg('savePage Exception ' + e)
		return "";
	}
}

function copyPage(oldFilePath,id) {
    try
    {
        var profilePath = getProfileDirectory();
        var folderPath = getFullFilePath(profilePath,new Array("extensions","mylog"));
        var filePath = getFullFilePath(folderPath,new Array(id + ".html"));
        
        //logMsg("filepath: " + oldFilePath + ",id: " + id);
        
        // first copy over the html page to the new location
        var oldFileObj = pathToFileObject(oldFilePath);
        var folderObj = pathToFileObject(folderPath);
        
        oldFileObj.copyTo(folderObj,id + ".html");
       
        // now copy over the data directory
        var dataFolderPath = oldFilePath.slice(0,oldFilePath.length - 5);
        //logMsg("data folder: " + dataFolderPath);
        oldFileObj = pathToFileObject(dataFolderPath);
        oldFileObj.copyTo(folderObj,id + "");
        
        // preview thumbnail
        oldFileObj = pathToFileObject(dataFolderPath + "-" + "preview.png");
        oldFileObj.copyTo(folderObj,id + "-preview.png");
        
        return filePath;
    } catch (e) {
        logMsg('copyPage Exception ' + e)
        return "";
    }

}

function deleteLocalPage(id) {
	try	{
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
        file.append("extensions");
        file.append("mylog");
        file.append(id + ".html");
        file.remove(false);
        
        var file2 = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
        file2.append("extensions");
        file2.append("mylog");
        file2.append(id + "-preview.png");
        file2.remove(false);
        
        var dir = Components.classes["@mozilla.org/file/directory_service;1"]
             .getService(Components.interfaces.nsIProperties)
             .get("ProfD", Components.interfaces.nsIFile);
        dir.append("extensions");
        dir.append("mylog");
        dir.append(id);
        dir.remove(true);
        
		return true;
	} catch (e) {
		logMsg('MyLog: savePage Exception ' + e)
		return false;
	}
}

function saveResultsPage(keyword,entries,snippets) {
	try {
		var htmlStr = "<html><head><meta http-equiv='content-type' content='text/html; charset=ISO-8859-1'><title>" + keyword + " - MyLog Search</title></head><body>";
		htmlStr += "<img src='chrome://mylog/skin/MyLog-Logo.jpg' width='160' height='160' />";
		htmlStr += "<table width='100%'>";
		htmlStr += "<tr><td bgcolor='#e5ecf9'><h3>Results For " + keyword + "</h3></td></tr>";
		for (var i=0;i<entries.length;i++) {
			htmlStr += "<tr><td><a href='" + entries[i].getUrl() + "'>" + entries[i].getTitle() + "</a></td></tr>\n";
			//alert(snippets[i]);
			htmlStr += "<tr><td>" + snippets[i] + "</td></tr>\n";
			htmlStr += "<tr><td>" + entries[i].getUrl() + " - <a href='file://" + entries[i].getFilePath() + "'>Cached</a></td></tr>\n";
			htmlStr += "<tr><td>&nbsp;</td></tr>\n";
		}
	
		htmlStr += "</table></body></html>";
		
		// construct an nsIFile for the page stored on (profile)/mylog/results
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("ProfD", Components.interfaces.nsIFile);
	    file.append("extensions");
	    file.append("mylog");
	    file.append("results");
	    createDirectory(file);
	    file.append("results.html");
		stringToFile(file,htmlStr);
		
		return htmlStr;
	} catch(e) {
		logMsg("Exception caught in saveResultsPage(): " + e);
		return "";
	}
}

function showResultsPage() {
	try {
		// construct an nsIFile for the page stored on (profile)/mylog/results
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get("ProfD", Components.interfaces.nsIFile);
	    file.append("extensions");
	    file.append("mylog");
	    file.append("results");
	    file.append("results.html");
		openUILinkIn(file.path, "current");
	}catch(e) {
		logMsg("Exception caught in showResultsPage(): " + e);
	}
}

function readPage(fileName){
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("ProfD", Components.interfaces.nsIFile);
    file.append("extensions");
    file.append("mylog");
    file.append(fileName);

    var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                        .createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
	                        .createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 
	
	var str = sstream.read(4096);
	while (str.length > 0) {
	  data += str;
	  str = sstream.read(4096);
	}	
	sstream.close();
	fstream.close();
	return data;
}

    
    
