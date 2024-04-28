const Order = require('../models/order.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/coupon.model');
const Product = require('../models/product.model')
const Billing = require('../models/billing.model');

const generateRandomOrderId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderId = '#';
    for (let i = 0; i < 8; i++) {
        orderId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return orderId;
};

// exports.createOrder = async (req, res) => {
//     const { cart_id: cartId, user_id: userId, product_id: productId, quantity, size, coupon_code, price } = req.body;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         let cart, products;

//         if (cartId) {
//             cart = await Cart.findById(cartId);
//         } else if (productId) {
//             const product = await Product.findById(productId);
//             if (!product) {
//                 return res.status(404).send({ error: 'Product not found' });
//             }
//             if (!quantity || isNaN(quantity) || quantity < 1) {
//                 return res.status(400).send({ error: 'Quantity must be a positive number' });
//             }
//             products = [{
//                 productId: productId,
//                 name: product.name,
//                 quantity: quantity,
//                 price,
//                 size
//             }];
//         }

//         if (!cart && !products) {
//             return res.status(400).send({ error: 'Either cart_id or product_id must be provided' });
//         }

//         if (cart && (cart.userId.toString() !== userId)) {
//             return res.status(404).send({ error: 'Cart is not associated with this user' });
//         }

//         products = products || cart.products;

//         let totalBill = products.reduce((total, product) => {
//             return total + (product.price * product.quantity);
//         }, 0);

//         if (coupon_code) {
//             const coupon = await Coupon.findOne({ code: coupon_code });
//             if (!coupon) {
//                 return res.status(400).send({ error: 'Coupon not found' });
//             }

//             if (coupon.userUsed && coupon.userUsed.includes(userId) && coupon.userUsed.filter(id => id.toString() === userId).length >= coupon.couponUsedLimit) {
//                 return res.status(400).send({ error: 'User has already reached the coupon usage limit' });
//             }

//             const discountAmount = coupon.discount;
//             totalBill -= discountAmount;

//             coupon.userUsed.push(userId);
//             await coupon.save();

//             if (!user.coupons) {
//                 user.coupons = [];
//             }
//             user.coupons.push({
//                 couponId: coupon._id,
//                 code: coupon.code,
//                 discount: coupon.discount
//             });
//             await user.save();
//         }

//         const order = new Order({
//             owner: userId,
//             products: products,
//             bill: totalBill
//         });

//         order.order_id = generateRandomOrderId();

//         const savedOrder = await order.save();

//         const update = {
//             $push: {
//                 order_ids: {
//                     _id: savedOrder._id,
//                     orderId: savedOrder.order_id
//                 }
//             }
//         };
//         await User.findByIdAndUpdate(userId, update);

//         res.status(201).send(savedOrder);
//     } catch (error) {
//         res.status(400).send({ error: 'Error creating order', details: error.message });
//     }
// };

//////////////////////////////////////////////////////////////////////////
// exports.createOrder = async (req, res) => {
//     const { cart_id: cartId, user_id: userId, orderTotal, selectedBillingId, couponUsed, couponDiscount, razorpayPaymentId } = req.body;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         const cart = await Cart.findById(cartId);

//         if (!cart || cart.userId.toString() !== userId) {
//             return res.status(404).send({ error: 'Cart is not associated with this user' });
//         }

//         // let totalBill = cart.products.reduce((total, product) => {
//         //     return total + (product.price * product.quantity);
//         // }, 0);

//         // Fetch billing information if selectedBillingId is provided
//         let billingAddress = null;
//         if (selectedBillingId) {
//             const billingInfo = await Billing.findOne({ user_id: userId });
//             if (!billingInfo) {
//                 return res.status(404).send({ error: 'Billing information not found for this user' });
//             }
//             billingAddress = billingInfo.billings.id(selectedBillingId);
//             if (!billingAddress) {
//                 return res.status(404).send({ error: 'Selected billing address not found' });
//             }
//         }

       

//         // Create order instance
//         const order = new Order({
//             owner: userId,
//             products: cart.products,
//             bill: orderTotal,
//             billing_address: billingAddress,
//             couponUsed: couponUsed,
//             actual_bill: Number(orderTotal) + Number(couponDiscount),
//             payment_id: razorpayPaymentId,
//             couponDiscount,
//         });

