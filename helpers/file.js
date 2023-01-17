import Downloader from "nodejs-file-downloader"
import fs from "node:fs/promises";
import path from "node:path";
import {v4 as uuidv4} from "uuid"

const constants = {
    directory: './downloads'
}

const downloadHelper = (url) => new Downloader({
    url,
    directory: constants.directory,
    onBeforeSave: (deducedName) => {
        const fileName = deducedName.split('.')[0];
        const extension = deducedName.split('.')[1];
        return `${fileName}_${uuidv4()}.${extension}`
    },
})


const file = {
    async downloadOneFile(url) {
        try {
            return await downloadHelper(url).download();
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    async downloadMultiFile(urls) {
        const files = []
        await Promise.all(urls.map(async (x) => {
            const file = await this.downloadOneFile(x);
            files.push(file)
        }));
        return files.filter(x => !!x);
    },
    clearFileDirectory: async () => {
        for (const file of await fs.readdir(constants.directory)) {
            await fs.unlink(path.join(constants.directory, file));
        }
    }
}


export default file;