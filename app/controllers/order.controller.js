const Order = require('../models/order.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/coupon.model');

const generateRandomOrderId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderId = '#';
    for (let i = 0; i < 8; i++) {
        orderId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return orderId;
};

exports.createOrder = async (req, res) => {
    const { cart_id: cartId, user_id: userId, coupon_code } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const cart = await Cart.findById(cartId);

        if (!cart || cart.userId.toString() !== userId) {
            return res.status(404).send({ error: 'Cart is not associated with this user' });
        }

        let totalBill = cart.products.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);

        
        if (coupon_code) {
            const coupon = await Coupon.findOne({ code: coupon_code });
            if (coupon) {
               if (!coupon) {
                return res.status(400).send({ error: 'Coupon not found' });
            }

           if (coupon.userUsed && coupon.userUsed.includes(userId) && coupon.userUsed.filter(id => id.toString() === userId).length >= coupon.couponUsedLimit) {
                return res.status(400).send({ error: 'User has already reached the coupon usage limit' });
            }
            //for percentage
                // const discountAmount = (coupon.discount / 100) * totalBill;  

            //for fixed amount
                const discountAmount = coupon.discount;

                totalBill -= discountAmount;

                coupon.userUsed.push(userId);
                await coupon.save();

                if (!user.coupons) {
                    user.coupons = [];
                }
                user.coupons.push({
                    couponId: coupon._id,
                    code: coupon.code,
                    discount: coupon.discount
                });
                await user.save();
            }
        }

        const order = new Order({
            owner: userId,
            products: cart.products,
            bill: totalBill
        });

        order.order_id = generateRandomOrderId();

         const savedOrder = await order.save();

        const update = {
            $push: {
                order_ids: {
                    _id: savedOrder._id,
                    orderId: savedOrder.order_id,
                    // order_date: Date.now()
                }
            }
        };
        await User.findByIdAndUpdate(userId, update);
        
        res.status(201).send(savedOrder);
    } catch (error) {
        res.status(400).send({ error: 'Error creating order', details: error.message });
    }
};

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