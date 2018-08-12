

const level = require('level');
const blockDBStoreLoc = './blockDB';
const db=level(blockDBStoreLoc,{ valueEncoding: 'json' });

const SHA256 = require('crypto-js/sha256');
class Chain {


    isblock(value, next) {
        next("hi")
    }

    t() {
        this.isblock(10, (next) => {
            console.log(next)
        })
    }

}

let ch=new Chain();
ch.t()


//Initialize object
let block=new Blockchain();

//Adding Block to level DB

block.addBlock(1,new Block('Second block'));
block.addBlock(0,new Blockchain("First block"));
block.addBlock(2,new Blockchain("Third block"));

//Get the inserted block

block.getBlock(0);
block.getBlock(1);
block.getBlock(2);

//Get the block Height

block.getBlockHeight();

//Validate the Level Block
block.validatelavelBlock(1);

//validate the block chain
block.validateChain();