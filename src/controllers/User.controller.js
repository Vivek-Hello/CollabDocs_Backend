import { User } from "../models/User.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const cookieOption = {
  maxAge: 24 * 7 * 60 * 60 * 1000,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
};

const genrateToken =  (id) => {
  const token =  jwt.sign({ id }, process.env.JWT, { expiresIn: "7d" });
  return token;
};

export const SignUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(401).json({ error: "all fields are required" });
    }
    const ExistedUser = await User.findOne({ email });
    if (ExistedUser) {
      return res.status(402).json({ error: "User already existic" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashPassword });
    if (!user) {
      return res.status(500).json({ error: "user not created" });
    }
    
    const token = genrateToken(user._id);
    res.cookie("token", token, cookieOption);
    return res
      .status(210)
      .json({ message: "User SignUp is successfull", user: {_id:user._id.toString(),name:user.name,email:user.email} });
  } catch (error) {
    return res.status(501).json({ error: error.message });
  }
};

export const LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ error: "all fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(402).json({ error: "invalid Password" });
    }
    const token = genrateToken(user._id);
   
    
    res.cookie("token", token, cookieOption);
   
    return res
      .status(210)
      .json({ message: "User is login Successfull", user: {_id:user._id.toString(),name:user.name,email:user.email} });
  } catch (error) {
    return res.status(501).json({ error: error.message });
  }
};

export const LogOut = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: "token is required" });
    
    
    const { id } =  jwt.verify(token, process.env.JWT);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.clearCookie("token", cookieOption);
    
    
    return res.status(210).json({ message: "User logOut Successfull" });
  } catch (error) {
    return res.status(501).json({ error: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
  
    
    const token = req.cookies.token;
 
    
    if (!token) return res.status(401).json({ error: "token is required" });
   
    const { id } =   jwt.verify(token, process.env.JWT);
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res
      .status(210)
      .json({ message: "User is login Successfull", user: {_id:user._id,name:user.name,email:user.email} });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
