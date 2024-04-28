const Product = require('../models/product.model');
const User = require('../models/user.model');

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
        res.status(400).send(error);
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        let query = Product.find();

        if (req.query.sort === 'newest') {
            query = query.sort({ createdAt: -1 });
        }

        const products = await query;
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getProductById = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findById(_id);
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateProduct = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findByIdAndUpdate(_id, req.body, { new: true });
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (error) {
        res.status(400).send(error);
    }
};

exports.deleteProduct = async (req, res) => {
    const _id = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(_id);
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};



exports.getSimilarProducts = async (req, res) => {
    const category = req.params.category;
    try {
        const products = await Product.find({ category: category }).limit(2);
        if (products.length === 0) {
            return res.status(404).send();
        }
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getProductsByMaxTotalOrders = async (req, res) => {
    try {
        const products = await Product.find().sort({ total_orders_of_product: -1 });
        if (!products || products.length === 0) {
            return res.status(404).send({ error: 'No products found' });
        }
        res.send(products);
    } catch (error) {
        res.status(500).send(error);
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
        res.status(500).send(error);
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
        res.status(500).send(error);
    }
};