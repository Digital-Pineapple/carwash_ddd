import { Router } from 'express';
import { ShoppingCartRepository } from '../../repository/shoppingCart/ShoppingCartRepository'; 
import ShoppingCartModel from '../../models/ShoppingCartModel';
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';
import { ShoppingCartUseCase } from '../../../application/shoppingCart.ts/ShoppingCartUseCase';
import { ShoppingCartController } from '../../controllers/shoppingCart/shoppingCartController';
import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { StockStoreHouseRepository } from '../../repository/stockStoreHouse/StockStoreHouseRepository';
import StockStoreHouseModel from '../../models/stockStoreHouse/StockStoreHouseModel';
import { StockStoreHouseUseCase } from '../../../application/storehouse/stockStoreHouseUseCase';
import { ShippingCostRepository } from '../../repository/shippingCostRepository/ShippingCostRepository';
import ShippingCostModel from '../../models/ShippingCostModel';
import { ShippingCostUseCase } from '../../../application/shippingCost/ShippingCostUseCase';

const shoppingCartRouter = Router();

const shoppingCartRepository    = new ShoppingCartRepository(ShoppingCartModel);
const shoppingCartUseCase      = new ShoppingCartUseCase(shoppingCartRepository);
const s3Service = new S3Service();
const stockStoreHouseRepository = new StockStoreHouseRepository(StockStoreHouseModel);
const stockStoreHouseUseCase = new StockStoreHouseUseCase(stockStoreHouseRepository);
const shippingCostRepository = new ShippingCostRepository(ShippingCostModel);
const shippingCostUseCase = new ShippingCostUseCase(shippingCostRepository);
const shoppingCartController   = new ShoppingCartController(shoppingCartUseCase, stockStoreHouseUseCase, shippingCostUseCase, s3Service);

const userValidations = new UserValidations();

shoppingCartRouter
    .get('/all', shoppingCartController.getAllShoppingCarts)
    .get('/', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.getShoppingCart)
    .post('/', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.createShoppingCart)
    .put('/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.updateShoppingCart )
    .delete('/membership/:id', shoppingCartController.deleteMembershipInCart)
    .delete('/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.deleteShoppingCart)
    .delete('/product/:id', userValidations.authTypeUserValidation(['CUSTOMER']), shoppingCartController.deleteProductCart)
    .delete('/products/ok', userValidations.authTypeUserValidation(['CUSTOMER']), shoppingCartController.emptyCart)
    .put('/products/:id', userValidations.authTypeUserValidation(['CUSTOMER']), shoppingCartController.addToCart)
    .put('/product/quantity/:id', userValidations.authTypeUserValidation(['CUSTOMER']), shoppingCartController.updateProductQuantity)
    .put ('/merge/ok', shoppingCartController.mergeCart) 
    .get('/no-auth', shoppingCartController.getNoAuthCart)


export default shoppingCartRouter;
