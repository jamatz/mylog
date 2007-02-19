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
		if ($file =~ /\.js$/) {
			print OUTPUTFILE "<h3>$File::Find::name:</h3><p>";
			open(INPUTFILE, "<$file");
			while(<INPUTFILE>) {
				my $line = $_;
				if ($line =~ /^\/\/ \*\*\* /) {
					print OUTPUTFILE "<pre>$line</pre>";
				}
			}
			close(INPUTFILE);
			print OUTPUTFILE "</p>";
		}
	}

}
