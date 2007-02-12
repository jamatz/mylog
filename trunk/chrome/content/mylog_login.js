// LogIn Functionality
//
// Eric Bluhm
// Bryan Early
// Created November 27, 2006.
// Modified November 28, 2006.
// Modified November 30, 2006.
// Modified December 1, 2006.

function BeginLogIn(){

	var done = false;
	var username = '';
	while(!done)
	{
		username = prompt('Username:', ' ');
		var regexp = /\W/;

		var position = username.search(regexp);

		if(position == -1)
			done = true; 
	}
        password = prompt('Password:', ' ');

 	LogIn(username, password);
}

function LogIn(username, password)
{

	// find profile directory
	var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
	file.append("users.xml");
	var filepath = "file:///" + file.path;

    var xmlDoc = Sarissa.getDomDocument();
    xmlDoc.async = false; 

	var objNodeList;
	// populate the DOM Document using a remote file
	xmlDoc.load(filepath);
	
    // the following two lines are needed for IE
	xmlDoc.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
	xmlDoc.setProperty("SelectionLanguage", "XPath");
  
	var xpathStr = "/users/user[name='"+username+"']";
  
    var objNodeList = xmlDoc.documentElement.selectNodes(xpathStr);
    //alert("results list is " + objNodeList.length);

    if(objNodeList.length > 0) 
    {
      var correctPass = objNodeList[0].getElementsByTagName("password").item(0).childNodes[0].nodeValue;
    
      if(correctPass == password)
      {
	   alert("LOG IN SUCCESSFUL");
	   return true;
      }
      else
      {
        alert("incorrect password");
		return false;
      }
    }
    else
    {
	   alert("invalid username");
	   return false;
    }	
}

//User Class
function User()
{
	var username = '';
	var directory = '';
	
	this.getUsername = getUsername;
	this.getDirectory = getdirectory;
	
	function getUsername()
	{	
		return username;
	}

	function getDirectory()
	{	
		return directory;
	}

	function setUsername(theUsername)
	{	
		username = theUsername;
	}

	function setDirectory(theDirectory)
	{	
		directory = theDirectory;
	}
}