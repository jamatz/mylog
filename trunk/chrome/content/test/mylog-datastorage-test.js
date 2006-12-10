<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>ECMAUnit Tests</title>
    <script language="JavaScript" type="text/javascript" src="chrome://mylog/content/mylog.js"></script>
    <script language="JavaScript" type="text/javascript" src="chrome://mylog/content/mylog-datastorage.js"></script>
    <script language="JavaScript" type="text/javascript" src="chrome://mylog/content/mylog-searchwindow.js"></script>
    <script type="text/javascript" src="chrome://mylog/content/test/ecmaunit.js"> </script>
    <script type="text/javascript">
//<![CDATA[
       
        function TestTestCase() {
            this.name = 'TestTestCase';
            var dataStore;
         var dataHandler;
         
            this.setUp = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                dataStore = new XmlDataStore();
                dataHandler = dataStore.open();
            };
            this.testAssertEquals = function() {
              
                var entryList = dataHandler.findEntries("djfklasj;fkljsdk;fljsdf","comment");
                this.assertEquals(entryList.length, 0);
            };
            this.tearDown = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                dataStore.close(dataHandler);
            };
        };
        TestTestCase.prototype = new TestCase;

        function TestTestCase2() {
            this.name = 'TestTestCase2';
                    var dataStore;
         var dataHandler;
            this.setUp = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                dataStore = new XmlDataStore();
                dataHandler = dataStore.open();
            };
            this.testAssertEquals = function() {
                var entryList = dataHandler.findEntries("Suck","comment");
                this.assertEquals(entryList.length, 1);
            };

            this.tearDown = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                     dataStore.close(dataHandler);
            };
        };

        TestTestCase2.prototype = new TestCase;

        function TestTestCase3() {
            this.name = 'TestTestCase3';
                 var dataStore;
         var dataHandler;
            this.setUp = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                 dataStore = new XmlDataStore();
                dataHandler = dataStore.open();
            };
            this.testAssertEquals = function() {
                var entryList = dataHandler.findEntries("a","comment");
                this.assertEquals(entryList.length, 3);
            };
            this.tearDown = function() {
                /* not in use here, didn't have to define it but this might be
                used as a reference
                */
                dataStore.close(dataHandler);
            };
        };
        TestTestCase3.prototype = new TestCase;
        
        function runTests() {
            placeholder = document.getElementById('placeholder');
            var testsuite = new TestSuite(new HTMLReporter(placeholder));
            testsuite.registerTest(TestTestCase);
            testsuite.registerTest(TestTestCase2);
            testsuite.registerTest(TestTestCase3);
            testsuite.runSuite();
        }
//]]>
</script>
</head>

<body onload="runTests()">
<h3>EcmaUnit tests for EcmaUnit</h3>
<div id="placeholder"> </div>
</body>
</html>
