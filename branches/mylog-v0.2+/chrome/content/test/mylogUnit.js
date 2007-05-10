// String msg is optional
function assertEquals(arg1, arg2, msg) {
	if (!msg) {
		msg = "";
	} else {
		msg = msg + "; "
	}
	if(!(arg1 === arg2)) {
		alert(msg + "not equal: " + arg1 + ", " + arg2);
		return false;
	}
	return true;
}