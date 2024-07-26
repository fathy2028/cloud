import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";



export const createCategoryController= async(req,res)=>{
    try {
        const {name}=req.body;
        if(!name){
          return  res.status(401).send({message:"name is required"});
        }
        const existcategory=await categoryModel.findOne({name})
        if(existcategory){
           return res.status(200).send({
                success:true,
                message:"category already exist"
            })
        }
        const category=await categoryModel({name,slug:slugify(name)}).save()
        res.status(201).send({
            success:true,
            message:"category created successfully",
            category
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"error in creating category",
            error
        })
    }
}

export const updateCategoryController = async (req, res) => {
    try {
        const id = req.params.id;
        const { name } = req.body; // Destructure name from req.body
        if (!name) {
            return res.status(400).send({
                success: false,
                message: "Name is required",
            });
        }
        const category = await categoryModel.findByIdAndUpdate(
            id,
            { name, slug: slugify(name) },
            { new: true }
        );
        res.status(200).send({
            success: true,
            message: "Category updated successfully",
            category,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while updating the category",
            error,
        });
    }
};
export const getCategoriesController= async(req,res)=>{
try {
    const categories=await categoryModel.find();
    res.status(200).send({
    success:true,
    message:"get successfully",
    categories
})
} catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:"error in fetch categories",
        error
    })
}
}

export const getCategoryController= async(req,res)=>{
try {
    const {id}=req.params.id;
    const category=await categoryModel.findById(id)
    res.status(200).send({
        success:true,
        message:"fetched successfully",
        category
    })
} catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:"error in fetch this category",
        error
    })
}
}

export const deleteCategoryController=async(req,res)=>{
try {
    const id=req.params.id
    await  categoryModel.findByIdAndDelete(id);
    res.status(200).send({
        success:true,
        message:"deleted successfully",
    })
} catch (error) {
    console.log(error)
    res.status(500).send({
        success:false,
        message:"faild to delete category",
        error
    })
}
}