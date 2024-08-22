import { Router } from 'express';
import { ShoppingCartRepository } from '../../repository/shoppingCart/ShoppingCartRepository'; 
import ShoppingCartModel from '../../models/ShoppingCartModel';
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';
import { ShoppingCartUseCase } from '../../../application/shoppingCart.ts/ShoppingCartUseCase';
import { ShoppingCartController } from '../../controllers/shoppingCart/shoppingCartController';
import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';

const shoppingCartRouter = Router();

const shoppingCartRepository    = new ShoppingCartRepository(ShoppingCartModel);
const shoppingCartUseCase      = new ShoppingCartUseCase(shoppingCartRepository);
const s3Service = new S3Service();

const shoppingCartController   = new ShoppingCartController(shoppingCartUseCase, s3Service);

const userValidations = new UserValidations();

shoppingCartRouter
    .get('/', shoppingCartController.getAllShoppingCarts)
    .get('/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.getShoppingCart)
    .post('/', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.createShoppingCart)
    .put('/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.updateShoppingCart )
    .delete('/membership/:id', shoppingCartController.deleteMembershipInCart)
    .delete('/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.deleteShoppingCart)
    .put('/product/:id', shoppingCartController.deleteProductInCart)
    .delete('/products/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.deleteProductsInShoppingCart)
    .put('/products/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.updateShoppingCartProducts)
    .put('/product/quantity/:id', userValidations.authTypeUserValidation(['CUSTOMER', 'ADMIN']), shoppingCartController.updateProductQuantity)
    .put ('/merge/ok', shoppingCartController.mergeCart)
    

export default shoppingCartRouter;