//         order.order_id = generateRandomOrderId();

//         const savedOrder = await order.save();

//         // Update user's order history
//         const update = {
//             $push: {
//                 order_ids: {
//                     _id: savedOrder._id,
//                     orderId: savedOrder.order_id
//                 }
//             }
//         };
//         await User.findByIdAndUpdate(userId, update);

//         await Cart.deleteOne({ _id: cartId });

//         res.status(201).send(savedOrder);
//     } catch (error) {
//         res.status(400).send({ error: 'Error creating order', details: error.message });
//     }
// };
//////////////////////////////////////////////////////////////////////////////


exports.createOrder = async (req, res) => {
    const { product_id: productId, cart_id: cartId, user_id: userId, orderTotal, selectedBillingId, couponUsed, couponDiscount, razorpayPaymentId, quantity, selected_size: selectedSize } = req.body;

    try {
      if (!productId && !cartId) {
            return res.status(400).send({ error: 'Either product ID or cart ID must be provided' });
        }

       let products = [];
        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send({ error: 'Product not found' });
            }
           const selectedProductSize = product.size.find(size => size.size === selectedSize);
            if (!selectedProductSize) {
                return res.status(404).send({ error: 'Selected size not found for this product' });
            }
            products.push({
                productId: product._id,
                name: product.product_name,
                quantity: quantity || 1, 
                price: selectedProductSize.price,
                selected_size: selectedSize,
                product_image: product.product_image[0], 
                actual_price: product.actual_price,
                sale_price: product.sale_price
            });
            await Product.findByIdAndUpdate(productId, { $inc: { total_orders_of_product: 1 } });
        } else {
            const cart = await Cart.findById(cartId);
            if (!cart || cart.userId.toString() !== userId) {
                return res.status(404).send({ error: 'Cart is not associated with this user' });
            }
            products = cart.products.map(product => ({
                productId: product.productId,
                name: product.name,
                quantity: product.quantity,
                price: product.price,
                selected_size: product.selected_size,
                product_image: product.product_image,
                actual_price: product.actual_price,
                sale_price: product.sale_price
            }));
            for (const product of cart.products) {
                await Product.findByIdAndUpdate(product.productId, { $inc: { total_orders_of_product: 1 } });
            }
        
        }

        let billingAddress = null;
        if (selectedBillingId) {
            const billingInfo = await Billing.findOne({ user_id: userId });
            if (!billingInfo) {
                return res.status(404).send({ error: 'Billing information not found for this user' });
            }
            billingAddress = billingInfo.billings.id(selectedBillingId);
            if (!billingAddress) {
                return res.status(404).send({ error: 'Selected billing address not found' });
            }
        }

       const order = new Order({
            owner: userId,
            products,
            bill: orderTotal,
            billing_address: billingAddress,
            couponUsed: couponUsed,
            actual_bill: Number(orderTotal) + Number(couponDiscount),
            payment_id: razorpayPaymentId,
            couponDiscount,
        });

        order.order_id = generateRandomOrderId();

        const savedOrder = await order.save();

       const update = {
            $push: {
                order_ids: {
                    _id: savedOrder._id,
                    productIds: products.map(product => product.productId),
                    orderId: savedOrder.order_id
                }
            }
        };
        await User.findByIdAndUpdate(userId, update);

        if (cartId) {
            await Cart.deleteOne({ _id: cartId });
        }

        res.status(201).send(savedOrder);
    } catch (error) {
        res.status(400).send({ error: 'Error creating order', details: error.message });
    }
};


// exports.createOrder = async (req, res) => {
//     const { cart_id: cartId, user_id: userId, coupon_code } = req.body;

//     try {
//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         const cart = await Cart.findById(cartId);

//         if (!cart || cart.userId.toString() !== userId) {
//             return res.status(404).send({ error: 'Cart is not associated with this user' });
//         }

//         let totalBill = cart.products.reduce((total, product) => {
//             return total + (product.price * product.quantity);
//         }, 0);

        
//         if (coupon_code) {
//             const coupon = await Coupon.findOne({ code: coupon_code });
//             if (coupon) {
//                if (!coupon) {
//                 return res.status(400).send({ error: 'Coupon not found' });
//             }

