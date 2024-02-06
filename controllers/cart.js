const Cart = require("../models/Cart");
const Product = require("../models/Product");

module.exports.getUserCart = (req, res) => {
    const userId = req.user.id;
    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).send({ message: "Cart not found for the user" });
            } else {
                return res.status(200).send({ cart });
            }
        })
        .catch(err => {
            console.log("Error while retrieving the cart: ", err);
            return res.status(500).send({ error: "Error while retrieving the cart" });
        });
};

module.exports.addToCart = (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).send({ message: 'Product ID is required' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).send({ message: "Quantity is required and must be a positive integer greater than 0" });
    }

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).send({ error: "Product not found" });
            }

            const subTotal = product.price * quantity;
            const userId = req.user.id;

            Cart.findOne({ userId })
                .then(cart => {
                    if (!cart) {
                        cart = new Cart({
                            userId,
                            cartItems: []
                        });
                    }

                    const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

                    if (existingCartItem) {
                        existingCartItem.quantity += quantity;
                        existingCartItem.subTotal += subTotal;
                    } else {
                        cart.cartItems.push({ productId, quantity, subTotal });
                    }

                    cart.totalPrice += subTotal;

                    cart.save()
                        .then(savedCart => {
                            return res.status(201).send({ message: "Cart has been saved", savedCart });
                        })
                        .catch(err => {
                            console.error("Error adding items to the cart: ", err);
                            return res.status(500).send({ error: "Error adding items to the cart" })
                        });

                })
                .catch(err => {
                    console.log("Error while retrieving the cart: ", err);
                    return res.status(500).send({ error: "Error while retrieving the cart" });
                });
        })
        .catch(err => {
            console.log("Error while retrieving the product: ", err);
            return res.status(500).send({ error: "Error while retrieving the product" });
        });
};

module.exports.updateQuantity = (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId) {
        return res.status(400).send({ message: 'Product ID is required' });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).send({ message: "Quantity is required and must be a positive integer greater than 0" });
    }

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).send({ error: "Product not found" });
            }

            const newSubTotal = product.price * quantity;
            const userId = req.user.id;

            Cart.findOne({ userId })
                .then(cart => {
                    if (!cart) {
                        return res.status(404).send({ message: "Cart not found for the user" });
                    }

                    const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

                    if (!existingCartItem) {
                        return res.status(404).send({ message: "Product not found in the user's cart" });
                    }

                    existingCartItem.quantity = quantity;
                    existingCartItem.subTotal = newSubTotal;

                    cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subTotal, 0);

                    cart.save()
                        .then(updatedCart => {
                            return res.status(200).send({ message: "Cart has been updated successfully", updatedCart });
                        })
                        .catch(err => {
                            return res.status(500).send({ error: "Error while updating cart" })
                        });

                })
                .catch(err => {
                    console.error("Error while retrieving the cart for update: ", err);
                    return res.status(500).send({ error: "Error while retrieving the cart for update" })
                });


        })
        .catch(err => {
            console.log("Error while retrieving the product: ", err);
            return res.status(500).send({ error: "Error while retrieving the product" });
        });

};

module.exports.removeFromCart = (req, res) => {
    
};