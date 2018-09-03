//This is Private Blockchain 

Project 

1. It has all the details which review comment change.


Configure LevelDB to persist dataset
SImpleChain.js includes the Node.js level library and configured to persist data within the project directory.

Modify simpleChain.js functions to persist data with LevelDB
addBlock(newBlock) includes a method to store newBlock within LevelDB

Needs to make some changes to be less prone to bugs. See Code Review.

Genesis block persist as the first block in the blockchain using LevelDB

Modify validate functions
validateBlock() function to validate a block stored within levelDB

It works with valid and invalid blocks. Nice work!

validateChain() function to validate blockchain stored within levelDB

Needs changes in the implementation which I highlighted in the code review.

Modify getBlock() function
getBlock() function retrieves a block by block heigh within the LevelDB chain.

It gets the correct block specified by the block height!

Modify getBlockHeight() function
getBlockHeight() function retrieves current block height within the LevelDB chain.

It is off by 1. Needs minor changes.


