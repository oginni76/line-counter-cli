This program counts the number of lines in your code and returns the total lines, comment, empty and coded lines(ones containing actual code).


# Installation 
npm i line-counter-cli

# Run the command
npx line-counter

## How the program works
It consists of two functions
1. The first traverses through your directory(folder) and files to get which would be worked on or ignored
2. The second function is what is responsible for counting the lines.


## Comments
I made sure to add the proper comment method for most languages but if you find out that the comments in your particular
programming langusage isn't counted you can add the comment symbol of your language to the comments part of the code
You should see three options 
1. for single line comments /^comment symbol/
2. for what starts the block line comment in the language you use 
   this is quite tricky, it should be /^start comment symbol/
4. for what end the language you use /end comment symbol$/

When the program hits a block/multi line comment, it takes note of that line by tracking it with the inBlockComment
variable which tells the code whether subsequent lines are part of a block comment until we find the closing pattern.


## Folders /Files ignored
1. Node_modules.
2. Anything added to gitignore. 
3. anything you add to the customexclusions array(For files you want the lines counted but are not in your gitignore)




# ==========
One issue i noticed with this first version is that it counts lines in picture png files(I dont know how that happened)
but I'd surely fix it by the next release.

#
Also since I used typescript I shoudld have declared all the types at the top of the code.
Might do that later.

This is the first version and I would like us all to test and use it.
Your feedbacks are highlyyyyyyyyyyy welcome.

Feel free to raise an issue and also fork or fix if you would love to.
