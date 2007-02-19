Extension Installation
1. Check out code with an svn client using the command
	svn checkout http://mylog.googlecode.com/svn/trunk/ mylog
2. The files are in a directory [mylog-dir].
3. Find your Firefox Profile directory [profile-dir]. It may be
   easiest to create a new profile by running Firefox.exe
   -ProfileManager. Make sure to run Firefox with the new profile
   at least once.
4. You must create a file "mylog@uiuc.edu" in
   [profile-dir]/extensions. It should be a one line plain text
   file with the path to [mylog-dir]. Make sure there is no
   extension (such as .txt). Close all Firefox windows and open
   Firefox with your profile. You can check that MyLog is correctly
   installed by looking in Tools -> Add-ons.

Running unit tests
1. Copy all files in [mylog-dir]/chrome/content/test/data/
   to [profile-dir].
2. Right click on a Firefox window and click "MyLog Unit Tests".
   Alternatively, you can type in the location bar of Firefox:
   chrome://mylog/content/test/mylog-UnitTest-index.html

