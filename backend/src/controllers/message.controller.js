const User = require('../models/user.model');
const Message = require('../models/message.model');
const cloudinary = require('../lib/cloudinary');
const {getReceiverSocketId, io} = require('../lib/socket');

const getUsersForSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUsersForSideBar controller", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}

const getMessages = async (req, res) => {
    try {
        const {id: userToChatId} = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ],
        });
        return res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller", error.message);
        return res.status(500).json({message: "Internal server error"});
    }
}

const sendMessage = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        return res.status(500).json({message: "Internal server error"});  
    }
}

module.exports = {getUsersForSideBar, getMessages, sendMessage};