const mongoose = require('mongoose');
const { User } = require('../models/user.model');

module.exports.getAllUsers = async (req, res) => {
    try {
        let users = await User.find({});
        return res.send(users);
    } catch(err) {
        return res.send(err);
    }
}

module.exports.getUser = async (req, res) => {
    let userId = req.params.id;
    if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send("Invalid ObjectId");
    let user = await User.findById(userId);
    if(!user) return res.status(404).send("User not found.");
    return res.send(user);
}

module.exports.createUser = async (req, res) => {
    console.log(req.body);
    let { name, email, country } = req.body;
    let user = new User({
        name,
        email,
        country
    });
    await user.save();
    return res.send(user);
}

module.exports.updateUser = async (req, res) => {
    let userId = req.params.id;
    console.log(req.body);
    User.findByIdAndUpdate(userId, req.body, { new: true })
    .then(user => {
        return res.send(user);
    })
    .catch(err => {
        return res.status(500).send(err);
    });
}

module.exports.deleteUser = async (req, res) => {
    let userId = req.params.id;
    await User.findByIdAndDelete(userId);
    return res.send("User deleted");
}