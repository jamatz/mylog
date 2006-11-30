function handleLogContentRequest() {

//	var user = logIn();

	var url;
	url = window.content.location.href;

//	alert(url);

	window.openDialog("chrome://mylog/content/mylog-logcontentdialog.xul","mylog-logcontentdialog",
		"chrome",url);

//	handleLogContentSubmission(url);
}

function handleLogContentSubmission(url, comment) {
	var le = new LogEntry();
	le.setUrl(url);
	le.addComment(comment);
	le.save();

	alert("Content saved.");
}

// Class LogEntry
function LogEntry() {
	var _url;
	var _tags;
	var _comments = new Array();
	var _filePath;
	var _date;
	var _time;

	this.getUrl = getUrl;
	this.setUrl = setUrl;
	this.getFilePath = getFilePath;
	this.setFilePath = setFilePath;

	this.addComment = addComment;

	this.save = save;
	this.readFromFile = readFromFile;

	function getUrl(url) {
		return _url;
	}

	function setUrl(url) {
		_url = url;
	}

	function getFilePath() {
		return _filePath;
	}

	function setFilePath(filePath) {
		_filePath = filePath;
	}

	function addComment(comment) {
		var c = new Comment(comment, "12", "12"); //TODO: get date and time
		_comments.push(c);

		// alert(_comments[_comments.length-1].getContent());
	}

	function save() {
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
							 .getService(Components.interfaces.nsIProperties)
							 .get("ProfD", Components.interfaces.nsIFile);
		file.append("testmylog.txt");
		alert(file.path);
		
		setFilePath(file);
		
		var title = "The title"; // TODO: get title
		//TODO: TAGS
		var url = getUrl();
		var filepath = "The filepath"; // TODO: get filepath
		var comment = _comments[_comments.length-1].getContent(); // TODO: get all comments


		var doc = document.implementation.createDocument("", "", null);

		var entriesElem = doc.createElement("entries");
		var entryElem = doc.createElement("entry");
		var tagsElem = doc.createElement("tags");
		var titleElem = doc.createElement("title");
		var urlElem = doc.createElement("url");
		var filepathElem = doc.createElement("filepath");
		var commentsElem = doc.createElement("comments");
		var thisCommentElem = doc.createElement("comment");

		entriesElem.setAttribute("user", "me"); //TODO: remove!
		entryElem.setAttribute("id", "1");
		thisCommentElem.setAttribute("time", "12"); //TODO: actual time
		thisCommentElem.setAttribute("date", "12"); //TODO: actual date

		var titleElemText = doc.createTextNode(title);
		var urlElemText = doc.createTextNode(url);
		var filepathElemText = doc.createTextNode(filepath);
		var thisCommentElemText = doc.createTextNode(comment); // TODO: get all comments

		entryElem.appendChild(tagsElem);
		titleElem.appendChild(titleElemText);
		entryElem.appendChild(titleElem);
		urlElem.appendChild(urlElemText);
		entryElem.appendChild(urlElem);
		filepathElem.appendChild(filepathElemText);
		entryElem.appendChild(filepathElem);
		thisCommentElem.appendChild(thisCommentElemText);
		commentsElem.appendChild(thisCommentElem);
		entryElem.appendChild(commentsElem);
		entriesElem.appendChild(entryElem);
		doc.appendChild(entriesElem);
		

		var serializer = new XMLSerializer();
		// The actual string that is written to file
		// var data = url + newLine + comment;
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

	function readFromFile() {

	}

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