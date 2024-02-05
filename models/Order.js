const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productsOrdered: [
        { productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" } },
        { quantity: { type: Number, default: 0 } },
        { subTotal: { type: Number, default: 0 } }
    ],
    totalPrice: { type: Number, default: 0 },
    orderedOn: { type: Date, default: Date.now },
    status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Order", orderSchema);