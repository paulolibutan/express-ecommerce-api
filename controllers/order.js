const Order = require("../models/Order");
const Cart = require("../models/Cart");

module.exports.checkoutOrder = (req, res) => {

    const isAdmin = req.user.isAdmin;
    const userId = req.user.id;

    if (isAdmin) {
        return res.status(403).send({ error: "Order checkout is only allowed for logged in customers" });
    }

    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).send({ message: "Cart not found for the user" });
            }

            if (cart.cartItems.length < 1) {
                return res.status(400).send({ message: "Cannot checkout order. The cart is empty" });
            }

            const order = new Order({
                userId,
                productsOrdered: cart.cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    subTotal: item.subTotal
                })),
                totalPrice: cart.totalPrice
            });

            order.save()
                .then(order => {
                    return res.status(201).send({ message: "Order has been checked out successfully", order });
                })
                .catch(err => {
                    console.log("Error while checking out the order: ", err);
                    return res.status(500).send({ error: "Error while checking out the order" });
                });

            cart.cartItems = [];
            cart.totalPrice = 0;
            cart.save();
                
        })
        .catch(err => {
            console.log("Error while retrieving the cart: ", err);
            return res.status(500).send({ error: "Error while retrieving the cart" });
        });
};

module.exports.getAllOrders = (req, res) => {
    Order.find()
        .then(orders => {
            if (!orders) {
                return res.status(404).send({ message: "No orders found" });
            } else {
                return res.status(200).send({ orders });
            }
        })
        .catch(err => {
            console.log("Error while retrieving the orders: ", err);
            return res.status(500).send({ error: "Error while retrieving the orders" });
        });
};

module.exports.getUserOrders = (req, res) => {
    const userId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (isAdmin) {
        return res.status(403).send({ error: "Retrieving orders is only allowed for logged in customers" });
    }

    Order.find({ userId })
        .then(orders => {
            if (!orders) {
                return res.status(404).send({ message: "No orders found for the user" });
            } else {
                return res.status(200).send({ orders });
            }
        })
        .catch(err => {
            console.log("Error while retrieving the orders: ", err);
            return res.status(500).send({ error: "Error while retrieving the orders" });
        });
};