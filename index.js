import express from "express";
import {trendyol} from "./getters/getters.js";
import {womenCategories} from "./getters/utils.js";
import axios from "axios";

const app = express();
const port = 3000;

app.get('/products', async (req, res) => {
    const products = await trendyol.getProductUrlsFromMultiCategory(womenCategories, 10);
    const productsDetail = [];
    await Promise.all(products.map(async (x) => {
        try {
            const detail = await trendyol.getProductDetail(x);
            productsDetail.push(
                detail
            )
        } catch (e) {
            // console.log(e, x)
            productsDetail.push(e);
        }
    }))


    res.send({results: productsDetail, total: productsDetail.length})
});

app.get('/creator', async (req,res) => {
    const products = await axios.get('http://localhost:3000/products');

    res.send(products.data)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})