//            if (coupon.userUsed && coupon.userUsed.includes(userId) && coupon.userUsed.filter(id => id.toString() === userId).length >= coupon.couponUsedLimit) {
//                 return res.status(400).send({ error: 'User has already reached the coupon usage limit' });
//             }
//             //for percentage
//                 // const discountAmount = (coupon.discount / 100) * totalBill;  

//             //for fixed amount
//                 const discountAmount = coupon.discount;

//                 totalBill -= discountAmount;

//                 coupon.userUsed.push(userId);
//                 await coupon.save();

//                 if (!user.coupons) {
//                     user.coupons = [];
//                 }
//                 user.coupons.push({
//                     couponId: coupon._id,
//                     code: coupon.code,
//                     discount: coupon.discount
//                 });
//                 await user.save();
//             }
//         }

//         const order = new Order({
//             owner: userId,
//             products: cart.products,
//             bill: totalBill
//         });

//         order.order_id = generateRandomOrderId();

//          const savedOrder = await order.save();

//         const update = {
//             $push: {
//                 order_ids: {
//                     _id: savedOrder._id,
//                     orderId: savedOrder.order_id,
//                     // order_date: Date.now()
//                 }
//             }
//         };
//         await User.findByIdAndUpdate(userId, update);
        
//         res.status(201).send(savedOrder);
//     } catch (error) {
//         res.status(400).send({ error: 'Error creating order', details: error.message });
//     }
// };

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.send(orders);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getOrder = async (req, res) => {

    try {
        const order = await Order.findById(req.params.order_id);
        const user = await User.findById(req.params.user_id);
        if (!order) {
            return res.status(404).send();
        }

        if (!user) {
            return res.status(404).send();
        }
        res.send(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

// exports.updateOrder = async (req, res) => {
//     try {
//         const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//         if (!order) {
//             return res.status(404).send();
//         }
//         const user = await User.findById(req.params.user_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(order);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// };

// exports.deleteOrder = async (req, res) => {
//     try {
//         const order = await Order.findByIdAndDelete(req.params.id);
//         if (!order) {
//             return res.status(404).send();
//         }
//         const user = await User.findById(req.params.user_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         console.log(error);
//         res.send(order);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// };

exports.getAllOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ owner: req.params.user_id });
        res.send(orders);
    } catch (error) {
        res.status(500).send(error);
    }
};

// exports.postOrderNew = async (req, res) => {
//     try {
//         // Extract data from request body
//         const { user_id, selectedBillingId, orderTotal, productIds } = req.body;

//         // Check if userId is provided
//         if (!user_id) {
//             return res.status(400).json({ error: 'User ID is required' });
//         }

       
//         const user = await Billing.findOne({ user_id });

//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const billing = user.billings.id(selectedBillingId);

//         if (!billing) {
//             return res.status(404).json({ error: 'Billing information not found' });
//         }

//         // Retrieve product details
//         const products = await Product.find({ _id: { $in: productIds } });
//         if (!products) {
//             return res.status(404).json({ error: 'Products not found' });
//         }

//         // Prepare order data
//         const orderProducts = products.map(product => ({
//             productId: product._id,
//             name: product.name,
//             quantity: 1, // You may need to adjust this based on your requirements
//             price: product.price, // Assuming product price is used
//             // Add other product details as needed
//         }));

//         // Create new order
//         const order = new Order({
//             owner: userId,
//             products: orderProducts,
//             bill: orderTotal,
//             billing: billing, // Add the billing information to the order
//         });

//         // Generate random order ID
//         order.order_id = generateRandomOrderId();

//         // Save the order
//         const savedOrder = await order.save();

//         // Update user's order history
//         const update = {
//             $push: {
//                 order_ids: {
//                     _id: savedOrder._id,
//                     orderId: savedOrder.order_id
//                 }
//             }
//         };
//         await User.findByIdAndUpdate(userId, update);

//         // Send response
//         res.status(201).json(savedOrder);
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ error: 'Error creating order', details: error.message });
//     }
// };

