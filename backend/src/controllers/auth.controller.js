const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const generateToken = require('../lib/utils');
const cloudinary = require('../lib/cloudinary');

const signup = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // handle all invalid cases for the request.
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be atleast 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        profilePic: newUser.profilePic
      });

    } else {
      return res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const login = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({message: "Invalid credentials"});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!isPasswordCorrect){
      return res.status(400).json({message: "Invalid credentials"});
    }

    generateToken(user._id,res);
    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({message: "Internal server error"});
  }
}

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge:0});
    return res.status(200).json({message: "Logged out successfully"});
  } catch (error) {
    console.log("Error in logout controller", error.message);
    return res.status(500).json({message: "Internal server error"});
  }
}

const updateProfile = async (req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;
    if(!profilePic){
      return res.status(400).json({message: "Profile picture is required"});
    }
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const udpatedUser = await User.findByIdAndUpdate(userId, {
      profilePic: uploadResponse.secure_url
    }, {new: true}); // by default, old document is returned after update.

    return res.status(200).json(udpatedUser);
  } catch (error) {
    console.log("Error in updateProfile controller", error.message);
    return res.status(500).json({message: "Internal server error"});
  }
}

const checkAuth = (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    return res.status(500).json({message: "Internal server error"});
  }
}

module.exports = { login, signup, logout, updateProfile, checkAuth };