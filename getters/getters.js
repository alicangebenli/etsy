import axios from "axios";
import {parse} from 'node-html-parser';
import {expectBrand, womenCategories} from "./utils.js";
import services from "./services.js";


const trendyol = {
    getProductUrlsFromOneCategory: async function ({
                                                       url = '',
                                                       totalPage,
                                                       currentPage = 1,
                                                       productList = [],
                                                       totalProductCount
                                                   }) {

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

        root.querySelectorAll('.p-card-wrppr').forEach(x => {
            const href = 'https://www.trendyol.com' + x.querySelector('a').getAttribute('href');
            const brand = x.querySelector('.product-down .prdct-desc-cntnr-ttl').innerText.trim();
            if (href && !expectBrand.includes(brand)) {
                productList.push(href.split('?')[0]);
            }
        })
        if ((totalPage && currentPage < totalPage) || (totalProductCount && productList.length <= totalProductCount)) {
            return await this.getProductUrlsFromOneCategory({
                url,
                totalPage,
                totalProductCount,
                currentPage: currentPage + 1,
                productList
            })
        } else {
            if (!!totalProductCount) {
                return productList.slice(0, totalProductCount);
            }
            return productList;
        }
    },
    getProductUrlsFromMultiCategory: async function (categoryList, totalProductCountPerCategory) {
        const products = [];
        await Promise.all(categoryList.map(async (x) => {
            const p = await this.getProductUrlsFromOneCategory({
                url: x.url,
                totalProductCountPerCategory
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
        const productGroupsResponse = await services.getProductGroups(product.productGroupId)
        let productDetails;
        if (productGroupsResponse.data?.result?.slicingAttributes?.[0]?.attributes) {
            productDetails = await Promise.all([
                ...productGroupsResponse.data.result.slicingAttributes[0].attributes.map(x => x.contents[0].id).map(x => {
                    return services.getProductDetail(x);
                })
            ])
        } else {
            productDetails = [await services.getProductDetail(product.id)]
        }

        const attributes = productDetails.map(p => {
            const data = p.data;
            const {images, attributes, allVariants} = data.result;
            return {
                images: images.map(x => 'https://cdn.dsmcdn.com' + x),
                color: attributes.find(x => x.key.name === 'Renk').value.name,
                size: allVariants.filter(x => x.inStock).map(x => {
                    return {
                        [x.value]: x.price
                    }
                })
            }
        })

        return {
            url,
            productGroupId: product.productGroupId,
            merchant: product.merchant.name,
            title: productContainer.querySelector('h1.pr-new-br span').innerText.trim().split(' ').slice(0, -1).join(' '),
            price: parseFloat(productContainer.querySelector('.prc-dsc').innerText.split('TL')[0].replace(',', '.')),
            attributes
        }
    }
}

export {
    trendyol
}