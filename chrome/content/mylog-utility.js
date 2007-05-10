// *** bearly, thpark2: 04-15-2007: Changed fileToString to support Unicode.
// *** bearly, vviswana: 03-07-2007: Initial creation. Added fileToString, stringToFile, logMsg, and createDirectory.

var MYLOG_ID = "mylog@uiuc.edu";

// fileObject is an nsIFile
function fileToString(fileObject) {
	var data = "";
	try {
		// Read file to string (data)

		var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
								.createInstance(Components.interfaces.nsIFileInputStream);
		fstream.init(fileObject, -1, 0, 0);
		/*
		var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
								.createInstance(Components.interfaces.nsIScriptableInputStream);
		sstream.init(fstream); 
	
		var str = sstream.read(4096);
		while (str.length > 0) {
		  data += str;
		  str = sstream.read(4096);
		}
	
		sstream.close();
		fstream.close();
		*/
		
		var charset =  "UTF-8";
		const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
		var is = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
		                   .createInstance(Components.interfaces.nsIConverterInputStream);
		is.init(fstream, charset, 1024, replacementChar);
		
		var str = {};
		while (is.readString(4096, str) != 0) {
		  data += str.value;
		}
		
		return data;
	}	catch(e) {
		logMsg("Exception caught in fileToString(): " + e);
		return "";
	}
}

function stringToFile(fileObject,dataString) {
	try {
		// file is nsIFile, data is a string
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		                         .createInstance(Components.interfaces.nsIFileOutputStream);
		
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(fileObject, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
		foStream.write(dataString, dataString.length);
		foStream.close();
	} catch(e) {
		logMsg("Exception caught in stringToFile(): " + e);
		return "";
	}
}

function pathExists(path) {
    var dirObject = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);

    dirObject.initWithPath(path);
    return dirObject.exists();
}

// dirObject is an nsIFile object
// Directory will only be created if it doesn't already exist
function createDirectory(dirObject) {
	try {
		if( !dirObject.exists() || !dirObject.isDirectory() ) {   // if it doesn't exist, create
		  dirObject.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0700);
		}
	}catch(e) {
		logMsg("Exception caught in createDirectory(): " + e);
	}
}

function createDirectoryFromPath(dirPath) {
    try {
        var dirObject = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
        dirObject.initWithPath(dirPath);
        createDirectory(dirObject);
    }catch(e) {
        logMsg("Exception caught in createDirectory(): " + e);
    }
}

function createSubDirectoryFromPath(parentPath,subPath) {
    try {
        createDirectoryFromPath(parentPath);
        var dirObject = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
        dirObject.initWithPath(parentPath);
        dirObject.append(subPath);
        createDirectory(dirObject);
    } catch(e) {
        logMsg("Exception caught in createSubDirectoryFromPath: " + e);
    }
}

function copyFilePath(fromPath,toPath,newName) {
    try {
        var dirObject = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
        var destDirObject =  Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);               
                        
        dirObject.initWithPath(fromPath);
        destDirObject.initWithPath(toPath);
        
        //logMsg("copying " + dirObject.path + " to " + destDirObject.path);
        dirObject.copyTo(destDirObject,newName);
    }catch(e) {
        logMsg("Exception caught in copyFilePath: " + e);
    }
}

function removePath(path) {
    try {
        if(pathExists(path)) {
            var dirObject = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);
            dirObject.initWithPath(path);
            dirObject.remove(true);
        }
    }catch(e) {
        logMsg("Exception in removePath:" + e);
    }
}

function getFullFilePath(parentPath,subPaths) {
    var dirObject = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    dirObject.initWithPath(parentPath);

    if(typeof(subPaths)!="undefined") {
        for(var i=0;i<subPaths.length;i++) {
            //logMsg("subpath:" + subPaths[i]);
            dirObject.append(subPaths[i]);
        }
    }

    return dirObject.path;
}

function pathToFileObject(path) {
    var dirObject = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
    dirObject.initWithPath(path);
    return dirObject;
}

function logMsg(msg) {
	try {
	  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
	                                 .getService(Components.interfaces.nsIConsoleService);
	  consoleService.logStringMessage(msg);
	}catch(e) {
		alert("Exception caught in logMsg(): " + e);
	}
}

/************************************************************************************************************** 
			 The following comes from the Firefox extension, Extension Developer's Extension, and it comes
             from the .xpi file creation section
**************************************************************************************************************/

/*
 * zipUtil object to contain info about an installed
 * zip utility.
 */
function zipUtil(type, exePath, scriptPath, noComp, maxComp, extraArgs){
  this.zipType = type;
  this.zipExe = exePath;
  this.zipScript = getFileFromExtensionDir(MYLOG_ID, scriptPath);
  this.NO_COMPRESSION = noComp;
  this.MAX_COMPRESSION = maxComp;
  this.EXTRA_ARGS = extraArgs;
}

zipUtil.prototype = {
  /*
   * Create zipFile by adding filesToAdd from workingDir,
   * with boolean indicating compression.
   *
   * Return true for success, false for failure.
   */
  createZip: function(workingDir, zipFile, filesToAdd, compression) {
    var compressarg = compression ? 
      this.MAX_COMPRESSION : this.NO_COMPRESSION;
    var opts = compressarg;
    //var opts = this.EXTRA_ARGS || [];
    //opts = opts.push([compressarg]).join(' ');
    var args = [this.zipExe, workingDir, opts, zipFile].concat(filesToAdd);
    if(this.zipScript.exists() && this.zipScript.isExecutable()) {
      var proc = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
      proc.init(this.zipScript);
      proc.run(true, args, args.length);
      // return whether the zip file exists
      var zf = pathToFileObject(zipFile);
      return zf.exists();
    }
    else {
      logMsg("zip script not found or not executable");
      return false;
    }
  },

  toString: function() {
    return "[zipUtil " + this.zipType + "]";
  }
}

