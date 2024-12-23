import { Router } from 'express';

import { VariantProductRepository } from '../../repository/variantProduct/VariantProductRepository';
import { VariantProductUseCase } from '../../../application/variantProduct/VariantProductUseCase';
import { VariantProductController  } from '../../controllers/variantProduct/VariantProductController';
import {VariantProductModel} from '../../models/variantProduct/VariantProductModel';
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';
import { ProductRepository } from '../../repository/product/ProductRepository';
import ProductModel from '../../models/products/ProductModel';
import { ProductUseCase } from '../../../application/product/productUseCase';
import { StockStoreHouseRepository } from '../../repository/stockStoreHouse/StockStoreHouseRepository';
import StockStoreHouseModel from '../../models/stockStoreHouse/StockStoreHouseModel';
import { StockStoreHouseUseCase } from '../../../application/storehouse/stockStoreHouseUseCase';

const variantProductRouter = Router();

const variantProductRepository     = new VariantProductRepository(VariantProductModel);
const stockStoreHouseRepository = new StockStoreHouseRepository(StockStoreHouseModel)
const productRepository = new ProductRepository(ProductModel)
const variantProductUseCase        = new VariantProductUseCase(variantProductRepository);
const productUseCase = new ProductUseCase(productRepository)
const stockStoreHouseUseCase = new StockStoreHouseUseCase(stockStoreHouseRepository)
const variantProductController     = new VariantProductController(variantProductUseCase, stockStoreHouseUseCase);
const userValidations = new UserValidations();

variantProductRouter
.post('/',userValidations.authTypeUserValidation(['SUPER-ADMIN', 'ADMIN']), variantProductController.createVariant)
.post('/delete-image/:id',userValidations.authTypeUserValidation(['SUPER-ADMIN', 'ADMIN']), variantProductController.deleteImageVariant)
.delete('/:id',userValidations.authTypeUserValidation(['SUPER-ADMIN', 'ADMIN']), variantProductController.deleteVariant)
   

export default variantProductRouter;
