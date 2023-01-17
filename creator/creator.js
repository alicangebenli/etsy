import puppeteer from 'puppeteer';
import cookies from "../cookies.js";
import file from "../helpers/file.js";
import axios from "axios";
import db from "../helpers/db.js";

const creator = {
    async etsy({products, res}) {
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
            res
        })
        await db.add({
            trendyolUrl: url,
            etsyUrl: product.url
        })
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
    async create({imageIds, productGroupId, price, title, desc, formattedPrice, res}) {
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
                'cookie': 'user_prefs=dEvrw12blIWNZMJTzfIYDQbhlQFjZACC5J23p8HoaKWQoEglnbzSnBwdpdQ83dBgJR2gEFTECELhImIZAA..; fve=1673124758.0; ua=531227642bc86f3b5fd7103a0c0b4fd6; _gcl_au=1.1.1639382770.1673124760; _tt_enable_cookie=1; _ttp=2805cFkBCeDGwmA0BLS6POCpmgB; _pin_unauth=dWlkPU9XSXlObVV5WWpBdFkyWXhNaTAwWldKbExUZ3lZalV0WWpVMk1qazFORFZpWlRBeg; G_ENABLED_IDPS=google; session-key-apex=683690058-1130702022807-1e5febfd1dc6c1241047bc3197c329403de7cea54c2e8bc286645903|1675716764; LD=1; last_browse_page=https%3A%2F%2Fwww.etsy.com%2F; dashboard_stats_range=all_time; uaid=XbX5aDc3LCQTZQXhzZbvZmxHfdZjZACC5J23p4Hpw3lc1UqliZkpSlZK2amhrhHhGc4--akRJm7pqZGBkboWLsXeRQaRPkq1DAA.; _gid=GA1.2.1869869820.1673868594; session-key-www=683690058-1130702022807-08e844594cef74a0564bc82ad96ba348a4154114b98d035af7c88b9c|1676481788; et-v1-1-1-_etsy_com=2%3A5dad0647a7a90f1a6e0a75bcdb717dba55bfdadd%3A1673124763%3A1673953776%3A__athena_compat-683690058-1130702022807-53a48461de6efbf73aed2b7bc981adb7c417bee68a2962be5b9175f4b5593577035a57aa9b9ecca5; _ga=GA1.1.1819584751.1673124760; _uetsid=1905ade0959111edbdc5e5bd773998f3; _uetvid=399091208ecd11edaec5f3870363f26d; _ga_KR3J610VYM=GS1.1.1673974238.16.1.1673976004.56.0.0; et-v1-1-1-_etsy_com=2%3A2a0eee92ed39c841126a8e1ad3dd5273f6ffdeed%3A1673124763%3A1673974228%3A__athena_compat-683690058-1130702022807-53a48461de6efbf73aed2b7bc981adb7c417bee68a2962be5b9175f4b5593577035a57aa9b9ecca5',
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
            return false
        }
    }
}

export default creator;



