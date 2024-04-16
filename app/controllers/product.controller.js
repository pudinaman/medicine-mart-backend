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
        const products = await Product.find();
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
