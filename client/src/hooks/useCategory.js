import { useState, useEffect } from "react";
import axios from "axios";

export default function useCategory() {
    const [categories, setCategories] = useState([]);

    const getCategories = async () => {
        try {
            const { data } = await axios.get("/api/v1/category/getcategories"); // Await the axios call
            setCategories(data?.categories || []); // Handle the response correctly
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    return categories;
}
