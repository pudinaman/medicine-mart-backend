const { product } = require('../models');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

exports.getCart = async (req, res) => {
    try {
        const userId = req.params.userId; 
        const cart = await Cart.findOne({ userId });

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        if (!cart || cart.products.length === 0) {
            return res.status(200).send(null);
        }

        res.status(200).send(cart);
    } catch (error) {
        console.error('Error retrieving cart:', error);
        res.status(500).send({ error: 'Error retrieving cart', details: error.message });
    }
};


// exports.addToCart = async (req, res) => {
//     try {
//         const { userId, productId, quantity, price, selected_size } = req.body;
//         if (!userId || !productId || !quantity || !price || !selected_size) {
//             return res.status(400).send({ error: 'Missing required fields in request body' });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).send({ error: 'User not found' });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send({ error: 'Product not found', productId });
//         }

//         let cart = await Cart.findOne({ userId });
//         if (!cart) {
//             cart = new Cart({ userId, products: [] });
//         }

//         let productIndex = cart.products.findIndex(product => product.productId.toString() === productId);

//         let productPrice = price || product.price; 

//         if (productIndex !== -1) {
//             cart.products[productIndex].quantity = quantity;
//         } else {
//             cart.products.push({
//                 productId: product._id,
//                 name: product.product_name,
//                 quantity,
//                 actual_price: product.price,
//                 sale_price: product.sale_price,
//                 price,
//                 selected_size
//             });
//         }

//         cart.bill = cart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

//         await cart.save();
//         console.log(`Cart saved for ${userId} for product ${productId} with quantity ${quantity} and price ${price}`);
//         const status = productIndex !== -1 ? 200 : 201;
//         res.status(status).send(cart);
//     } catch (error) {
//         console.error('Error adding to cart:', error);
//         res.status(400).send(error);
//     }
// };

exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, price, selected_size } = req.body;
        if (!userId || !productId || !quantity || !price || !selected_size) {
            return res.status(400).send({ error: 'Missing required fields in request body' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found', productId });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, products: [] });
        }

        const existingProductIndex = cart.products.findIndex(product => product.productId.toString() === productId && product.selected_size === selected_size);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity = quantity;
        } else {
            const existingProductDifferentSize = cart.products.find(product => product.productId.toString() === productId && product.selected_size !== selected_size);

            if (existingProductDifferentSize) {
                 cart.products.push({
                    productId: product._id,
                    name: product.product_name,
                    quantity,
                    actual_price: product.price,
                    sale_price: product.sale_price,
                    price,
                    selected_size,
                    product_image: product.product_image[0]
                });
            } else {cart.products.push({
                    productId: product._id,
                    name: product.product_name,
                    quantity,
                    actual_price: product.price,
                    sale_price: product.sale_price,
                    price,
                    selected_size,
                    product_image: product.product_image[0]
                });
            }
        }

        cart.bill = cart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

        await cart.save();
        console.log(`Cart saved for ${userId} for product ${productId} with quantity ${quantity} and price ${price}`);
        const status = existingProductIndex !== -1 ? 200 : 201;
        res.status(status).send(cart);
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(400).send(error);
    }
};



exports.removeFromCart = async (req, res) => {
    try {
        const cartId = req.params.id;
        const userId = req.params.userId; 
        const productId = req.query.productId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const cart = await Cart.findOne(cartId);

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        const productIndex = cart.products.findIndex(product => product.productId.toString() === productId);

        if (productIndex === -1) {
            return res.status(404).send({ error: 'Product not found in cart' });
        }

        cart.products.splice(productIndex, 1);

        if (cart.products.length === 0) {
            await Cart.findOneAndDelete({ userId }); 
            return res.status(200).send({ productId, message: 'Product removed and cart deleted successfully (No products in cart)' });
        }

        cart.bill = cart.products.reduce((total, product) => total + (product.price * product.quantity), 0);

        await cart.save();
        try {
            await cart.save();
            res.send(cart);
          } catch (err) {
            if (err instanceof mongoose.Error.VersionError) {
              return res.status(409).send('Conflict, please retry');
            } else {
              throw err;
            }
          }
        } catch (error) {
            
        }
    };

