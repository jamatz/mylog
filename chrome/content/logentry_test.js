function testSaveAndRead() {
	var alertLog = "";

	alertLog = "Testing LogEntry\n";
	
	var url = "http://www.goodurl.com/";

	var savingLogEntry = new LogEntry();
	savingLogEntry.setUrl(url);
	savingLogEntry.save();

	var loadingLogEntry = new LogEntry();
	loadingLogEntry.readFromFile(savingLogEntry.getFilePath());



	alertLog = alertLog + "Testing set/getUrl:\n";
	if (savingLogEntry.getUrl() === url) {
		alertLog = alertLog + "  Test succeeded.\n";
	} else {
		alertLog = alertLog + "  Test failed.\n";
	}

	alertLog = alertLog + "Testing url equality:\n";
	if (savingLogEntry.getUrl() === loadingLogEntry.getUrl()) {
		alertLog = alertLog + "  Test succeeded.\n";
	} else {
		alertLog = alertLog + "  Test failed.\n";
	}

	alert(alertLog);

}