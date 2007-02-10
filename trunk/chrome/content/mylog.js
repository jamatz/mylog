// Created by Brian Cho and Soumi Sinha on December 1, 2006.
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
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	window.openDialog("chrome://mylog/content/mylog-searchwindow.xul","mylog-searchwindow",
		"chrome", dataStore, dataHandler);
}

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function handleLogContentSubmission(url, title, tags, comment) {
	var le = new LogEntry();
	le.setUrl(url);
	le.setTitle(title);
	for (var i = 0; i < tags.length; i++) {
		le.addTag(tags[i]);
	}
	le.addComment(comment);

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	dataHandler.addEntry(le);
	dataStore.close(dataHandler);
}

//	Created by Josh Matz and Eric Bluhm on December 6, 2006.
function handleAddTag(tag) {

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var wasAdded = dataHandler.addTag(tag);
	dataStore.close(dataHandler);

	return wasAdded;
}

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
// Class LogEntry
function LogEntry() {
	var _url;
	var _title;
	var _tags = new Array();      //Array of strings
	var _comments = new Array();  //Array of Comments
	var _filePath;
	var _date;
	var _time;
	var _id; /* int (not string) */

	this.getUrl = getUrl;
	this.setUrl = setUrl;
	this.getTitle = getTitle;
	this.setTitle = setTitle;
	this.getFilePath = getFilePath;
	this.getFilePathText = getFilePathText;
	this.setFilePath = setFilePath;
	this.getId = getId;
	this.setId = setId;

	this.getTags = getTags;
	this.addTag = addTag;
	this.getComments = getComments;
	this.addComment = addComment;

	this.setFromDomNode = setFromDomNode;

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

	function getId() {
		return _id;
	}

	function setId(id) {
		_id = id;
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
		var dateVar = new Date();
		var year = dateVar.getYear() + 1900;
		var month = dateVar.getMonth() + 1;
		var dateStr = year + "/" + month + "/" + dateVar.getDate();
		var timeStr = dateVar.getHours() + ":";
		if(dateVar.getMinutes() < 10){
			timeStr = timeStr+"0";
		}
	    timeStr = timeStr + dateVar.getMinutes();
		var c = new Comment(comment, dateStr, timeStr);
		_comments.push(c);

	}

	function setFromDomNode(domNode) {
        if(domNode.nodeName != "entry") {
            if(this._debug == "true") {
                dump("Node to turn into bookmark is not an <entry> node!");
            }
            this._throwException("Invalid DOM node for bookmark creation");
        } else {
            // Iterate across the entry's childnodes, setting the values correspondingly
			var idstr = domNode.getAttribute("id");
			_id = idstr * 1; // convert string to int
            for (var i=0; i<domNode.childNodes.length; i++) {
				var entryNode = domNode.childNodes[i];
                if(entryNode.nodeName == "title") {
                    _title = entryNode.childNodes[0].nodeValue;
                } else if(entryNode.nodeName == "url") {
                    _url = entryNode.childNodes[0].nodeValue;
                } else if(entryNode.nodeName == "filepath") {
                    _filePath = entryNode.childNodes[0].nodeValue;
                } else if(entryNode.nodeName == "entrytags") {
                	_addTagsFromDomNode(entryNode);

                } else if(entryNode.nodeName == "comments") {
                	_addCommentsFromDomNode(entryNode);
                }
            }
        }
    }
    
    function _addTagsFromDomNode(entryNode) {
		for (var j = 0; j < entryNode.childNodes.length; j++) {
			var entryTagNode = entryNode.childNodes[j];
			if (entryTagNode.nodeName == "entrytag") {
				addTag(entryTagNode.getAttribute("name"));
			}
		}
    }
    
    function _addCommentsFromDomNode(entryNode) {
		for (var j = 0; j < entryNode.childNodes.length; j++) {
			if (entryNode.childNodes[j].childNodes[0]) {
				var comment = new Comment(entryNode.childNodes[j].childNodes[0].nodeValue,
					entryNode.childNodes[j].getAttribute("date"),
					entryNode.childNodes[j].getAttribute("time"));
				_comments.push(comment);
			}
		}
    }

}

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function Comment(content, date, time) {
	var _content = content;
	var _date = date;
	var _time = time;

	this.getContent = getContent;
	this.getDate = getDate;
	this.getTime = getTime;

	function getContent() {
		return _content;
	}
	
	function getDate() {
		return _date;
	}
	
	function getTime() {
		return _time;
	}
}