exports.deleteCart = async (req, res) => {
    try {
        const userId = req.params.userId; 

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        const cart = await Cart.findOneAndDelete({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        res.status(200).send({ message: 'Cart deleted successfully' });
    } catch (error) {
        console.error('Error deleting cart:', error);
        res.status(500).send({ error: 'Error deleting cart', details: error.message });
    }
};

// exports.updateCart = async (req, res) => {
//     try {
//         const { userId, productId, quantity, product_name, price } = req.body;

//         if (!userId || !productId || !quantity || !product_name || !price) {
//             return res.status(400).send({ error: 'Missing required fields in request body' });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send({ error: 'Product not found' });
//         }

//         // Find the product in the user's cart by productId and name
//         const updatedCart = await Cart.findOne({ 
//             userId, 
//             "products.productId": productId,
//             "products.name": product_name
//         });

//         if (!updatedCart) {
//             // If the product with the specific productId and name doesn't exist in the cart, add it
//             const newProduct = {
//                 productId: product._id,
//                 name: product.product_name,
//                 quantity,
//                 price,
//             };

//             const newCart = await Cart.findOneAndUpdate(
//                 { userId },
//                 { $push: { products: newProduct } },
//                 { new: true }
//             );

//             if (!newCart) {
//                 return res.status(404).send({ error: 'Cart not found' });
//             }

//             newCart.bill = newCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
//             await newCart.save();
//             return res.status(200).send(newCart);
//         }

//         // If the product with the specific productId and name exists in the cart, update its quantity or price
//         let productToUpdate = updatedCart.products.find(prod => prod.productId == productId && prod.name == product_name && prod.price == price);

//         if (productToUpdate) {
//             productToUpdate.quantity = quantity;
//         } else {
//             // If the product with the specific productId, name, and price doesn't exist in the cart, add it
//             const newProduct = {
//                 productId: product._id,
//                 name: product.product_name,
//                 quantity,
//                 price,
//             };

//             updatedCart.products.push(newProduct);
//         }

//         updatedCart.bill = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
//         await updatedCart.save();
//         res.status(200).send(updatedCart);
//     } catch (error) {
//         console.error('Error updating cart:', error);
//         res.status(500).send({ error: 'Error updating cart', details: error.message });
//     }
// };
exports.updateCart = async (req, res) => {
    try {
        const { userId, products } = req.body;

        if (!userId || !products || !Array.isArray(products)) {
            return res.status(400).send({ error: 'Missing required fields in request body' });
        }

        let updatedCart = await Cart.findOne({ userId });

        if (!updatedCart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        for (let product of products) {
            const { productId, quantity, product_name, price } = product;

            const productInDb = await Product.findById(productId);
            if (!productInDb) {
                return res.status(404).send({ error: 'Product not found' });
            }

            let productInCart = updatedCart.products.find(p => p.productId.toString() === productId && p.name === product_name && p.price === price);

            if (productInCart) {
                productInCart.quantity = quantity;
            } else {
                updatedCart.products.push(product);
            }
        }

        updatedCart.bill = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
        await updatedCart.save();

        res.status(200).send(updatedCart);
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send({ error: 'Error updating cart', details: error.message });
    }
};
// exports.updateCart = async (req, res) => {
//     try {
//         const { userId, productId, quantity, product_name, price } = req.body;

//         if (!userId || !productId || !quantity || !product_name || !price) {
//             return res.status(400).send({ error: 'Missing required fields in request body' });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send({ error: 'Product not found' });
//         }

//         let updatedCart = await Cart.findOneAndUpdate({ 
//             userId, 
//             products: { $elemMatch: { productId: productId, name: product_name, price: price } }
//         }, { 
//             $set: { "products.$.quantity": quantity }
//         }, { new: true });

//         if (!updatedCart) {
//             return res.status(404).send({ error: 'Product not found in cart' });
//         }

//         // Recalculate the bill
//         updatedCart.bill = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
//         await updatedCart.save();

//         console.log('Cart updated:', updatedCart);

//         return res.status(200).send(updatedCart);
//     } catch (error) {
//         console.error('Error updating cart:', error);
//         res.status(500).send({ error: 'Error updating cart', details: error.message });
//     }
// };


// exports.updateCart = async (req, res) => {
//     try {
//         const { userId, productId, quantity } = req.body;

//         if (!userId || !productId || !quantity) {
//             return res.status(400).send({ error: 'Missing required fields in request body' });
//         }

//         const product = await Product.findById(productId);
//         if (!product) {
//             return res.status(404).send({ error: 'Product not found' });
//         }

//         const updatedCart = await Cart.findOneAndUpdate(
//             { userId, "products.productId": productId },
//             { $set: { "products.$.quantity": quantity } },
//             { new: true }
//         );

//         if (!updatedCart) {
//             const newProduct = {
//                 productId: product._id,
//                 name: product.product_name,
//                 quantity,
//                 price: product.price
//             };

//             const newCart = await Cart.findOneAndUpdate(
//                 { userId },
//                 { $push: { products: newProduct } },
//                 { new: true }
//             );

//             if (!newCart) {
//                 return res.status(404).send({ error: 'Cart not found' });
//             }

//             newCart.bill = newCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
//             await newCart.save();
//             res.status(200).send(newCart);
//         } else {
//             updatedCart.bill = updatedCart.products.reduce((total, product) => total + (product.price * product.quantity), 0);
//             await updatedCart.save();
//             res.status(200).send(updatedCart);
//         }
//     } catch (error) {
//         console.error('Error updating cart:', error);
//         res.status(500).send({ error: 'Error updating cart', details: error.message });
//     }
// };

exports.getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).send(carts);
    } catch (error) {
        console.error('Error retrieving carts:', error);    
        res.status(500).send({ error: 'Error retrieving carts', details: error.message });
    }
};