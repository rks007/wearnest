import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";


console.log("Redis-----URL: ", process.env.REDIS_URL);

//generate auth tokens and refresh tokens
const generateTokens = async (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });

    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });

    return {accessToken, refreshToken};
}

//store refresh token in redis

const storeRefreshToken = async (userId, refreshToken) => {
           
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7); //expire in 7 days

}

//set cookie function

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //prevent XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //prevent CSRF attacks
        maxAge: 15 * 60 * 1000 //15 minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, //prevent XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 //7 days
    })
}



export const signup = async (req, res) => {

    const {name, email, password} = req.body;

    try {
        
        //check if user already exists
        const userExists = await User.findOne({email});
    
        if(userExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
    
        const user = await User.create({
            name,
            email,
            password
        })

        //authenticate the user
        const {accessToken, refreshToken} = await generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);//store refresh token in redis

        setCookies(res, accessToken, refreshToken);
    
        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },  
        });

    } catch (error) {
        console.log("Error creating user: ", error);
        res.status(500).json({
            message: "Internal server error"
        });
        
    }

}

export const login = async (req, res) => {
    try {
        
        const {email, password} = req.body;

        //check if user exists
        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password))){
            //generate tokens
            const {accessToken, refreshToken} = await generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);//store refresh token in redis

            setCookies(res, accessToken, refreshToken);

            res.status(200).json({
                message: "Logged in successfully",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });  
        } else {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }
        
    } catch (error) {
        console.log("Error logging in: ", error);
        res.status(500).json({
            message: "Internal server error"
        });
        
    }
}

export const logout = async (req, res) => {
    try {
        
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decoded.userId}`); //delete refresh token from redis
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            message: "Logged out successfully"
        });

    } catch (error) {
        
        console.log("Error logging out: ", error);
        res.status(500).json({
            message: "Internal server error"
        });

    }
}

//this will be used to refresh the access token
export const refreshToken = async (req, res) => {
    try {
        
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return res.status(401).json({
                message: "No refresh token provided"
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const userId = decoded.userId;

        //check if refresh token is valid
        const storedRefreshToken = await redis.get(`refresh_token:${userId}`);
        if(refreshToken !== storedRefreshToken) {
            return res.status(403).json({
                message: "Invalid refresh token"
            });
        }

        //generate new access token
        const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15m"});

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000 //15 minutes
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken
        });

    } catch (error) {
        console.log("Error refreshing token: ", error);
        res.status(500).json({
            message: "Internal server error"
        });
        
    }
}

export const getProfile = async (req, res) => {
    try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
}