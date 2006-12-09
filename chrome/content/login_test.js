//This function tests the LogIn and should result in all "Pass"
//alert boxes if the test passes.

//Eric Bluhm 
//Bryan Early

function test()
{

// Testing the null case
if(LogIn("",""))
{
alert("Fail");
}  
else
{
alert("Pass");
}

// Testing valid username with invalid password
if(LogIn("Eric","wrongpassword"))
{
alert("Fail"); 
}
else
{
alert("Pass");
}

// Testing valid username with valid password
if(LogIn("Eric","correctpassword"))
{
alert("Pass");  
}
else
{
alert("Fail");
}

// Testing invalid username with invalid password that are not null
if(LogIn("Bob","invalidpassword"))
{
alert("Fail"); 
}
else
{
alert("Pass");
}

// Testing invalid username with valid password
if(LogIn("Ericc","correctpassword"))
{
alert("Fail");  
}
else
{
alert("Pass");
}

// Testing username with preceding number with valid password
if(LogIn("7Eric","correctpassword"))
{
alert("Fail");  
}
else
{
alert("Pass");
}

// Testing username with unhandled characters with valid password
if(LogIn("$Eric@#","correctpassword"))
{
alert("Fail");  
}
else
{
alert("Pass");
}

// Testing username and password input swapped
if(LogIn("correctpassword","Eric"))
{
alert("Fail");  
}
else
{
alert("Pass");
}


}
