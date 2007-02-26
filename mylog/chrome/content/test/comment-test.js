// This test for a search that should return 5 results
function MyLogTestCase() {
    this.name = 'MyLogTestCase';
    var handler,storage,entry,comments;
    this.setUp = function() {
        storage = new XmlDataStore();
        storage.setXmlFilepath("mylog-comment-test.xml");
        handler = storage.open();
        entry = handler.getEntry(0);
        comments = entry.getComments();
    }

	this.testGetDateString = function() {
		var origDateString = "2007/2/18";
		var dateString = comments[0].getDateString();
		this.assertEquals(origDateString, dateString);
	}
	
	this.testGetTimeString = function() {
		var origTimeString = "20:27";
		var timeString = comments[0].getTimeString();
		this.assertEquals(origTimeString, timeString);
	}

	this.testAddComment = function() {
		var currentDate = new Date();
		var origCommentString = "New comment added";
		entry.addComment(origCommentString);
		newComment = entry.getComments().pop();
		var equals = false;
		if (currentDate.getTime() - 10 < newComment.getDateParsableString() &&
		    currentDate.getTime() + 10 > newComment.getDateParsableString()) {
			equals = true;
		}
		this.assert(equals, "currentDate.getTime(): " + currentDate.getTime() +
		                    " newComment.getDateParsableString(): " + newComment.getDateParsableString());
		this.assertEquals(origCommentString, newComment.getContent());
	}
	
	this.testSetCommentAt = function() {
		var currentDate = new Date();
		entry.setCommentAt(0,'New Comment');
		newComment = entry.getComments().pop().getContent();
		this.assertEquals(newComment, 'New Comment');
	}
	
	this.testRemoveCommentAt = function() {
		entry.removeCommentAt(0);
		newComment = entry.getComments();
		this.assertEquals(newComment.length, 0);
	}

    this.tearDown = function() {
        /* not in use here, didn't have to define it but this might be
            used as a reference
        */
        storage.close(handler);
    };
};    
MyLogTestCase.prototype = new TestCase;

function runTests() {
    placeholder = document.getElementById('placeholder');
    var testsuite = new TestSuite(new HTMLReporter(placeholder));
    testsuite.registerTest(MyLogTestCase);
    testsuite.runSuite();
};