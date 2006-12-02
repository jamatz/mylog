function handleLogContentRequest() {

//	var user = logIn();

	var url;
	url = window.content.location.href;
//	alert(url);

	var title;
	title = document.title;
//	alert(title);

	window.openDialog("chrome://mylog/content/mylog-logcontentdialog.xul","mylog-logcontentdialog",
		"chrome",url,title);

//	handleLogContentSubmission(url);
}

function handleSearchLogRequest() {
//	window.open("chrome://mylog/content/mylog-searchwindow.xul","mylog-searchwindow",
//		"chrome");

	window.open("chrome://mylog/content/jsunit/testRunner.html","jsunit-window",
		"resizable=0");
}

function handleLogContentSubmission(url, title, tags, comment) {
	var le = new LogEntry();
	le.setUrl(url);
	alert(url);
	le.setTitle(title);
	alert(title);
	for (var i = 0; i < tags.length; i++) {
		le.addTag(tags[i]); // TODO: multiple tags (for loop on addTag)
	}
	alert(tags);
	le.addComment(comment);
	alert(comment);

	//TODO: make this a global variable

	var dataStore = new XmlDataStore();
	dataStore.addEntry(le);

	alert("Content saved.");
}

// Class LogEntry
function LogEntry() {
	var _url;
	var _title;
	var _tags = new Array();
	var _comments = new Array();
	var _filePath;
	var _date;
	var _time;

	this.getUrl = getUrl;
	this.setUrl = setUrl;
	this.getTitle = getTitle;
	this.setTitle = setTitle;
	this.getFilePath = getFilePath;
	this.getFilePathText = getFilePathText;
	this.setFilePath = setFilePath;

	this.getTags = getTags;
	this.addTag = addTag;
	this.getComments = getComments;
	this.addComment = addComment;

//	this.save = save;
//	this.readFromFile = readFromFile;

	function getUrl() {
		return _url;
	}

	function setUrl(url) {
		_url = url;
	}

	function getTitle() {
		return _title;
	}

	function setTitle(title) {
		_title = title;
	}

	function getFilePath() {
		return _filePath;
	}

	function getFilePathText() {
		return _filePath.path;
	}

	function setFilePath(filePath) {
		_filePath = filePath;
	}

	function getTags() {
		return _tags;
	}

	function addTag(tag) {
		_tags.push(tag);
	}

	function getComments() {
		return _comments;
	}

	function addComment(comment) {
		var c = new Comment(comment, "12", "12"); //TODO: get date and time
		_comments.push(c);

		// alert(_comments[_comments.length-1].getContent());
	}


/* Functionality moved to DataStorage class */

//	function save() {
//		var file = Components.classes["@mozilla.org/file/directory_service;1"]
//							 .getService(Components.interfaces.nsIProperties)
//							 .get("ProfD", Components.interfaces.nsIFile);
//		file.append("testmylog.xml");
//		if (!file.exists()) {
//			// Create file
//		} else {
//			// Append to file
//		}
//		
//		setFilePath(file); //TODO: actually, this should point to the filepath of the saved content, not this XML file
//		
//		var url = getUrl();
//		var title = getTitle();
//		var filepath = getFilePathText();
//		//TODO: SAVETHETAGS!
//		var tags = _tags[_tags.length-1]; // TODO: get all tags
//		var comment = _comments[_comments.length-1].getContent(); // TODO: get all comments
//
//
//		var doc = document.implementation.createDocument("", "", null);
//
//		var entriesElem = doc.createElement("entries");
//		var entryElem = doc.createElement("entry");
//		var tagsElem = doc.createElement("tags");
//		var titleElem = doc.createElement("title");
//		var urlElem = doc.createElement("url");
//		var filepathElem = doc.createElement("filepath");
//		var commentsElem = doc.createElement("comments");
//		var thisCommentElem = doc.createElement("comment");
//
//		entriesElem.setAttribute("user", "me"); //TODO: remove!
//		entryElem.setAttribute("id", "1");
//		thisCommentElem.setAttribute("time", "12"); //TODO: actual time
//		thisCommentElem.setAttribute("date", "12"); //TODO: actual date
//
//		var titleElemText = doc.createTextNode(title);
//		var urlElemText = doc.createTextNode(url);
//		var filepathElemText = doc.createTextNode(filepath);
//		var thisCommentElemText = doc.createTextNode(comment); // TODO: get all comments
//
//		entryElem.appendChild(tagsElem);
//		titleElem.appendChild(titleElemText);
//		entryElem.appendChild(titleElem);
//		urlElem.appendChild(urlElemText);
//		entryElem.appendChild(urlElem);
//		filepathElem.appendChild(filepathElemText);
//		entryElem.appendChild(filepathElem);
//		thisCommentElem.appendChild(thisCommentElemText);
//		commentsElem.appendChild(thisCommentElem);
//		entryElem.appendChild(commentsElem);
//		entriesElem.appendChild(entryElem);
//		doc.appendChild(entriesElem);
//		
//
//		var serializer = new XMLSerializer();
//		// The actual string that is written to file
//		// var data = url + newLine + comment;
//		var data = serializer.serializeToString(doc);
//		
//		// file is nsIFile, data is a string
//		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
//								 .createInstance(Components.interfaces.nsIFileOutputStream);
//
//		// use 0x02 | 0x10 to open file for appending.
//		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
//		foStream.write(data, data.length);
//		//serializer.serializeToStream(doc, foStream, "");
//		foStream.close();
//	}
//
//	function readFromFile() {
//
//	}

}

function Comment(content, date, time) {
	var _content = content;
	var _date = date;
	var _time = time;

	this.getContent = getContent;

	function getContent() {
		return _content;
	}
}