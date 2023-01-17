import translatte from "translatte";
const translateHelper = {
    async translate(message) {
        const {text} = await translatte(message, {to: 'en'});

        return text;
    }
}

export default translateHelper