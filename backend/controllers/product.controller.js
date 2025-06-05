import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        
        const products = await Product.find({}); //get everthing 
        res.status(200).json({
            products
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}