/*
 * Return a usable zipUtil.  Save the result
 * if we have to call determineZipUtil
 */
function getZipUtil() {
  var gZipUtil = determineZipUtil();
  return gZipUtil;
}

/*
 * Figure out what zip program is available and where it resides.
 * Returns a zipUtil object or null.
 */
function determineZipUtil(){
  var zfile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
  var zpath;
  /*
   * For Windows, we look for various zip programs
   * by looking in the Windows registry.
   */
  if(navigator.platform == "Win32") {
    // look for cygwin zip
    zpath = getRegKey("HKCU", "Software\\Cygnus Solutions\\Cygwin\\mounts v2\\/", "native") || getRegKey("HKLM", "Software\\Cygnus Solutions\\Cygwin\\mounts v2\\/", "native");
      
    if(zpath) {
      zfile.initWithPath(zpath);
      zfile.append("bin");
      zfile.append("zip.exe");

      if(zfile.exists()) {
        dump("found cygwin zip: " + zfile.path + "\n");
        return new zipUtil("Cygwin Zip",
                           zfile.path,
                           "cygzip.bat",
                           "-0",
                           "-9");
      }
    }

    // look for winzip command line addon
    zpath = getRegKey("HKCU", "Software\\Nico Mak Computing\\WinZip\\Add-Ons\\WZCLINE");
    if(zpath) {
      zfile = fileFromPath(zpath).parent;
      zfile.append("wzzip.exe");
      if(zfile.exists()) {
        dump("found WinZip: " + zfile.path + "\n");
        return new zipUtil("WinZip Commandline Addon",
                           zfile.path,
                           "wzcline.bat",
                           "-e0",
                           "-ex");
      }
    }

    // look for WinRAR
    zpath = getRegKey("HKCR", "WinRAR\\shell\\open\\command", "");
    if(zpath) {
      zpath = zpath.replace(/ +"%1" *$/, '').replace(/\"/g, '');
      zfile.initWithPath(zpath);
      if(zfile.exists()) {
        dump("found WinRAR: " + zpath + "\n");
        return new zipUtil("WinRAR",
                           zpath,
                           "winrar.bat",
                           "-m0",
                           "-m5");
      }
    }

    // look for winzip
    zpath = getRegKey("HKCR", "Applications\\winzip32.exe\\shell\\open\\command\\", "") || getRegKey("HKCR", "WinZip\\shell\\open\\command\\", "");
    if(zpath) {
      zpath = zpath.replace(/ +"%1" *$/, '');
      zfile.initWithPath(zpath);
      if(zfile.exists()) {
        dump("found WinZip: " + zpath + "\n");
        return new zipUtil("WinZip",
                           zpath,
                           "winzip.bat",
                           "-e0",
                           "-ex");
      }
    }

    // look for 7-Zip
    zpath = getRegKey("HKLM", "SOFTWARE\\7-Zip", "Path");
    if(zpath) {
      zfile.initWithPath(zpath);
      zfile.append("7z.exe");
      if(zfile.exists()) {
        dump("found 7-Zip: " + zpath + "\n");
        return new zipUtil("7-Zip",
                           zfile.path,
                           "7zip.bat",
                           "-mx0",
                           "-mx9");
      }
    }

    // win32, but no supported zip program
    return null;
  }

    //logMsg("checking linux path");
  // see if we have zip in our path
  var env = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment);
  var paths = env.get("PATH").split(':');
  for(i=0;i<paths.length;i++) {
   
    try {
      zfile.initWithPath(paths[i]);
      zfile.append("zip");
      //logMsg("trying program path: " + zfile.path);
      if(zfile.exists() && zfile.isExecutable()) {
        //logMsg("found zip prog");
        return new zipUtil("Unix Zip",
               zfile.path,
               "zip.sh",
               "-0",
               "-9");
      }
       
    }
    catch(e) {
        logMsg("Exception:" + e);
    }
  }

  //FIXME: handle other platforms gracefully?
  return null;
}

/*
 * Given an extension id, get a file from its installed directory
 */
function getFileFromExtensionDir(id, filename)
{
  if('@mozilla.org/extensions/manager;1' in Components.classes) {
    // Firefox 1.5+
    var em = Components.classes['@mozilla.org/extensions/manager;1']
                       .getService(Components.interfaces.nsIExtensionManager);
    var il = em.getInstallLocation(id);
    if(il == null)
      return null;

    var d = il.getItemLocation(id);
    d.append(filename);
    return d;
  }
  else {
    // Possibly FF <= 1.0 or SM
    // look in profile dir
    var directoryService=Components.classes['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties);
    var profD = directoryService.get('ProfD', Components.interfaces.nsILocalFile);
    var file = profD.clone();
    // try profile/extensions/id first
    file.append('extensions');
    file.append(id);
    file.append(filename);
    if(file.exists()) {
      return file;
    }
    else {
      // try the profile chrome dir
      file = profD.clone();
      file.append('chrome');
      file.append(filename);
      if(file.exists())
        return file;

      // ok, last ditch effort, try the app dir
      file = directoryService.get('AChrom', Components.interfaces.nsILocalFile);;
      file.append(filename);
      if(file.exists())
        return file;
    }
  }
  // ouch.
  return null;
}

function getProfileDirectory(){
    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
                 .getService(Components.interfaces.nsIProperties)
                 .get("ProfD", Components.interfaces.nsIFile);
    return dir.path;       
}