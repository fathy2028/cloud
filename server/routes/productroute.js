import express from "express";
import { isadmin, requiredsignin } from './../middlewares/authMiddleware.js';
import {
    createProductController,
    deleteProductController,
    getallProductController,
    getProductController,
    productCountController,
    productFillterController,
    productListController,
    productsByCategoryController,
    relatedProductController,
    searchProductController,
    updateProductController
} from "../controllers/productController.js";

const router = express.Router();

// Route to create a product, requires sign-in and admin privileges
router.post("/create-product", requiredsignin, isadmin, createProductController);

// Route to get all products
router.get("/getall-products", getallProductController);

// Route to get a single product by ID
router.get("/get-product/:id", getProductController);

// Route to update a product by ID, requires sign-in and admin privileges
router.put("/update-product/:id", requiredsignin, isadmin, updateProductController);

// Route to delete a product by ID, requires sign-in and admin privileges
router.delete("/delete-product/:id", requiredsignin, isadmin, deleteProductController);

// Route to filter products based on criteria
router.post("/product-filter", productFillterController);

// Route to get the total count of products
router.get("/product-count", productCountController);

// Route to get a paginated list of products
router.get("/product-list/:page", productListController);

// Route to search products by a keyword
router.get("/search/:keyword", searchProductController);

// Route to get related products by product ID and category ID
router.get("/related-product/:pid/:cid", relatedProductController);

// Route to get products by category ID
router.get("/productsbycategory/:id", productsByCategoryController);

export default router;
