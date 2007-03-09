// This test for a search that should return 2 results
    function MyLogTestCase() {
        this.name = 'MyLogTestCase';
        var handler,storage;
        this.setUp = function() {
            /* not in use here, didn't have to define it but this might be
        used as a reference
        */
            storage = new XmlDataStore();
            storage.setXmlFilepath("mylog-title-search-test.xml");
            handler = storage.open();
        };
    
        this.testSearch1 = function() {
            var title = "CNN";
            var searchType = "title"
           
            var returnList = handler.findEntries(title,searchType);
            this.assertEquals(returnList.length, 2);
        };
    
        this.testSearch2 = function() {
            var title = "IGN";
            var searchType = "title"
          
            var returnList = handler.findEntries(title,searchType);
            this.assertEquals(returnList.length, 1);
        };
    
         this.testSearch3 = function() {
            var title = "zzzzzzzzzzzz";
            var searchType = "title"
         
            var returnList = handler.findEntries(title,searchType);
            this.assertEquals(returnList.length, 0);
        };
    
        this.testSearch4 = function() {
            var title = "News";
            var searchType = "tag"
         
            var returnList = handler.findEntries(title,searchType);
            this.assertEquals(returnList.length, 0);
        };
    
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