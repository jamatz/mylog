// *** bcho2, ebluhm: 02-06-2007: Moved code from mylog-logEditor.xul to mylog-logEditor.js.
// *** jdelator, thpark2: 02-18-2007: Added functions setTagAt, removeTagAt, setCommentAt, removeCommentAt

var dataStore;
var dataHandler;

function filltextboxes(){
	var logEntry = window.arguments[0];
	dataStore = window.arguments[1];
	dataHandler = window.arguments[2];
	document.getElementById('mylog-url').setAttribute('value',logEntry.getUrl());
	document.getElementById('mylog-title').setAttribute('value',logEntry.getTitle());

	var Tags = "";
	var tagArray = logEntry.getTags();
	if(tagArray.length != 0){
		Tags = tagArray[0];
		var i = 0;
		i++;
		if(i != tagArray.length){
			Tags = Tags + ", " + tagArray[i];
			i++;
		}
	} 
	else
		Tags = "No tags are associated with this entry";
	document.getElementById('mylog-tags').setAttribute('value',Tags);
	fillComments(logEntry);

}

function doOK(){
	dataStore.close(dataHandler);
	return true;
}

function doCancel(){
	return true;
}

function setTitle(){
	var logEntry = window.arguments[0];
	var newTitle = document.getElementById("mylog-title-edit").value;
	logEntry.setTitle(newTitle);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function deleteTitle(){
	var logEntry = window.arguments[0];
	logEntry.setTitle("");
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function setURL(){
	var logEntry = window.arguments[0];
	var newURL = document.getElementById("mylog-url-edit").value;
	logEntry.setUrl(newURL);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function deleteURL(){
	var logEntry = window.arguments[0];
	logEntry.setUrl("");
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function setTagAt(index, newTag){
	var logEntry = window.arguments[0];
	logEntry.setTagAt(index, newTag);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function removeTagAt(index){
	var logEntry = window.arguments[0];
	logEntry.removeTagAt(index);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function addComment(){
	var logEntry = window.arguments[0];
	var newComment = document.getElementById("mylog-add-comments").value;
	logEntry.addComment(newComment);
	dataHandler.replaceEntry(logEntry);
	fillComments(logEntry);
	return true;
}

function setCommentAt(index, newComment){
	var logEntry = window.arguments[0];
	logEntry.setCommentAt(index, newComment);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function removeCommentAt(index){
	var logEntry = window.arguments[0];
	logEntry.removeCommentAt(index);
	dataHandler.replaceEntry(logEntry);
	filltextboxes();
	return true;
}

function fillComments(logEntry) {
	var comments = "";
	var commentArray = logEntry.getComments();
	if(commentArray){
		for (var i = 0; i < commentArray.length; i++) {
			comments = comments + commentArray[i].getDateString() +" "+ commentArray[i].getTimeString() +"\n"+ commentArray[i].getContent() + "\n\n";
		}
	}
	document.getElementById('mylog-comments').setAttribute('value',comments);
}
