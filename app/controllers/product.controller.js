const Product = require('../models/product.model');
const User = require('../models/user.model');
const slackLogger = require('../middlewares/webHook');

exports.createProduct = async (req, res) => {
    const userId = req.body.owner;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).send({ error: 'User not found' });
    }
    try {
        let productsToCreate = [];

        if (Array.isArray(req.body)) {
            productsToCreate = req.body;
        } else {
            productsToCreate.push(req.body);
        }
        const createdProducts = [];

        for (const productData of productsToCreate) {
            const product = new Product(productData);
            await product.save();
            createdProducts.push(product);
        }
        res.status(201).send(createdProducts);
    } catch (error) {
        console.error('Error creating product:', error);
        slackLogger('Error creating product', 'Failed to create product', error, req);
        res.status(400).send({ error: 'Error creating product', details: error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        let query = Product.find();

        const searchFields = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            searchFields.$or = [
                { product_name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { brand: searchRegex }
            ];
            query = query.find(searchFields);
        }

        if (req.query.sort === 'newest' || !req.query.sort) {
            query = query.sort({ createdAt: -1 });
        }

        const products = await query.exec();
        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products:', error);
        slackLogger('Error retrieving products', 'Failed to retrieve products', error, req);
        res.status(500).send({ error: 'Server Error', details: error.message });
    }
};

exports.getProductById = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).send(product);
    } catch (error) {
        console.error('Error retrieving product:', error);
        slackLogger('Error retrieving product', `Failed to retrieve product with ID ${_id}`, error, req);
        res.status(500).send({ error: 'Error retrieving product', details: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findByIdAndUpdate(_id, req.body, { new: true });
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).send(product);
    } catch (error) {
        console.error('Error updating product:', error);
        slackLogger('Error updating product', `Failed to update product with ID ${_id}`, error, req);
        res.status(400).send({ error: 'Error updating product', details: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(_id);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).send(product);
    } catch (error) {
        console.error('Error deleting product:', error);
        slackLogger('Error deleting product', `Failed to delete product with ID ${_id}`, error, req);
        res.status(500).send({ error: 'Error deleting product', details: error.message });
    }
};

exports.getSimilarProducts = async (req, res) => {
    const category = req.params.category;
    try {
        const products = await Product.find({ category }).limit(2);
        if (products.length === 0) {
            return res.status(404).send({ error: 'No similar products found' });
        }
        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving similar products:', error);
        slackLogger('Error retrieving similar products', `Failed to retrieve similar products for category ${category}`, error, req);
        res.status(500).send({ error: 'Error retrieving similar products', details: error.message });
    }
};

exports.getProductsByMaxTotalOrders = async (req, res) => {
    try {
        const products = await Product.find().sort({ total_orders_of_product: -1 });
        if (!products || products.length === 0) {
            return res.status(404).send({ error: 'No products found' });
        }
        res.status(200).send(products);
    } catch (error) {
        console.error('Error retrieving products by max total orders:', error);
        slackLogger('Error retrieving products by max total orders', 'Failed to retrieve products by max total orders', error, req);
        res.status(500).send({ error: 'Error retrieving products by max total orders', details: error.message });
    }
};

exports.postReview = async (req, res) => {
    const productId = req.params.id;
    const userId = req.body.userId;
    const { review_text, rating, images } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const existingReview = product.reviews.find(review => review.user.toString() === userId);
        if (existingReview) {
            return res.status(400).send({ error: 'User has already reviewed this product' });
        }

        const newReview = {
            user: userId,
            review_text,
            rating,
            images,
            username: user.username,
            avatar: user.avatar
        };

        product.reviews.push(newReview);
        await product.save();

        res.status(201).send(product);
    } catch (error) {
        console.error('Error posting review:', error);
        slackLogger('Error posting review', `Failed to post review for product with ID ${productId}`, error, req);
        res.status(500).send({ error: 'Error posting review', details: error.message });
    }
};

exports.getReviews = async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const reviews = product.reviews;
        res.status(200).send(reviews);
    } catch (error) {
        console.error('Error retrieving reviews:', error);
        slackLogger('Error retrieving reviews', `Failed to retrieve reviews for product with ID ${productId}`, error, req);
        res.status(500).send({ error: 'Error retrieving reviews', details: error.message });
    }
};
