const Checkout = require('../models/checkout.model');
const Billing = require('../models/billing.model');
const Order = require('../models/order.model');

// exports.createCheckout = async (req, res) => {
//     try {
//       // Extract the billingId from the request body
//       const { billingId, orderId, taxPrice, shippingPrice, paymentMethod, isPaid, paidAt, paymentResult } = req.body;
  
//       // Retrieve the billing document with the specified billingId
//       const billing = await Billing.findById(billingId);
  
//       if (!billing) {
//         return res.status(404).json({ message: 'Billing not found' });
//       }
  
//       // Find the billing address object by its ObjectId within the billings array
//       const billingAddressObj = billing.billings.find(billing => billing._id.equals(billingId));
  
//       if (!billingAddressObj) {
//         return res.status(404).json({ message: 'Billing address not found' });
//       }
  
//       // Extract the billing address from the found billing address object
//       const shippingAddress = billingAddressObj.address;
//       const total_bill_amount = order.bill + (taxPrice || 0.0) + (shippingPrice || 0.0);
      
//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({ message: 'Order not found' });
//       }

//       const items = order.products.map(product => ({
//         productId: product.productId,
//         name: product.name,
//         quantity: product.quantity,
//         price: product.price
//       }));

//       // Create the checkout object with the extracted billing address as shippingAddress
//       const checkout = await Checkout.create({
//         user: req.user._id, // Assuming you have authenticated users and have access to the user ID
//         items,
//         shippingAddress,
//         paymentMethod,
//         shippingPrice,
//         totalPrice : total_bill_amount,
//         orderStatus,
//         taxPrice,
//         isPaid,
//         paidAt,
//         paidAmount: total_bill_amount,
//         paymentResult,
//         order_id: orderId

//         // Other fields as needed
//       });
  
//       res.status(201).json(checkout);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };

//   exports.createCheckout = async (req, res) => {
//     try {
//       // Extract the billingId from the request body
//       const { billingId, billingObjectId, orderId, taxPrice, shippingPrice, paymentMethod, isPaid, paidAt, paymentResult } = req.body;
  
//       // Retrieve the billing document with the specified billingId
//       const billing = await Billing.findById(billingId);
  
//       if (!billing) {
//         return res.status(404).json({ message: 'Billing not found' });
//       }
  
//       // Find the billing address object by its ObjectId within the billings array
//       const billingObj = billing.billings.find(billing => billing._id.$oid === billingObjectId);
  
//       if (!billingObj) {
//         return res.status(404).json({ message: 'Billing address not found' });
//       }
  
//       // Extract the billing address from the found billing address object
//       const shippingAddress = billingObj.address;
  
//       const order = await Order.findById(orderId);
  
//       if (!order) {
//         return res.status(404).json({ message: 'Order not found' });
//       }
  
//       const items = order.products.map(product => ({
//         productId: product.productId,
//         name: product.name,
//         quantity: product.quantity,
//         price: product.price
//       }));
  
//       // Calculate total_bill_amount after retrieving order
//       const total_bill_amount = order.bill + (taxPrice || 0.0) + (shippingPrice || 0.0);
  
//       // Define orderStatus or remove it if not needed
//       const orderStatus = "Pending"; // Example status, replace with actual logic
  
//       // Create the checkout object with the extracted billing address as shippingAddress
//       const checkout = await Checkout.create({
//         user: req.user._id, // Assuming you have authenticated users and have access to the user ID
//         items,
//         shippingAddress,
//         paymentMethod,
//         shippingPrice,
//         totalPrice: total_bill_amount,
//         orderStatus,
//         taxPrice,
//         isPaid,
//         paidAt,
//         paidAmount: total_bill_amount,
//         paymentResult,
//         order_id: orderId
//         // Other fields as needed
//       });
  
//       res.status(201).json(checkout);
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };
exports.createCheckout = async (req, res) => {
    try {
      // Extract the billingId and billingObjectId from the request body
      const { user_id, billingId, billingObjectId, orderId, taxPrice, shippingPrice, paymentMethod, isPaid, paidAt, paymentResult } = req.body;
  
      console.log('Received billingId:', billingId);
      console.log('Received billingObjectId:', billingObjectId);
  
      // Retrieve the billing document with the specified billingId
      const billing = await Billing.findById(billingId);
  
      console.log('Retrieved billing document:', billing);
  
      if (!billing) {
        return res.status(404).json({ message: 'Billing not found' });
      }
  
      if (!billing.billings || !Array.isArray(billing.billings)) {
        return res.status(400).json({ message: 'Invalid billing document format: billings array is missing or not an array' });
      }
  
      console.log('Billing billings array:', billing.billings);
  
      // Find the billing object by its ID
      const billingObj = billing.billings.find(b => b && b._id && b._id.toString() === billingObjectId);
  
      console.log('Found billing object:', billingObj);
  
      if (!billingObj) {
        return res.status(404).json({ message: 'Billing address not found. Make sure the billingObjectId is correct.' });
      }
  
      // Extract the billing address from the found billing object
      const shippingAddress = billingObj.address;
  
      const order = await Order.findById(orderId);
  
      console.log('Retrieved order:', order);
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      const items = order.products.map(product => ({
        productId: product.productId,
        name: product.name,
        quantity: product.quantity,
        price: product.price
      }));
  
      // Calculate total_bill_amount after retrieving order
      const total_bill_amount = order.bill + (taxPrice || 0.0) + (shippingPrice || 0.0);
  
      // Define orderStatus or remove it if not needed
      const orderStatus = "Pending"; // Example status, replace with actual logic
  
      // Create the checkout object with the extracted billing address as shippingAddress
      const checkout = await Checkout.create({
        user: user_id, // Assuming you have authenticated users and have access to the user ID
        items,
        shippingAddress,
        paymentMethod,
        shippingPrice,
        totalPrice: total_bill_amount,
        orderStatus,
        taxPrice,
        isPaid,
        paidAt,
        paidAmount: total_bill_amount,
        paymentResult,
        order_id: orderId
        // Other fields as needed
      });
  
      res.status(201).json(checkout);
    } catch (err) {
      console.error('Error:', err);
      res.status(400).json({ message: err.message });
    }
  };
  
  
exports.getCheckout = async (req, res) => {
  const { id } = req.params;
  try {
    const checkout = await Checkout.findById(id);
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json(checkout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCheckout = async (req, res) => {
  const { id } = req.params;
  try {
    const checkout = await Checkout.findByIdAndUpdate(id, req.body, { new: true });
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json(checkout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCheckout = async (req, res) => {
  const { id } = req.params;
  try {
    const checkout = await Checkout.findByIdAndRemove(id);
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found' });
    }
    res.status(200).json({ message: 'Checkout deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    res.status(200).json(checkouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

