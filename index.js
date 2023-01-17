import express from "express";
import {trendyol} from "./getters/getters.js";
import {womenCategories} from "./getters/utils.js";
import axios from "axios";
import creator from "./creator/creator.js";
import db from "./helpers/db.js";
const app = express();
const port = 3000;
const url = 'http://localhost:' + port
app.get('/products', async (req, res) => {
    const {from, to, totalProductCountPerCategory} = req.query;
    const products = await trendyol.getProductsFromMultiCategory({
        categoryList: womenCategories, totalProductCountPerCategory: 100, isHasVariant: false
    })

    res.send({results: products, total: products.length})
});


app.get('/creator', async (req, res) => {
    // const response = await axios.get(url + '/products');
    // response.data.results = response.data.results;
    const product = await trendyol.getProductDetail('https://www.trendyol.com/yaren/uc-gozlu-kullanisli-capraz-canta-p-40730015')
    await creator.etsy({products: [product], res});

    res.send('ok')
})

app.get('/product-detail', async (req, res) => {
    const {url} = req.query;
    try {
        const product = await trendyol.getProductDetail(url)
        res.send(product)
    }catch (e) {
        console.log(e);
        res.send('has error')
    }
})
app.get('/', async (req, res) => {
    db.add({
        trendyolUrl:'',
        etsyUrl:''
    })
    res.send()
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})