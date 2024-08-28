"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth/"));
const services_1 = __importDefault(require("./services"));
const typeCar_1 = __importDefault(require("./typeCar"));
const Category_1 = __importDefault(require("./Category"));
const subCategory_1 = __importDefault(require("./subCategory"));
const commission_1 = __importDefault(require("./commission"));
const documentation_1 = __importDefault(require("./documentation"));
const carDetail_1 = __importDefault(require("./carDetail"));
const membership_1 = __importDefault(require("./membership"));
const membershipBenefit_1 = __importDefault(require("./membershipBenefit"));
const branchOffice_1 = __importDefault(require("./branchOffice"));
const product_1 = __importDefault(require("./product"));
const StockBranch_1 = __importDefault(require("./StockBranch"));
const typeUser_1 = __importDefault(require("./typeUser"));
const user_1 = __importDefault(require("./user"));
const servicesInBranch_1 = __importDefault(require("./servicesInBranch"));
const payments_1 = __importDefault(require("./payments"));
const shoppingCart_ts_1 = __importDefault(require("./shoppingCart.ts"));
const stockStoreHouse_1 = __importDefault(require("./stockStoreHouse"));
const storeHouse_1 = __importDefault(require("./storeHouse"));
const productOrder_1 = __importDefault(require("./productOrder"));
const shippingCost_1 = __importDefault(require("./shippingCost"));
const discountCoupon_1 = __importDefault(require("./discountCoupon"));
const sockets_1 = __importDefault(require("./sockets"));
const dynamicRoute_1 = __importDefault(require("./dynamicRoute"));
const apiRouter = () => {
    const apiRouter = (0, express_1.Router)();
    apiRouter.use('/auth', auth_1.default);
    apiRouter.use('/user', user_1.default);
    apiRouter.use('/services', services_1.default);
    apiRouter.use('/services-branch', servicesInBranch_1.default);
    apiRouter.use('/type-car', typeCar_1.default);
    apiRouter.use('/type-user', typeUser_1.default);
    apiRouter.use('/category', Category_1.default);
    apiRouter.use('/sub-category', subCategory_1.default);
    apiRouter.use('/commission', commission_1.default);
    apiRouter.use('/documentation', documentation_1.default);
    apiRouter.use('/car-detail', carDetail_1.default);
    apiRouter.use('/memberships', membership_1.default);
    apiRouter.use('/membership-benefits', membershipBenefit_1.default);
    apiRouter.use('/branch-offices', branchOffice_1.default);
    apiRouter.use('/product', product_1.default);
    apiRouter.use('/product-order', productOrder_1.default);
    apiRouter.use('/stock-branch', StockBranch_1.default);
    apiRouter.use('/payments', payments_1.default);
    apiRouter.use('/dynamic-route', dynamicRoute_1.default);
    apiRouter.use('/shipping-cost', shippingCost_1.default);
    apiRouter.use('/shopping-cart', shoppingCart_ts_1.default);
    apiRouter.use('/stock-StoreHouse', stockStoreHouse_1.default);
    apiRouter.use('/storehouse', storeHouse_1.default);
    apiRouter.use('/coupons', discountCoupon_1.default);
    apiRouter.use('/socket', sockets_1.default);
    return apiRouter;
};
exports.apiRouter = apiRouter;
const apiRouterx = (0, express_1.Router)();
apiRouterx.use('/auth', auth_1.default);
apiRouterx.use('/services', services_1.default);
apiRouterx.use('/services-branch', servicesInBranch_1.default);
apiRouterx.use('/type-car', typeCar_1.default);
apiRouterx.use('/type-user', typeUser_1.default);
apiRouterx.use('/category', Category_1.default);
apiRouterx.use('/sub-category', subCategory_1.default);
apiRouterx.use('/commission', commission_1.default);
apiRouterx.use('/documentation', documentation_1.default);
apiRouterx.use('/car-detail', carDetail_1.default);
apiRouterx.use('/memberships', membership_1.default);
apiRouterx.use('/membership-benefit', membershipBenefit_1.default);
apiRouterx.use('/branch-offices', branchOffice_1.default);
apiRouterx.use('/product', product_1.default);
apiRouterx.use('/product-order', productOrder_1.default);
apiRouterx.use('/payments', payments_1.default);
apiRouterx.use('/dynamic-route', dynamicRoute_1.default);
apiRouterx.use('/stock-branch', StockBranch_1.default);
apiRouterx.use('/shipping-cost', shippingCost_1.default);
apiRouterx.use('/shopping-cart', shoppingCart_ts_1.default);
apiRouterx.use('/stock-StoreHouse', stockStoreHouse_1.default);
apiRouterx.use('/storehouse', storeHouse_1.default);
apiRouterx.use('/coupons', discountCoupon_1.default);
exports.default = exports.apiRouter;
