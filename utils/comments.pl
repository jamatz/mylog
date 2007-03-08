#!/usr/bin/perl
# comments.pl
# ebowden2
# Combs through the source tree looking for standard-format log comments.
# Puts them in a nice little HTML report.

use strict;
use File::Find;
sub main;
sub extractComments;

my @mylogDirectory = ("../mylog/");
my $outputFile = "comments.html";
my $xulCommentsExpression


main();

sub main {
	open(OUTPUTFILE, ">$outputFile");
	print OUTPUTFILE "<html><head><title>MyLog Comments</title></head><body>";
	find(\&extractComments, @mylogDirectory);
	print OUTPUTFILE "</body></html>";
	close(OUTPUTFILE);
}

sub extractComments {
	my $file = $_;
	unless (-d $file) {
		# Handle .js files
		if ($file =~ /\.js$/) {
			print OUTPUTFILE "<h3>$File::Find::name:</h3><p>";
			open(INPUTFILE, "<$file");
			my $editedLine;
			while(<INPUTFILE>) {
				my $line = $_;
				if ($line =~ /^\/\/ \*\*\* (.*)/) {
					$editedLine = $1;
					print OUTPUTFILE "<pre>$editedLine</pre>";
					print $editedLine;
				}
			}
			close(INPUTFILE);
			print OUTPUTFILE "</p>";
			
			my @commentFields = split(/:/, $editedLine);
			my $commentDate = $commentFields[1];
			print $commentDate;
		}
		# Handle .xul files
		elsif ($file =~ /\.xul$/) {
			print OUTPUTFILE "<h3>$File::Find::name:</h3><p>";
			open(INPUTFILE, "<$file");
			my $line;
			while(<INPUTFILE>) {
				$line = $_;
				if ($line =~ /^<!-- \/\/ \*\*\* (.*) -->/) {
					print OUTPUTFILE "<pre>$1</pre>";
				}
			}
			close(INPUTFILE);
			print OUTPUTFILE "</p>";
		}
	}

}
