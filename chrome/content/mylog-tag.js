/* Class implementation for tag-related functions
// Written by Bryan Early and Soumi Sinha, Dec 5, 2006, 9 pm.
*/
//function TagHandler() {
//	
//	var _fileName = "mylog-tags.xml";
//	var _domDoc;
//
//	this.createTagHandlerFromFile = createTagHandlerFromFile;
//	this.getDomDoc = getDomDoc;
//	this.setDomDoc = setDomDoc;
//	this.getAllTagNames = getAllTagNames;
//
//	function getDomDoc() {
//		return _domDoc;
//	}
//
//	function setDomDoc(doc) {
//		_domDoc = doc;
//	}
//
//	function _readFromTagFile() {
//		var doc;
//		var file = Components.classes["@mozilla.org/file/directory_service;1"]
//							 .getService(Components.interfaces.nsIProperties)
//							 .get("ProfD", Components.interfaces.nsIFile);
//		file.append(_fileName);
//		// alert(file.path);
//		if (!file.exists()) {
//			// alert("File doesn't exist");
//			doc = document.implementation.createDocument("", "", null);
//			var entriesElem = doc.createElement("tags");
//			entriesElem.setAttribute("counter", "0");
//			doc.appendChild(entriesElem);
//		} else {
//			// alert("File exists");
//
//			// Read file to string (data)
//			var data = "";
//			var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
//									.createInstance(Components.interfaces.nsIFileInputStream);
//			var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
//									.createInstance(Components.interfaces.nsIScriptableInputStream);
//			fstream.init(file, -1, 0, 0);
//			sstream.init(fstream); 
//
//			var str = sstream.read(4096);
//			while (str.length > 0) {
//			  data += str;
//			  str = sstream.read(4096);
//			}
//
//			sstream.close();
//			fstream.close();
//
//			// Parse string (data) to DOM object
//			var domParser = new DOMParser();
//			doc = domParser.parseFromString(data, "text/xml");
//		}
//		// print the name of the root element or error message
//		// alert(doc.documentElement.nodeName == "parsererror" ? "error while parsing" : doc.documentElement.nodeName);
//
//		return doc;
//	}
//
//	function createTagHandlerFromFile() {
//		setDomDoc(_readFromTagFile());
//	}
//
//	function getAllTagNames() {
//		var tagsNode = _domDoc.getElementsByTagName("tags")[0];
//		var tagArr = tagsNode.getElementsByTagName("tag");
//		var tagNameArr = new Array();
//
//		for (var i = 0; i < tagArr.length; i++) {
//			tagNameArr.push(tagArr[i].getAttribute("name"));
//		}
//
//		return tagNameArr;
//	}
//
//}
//


//	Added by Bryan Early and Soumi Sinha on December 5.
//	This function will return a menupopup item containing all the tags.
function createTagMenupopup() {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var tagNameArr = dataHandler.getAllTags();

	var menuPopup = document.createElement("menupopup");
	menuPopup.setAttribute("id", "mylog-tagsMenuPopup");

	var i = 0;
	while (i != tagNameArr.length)
	{
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute( "label" , tagNameArr[i]);
		menuItem.setAttribute( "value" , tagNameArr[i]);
		menuItem.setAttribute( "id" , "mylog-tag-" + tagNameArr[i]);
		menuPopup.appendChild(menuItem);
		i=i+1;
	}

	return menuPopup;
}