        function TestTestCase() {
            this.name = 'TestTestCase';
            var le, dataStore, blankDataHandler;
            var url, title, tags, comment1, comment2, commment3, commments;
         
            this.setUp = function() {

				dataStore = new XmlDataStore();
				dataStore.setXmlFilepath("mylog-datastorage-test.xml"); // Shouldn't exist first time. We're starting from scratch.
				blankDataHandler = dataStore.open();
				dataStore.close(blankDataHandler);

				// Create default LogEntry
                url = "http://www.google.com";
                title = "Google search engine";
                tags = new Array("tag1","tag2","tag3");
                comments = new Array("comment1", "comment2", "comment3");

                le = new LogEntry();
                le.setUrl(url);
                le.setTitle(title);
                for (var i = 0; i < tags.length; i++) {
                        le.addTag(tags[i]);
                }
                for (var i = 0; i < comments.length; i++) {
                        le.addComment(comments[i]);
                }

//                var doc = document.implementation.createDocument("", "", null);
//                var entriesElem = doc.createElement("entries");
//                entriesElem.setAttribute("counter", "0");
//                doc.appendChild(entriesElem);
                
//                var dataHandler = dataStore.open();
//                dataHandler.addEntry(le);
//                dataStore.close(dataHandler);
            }

            this.testFindEntry = function() {
				var dataHandler = dataStore.open();
 
                uOfI = new LogEntry();
                uOfI.setUrl("http://www.uiuc.edu");
                uOfI.setTitle("U of I");
                
                tags = new Array("U","of","I");
                comments = new Array("school");
                
                for (var i = 0; i < tags.length; i++) 
                   uOfI.addTag(tags[i]);
                for (var i = 0; i < comments.length; i++) 
                   uOfI.addComment(comments[i]);
                   
				dataHandler.addEntry(uOfI);
				dataStore.close(dataHandler);
				
				var secondDataHandler = dataStore.open();
				var entries = secondDataHandler.findEntries("school","comment");
				
				this.assertEquals(entries.length, 1);
				this.assertEquals(uOfI.getUrl(), entries[0].getUrl());
				this.assertEquals(uOfI.getTitle(), entries[0].getTitle());
				this.assertEquals(uOfI.getTags(), entries[0].getTags());
				this.assertEquals(uOfI.getComments(), entries[0].getComments());
            }

           this.testGetEntry = function() {
				var dataHandler = dataStore.open();
                dataHandler.addEntry(le);
                dataStore.close(dataHandler);
                
				this.assertFalse(dataHandler.getEntry(1));
				
				var entry = dataHandler.getEntry(0);
				
				this.assertEquals(le.getUrl(), entry.getUrl());
				this.assertEquals(le.getTitle(), entry.getTitle());
				this.assertEquals(le.getTags(), entry.getTags());
				this.assertEquals(le.getComments(), entry.getComments());
            }
            

			this.testReplaceEntry = function() {
				var dataHandler = dataStore.open();
				dataHandler.addEntry(le);
				dataStore.close(dataHandler);
				
				var secondDataHandler = dataStore.open();
				var entries = secondDataHandler.getAllEntries();
				var newUrl = "http://newurl.com/";
				entries[0].setUrl(newUrl);
				secondDataHandler.replaceEntry(entries[0]);
				dataStore.close(secondDataHandler);
				
				var thirdDataHandler = dataStore.open();
				entries = thirdDataHandler.getAllEntries();
				this.assertEquals(entries.length, 1);
				this.assertEquals(entries[0].getUrl(), newUrl);
				this.assertEquals(le.getTitle(), entries[0].getTitle());
				this.assertEquals(le.getTags(), entries[0].getTags());
				this.assertEquals(le.getComments(), entries[0].getComments());
				this.assertEquals(entries[0].getId(), 0);

			}
            
            this.testRemoveEntry = function() {
				var dataHandler = dataStore.open();
				dataHandler.addEntry(le);
				dataStore.close(dataHandler);

				var secondDataHandler = dataStore.open();
				var entries = secondDataHandler.getAllEntries();
				var id = entries[0].getId();

				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 1);
				
				secondDataHandler.removeEntry(id);
				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 0);
				
				secondDataHandler.removeEntry(id); // Try removing again: should not crash
				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 0);

            }

            this.testRemoveEntry2 = function() {
				var dataHandler = dataStore.open();
				dataHandler.addEntry(le);

				uOfI = new LogEntry();
                uOfI.setUrl("http://www.uiuc.edu");
                uOfI.setTitle("U of I");
                
                tags = new Array("U","of","I");
                comments = new Array("school");
                
                for (var i = 0; i < tags.length; i++) 
                   uOfI.addTag(tags[i]);
                for (var i = 0; i < comments.length; i++) 
                   uOfI.addComment(comments[i]);
                   
				var secondEntry = dataHandler.addEntry(uOfI);
				dataStore.close(dataHandler);

				var secondDataHandler = dataStore.open();
				var entries = secondDataHandler.getAllEntries();
				var id = entries[0].getId();

				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 2);
				
				secondDataHandler.removeEntry(id);
				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 1);
				
				secondDataHandler.removeEntry(id); // Try removing again: should not crash
				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 1);

				secondDataHandler.removeEntry(secondEntry); // Try removing again: should not crash
				entries = secondDataHandler.getAllEntries();
				this.assertEquals(entries.length, 0);

            }

            
            this.tearDown = function() {
            	// dataStore.setXmlFilepath("mylog-tag-test2.xml");
				dataStore.close(blankDataHandler); // So we can start from scratch again.
            }
        }
        TestTestCase.prototype = new TestCase;

        function runTests() {
            placeholder = document.getElementById('placeholder');
            var testsuite = new TestSuite(new HTMLReporter(placeholder));
            testsuite.registerTest(TestTestCase);
            testsuite.runSuite();
        }