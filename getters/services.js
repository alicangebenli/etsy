import axios from "axios";

const services = {
    getProductDetail: async (productId) => {
        return await axios.get(`https://public.trendyol.com/discovery-web-productgw-service/api/productDetail/${productId}?storefrontId=1&culture=tr-TR&linearVariants=true&isLegalRequirementConfirmed=false`)
    },
    getProductGroups: async (productGroupId) => {
        return await axios.get(`https://public.trendyol.com/discovery-web-websfxproductgroups-santral/api/v1/product-groups/${productGroupId}`);
    }
}

export default services;