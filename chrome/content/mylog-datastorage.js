/* Interface for DataStore */

//function DataStore() {
//	// Define public methods
//	this.addEntry = addEntry;
//	this.replaceEntry = replaceEntry;
//	this.getEntry = getEntry;
//
//	// Public methods
//	function addEntry(logEntry) {}
//	function replaceEntry(logEntry) {}
//	function getEntry(id) {}
//	// TODO: Search functions go here (add to public methods)
//}

function XmlDataStore() {
	// Define public methods
	this.addEntry = addEntry;
	this.replaceEntry = replaceEntry;
	this.getEntry = getEntry;

	// Private members
	var _xmlfilepath = "mylog_entries.xml";
	

	// Public methods
	function addEntry(logEntry) {
		var doc = _readXmlFile();
		alert("XML file put into DOM object");

		var idstr = doc.getElementsByTagName("entries")[0].getAttribute("counter");
		var id = idstr * 1;
		alert(id);
		var counter = id + 1;
		doc.getElementsByTagName("entries")[0].setAttribute("counter", counter.toString());

		var url = logEntry.getUrl();
		var title = logEntry.getTitle();
		var filepath = _xmlfilepath; // TODO: actually get a filepath (once we save an actual file)
		var tags = logEntry.getTags(); // TODO: go through array
		var comments = logEntry.getComments(); // TODO: go through array
		alert("Got logEntry info");

		var entryElem = doc.createElement("entry");
		var tagsElem = doc.createElement("tags");
		var titleElem = doc.createElement("title");
		var urlElem = doc.createElement("url");
		var filepathElem = doc.createElement("filepath");
		var commentsElem = doc.createElement("comments");
		alert("Created XML elements");
		entryElem.setAttribute("id", id.toString());
		alert("Set XML attributes");

		var titleElemText = doc.createTextNode(title);
		var urlElemText = doc.createTextNode(url);
		var filepathElemText = doc.createTextNode(filepath);

		alert("Created XML textnodes");

		titleElem.appendChild(titleElemText);
		entryElem.appendChild(titleElem);
		urlElem.appendChild(urlElemText);
		entryElem.appendChild(urlElem);
		filepathElem.appendChild(filepathElemText);
		entryElem.appendChild(filepathElem);

		// Add all tags
		for (var i = 0; i < tags.length; i++) {
			var thisTagElem = doc.createElement("tag");
			thisTagElem.appendChild(doc.createTextNode(tags[i]));
			tagsElem.appendChild(thisTagElem);
		}
		entryElem.appendChild(tagsElem);

		// Add all comments
		for (var i = 0; i < comments.length; i++) {
			var thisCommentElem = doc.createElement("comment");
			thisCommentElem.setAttribute("time", "12"); //TODO: actual time
			thisCommentElem.setAttribute("date", "12"); //TODO: actual date
			thisCommentElem.appendChild(doc.createTextNode(comments[i].getContent()));
			commentsElem.appendChild(thisCommentElem);
		}
		entryElem.appendChild(commentsElem);

		doc.getElementsByTagName("entries")[0].appendChild(entryElem); // entriesElem.appendChild(entryElem);
		alert("Appended everything");

		_saveXmlFile(doc);
		alert("Done adding entry!");
	}

	function replaceEntry(logEntry) {
		var doc = _readXmlFile();
		//TODO: logic
		_saveXmlFile(doc);
	}

	function getEntry(id) {
		var doc = _readXmlFile();
		var logEntry = new LogEntry();

		//TODO: logic

		return logEntry;
	}

	// TODO: Search functions go here (add to public methods)


	// Private methods
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

	// If no file exists, return doc with entries tag
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

}