/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |

|  =========================================================*/

/*
* @Author
* Abhishek Kumar Chaubey
* version 1.0
* @Help from Udacity Private Blockchain project_2 code
* */
/*

integrating the level db for the  persistant database
* */
const level = require('level');
const blockDBStoreLoc = './blockDB';
const db = level(blockDBStoreLoc, {valueEncoding: 'json'});

const SHA256 = require('crypto-js/sha256');

/* ===== Block Class ==============================
|  Class with a constructor for block           |
|  ===============================================*/

class Block {
    constructor(data) {
            this.hash = "",
            this.height = 0,
            this.body = data,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain        |
|  ================================================*/

class Blockchain {

    constructor() {
        this.getBlockHeight().then((height) => {
            if (height == 0)
                this.addBlock(new Block("My First Block -Genesis Block"))
        })
    }

/*
* Add block to the database
* */
    addBlock(newBlock) {
        // Block height
        this.getBlockHeight().then(height => {
            newBlock.height = height;
            newBlock.time = new Date().getTime().toString().slice(0, -3);
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

            // Previous block hash
            if (height > 0) {
                this.getBlock(--height).then((Block) => {

                    newBlock.previousBlockHash = Block.hash;
                    this.addDataToLevelDB(newBlock);
                }).catch(error => {
                    console.log("Error in getBlock at addBlock with newBlock.height " + newBlock.height + error);
                })


            } else {
                // Block hash with SHA256 using newBlock and converting to a string value.
                // Adding block object to the LevelDB
                this.addDataToLevelDB(newBlock);
            }
        }).catch(error => {
            console.log("Error in AddBlock" + error);
        })
    }

    // Add data to levelDB with value
    addDataToLevelDB(value) {
        let i = 0;
        db.createReadStream().on('data', function (data) {
            i++;
        }).on('error', function (err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function () {
            console.log('Block #' + i);
            new Blockchain().addLevelDBData(i, JSON.stringify(value));
        });
    }

    /*
    *
    *Add Level to data
    * */

    addLevelDBData(key, value) {
        db.put(key, value, function (err) {
            if (err) return console.log('Block ' + key + ' submission failed', err);
        })
    }

    /*   Checking Genesis Block Existant/Any Exist Block
     *   Through this function we can check any block which exist in level db can't created again and again
Ø    */

    isblockExist(key) {

        return new Promise(function (resolve, reject) {
            db.get(key, function (err) {
                if (err) {
                    console.log("block Do not exists at this key" + err);
                    resolve(false)
                }
                else {
                    console.log("block exists");
                    resolve(true)
                }
            }, function (err) {
                reject(err);
                // console.log("Block do not exist at this blockheight" + err+blockHeight);
            })
        });
    }


    /*
    @Function
    * get block values
    * */

    getBlock(blockHeight) {
        // return object as a single string
        return new Promise(function (resolve, reject) {
            db.get(blockHeight, function (err, value) {
                console.log(" block height get block", blockHeight);

                if (err) {
                    console.log("get block", err);
                    reject(0)
                }
                else {
                    console.log(" block exists" + (value));
                    resolve(JSON.parse(value))
                }

            }, function (err) {
                console.log("Block do not exist at this blockheight" + err + blockHeight);

                reject(err);
            })

        })


    }

    /*
    *
    * Validate the block for the given block height
    *
    * */
    validateBlock(blockHeight) {
        console.log("BlockHeight", blockHeight)

        return new Promise(function (resolve, reject) {

            new Blockchain().getBlock(blockHeight).then(function (response) {
                // console.log((response));
                if (response !== 0) {
                    let block = response;
                    console.log((block));
                    // get block hash
                    let blockHash = block.hash;
                    // remove block hash to test block integrity
                    block.hash = '';
                    // generate block hash
                    let validBlockHash = SHA256(JSON.stringify(block)).toString();
                    // Compare
                    if (blockHash === validBlockHash) {
                        console.log("Validated")
                        resolve(true);
                    } else {
                        console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
                        resolve(false);
                    }
                } else {
                    resolve(false)
                    console.log("Block not found")
                }
            }, function (err) {
                reject(err);
                // console.log("Block do not exist at this blockheight" + err+blockHeight);
            });

        })

    }
    /*
    * @Method to Validate Chain
    * */
    validateChain() {
        let errorLog = [];
        let blockheight = 0;
        //This promise will obtain blockheight
        this.getBlockHeight().then(height => {

            console.log("block height firdt promise" + height)
            blockheight = height
            return height;

        }).then(height => {

            //console.log("2nd promise" + height)
            //This promise block is to check obtain the error log array
            for (var i = 0; i < height - 1; i++) {
                // validate block
                console.log("Block Height " + i)
                this.validateBlock(i).then(function (response) {
                    console.log("validateblock" + response)
                    if (response !== true) {
                        errorLog.push(i);
                    } else {

                    }

                })
            }
        }).then(block => {
            //This promise async block to check the values of the block hashes
            //console.log("3rd promise" + height)
            this.getBlock(i).then(function (response) {
                console.log("validate chain" + response)
                let blockHash = response.hash;
                this.getBlock(i).then(function (response2) {
                    let previousHash = response2.previousBlockHash;
                    if (blockHash !== previousHash) {
                        errorLog.push(i);
                    }
                    if (errorLog.length > 0) {
                        console.log('Block errors = ' + errorLog.length);
                        console.log('Blocks: ' + errorLog);
                    } else {
                        console.log('No errors detected');
                    }
                })

            }, function (err) {
                console.log(err)
            })

        }).catch(error => console.log(error))

    }

    //This Function Helps to ge the desired block from the  level DB

    getLevelDBData(key) {

        return new Promise((resolve, reject) => {
            db.get(key, function (err, value) {
                if (err) {
                    console.log('Not found!', err);
                    reject(err);
                }
                ;
                console.log('Value = ' + value);
                resolve(value);
            })
        })

    }

    /*
    * Get Block Height
    * */
    getBlockHeight() {
        return new Promise(function (resolve, reject) {
            let i = 0;
            db.createReadStream().on('data', function (data) {
                i++;
                //console.log(data.key, '=', data.value)
            }).on('error', function (err) {
                return console.log('Unable to find current height', err)

                reject(i);
            }).on('close', function (data) {
                console.log('Found Height ' + i);
                //return i;
                if (i > 0) --i;
                resolve(i)
            }, function (err) {
                reject(i);

                console.log("Block do not exist at this blockheight" + err + blockHeight);
            });
        })
    }

}

// //Initialize object
// let block = new Blockchain();
//
//
// (function theLoop(i) {
//     setTimeout(function () {
//
//         block.addBlock(new Block('Test' + i));
//         if (--i) theLoop(i);
//     }, 200);
// })(10);
//
//
// (function theLoop(i) {
//     setTimeout(function () {
//         block.getBlock(i);
//         if (--i) theLoop(i);
//     }, 400);
// })(10);




//Get the block Height


//
// (function theLoop(i) {
//     setTimeout(function () {
//         block.getLevelDBData(i);
//         if (--i) theLoop(i);
//     }
//     , 200);
// })(5);
//
//
// //Validate the Level Block
//
// (function theLoop(i) {
//     setTimeout(function () {
//         block.validateBlock(i);
//         if (--i) theLoop(i);
//     }, 100);
// })(10);
//
//
//
// //validate the block chain
//
// setTimeout(function () {
//     block.validateChain();
// }, 400);


module.exports = new Blockchain();