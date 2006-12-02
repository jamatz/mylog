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


/* IMPLEMENTATIONS */
function XmlDataStore() {
	this.open = open;
	this.close = close;
	
	// Private members
	var _xmlfilepath = "mylog_entries.xml";

	// Public methods
	function open() {
		var doc = _readXmlFile();
		var handler = new XmlDataHandler();
		handler.setDomDoc(doc);
		return handler;
	}

	function close(handler) {
		var doc = handler.getDomDoc();
		_saveXmlFile(doc);
	}

	// Private methods
	function _readXmlFile() {
		var doc;
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
							 .getService(Components.interfaces.nsIProperties)
							 .get("ProfD", Components.interfaces.nsIFile);
		file.append(_xmlfilepath);
		alert(file.path);
		if (!file.exists()) {
			// alert("File doesn't exist");
			doc = document.implementation.createDocument("", "", null);
			var entriesElem = doc.createElement("entries");
			entriesElem.setAttribute("counter", "0");
			doc.appendChild(entriesElem);
		} else {
			// alert("File exists");

			// Read file to string (data)
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

			// Parse string (data) to DOM object
			var domParser = new DOMParser();
			doc = domParser.parseFromString(data, "text/xml");
		}
		// print the name of the root element or error message
		// alert(doc.documentElement.nodeName == "parsererror" ? "error while parsing" : doc.documentElement.nodeName);

		return doc;
	}

	function _saveXmlFile(doc) {

		var file = Components.classes["@mozilla.org/file/directory_service;1"]
							 .getService(Components.interfaces.nsIProperties)
							 .get("ProfD", Components.interfaces.nsIFile);
		file.append(_xmlfilepath);

		var serializer = new XMLSerializer();
		// The actual string that is written to file
		var data = serializer.serializeToString(doc);
		
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
								 .createInstance(Components.interfaces.nsIFileOutputStream);

		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		foStream.write(data, data.length);
		//serializer.serializeToStream(doc, foStream, "");
		foStream.close();

	}


}

function XmlDataHandler() {
	var _doc;

	this.addEntry = addEntry;
	this.replaceEntry = replaceEntry;
	this.removeEntry = removeEntry;
	this.getEntry = getEntry;

	this.getDomDoc = getDomDoc;
	this.setDomDoc = setDomDoc;

	function addEntry(logEntry) {

		var idstr = _doc.getElementsByTagName("entries")[0].getAttribute("counter");
		var id = idstr * 1;
		alert(id);
		var counter = id + 1;
		_doc.getElementsByTagName("entries")[0].setAttribute("counter", counter.toString());
		alert("set entries counter");

		var url = logEntry.getUrl();
		var title = logEntry.getTitle();
		var filepath = "nowhere"; // TODO: actually get a filepath (once we save an actual file)
		var tags = logEntry.getTags(); // TODO: go through array
		var comments = logEntry.getComments(); // TODO: go through array
		alert("Got logEntry info");

		var entryElem = _doc.createElement("entry");
		var tagsElem = _doc.createElement("tags");
		var titleElem = _doc.createElement("title");
		var urlElem = _doc.createElement("url");
		var filepathElem = _doc.createElement("filepath");
		var commentsElem = _doc.createElement("comments");
		alert("Created XML elements");
		entryElem.setAttribute("id", id.toString());
		alert("Set XML attributes");

		var titleElemText = _doc.createTextNode(title);
		var urlElemText = _doc.createTextNode(url);
		var filepathElemText = _doc.createTextNode(filepath);

		alert("Created XML textnodes");

		titleElem.appendChild(titleElemText);
		entryElem.appendChild(titleElem);
		urlElem.appendChild(urlElemText);
		entryElem.appendChild(urlElem);
		filepathElem.appendChild(filepathElemText);
		entryElem.appendChild(filepathElem);

		// Add all tags
		for (var i = 0; i < tags.length; i++) {
			var thisTagElem = _doc.createElement("tag");
			thisTagElem.appendChild(_doc.createTextNode(tags[i]));
			tagsElem.appendChild(thisTagElem);
		}
		entryElem.appendChild(tagsElem);

		// Add all comments
		for (var i = 0; i < comments.length; i++) {
			var thisCommentElem = _doc.createElement("comment");
			thisCommentElem.setAttribute("time", "12"); //TODO: actual time
			thisCommentElem.setAttribute("date", "12"); //TODO: actual date
			thisCommentElem.appendChild(_doc.createTextNode(comments[i].getContent()));
			commentsElem.appendChild(thisCommentElem);
		}
		entryElem.appendChild(commentsElem);

		_doc.getElementsByTagName("entries")[0].appendChild(entryElem); // entriesElem.appendChild(entryElem);
		alert("Appended everything");
	
	}
	function replaceEntry(logEntry) {}
	function removeEntry(id) {}
	function getEntry(id) { return logEntry }

	function getDomDoc() {
		return _doc;
	}

	function setDomDoc(doc) {
		_doc = doc;
	}
}