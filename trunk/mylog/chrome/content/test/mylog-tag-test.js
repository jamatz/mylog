    function MyLogTestCase() {
        this.name = 'MyLogTestCase';
        var handler,storage,entry;
        this.setUp = function() {
            /* not in use here, didn't have to define it but this might be
        used as a reference
        */
            storage = new XmlDataStore();
            storage.setXmlFilepath("mylog-tag-test.xml");
            handler = storage.open();
            entry = handler.getEntry(0);        
        }
    
    	this.testAddTags = function() {
    		//The DOM object should already have these tags
    		//"blah", "Google", "blank"
    		//Our tests try to add existing tags
    		//and add new tags. Duplicate tags are 
    		//not allowed
    		
     		this.assertFalse(handler.addTag("blah"));           
     		this.assertFalse(handler.addTag("Google"));           
     		this.assertFalse(handler.addTag("blank"));           
	 		this.assertFalse(handler.addTag(""));           

     		this.assertTrue(handler.addTag("bleh"));           
     		this.assertTrue(handler.addTag("Yahoo"));           
     		this.assertTrue(handler.addTag("full"));           
     
        }
        
        this.testRemoveEntries = function() {
    		//The DOM object should already have these entries
    		//with corresponding IDs 0,1,2,3
    		//Our tests try remove the existing entries
    		//and remove entries with IDs that exist

     		this.assertFalse(handler.removeEntry(-1));           
     		this.assertFalse(handler.removeEntry(4));           
     		
     		this.assertTrue(handler.removeEntry(0));            
    		this.assertFalse(handler.removeEntry(0));               
     		this.assertTrue(handler.removeEntry(1));           
       		this.assertFalse(handler.removeEntry(1));           
     		this.assertTrue(handler.removeEntry(2));           
     		this.assertFalse(handler.removeEntry(2));           
     		this.assertTrue(handler.removeEntry(3));           
    		this.assertFalse(handler.removeEntry(3));           
    		
        }
    
        this.testGetAllTags = function() {
            var msg = "testGetAlltags";
            var tags = handler.getAllTags();
            var correctTags = ["blah", "Google", "blank"];
            var passed = 1;
            for (var i = 0; i < Math.max(tags.length, correctTags.length); i++) {
                    this.assertEquals(tags[i], correctTags[i]);
            }
        }
    
        this.testTagSearch1 = function() {
            var keyword = "blah";
            var correctEntryList = [0, 2, 3];
            var entryList = handler.findEntries(keyword,"tag");
            for (var i=0; i < Math.max(entryList.length, correctEntryList.length); i++) {
                    this.assertEquals(entryList[i].getId(), correctEntryList[i]);
            }
        }
    
        this.testTagSearch2 = function() {
            keyword = "Google";
            correctEntryList = [1];
            var entryList = handler.findEntries(keyword,"tag");
            for (var i=0; i < Math.max(entryList.length, correctEntryList.length); i++) {
                    this.assertEquals(entryList[i].getId(), correctEntryList[i]);
            }
        }
    
        this.testTagSearch3 = function() {
            keyword = "nothing";
            correctEntryList = [];
            var entryList = handler.findEntries(keyword,"tag");
            this.assertEquals(entryList.length,0);
        }

	    this.testSetTagAt = function() {
			entry.setTagAt(0,'New Tag');
			newTag = entry.getTags()[0];
			this.assertEquals(newTag, 'New Tag');
		}
	
		this.testRemoveTagAt = function() {
			entry.removeTagAt(0);
			newTags = entry.getTags();
			this.assertEquals(newTags.length, 0);
			
	        entry = handler.getEntry(3);     
	        entry.removeTagAt(1);			
	        newTags = entry.getTags();
			this.assertEquals(newTags.length, 1);
	        
		}
    
        this.tearDown = function() {
            /* not in use here, didn't have to define it but this might be
                used as a reference
            */
            storage.setXmlFilepath("mylog-tag-test2.xml");
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