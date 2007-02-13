// *** bcho2, ebluhm: 02-06-2007: Moved code from mylog-logEditor.xul to mylog-logEditor.js.

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
	if(tagArray){
		Tags = tagArray[0];
		var i = 0;
		i++;
		if(i != tagArray.length){
			Tags = Tags + ", " + tagArray[i];
			i++;
		}
	}

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

function doAddComment(){
	var logEntry = window.arguments[0];
	var newComment = document.getElementById("mylog-add-comments").value;
	logEntry.addComment(newComment);
	// alert(newComment);
	dataHandler.replaceEntry(logEntry);
	fillComments(logEntry);
	return true;
}

function fillComments(logEntry) {
	var comments = "";
	var commentArray = logEntry.getComments();
	if(commentArray){
		for (var i = 0; i < commentArray.length; i++) {
			comments = comments + commentArray[i].getDateString() +" "+ commentArray[i].getTimeString() +"\n"+ commentArray[i].getContent() + "\n\n";
		}
//			var i = 0;
//			i++;
//			if(i != commentArray.length){
//				Comments = Comments + ", " + commentArray[i].getContent();
//				i++;
//			}
	}
	
	// alert(Comments);

	document.getElementById('mylog-comments').setAttribute('value',comments);
}
