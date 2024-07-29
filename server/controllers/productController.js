import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import slugify from "slugify";
import multer from 'multer';

const upload = multer(); // Middleware to handle file uploads

// Create Product Controller
export const createProductController = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const { name, description, price, category, quantity, shipping } = req.body;
      const photo = req.file;

      // Validation
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
          data: photo.buffer,
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
  }
];

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
export const updateProductController = [
  upload.single('photo'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const { name, description, price, category, quantity, shipping } = req.body;
      const photo = req.file;

      const updatedFields = { name, description, price, category, quantity, shipping };

      if (name) {
        updatedFields.slug = slugify(name);
      }

      if (photo) {
        updatedFields.photo = {
          data: photo.buffer,
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
  }
];

// Delete Product Controller
export const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).send({
        success: false,
        message: "Product not found"
      });
    }
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
      product: {
        ...deletedProduct._doc,
        photo: undefined // Exclude photo from the main response
      }
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

// Product Filter Controller
export const productFillterController = async (req, res) => {
  try {
    const { category, priceRange } = req.body;
    let filter = {};

    if (category) filter.category = category;
    if (priceRange) filter.price = { $gte: priceRange[0], $lte: priceRange[1] };

    const products = await productModel.find(filter).populate("category");
    res.status(200).send({
      success: true,
      numproducts: products.length,
      message: "Products filtered successfully",
      products: products.map(product => ({
        ...product._doc,
        photo: undefined // Exclude photo from the main response
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in filtering products",
      error
    });
  }
};

// Product Count Controller
export const productCountController = async (req, res) => {
  try {
    const count = await productModel.countDocuments();
    res.status(200).send({
      success: true,
      count,
      message: "Products counted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in counting products",
      error
    });
  }
};

// Product List Controller
export const productListController = async (req, res) => {
  try {
    const { page = 1 } = req.params;
    const limit = 10;
    const skip = (page - 1) * limit;
    const products = await productModel.find().populate("category").skip(skip).limit(limit);
    res.status(200).send({
      success: true,
      numproducts: products.length,
      message: "Products listed successfully",
      products: products.map(product => ({
        ...product._doc,
        photo: undefined // Exclude photo from the main response
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in listing products",
      error
    });
  }
};

// Search Product Controller
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const products = await productModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ]
    }).populate("category");
    res.status(200).send({
      success: true,
      numproducts: products.length,
      message: "Products found successfully",
      products: products.map(product => ({
        ...product._doc,
        photo: undefined // Exclude photo from the main response
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in searching products",
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
      _id: { $ne: pid }
    }).populate("category").limit(4);
    res.status(200).send({
      success: true,
      numproducts: products.length,
      message: "Related products found successfully",
      products: products.map(product => ({
        ...product._doc,
        photo: undefined // Exclude photo from the main response
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in finding related products",
      error
    });
  }
};

// Products By Category Controller
export const productsByCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await productModel.find({ category: id }).populate("category");
    res.status(200).send({
      success: true,
      numproducts: products.length,
      message: "Products found by category successfully",
      products: products.map(product => ({
        ...product._doc,
        photo: undefined // Exclude photo from the main response
      }))
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in finding products by category",
      error
    });
  }
};
