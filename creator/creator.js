import puppeteer from 'puppeteer';
import cookies from "../cookies.js";
import file from "../helpers/file.js";
import axios from "axios";
import db from "../helpers/db.js";

const creator = {
    async etsy({products}) {
        const {images, productGroupId, price, enTitle, formattedPrice, enDesc, title, desc, url} = products[0];
        /*Files*/
        await file.clearFileDirectory();
        const files = await file.downloadMultiFile(images);
        const imagePaths = files.map(x => x.filePath);
        const imagesList = await this.imageLoader({images: imagePaths});

        const product = await this.create({
            imageIds: imagesList.map(x => x.id),
            imageUrls: imagesList.map(x => x.url),
            productGroupId,
            price,
            title: enTitle || title,
            formattedPrice,
            desc: enDesc || desc,
        })
        await db.add({
            trendyolUrl: url,
            etsyUrl: product.url
        });
        await file.clearFileDirectory();
    },
    async imageLoader({images}) {
        const browser = await puppeteer.launch({
            headless: true,
            // args: [`--window-size=1920,1080`],
            // defaultViewport: {
            //     width: 1920,
            //     height: 1080
            // },
            // devtools: true
        });
        const page = await browser.newPage();
        await page.setCookie(...cookies)
        await page.goto('https://www.etsy.com/your/shops/TurkeyShopAnkara/tools/listings/create')
        // await page.setRequestInterception(true);
        //const fileNames = [];
        // await page.on('request', req => {
        //     const headers = req.headers();
        //     const url = req.url();
        //     if (url === 'https://www.etsy.com/your/image/upload/listings') {
        //         const file = headers['x-file-name'];
        //         fileNames.push({
        //             id: parseInt(file.split('.')[0]),
        //             extension: file.split('.')[1]
        //         })
        //     }
        //     req.continue();

        const elementHandle = await page.$('#listing-edit-image-upload');
        await elementHandle.uploadFile(...images);
        await page.waitForTimeout(8000);
        const imagesList = await page.evaluate(async () => {
            const ids = [...document.querySelectorAll('[data-region="images"] [data-image] button[data-action="view"]')].map(x => {
                const url = x.getAttribute('style').split('url(')[1].split(')')[0];
                const id = parseInt(url.split('/').slice(-2)[0])
                return {
                    url,
                    id
                }
            })

            return Promise.resolve(ids)
        })
        await browser.close();
        return imagesList;
    },
    async create({imageIds, productGroupId, price, title, desc, formattedPrice}) {
        const cookie = cookies.map(x => x.name + '=' + x.value).join(';');

        const data = JSON.stringify({
            "publish": true,
            "currency_code": "TRY",
            "currency_symbol": "₺",
            "is_retail": true,
            "is_pattern": false,
            "is_onboarding": false,
            "is_creation": true,
            "non_taxable": false,
            "type": "physical",
            "quantity": 1,
            "listing_images": imageIds.map(x => {
                return {
                    "image_id": x
                }
            }),
            "tags": [],
            "materials": [],
            "publish_details": {
                "is_chargeable": true,
                "is_draftable": true
            },
            "item_weight": null,
            "item_weight_unit": "g",
            "item_length": null,
            "item_width": null,
            "item_height": null,
            "item_dimensions_unit": "mm",
            "should_auto_renew": true,
            "display_unit_price": false,
            "shipping": {
                "name": null,
                "origin_country_id": 203,
                "origin_postal_code": "06380",
                "min_processing_days": 1,
                "max_processing_days": 1,
                "handling_fee": 0,
                "international_handling_fee": 0,
                "has_international_handling_fee": false,
                "entries": [
                    {
                        "destination_country_id": 203,
                        "destination_region_id": 0,
                        "origin_country_id": 203,
                        "free_shipping": true,
                        "shipping_carrier_id": 60,
                        "min_delivery_time": null,
                        "max_delivery_time": null,
                        "primary_cost": 0,
                        "secondary_cost": 0,
                        "mail_class": "domestic",
                        "has_been_rendered": false,
                        "destination_country_name": "Turkey"
                    },
                    {
                        "destination_country_id": 0,
                        "destination_region_id": 0,
                        "origin_country_id": 203,
                        "free_shipping": true,
                        "shipping_carrier_id": 60,
                        "min_delivery_time": null,
                        "max_delivery_time": null,
                        "primary_cost": 0,
                        "secondary_cost": 0,
                        "mail_class": "international",
                        "has_been_rendered": false
                    }
                ],
                "upgrades": [],
                "calculated_options": [],
                "profile_type": "manual",
                "is_free_domestic_shipping": false,
                "is_free_international_shipping": false,
                "shop_id": 37708695,
                "currency_code": "TRY",
                "profile_id": null,
                "original_domestic_primary_cost": 0,
                "num_listings": 0,
                "did_processing_time_increase": false,
                "did_processing_time_decrease": false,
                "did_processing_time_stay_the_same": true
            },
            "translations": [],
            "source_shipping_profile_id": null,
            "inventory": {
                "children": [],
                "channels": [
                    {
                        "channel_id": 1,
                        "price": price,
                        "quantity": 1,
                        "is_enabled": true
                    }
                ],
                "sku": productGroupId.toString()
            },
            "attributes": [],
            "price": formattedPrice.toString(),
            "digital_fulfillment": 0,
            "is_waitlist_enabled": false,
            "is_personalizable": false,
            "should_advertise": true,
            "variation_images": [],
            "video": {
                "video_id": -1,
                "cropped_dimensions": {
                    "x": null,
                    "y": null,
                    "aspect_ratio": null,
                    "crop_url": null,
                    "crop_thumbnail_url": null
                },
                "videos_were_deleted": false
            },
            "title": title,
            "description": desc,
            "section_id": "",
            "section_ids": [
                ""
            ],
            "shipping_profile_id": null,
            "who_made": "someone_else",
            "when_made": "2020_2023",
            "is_supply": false,
            "file_ids": [],
            "production_partner_ids": [
                2468417
            ],
            "shipping_customs_settings": {
                "tariff_code": ""
            },
            "taxonomy_id": 161,
            "is_handmade": false,
            "is_vintage": false,
            "click_timestamp": 88913.20000001788,
            "is_csp_aware": true,
            "files": [],
            "is_taxable": true,
            "image_ids": imageIds,
            "_nnc": "3:1673976000:Gyw8V_t32Ec2tc3qe6_UCt_orKKL:1b4d88b226ab124b5f25bcb0b2ddedc3b8c3cba30618da4132df6d2dd9c81a27"
        });

        const config = {
            method: 'post',
            url: 'https://www.etsy.com/api/v3/ajax/shop/37708695/listings',
            headers: {
                'authority': 'www.etsy.com',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                'content-type': 'application/json',
                'cookie': cookie,
                'origin': 'https://www.etsy.com',
                'referer': 'https://www.etsy.com/your/shops/TurkeyShopAnkara/tools/listings/create',
                'sec-ch-ua': '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest'
            },
            data: data
        };
        try {
            const response = await axios(config);

            return response.data;
        } catch (e) {
            console.log(e)
            return false
        }
    }
}

export default creator;



