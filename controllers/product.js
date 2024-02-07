const Product = require("../models/Product");

// Create new product
module.exports.createProduct = (req, res) => {
    const { name, description, price } = req.body;

    let newProduct = new Product({
        name,
        description,
        price
    });

    newProduct.save()
        .then(product => {
            return res.status(201).send({ message: "Product has been created successfully", product: product });
        })
        .catch(err => {
            console.error("Error in creating product: ", err);
            return res.status(500).send({ error: "Error in creating product" });
        });
};

// Get all products (active/inactive)
module.exports.getAllProducts = (req, res) => {
    Product.find({})
        .then(products => {
            if (products) {
                return res.status(200).send({ products });
            } else {
                return res.status(404).send({ message: "No products found" });
            }
        })
        .catch(err => {
            console.error("Error while retrieving product details: ", err);
            return res.status(500).send({ error: "Error while retrieving product details" });
        });
};

// Get Active Products only
module.exports.getAllActiveProducts = (req, res) => {
    Product.find({ isActive: true })
        .then(products => {
            if (products) {
                return res.status(200).send({ products });
            } else {
                return res.status(404).send({ message: "No available products at the moment" });
            }
        })
        .catch(err => {
            console.error("Error while retrieving product details: ", err);
            return res.status(500).send({ error: "Error while retrieving product details" });
        });
};

// Get Single Product
module.exports.getProductById = (req, res) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (product) {
                return res.status(200).send({ product });
            } else {
                return res.status(404).send({ error: "Product not found" });
            }
        })
        .catch(err => {
            console.error("Error while retrieving the product: ", err);
            return res.status(500).send({ error: "Error while retrieving the product" });
        });
};

// Update Product Info
module.exports.updateProductInfo = (req, res) => {
    const { name, description, price } = req.body;
    const productId = req.params.productId;

    let updatedProduct = {
        name,
        description,
        price
    };

    Product.findByIdAndUpdate(productId, updatedProduct, { new: true })
        .then(updatedProduct => {
            if (updatedProduct) {
                return res.status(200).send({ message: "Product has been updated successfully", updatedProduct });
            } else {
                return res.status(404).send({ error: "Product not found" });
            }
        })
        .catch(err => {
            console.error("Error while updating the product: ", err);
            return res.status(500).send({ error: "Error while updating the product" });
        });
};

// Archive Product
module.exports.archiveProduct = (req, res) => {

    let updateIsActiveField = {
        isActive: false
    }

    const productId = req.params.productId;

    Product.findByIdAndUpdate(productId, updateIsActiveField, { new: true })
        .then(archivedProduct => {
            if (archivedProduct) {
                return res.status(200).send({ message: "Product has been archived successfully", archivedProduct });
            } else {
                return res.status(404).send({ error: "Product not found" });
            }
        })
        .catch(err => {
            console.error("Error while archiving the product: ", err);
            return res.status(500).send({ error: "Error while archiving the product" });
        });
};

// Activate Product
module.exports.activateProduct = (req, res) => {

    let updateIsActiveField = {
        isActive: true
    }

    const productId = req.params.productId;

    Product.findByIdAndUpdate(productId, updateIsActiveField, { new: true })
        .then(activatedProduct => {
            if (activatedProduct) {
                return res.status(200).send({ message: "Product has been activated successfully", activatedProduct });
            } else {
                return res.status(404).send({ error: "Product not found" });
            }
        })
        .catch(err => {
            console.error("Error while activating the product: ", err);
            return res.status(500).send({ error: "Error while activating the product" });
        });
};

module.exports.searchProductByName = (req, res) => {
    const { name } = req.body;

    Product.find({ name: { $regex: name } })
        .then(products => {
            if (!products) {
                return res.status(404).send({ error: "Product not found" });
            } else {
                return res.status(200).send({ products });
            }
        })
        .catch(err => {
            console.error("Error while retrieving the product: ", err);
            return res.status(500).send({ error: "Error while retrieving the product" });
        });

};

module.exports.searchProductByPriceRange = (req, res) => {
    const { minPrice, maxPrice } = req.body;

    Product.find({ $and: [{ price: { $gte: minPrice } }, { price: { $lte: maxPrice } }] })
        .then(products => {
            if (products.length < 1) {
                return res.status(404).send({ error: "No product found with that specified price range" });
            } else {
                return res.status(200).send({ products });
            }
        })
        .catch(err => {
            console.error("Error while retrieving the product: ", err);
            return res.status(500).send({ error: "Error while retrieving the product" });
        });

};