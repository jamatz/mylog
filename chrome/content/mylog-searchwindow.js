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



function handleSearchRequest() {
    var keyword = document.getElementById("some-text").value;
    var searchType = document.getElementById("search-type").value;

	var entryList = dataHandler.findEntries(keyword,searchType);
    if(entryList.length > 0) {
		displayResults(entryList);
    } else {
		clearResults();
	}
    
    /*var resultList = QueryBookmarksInFile(keyword,searchType,"mylogformat.myLog");
    if(resultList.length > 0) {
        ShowResults(resultList);
    }*/
}

function handleResultClicked() {
	var id = document.getElementById('results-list').selectedItem.value;
	var logEntry = dataHandler.getEntry(id);
	window.openDialog("chrome://mylog/content/mylog-logEditor.xul","Log Entry Editor",
		"chrome",logEntry, dataStore, dataHandler);

}

function displayResults(resultList) {
	clearResults();

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
		
		document.getElementById('results-list').appendItem(heading + "(" + bookmarkTitle + ", " + bookmarkUrl + ")", resultList[i].getId());
    }
}

// Created by Brian Cho and Soumi Sinha on December 9, 2006.
function clearResults() { 
	while (document.getElementById('results-list').getRowCount() > 0) {
		document.getElementById('results-list').removeItemAt(0);
	}
}
