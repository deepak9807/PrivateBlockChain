// Retrieve and return all notes from the database.

const block = require('../public/javascripts/simpleChain');
exports.find = (req, res) => {
    height = req.params.blockID;
    block.getBlock(height).then(function (response) {
        // console.log("====================================================",response);
        res.send(response)
    });
};

exports.create = (req, res) => {
    res.send("this is me")
};