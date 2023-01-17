import axios from "axios";
import {parse} from 'node-html-parser';
import {expectBrand} from "./utils.js";
import translateHelper from "../helpers/translate.js";

const toCurrencyString = function (value) {
    const newValue = value.toString().replace(/(\d)(?=(\d{3})+\b)/g, "$1,");

    return newValue.includes('.') ? newValue : newValue + '.00';
};


const trendyol = {
    getProductsFromSingleCategory: async function ({
                                                       url = '',
                                                       currentPage = 1,
                                                       productList = [],
                                                       totalProductCount,
                                                       isHasVariant = true,
                                                       fromPage = 1,
                                                   }) {
        if (currentPage < fromPage) {
            currentPage = fromPage
        }
        if (currentPage > 1) {
            const param = ('&pi=' + currentPage.toString());
            if (!url.includes('pi')) {
                url += param;
            } else {
                url = url.split('&pi')[0] + param;
            }
        }
        const response = await axios.get(url);
        const root = parse(response.data);

        await Promise.all(root.querySelectorAll('.p-card-wrppr').map(async (x) => {
            const href = 'https://www.trendyol.com' + x.querySelector('a').getAttribute('href');
            const brand = x.querySelector('.product-down .prdct-desc-cntnr-ttl').innerText.trim();
            if (href && !expectBrand.includes(brand)) {
                const url = href.split('?')[0]
                try {
                    const product = await this.getProductDetail(url);
                    if (!isHasVariant && product.isHasVariant) {
                        productList.push(product);
                    } else if (isHasVariant) {
                        productList.push(product);
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }))
        if (totalProductCount && productList.length <= totalProductCount) {
            return await this.getProductsFromSingleCategory({
                url,
                totalProductCount,
                currentPage: currentPage + 1,
                productList,
                isHasVariant
            })
        } else {
            if (!!totalProductCount) {
                return productList.slice(0, totalProductCount);
            }
            return productList;
        }
    },
    getProductsFromMultiCategory: async function ({
                                                      categoryList,
                                                      totalProductCountPerCategory,
                                                      isHasVariant,
                                                      fromPage
                                                  }) {
        const products = [];
        await Promise.all(categoryList.map(async (x) => {
            const p = await this.getProductsFromSingleCategory({
                fromPage,
                url: x.url,
                totalProductCount: totalProductCountPerCategory,
                isHasVariant
            });
            return products.push(...p);
        }));

        return products;
    },
    getProductDetail: async function (url) {
        const containerSelector = '.product-container';
        const response = await axios.get(url);
        const root = parse(response.data);
        const productContainer = root.querySelector(containerSelector);
        const {product} = JSON.parse(response.data.split('__PRODUCT_DETAIL_APP_INITIAL_STATE__=')[1].split('</script>')[0].split(';')[0]);
        const title = product?.name || productContainer.querySelector('h1.pr-new-br span').innerText.trim().split(' ').slice(0, -1).join(' ');
        const desc = [...root.querySelectorAll('.details-section .detail-desc-list li')].map(x => x.innerText).join(' ');
        const buyPrice = product?.price?.sellingPrice?.value || parseFloat(productContainer.querySelector('.prc-dsc').innerText.replace('.', '').replace(',', '.').split('TL')[0])
        const price = (buyPrice) * 10;
        let enTitle;
        try {
            enTitle = await translateHelper.translate(title)
        } catch (e) {
            console.log(e)
        }
        let enDesc;
        try {
            enDesc = await translateHelper.translate(desc)
        } catch (e) {
            console.log(e)
        }
        return {
            url,
            productGroupId: product.productGroupId,
            merchant: product.merchant.name,
            title: title,
            enTitle: enTitle,
            price: price,
            desc: desc,
            enDesc: enDesc,
            isHasVariant: product?.attributes?.length <= 1 && product?.variants?.length <= 1,
            images: product?.images.map(x => 'https://cdn.dsmcdn.com' + x),
            formattedPrice: toCurrencyString(price),
            buyPrice: buyPrice
        }
    },
    getProductVariants() {
        // const productGroupsResponse = await services.getProductGroups(product.productGroupId)
        // let productDetails;
        // if (productGroupsResponse.data?.result?.slicingAttributes?.[0]?.attributes) {
        //     productDetails = await Promise.all([
        //         ...productGroupsResponse.data.result.slicingAttributes[0].attributes.map(x => x.contents[0].id).map(x => {
        //             return services.getProductDetail(x);
        //         })
        //     ])
        // } else {
        //     productDetails = [await services.getProductDetail(product.id)]
        // }
        //
        // const attributes = productDetails.map(p => {
        //     const data = p.data;
        //     const {images, attributes, allVariants} = data.result;
        //     return {
        //         images: images.map(x => 'https://cdn.dsmcdn.com' + x),
        //         color: attributes.find(x => x.key.name === 'Renk').value.name,
        //         size: allVariants.filter(x => x.inStock).map(x => {
        //             return {
        //                 [x.value]: x.price
        //             }
        //         })
        //     }
        // })
    }
}

export {
    trendyol
}