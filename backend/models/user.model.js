import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password must be at least 6 characters"],
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1, 
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
}, 
{
    timestamps: true
}
);


//hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        //if password is not modified, skip hashing
        //this is important for updating user profile
        return next();
    }
    try {
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();

    } catch (error) {
        console.log("Error hashing password: ", error);     
        next(error);
        
    }
});

//compare password
userSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.log("Error comparing password: ", error);
        throw error;
    }
};


const User = mongoose.model("User", userSchema); 

export default User;