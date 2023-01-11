import puppeteer from 'puppeteer';
import cookies from "../cookies.js";

const creator = {
    etsy: async ({products}) => {
        const browser = await puppeteer.launch({
            headless: false, args: [`--window-size=1920,1080`], defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        const page = await browser.newPage();
        await page.setCookie(...cookies)
        await page.goto('https://www.etsy.com/your/shops/TurkeyShopAnkara/tools/listings/create')
        const elementHandle = await page.$('#listing-edit-image-upload');
        await elementHandle.uploadFile('/Users/ali.gebenli/Downloads/1_org_zoom.jpeg')
    }
}



