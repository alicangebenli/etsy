import axios from "axios";

const binId = '63c6e1d201a72b59f24d4401';
const instance = axios.create({
    baseURL: 'https://api.jsonbin.io/v3',
    headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': '$2b$10$t1SBd.89LYSIsXzfKIIHM.snuILd7.ZTsbj5mln6ndzeTKq1JVDqq',
        'X-Access-Key': '$2b$10$P7SRHHcTkmFm7ttJEGD5ke84sScsVk06gL2E.cBo7.tTkXu/w/V1u',
    }
});

const Database = {
    async getAll() {
        const response = await instance.get(`/b/${binId}`);
        return response.data.record.products;
    },
    async add({trendyolUrl, etsyUrl}) {
        const data = await this.getAll();
        data.push({
            trendyolUrl,
            etsyUrl
        });
        await instance.put(`/b/${binId}`, {products: data})
    },
    async remove({trendyolUrl, etsyUrl}) {
        let data = this.getAll();
        data = data.filter(x => x.trendyolUrl !== trendyolUrl && x.etsyUrl !== etsyUrl);
        await instance.put('/b', {products: data})
    },
    async removeAll() {
        await instance.put(`/b/${binId}`, {products: []})
    }
}

export default Database;