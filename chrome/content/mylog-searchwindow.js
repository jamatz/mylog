/**********************************************************************************
* File: BookmarkRetrieval.js
* Contains interface for searching through bookmarks
*
* Revision History:
* Date            Author                        Comment
* 12/1/2006   Vinayak Viswanathan   Creating BookmarkGopher (thanks Bryan...) 
*                                                      class to search for bookmarks                                                        
* 11/29/2006 - Vinayak Viswanathan - Initial file creation; adding QueryBookmarksInFile()
***********************************************************************************/


var dataStore;
var dataHandler;

function handleSearchRequest() {
    var keyword = document.getElementById("some-text").value;
    var searchType = document.getElementById("search-type").selectedItem.value;
    //alert("Received user input");

	dataStore = new XmlDataStore();
	dataHandler = dataStore.open();
	//alert("DataHandler open()ed");
	var entryList = dataHandler.findEntries(keyword,searchType);
	//alert("DataHandler findEntries() run");
    if(entryList.length > 0) {
        // alert(entryList.length);
		displayResults(entryList);
    }
    
    /*var resultList = QueryBookmarksInFile(keyword,searchType,"mylogformat.myLog");
    if(resultList.length > 0) {
        ShowResults(resultList);
    }*/
}

function handleResultClicked() {
	var id = document.getElementById('results-list').selectedItem.value;
	//alert(id);
	var logEntry = dataHandler.getEntry(id);
	//alert(logEntry.getTitle());
	window.openDialog("chrome://mylog/content/mylog-logEditor.xul","Log Entry Editor",
		"chrome",logEntry, dataStore, dataHandler);

}

function displayResults(resultList) {
    /*var heading = "(Title, URL): ";
    for(i=0;i<resultList.length;i++)
    {
        var bookmarkTitle = resultList[i].getElementsByTagName("title").item(0).childNodes[0].nodeValue;
        var bookmarkUrl =   resultList[i].getElementsByTagName("url").item(0).childNodes[0].nodeValue;
        //alert("Bookmark Title: " + bookmarkTitle);
        document.getElementById('results-list').appendItem(heading + "(" + bookmarkTitle + ", " + bookmarkUrl + ")", bookmarkTitle);
    }*/

    var heading = "(Title, URL): ";
    for(var i=0;i<resultList.length;i++) {
		var bookmarkTitle = resultList[i].getTitle();
		var bookmarkUrl = resultList[i].getUrl();
        // alert(bookmarkTitle + ", " + bookmarkUrl + ", " + resultList[i].getFilePathText());
		alert(resultList[i].getId());
		document.getElementById('results-list').appendItem(heading + "(" + bookmarkTitle + ", " + bookmarkUrl + ")", resultList[i].getId());
    }
}