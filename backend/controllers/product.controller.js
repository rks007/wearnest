import cloudinary from "../lib/cloudinary.js";
import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
    try {
        
        const products = await Product.find({}); //get everthing 
        return res.status(200).json({
            products
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        // If not found in Redis, fetch from database
        // .lean is used to get plain JavaScript objects instead of Mongoose documents
        // this is done to improve performanc
        featuredProducts = await Product.find({isFeatured: true}).lean();

        if(featuredProducts.length === 0) {
            return res.status(404).json({
                message: "No featured products found"
            });
        }
        //store in redis for future request to gat it faster
        await redis.set("featured_products", JSON.stringify(featuredProducts));

        return res.status(200).json(featuredProducts);

    } catch (error) {
        
        console.error("Error fetching featured products:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });

    }
}

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        
        const products = await Product.find({ category: category });
        if (products.length === 0) {
            return res.status(404).json({
                message: `No products found in category: ${category}`
            });
        };

        return res.status(200).json(products);

    } catch (error) {
        console.error("Error fetching products by category", error);
        return res.status(500).json({
            message: "Error fetching CATEGORY products",
            error: error.message
        });
        
    }
}

export const getRecommendedProducts = async (req, res) => { //i have used mongodb aggregation pipeline to get recommended products
    try {
        
        const products = await Product.aggregate([
            {
                $sample: {size: 3} // Randomly select 3 products
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1,
                }
            }
        ])

        return res.status(200).json(products);

    } catch (error) {
        
        console.error("Error fetching recommended products:", error);
        return res.status(500).json({
            message: "Error fetching recommended products",
            error: error.message
        });

    }
}

export const createProduct = async (req, res) => {
    try {
        
        const {name, description, price, image, category} = req.body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        
        let cloudinaryResponse = null;
        if(image) {
            cloudinaryResponse =  await cloudinary.uploader.upload(image, {folder: "products"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse ? cloudinaryResponse.secure_url : null, // Use the URL from Cloudinary
            category,
        })

        return res.status(201).json(product);

    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
        
    }
}

export const deleteProduct = async (req, res) => {
    try {
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0]; // Extract public ID from URL
            try {
                
                // await cloudinary.uploader.destroy(publicId, {folder: "products"});
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary");

            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
                return res.status(500).json({
                    message: "Failed to delete product image",
                    error: error.message
                });
                
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Product deleted successfully" 
        });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
        
    }
}

export const toggleFeaturedProduct = async (req, res) => {

    try {
        
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if(product){
            product.isFeatured = !product.isFeatured; // Toggle the isFeatured field
            const updatedProduct = await product.save();
            //update the cache
            await updateFeaturedProductsCache();
            return res.json(updatedProduct);
        }

        // Toggle the isFeatured field
        product.isFeatured = !product.isFeatured;
        await product.save();

        // Clear the featured products cache
        await redis.del("featured_products");

        return res.status(200).json({
            message: `Product ${product.isFeatured ? "featured" : "unfeatured"} successfully`,
            product
        });

    } catch (error) {
        
        console.error("Error toggling featured product:", error);
        return res.status(500).json({
            message: "Error toggling featured product",
            error: error.message
        });

    }

}

const updateFeaturedProductsCache = async () => {
    try {
        
        const featuredProducts = await Product.find({ isFeatured: true }).lean();

        // Store the featured products in Redis cache
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        
    } catch (error) {
        
        console.error("Error updating featured products cache:", error);
        throw new Error("Failed to update featured products cache");
    }
}