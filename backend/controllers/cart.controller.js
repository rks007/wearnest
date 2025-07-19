import User from "../models/user.model.js";
import Product from "../models/product.model.js";


export const addToCart = async (req, res) => {
    try {
        
        const {productId} = req.body;

        const user = req.user; //from the protectRoute middleware

        const existingItem = user.cartItems.find(item => item.id === productId);
        if (existingItem) {
            // If the item already exists in the cart, increment the quantity
            existingItem.quantity += 1;
        } else {
            // If the item does not exist, add it to the cart
            user.cartItems.push(productId);
        }

        await user.save();
        return res.status(200).json(user.cartItems);


    } catch (error) {
        
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Error adding to the cart" });
    }
}


export const removeAllFromCart = async (req, res) => {
    try {
        
        const {productId} = req.body;
        const user = req.user; 
        if(!productId){
            user.cartItems = [];
        } else {
            // Remove specific product from cart
            user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        }
        await user.save();
        return res.status(200).json(user.cartItems);

    } catch (error) {
        
        console.error("Error removing all items from cart:", error);
        res.status(500).json({ message: "Error removing all items from the cart" });

    }
}

export const updateQuantity = async (req, res) => {
    try {
        
        const {id:productId} = req.params; // product ID from the URL

        const {quantity} = req.body; 
        const user = req.user; 
        const existingItem = user.cartItems.find((item) => item.id === productId); 

        if(existingItem){
            if(quantity === 0){
                user.cartItems = user.cartItems.filter((item) => item.id !== productId); // Remove item if quantity is 0
                await user.save();
                return res.json(user.cartItems);
            }

            existingItem.quantity = quantity; // Update the quantity of the existing item
            await user.save();
            return res.status(200).json(user.cartItems);
        } else {
            return res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (error) {
        
        console.error("Error updating quantity:", error);
        res.status(500).json({ message: "Error updating quantity in the cart" });
    }
}

export const getCartProducts = async (req, res) => {
    try {
        const products = await Product.find({_id: {$in: req.user.cartItems}});

        //add quantity to each product
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {...product.toJSON(), quantity: item.quantity}
        })

        res.json(cartItems);
    } catch (error) {
        
        console.error("Error getting cart products:", error);
        res.status(500).json({ message: "Error getting cart products" });
        
    }
}