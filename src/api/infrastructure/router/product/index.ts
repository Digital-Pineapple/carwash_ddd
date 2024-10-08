import { CategoryUseCase } from './../../../application/category/CategoryUseCase';
import { Router } from "express";
import { ProductRepository } from "../../repository/product/ProductRepository";
import { ProductUseCase } from "../../../application/product/productUseCase";
import { ProductController } from "../../controllers/Product/ProductController";
import { S3Service } from "../../../../shared/infrastructure/aws/S3Service";
import ProductModel from "../../models/products/ProductModel";
import { ProductValidations } from "../../../../shared/infrastructure/validation/Product/ProductValidation";
import { UserValidations } from "../../../../shared/infrastructure/validation/User/UserValidation";
import { CategoryRepository } from "../../repository/Category/CategoryRepository";
import CategoryModel from "../../models/CategoryModel";
import StockStoreHouseModel from '../../models/stockStoreHouse/StockStoreHouseModel';
import { StockStoreHouseRepository } from '../../repository/stockStoreHouse/StockStoreHouseRepository';
import { StockStoreHouseUseCase } from '../../../application/storehouse/stockStoreHouseUseCase';
import { SubCategoryUseCase } from '../../../application/subCategory/SubCategoryUseCase';
import { SubCategoryRepository } from '../../repository/subCategory/SubCategoryRepository';
import SubCategoryModel from '../../models/SubCategoryModel';

const productRouter = Router();

const productRepository = new ProductRepository(ProductModel);
const categoryRepository = new CategoryRepository(CategoryModel)
const subcategoryRepository = new SubCategoryRepository(SubCategoryModel)

const stockStoreHouseRepository = new StockStoreHouseRepository(StockStoreHouseModel);

const productUseCase = new ProductUseCase(productRepository);
const categoryUseCase = new CategoryUseCase(categoryRepository)
const subCategoryUseCase = new SubCategoryUseCase(subcategoryRepository);
const stockStoreHouseUseCase = new StockStoreHouseUseCase(stockStoreHouseRepository);

const s3Service = new S3Service();
const productvalidations = new ProductValidations()

const productController = new ProductController(productUseCase, categoryUseCase, stockStoreHouseUseCase, s3Service, subCategoryUseCase);
const userValidations = new UserValidations();

productRouter

  .get("/", userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.getAllProducts)
  .get("/:id", productController.getProduct)
  .get('/non-existent/get', productController.getNoStockProducts)
  .post("/addProduct", productvalidations.productValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.createProduct)
  .post('/search-category', productController.getProductsByCategory)
  .post("/updateInfo/:id", productvalidations.productValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.updateProduct)
  .put("/updateVideo/:id", productvalidations.videoValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.updateProductVideo)
  .put("/updateThumbnail/:id", productvalidations.thumbnailValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.updateThumbnail)
  .post("/addImageDetail/:id", productvalidations.imagesValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.addOneImageProduct)
  .post("/deleteImageDetail/:id", productvalidations.imagesValidation, userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.deleteOneImageDetail)
  .post('/search/ok', productController.searchProduct)
  .get("/productsByCategories/ok", productController.getProductsByCategories)
  .post("/productsBySubCategory/ok", productController.getProductsBySubCategory)
  .get("/videos/ok", productController.getVideos)
  .get("/recommendProducts/ok/:id", productController.getSimilarProducts)
  .delete("/:id", userValidations.authTypeUserValidation(['SUPER-ADMIN', "ADMIN"]), productController.deleteProduct)  

export default productRouter;
