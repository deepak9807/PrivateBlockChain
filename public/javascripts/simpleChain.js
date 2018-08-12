/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |

|  =========================================================*/
/*

integrating the level db for the  persistant database
* */
const level = require('level');
const blockDBStoreLoc = './blockDB';
const db=level(blockDBStoreLoc,{ valueEncoding: 'json' });

const SHA256 = require('crypto-js/sha256');
/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/
const genesisblockkey=0;
class Blockchain{
  constructor(){
    this.chain = [];
    this.addBlock(genesisblockkey,new Block("First block in the chain - Genesis block"));
  }


  // Add new block
  addBlock(key,newBlock){
    // Block height
    newBlock.height = this.chain.length;
    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    // previous block hash
    if(this.chain.length>0){
      newBlock.previousBlockHash = this.chain[this.chain.length-1].hash;
    }
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    //Adding Blocks to DB

      this.putBlocktoLevelDB(key,newBlock);

      // Adding block object to chain
      this.chain.push(newBlock);

  }

  /*
  * @func this will help to insert New Non existing blocks to the database levelDB
  * */
   putBlocktoLevelDB(key,newBlock) {

       this.isblockExist(key).then(function (response) {
           if (response !== true) {
               console.log(response)
               db.put(key, JSON.stringify(newBlock), function (err) {
               if (err) return console.log(key + " message " + newBlock.toString() + " Error Occured" + err);
               else {
                   console.log("value inserted in db")
               }

           })
       }else {
               console.log("Block Already exist at position"+key);
           }}, function (err) {
           console.log("Insertion"+err);
       });

   }



    //Checking Genesis Block Existant Through this function we can check any block whic exist in level db can't created again and again
    isblockExist(key){

        return new Promise(function (resolve, reject) {
            db.get(key, function (err) {

                if (err) {
                    console.log("block  exists Error" +err);
                 resolve(false)
                }
                else {
                    console.log("block exists");
                    resolve(true)
                }

            })
        })
    }



    // get block

    getBlock(blockHeight){
      // return object as a single string
        console.log("GETBlock"+blockHeight)
        return new Promise(function (resolve, reject) {
            db.get(blockHeight, function (err,value) {

                if (err) {
                    console.log("get block",err);
                    reject(err)
                }
                else {
                    console.log("Genesis block exists");
                    resolve(JSON.parse(value))
                }

            })

        })


    }

    /*
    * Validate the block for the given block height
    * */
    validatelavelBlock(blockHeight){
    console.log("BlockHeight",blockHeight)

        return new Promise(function (resolve, reject) {

            new Blockchain().getBlock(blockHeight).then(function (response) {
                // console.log((response));
                let block = response;
                console.log((block));
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash===validBlockHash) {
                    console.log("Validated")
                    resolve(true);
                } else {
                    console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
                    reject(false);
                }
            }, function (err) {
                reject(false);
                console.log("Block do not exist at this blockheight" + err+blockHeight);
            });

        })

    }

   // Validate blockchain

    validateChain(){
      let errorLog = [];
      for (var i = 0; i < this.getBlockHeight()-1; i++) {
        // validate block
          console.log("Block Height "+ i)
        if (!this.validatelavelBlock(i))errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.getBlock(i).hash;
        let previousHash = this.getBlock(i+1).previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      if (errorLog.length>0) {
        console.log('Block errors = ' + errorLog.length);
        console.log('Blocks: '+errorLog);
      } else {
        console.log('No errors detected');
      }
    }

    //This Function Helps to ge the desired block from the  level DB

    getLevelDBData(key){

        this.isblockExist(key).then(function (response) {
            if (response == true) {

                db.get(key, function (err, value) {
                    if (err) return console.log('Not found!', err);
                    else {
                        console.log("data block" + value);
                        return value;
                    }
                });

            } else {
                console.log("Data Nit exist at "+key);
            }
        },function (err){
            console.log("Error",response)
        } );

    }

/*
* Get Block Height
* */
    getBlockHeight(){
        return new Promise(function (resolve, reject) {
            let i = 0;
            db.createReadStream().on('data', function(data) {
                i++;
                //console.log(data.key, '=', data.value)
            }).on('error', function(err) {
                return console.log('Unable to find current height', err)
            }).on('close', function(data) {
                console.log('Found Height ' + i);
                //return i;
                resolve(i);
            });
        })
    }

}

//Initialize object
let block=new Blockchain();

block.addBlock(1,new Blockchain("Second block"));

block.addBlock(2,new Blockchain("Third block"));

//Get the inserted block

block.getBlock(1);

//Get the block Height
block.getBlockHeight();

//block.getLevelDBData(2);

//Validate the Level Block
block.validatelavelBlock(0);


//validate the block chain
block.validateChain();