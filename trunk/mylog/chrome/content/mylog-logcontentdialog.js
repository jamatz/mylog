// *** bcho2, ebluhm: 02-06-2007: Moved code from mylog-logcontentdialog.xul to mylog-logcontentdialog.js.
// *** bcho2, ebluhm: 02-06-2007: Fixed bug with Add Tag/Remove Tag.

var selectedTags = new Array();

//  Modified by Bryan Early and Soumi Sinha on December 5, 2006. - fills tag menu.
function filltextboxes() {
	var doc = window.arguments[0];
	var url = doc.URL;
	var title = doc.title;

	document.getElementById('mylog-url').setAttribute('value',url);
	document.getElementById('mylog-title').setAttribute('value',title);

	fillTagMenu();
}

//	Added by Bryan Early and Soumi Sinha on December 5, 2006.
//	This function will add the tag menupopup item to the document.
function fillTagMenu() {
	var menuPopup = createTagMenupopup();
	var menuItem = document.createElement("menuitem");
	menuItem.setAttribute( "label" , "Create New Tag");
	menuItem.setAttribute( "value" , "new tag");
	menuItem.setAttribute( "id" , "mylog-createTag");
	menuPopup.appendChild(menuItem);
	document.getElementById("mylog-tags").appendChild(menuPopup);
}

function doOK()
{	
	var doc = window.arguments[0];
	var url = document.getElementById("mylog-url").value;
	// alert(url);
	var title = document.getElementById("mylog-title").value;
	// alert(title);
//	var tags = new Array();
//	var tagElems = document.getElementById("mylog-currentTagsPopup").childNodes;
//	var i = 0;
//	while (i != tagElems.length) {
//		tags.push(tagElems[i].value);
//		i++;
//	}
	var tags = selectedTags;
	// alert(tags);
	var comment = document.getElementById("mylog-comments").value;
	// alert(comment);
	handleLogContentSubmission(url, title, tags, comment, doc);
	return true;
}

function doCancel()
{
  return true;
}


//	Added by Bryan Early on December 6, 2006.
//	This function will add a tag to the current tags.
function addTag() {
	var tag = document.getElementById("mylog-tags").value
	if (tag == "new tag")
	{
		tag = createTag();
		if (tag == null) {
			return;
		}
	}
	var menuItem = document.createElement("menuitem");
	menuItem.setAttribute( "label" , tag);
	menuItem.setAttribute( "value" , tag);
	menuItem.setAttribute( "id" , "mylog-remove-" + tag);
	selectedTags.push(tag);
	document.getElementById("mylog-currentTagsPopup").appendChild(menuItem);
	menuItem.selectedIndex = -1;
}

//	Added by Bryan Early on December 6, 2006.
//	This function will remove a tag from the current tags.
function removeTag() {
	var tag = document.getElementById("mylog-currenttags").value;
	var menuElem = document.getElementById("mylog-currentTagsPopup");
	var tagElem = document.getElementById("mylog-remove-" + tag);
	for (var i = 0; i < selectedTags.length; i++) {
		if (selectedTags[i] == tag) {
			selectedTags.splice(i,1);
		}		
	}
	menuElem.removeChild(tagElem);
	menuElem.selectedItem = -1;
}

//	Added by Bryan Early and Soumi Sinha on December 6, 2006.
//	This function will create a new tag and return it.
function createTag() {
	var tag = prompt("Enter new tag name:", "");
	if (tag == null) {
		return null;
	}
	var ret = handleAddTag(tag);
	if (ret) {
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute( "label" , tag);
		menuItem.setAttribute( "value" , tag);
		menuItem.setAttribute( "id" , "mylog-remove-" + tag);
		var refItem = document.getElementById("mylog-createTag");
		document.getElementById("mylog-tagsMenuPopup").insertBefore(menuItem, refItem);
		return tag;
	}
}