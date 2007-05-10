// *** bearly, vviswana: 03-07-2007: Created handleSearchContentRequest
// *** bearly, vviswana: 02-13-2007: Modified handleLogContentSubmission to call savePage.
// *** groupmeeting: 02-12-2007: refactored Comment object to use the javascript Date object

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
/*function handleLogContentRequest() {

	//	var user = logIn();

	var url;
	url = window.content.location.href;
	//	alert(url);

	var title;
	title = document.title;
	//	alert(title);

	window.openDialog("chrome://mylog/content/mylog-logcontentdialog.xul","mylog-logcontentdialog",
		"chrome",window.content.document);

	//	handleLogContentSubmission(url);
}*/

function handleLogContentRequest() {
	if (content.document.URL == 'about:blank') {
		return 0;
	}
	var id = handleLogContentSubmission(content.document.URL, content.document.title, new Array(), "", content.document);
	createThumbnail(content.document, id);
	dataHandler = dataStore.open();
	populateListbox();
	searchboxCallback(document.getElementById("SearchBox").value);
	var theListbox = document.getElementById("results-listbox");
	var currentEntry;
	for (var i = 0; i < theListbox.childNodes.length; i++) {
		currentEntry = theListbox.childNodes[i];
		
		if (currentEntry.value == id) {
			theListbox.scrollToIndex(i);
			theListbox.selectItem(currentEntry);
			handleResultClicked();
			break;
		}
	}
	
}


function handleSearchLogRequest() {
	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	window.openDialog("chrome://mylog/content/mylog-searchwindow.xul","mylog-searchwindow",
		"chrome", dataStore, dataHandler);
}


function handleExportRequest(store,handler) {
	var dataStore; 
	var dataHandler;
    
    if(typeof(store) == "undefined") {
        dataStore = new XmlDataStore();
    }
    else {
        dataStore = store;
    }
    
    if(typeof(handler) == "undefined") {
        dataHandler = dataStore.open();
    }
    else {
        dataHandler = handler;
    }
    
	window.openDialog("chrome://mylog/content/mylog-exportwindow.xul","mylog-exportwindow",
		"chrome", dataStore, dataHandler);
}


//function handleSearchContentRequest() {
//	var dataStore = new XmlDataStore();
//	var dataHandler = dataStore.open();
//	var keyword=prompt("Please enter your search keyword","");
//	dataHandler.findEntries(keyword,"content");
//	showResultsPage();
//}


// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function handleLogContentSubmission(url, title, tags, comment, doc) {
	var le = new LogEntry();
	le.setUrl(url);
	le.setTitle(title);
	for (var i = 0; i < tags.length; i++) {
		le.addTag(tags[i]);
	}
	
	le.addComment(comment);

	var dataStore = new XmlDataStore();
	var dataHandler = dataStore.open();
	var id = dataHandler.addEntry(le, doc);
	dataStore.close(dataHandler);
	return id;
}

//	Created by Josh Matz and Eric Bluhm on December 6, 2006.
function handleAddTag(tag) {
	var wasAdded = false;
	try {
		var dataStore = new XmlDataStore();
		var dataHandler = dataStore.open();
		wasAdded = dataHandler.addTag(tag);
		dataStore.close(dataHandler);
	} catch(e) {
		logMsg("Exception in handleAddTag(): " + e);
	}
	
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
	var _previewFilePath;
	var _date;
	var _time;
	var _id; /* int (not string) */

	this.getUrl = getUrl;
	this.setUrl = setUrl;
	this.getTitle = getTitle;
	this.setTitle = setTitle;
	this.getFilePath = getFilePath;
	this.getPreviewFilePath = getPreviewFilePath;
	this.getFilePathText = getFilePathText;
	this.setFilePath = setFilePath;
	this.setPreviewFilePath = setPreviewFilePath;
	this.getId = getId;
	this.setId = setId;

	this.getTags = getTags;
	this.addTag = addTag;
	this.setTagAt = setTagAt;
	this.removeTagAt = removeTagAt;
	this.removeTags = removeTags;

	this.getComments = getComments;
	this.removeComments = removeComments;
	this.addComment = addComment;
	this.addCommentObject = addCommentObject;
	this.setCommentAt = setCommentAt;
	this.removeCommentAt = removeCommentAt;

	this.setFromDomNode = setFromDomNode;
    this.clone = clone;
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
	
	function getPreviewFilePath() {
		return _previewFilePath;
	}

	function getFilePathText() {
		return _filePath.path;
	}

	function setFilePath(filePath) {
		_filePath = filePath;
	}
	
	function setPreviewFilePath(previewFilePath) {
		_previewFilePath = previewFilePath;
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
	
	function setTagAt(index, tag) {
		_tags[index] = tag;
	}

	function removeTagAt(index) {
		if((index > -1) && (index < _tags.length))
			_tags.splice(index,1);
	}
	
	function removeTags() {
		_tags = new Array();
	}

	function getComments() {
		return _comments;
	}

	function addComment(comment) {
		var dateVar = new Date();
		var c = new Comment(comment, dateVar);
		_comments.push(c);
	}
	
	function addCommentObject(commentObject) {
		var c = new Comment(commentObject.getContent(),commentObject.getDate());
		_comments.push(commentObject);
	}
	
	function setCommentAt(index, comment) {
		var dateVar = new Date();
		_comments[index] = new Comment(comment, dateVar);
	}

	function removeCommentAt(index) {
		if((index > -1) && (index < _comments.length))
			_comments.splice(index,1);
	}	
	
	function removeComments() {
		_comments = [];
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
				var dateObj = new Date();
				dateObj.setTime(entryNode.childNodes[j].getAttribute("date"));
				var comment = new Comment(entryNode.childNodes[j].childNodes[0].nodeValue,
					dateObj);
				_comments.push(comment);
			}
		}
    }

    function clone() {
        var newObject = new LogEntry();
        newObject.setId(_id);
        newObject.setTitle(_title);
        newObject.setUrl(_url);
        newObject.setFilePath(_filePath);
        newObject.setPreviewFilePath(_previewFilePath);
        newObject._tags = _tags.concat();
        newObject._comments = _comments.concat();
        
        return newObject;
    }
}

// Created by Brian Cho and Soumi Sinha on December 1, 2006.
function Comment(content, dateObj) {
	var _content = content;
	var _dateObj = dateObj;

	this.getContent = getContent;
	this.getDate = getDate;
	this.getDateString = getDateString;
	this.getTimeString = getTimeString;
	this.getDateParsableString = getDateParsableString;

	function getContent() {
		return _content;
	}
	
	function getDate() {
		return _dateObj;
	}
	
	function getDateString() {
		var year = _dateObj.getYear() + 1900;
		var month = _dateObj.getMonth() + 1;
		var dateString = year + "/" + month + "/" + _dateObj.getDate();
		return dateString;
	}
	
	function getTimeString() {
		var timeString = _dateObj.getHours() + ":";
		if(_dateObj.getMinutes() < 10){
			timeString = timeString+"0";
		}
	    timeString = timeString + _dateObj.getMinutes();
	    
	    return timeString;
	}
	
	function getDateParsableString() {
		return _dateObj.getTime();
	}
}