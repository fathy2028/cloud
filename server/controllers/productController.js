import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import slugify from "slugify";

// Create Product Controller
export const createProductController = async (req, res) => {
    try {
        const { name, description, price, category, quantity, shipping } = req.body;
        const photo = req.files ? req.files.photo : null;
        name="fathy";
        if (!name) return res.status(400).send({ message: "Name is required" });
        if (!description) return res.status(400).send({ message: "Description is required" });
        if (!price) return res.status(400).send({ message: "Price is required" });
        if (!category) return res.status(400).send({ message: "Category is required" });
        if (!quantity) return res.status(400).send({ message: "Quantity is required" });
        if (!shipping) return res.status(400).send({ message: "Shipping is required" });
        if (!photo) return res.status(400).send({ message: "Photo is required" });

        const product = new productModel({
            name,
            slug: slugify(name),
            description,
            price,
            category,
            quantity,
            shipping,
            photo: {
                data: photo.data,
                contentType: photo.mimetype,
            }
        });

        await product.save();

        res.status(201).send({
            success: true,
            message: "Product created successfully",
            product: {
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in creating product",
            error
        });
    }
};

// Get All Products Controller
export const getallProductController = async (req, res) => {
    try {
        const products = await productModel.find().populate("category").limit(12).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            numproducts: products.length,
            message: "Products fetched successfully",
            products: products.map(product => ({
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Products cannot be fetched",
            error
        });
    }
};

// Get Single Product Controller
export const getProductController = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById(id).populate("category", "name");
        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }
        res.status(200).send({
            success: true,
            message: "Product fetched successfully",
            product: {
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting the product",
            error
        });
    }
};

// Get Product Photo Controller
export const getProductPhotoController = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById(id).select("photo");
        if (!product || !product.photo || !product.photo.data) {
            return res.status(404).send({
                success: false,
                message: "Photo not found"
            });
        }
        res.set("Content-Type", product.photo.contentType);
        res.send(product.photo.data);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while getting the photo",
            error
        });
    }
};

// Update Product Controller
export const updateProductController = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, category, quantity, shipping } = req.body;
        const photo = req.files ? req.files.photo : null;

        const updatedFields = { name, description, price, category, quantity, shipping };

        if (name) {
            updatedFields.slug = slugify(name);
        }

        if (photo) {
            updatedFields.photo = {
                data: photo.data,
                contentType: photo.mimetype,
            };
        }

        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updatedFields,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Product updated successfully",
            product: {
                ...updatedProduct._doc,
                photo: undefined // Exclude photo from the main response
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in updating product",
            error
        });
    }
};

// Delete Product Controller
export const deleteProductController = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).send({
                success: false,
                message: "Product not found"
            });
        }

        // Check if the product exists in any orders
        const orders = await orderModel.find({ products: id });
        if (orders.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Cannot delete product as it exists in orders"
            });
        }

        await productModel.findByIdAndDelete(id);

        res.status(200).send({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in deleting product",
            error
        });
    }
};

// Filter Products Controller
export const productFillterController = async (req, res) => {
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) {
            args.category = { $in: checked }; // Use $in to filter categories
        }
        if (radio.length) {
            args.price = { $gte: radio[0], $lte: radio[1] }; // Set price range filter
        }
        const products = await productModel.find(args);
        res.status(200).send({
            success: true,
            products
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error while filtering",
            error
        });
    }
};

// Product Count Controller
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount();
        res.status(200).send({
            success: true,
            total
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting products",
            error
        });
    }
};

// Product List Controller
export const productListController = async (req, res) => {
    try {
        const perPage = 8;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel.find({}).skip((page - 1) * perPage).limit(perPage).sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            products: products.map(product => ({
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Failed to get product page list",
            error
        });
    }
};

// Search Product Controller
export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).populate("category");
        res.json(results.map(product => ({
            ...product._doc,
            photo: undefined // Exclude photo from the main response
        })));
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in search",
            error
        });
    }
};

// Related Product Controller
export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid } // Exclude the current product
        }).limit(3).populate("category");
        res.status(200).send({
            success: true,
            products: products.map(product => ({
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "error while getting related product",
            error
        });
    }
};

// Get Products by Category Controller
export const productsByCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.findById(id);
        const products = await productModel.find({ category }).populate("category");
        res.status(200).send({
            success: true,
            category,
            products: products.map(product => ({
                ...product._doc,
                photo: undefined // Exclude photo from the main response
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(400).send({
            success: false,
            message: "Error while getting products",
            error
        });
    }
};
