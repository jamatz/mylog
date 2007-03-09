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

	this.testGetComments = function() {
		//Already has one comment added from setUp
		//comment[0] = "First Comment";
		//getComments returns an array of Comment objects
		//Each comment object has a string with the content
		//of the comment and the date
		
		var secondComment = "Second comment";
		var thirdComment = "Third comment";
		entry.addComment(secondComment);	
		entry.addComment(thirdComment);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 3);
		this.assertEquals(commentsReturned[0].getContent(), "First comment");
		this.assertEquals(commentsReturned[1].getContent(), "Second comment");
		this.assertEquals(commentsReturned[2].getContent(), "Third comment");
	}
	
	this.testRemoveComments = function() {
		//Already has one comment added from setUp
		//comment[0] = "First Comment";
		
		//This should not remove a comment at all or
		//even give an error message
		entry.removeCommentAt(-1);
		this.assertEquals(entry.getComments().length, 1);

		//Boundary Value Analysis
		//This should remove the first comment				
		entry.removeCommentAt(0);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 0);

		//These should remove arbitary comments and
		//check to make the comments array is the correct length
		//and the unremoved comments are still there
		//It will also check for boundary values
		entry.addComment("First comment");		
		entry.addComment("Second comment");		
		entry.addComment("Third comment");

		entry.removeCommentAt(3);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 3);
		
		entry.removeCommentAt(1);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 2);
		this.assertEquals(commentsReturned[0].getContent(), "First comment");
		this.assertEquals(commentsReturned[1].getContent(), "Third comment");

		entry.removeCommentAt(1);
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 1);
		this.assertEquals(commentsReturned[0].getContent(), "First comment");

		entry.removeCommentAt(-1);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 1);

		entry.removeCommentAt(1);		
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 1);
		
		entry.removeCommentAt(0);
		commentsReturned = entry.getComments();
		this.assertEquals(commentsReturned.length, 0);

	
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