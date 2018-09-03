// Retrieve and return all notes from the database.

const block = require('../public/javascripts/simpleChain');
exports.find = (req, res) => {
    height = req.params.blockID;
    block.blockchain.getBlock(height).then(function (response) {
        // console.log("====================================================",response);
        res.send(response)
    });
};

exports.create = (req, res) => {
    if(!req.body.content) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }
    console.log(req.body.content);
    res.send(block.blockchain.addblock_util(req.body.content));
};