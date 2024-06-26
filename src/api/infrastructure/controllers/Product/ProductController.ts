import { CategoryUseCase } from './../../../application/category/CategoryUseCase';
import { body } from 'express-validator';
import { Request, Response, NextFunction, response } from 'express';
import { ErrorHandler } from "../../../../shared/domain/ErrorHandler";
import { ResponseData } from "../../../../shared/infrastructure/validation/ResponseData";
import { ProductUseCase } from "../../../application/product/productUseCase";
import { S3Service } from "../../../../shared/infrastructure/aws/S3Service";
import { stringify } from 'uuid';
import { errorMonitor } from 'nodemailer/lib/xoauth2';
import { StockStoreHouseUseCase } from '../../../application/storehouse/stockStoreHouseUseCase';
import { ProductEntity } from '../../../domain/product/ProductEntity';

export class ProductController extends ResponseData {
  protected path = "/product";

  constructor(
    private productUseCase: ProductUseCase,
    private categoryUseCase: CategoryUseCase,
    private stockStoreHouseUseCase : StockStoreHouseUseCase,
    private readonly s3Service: S3Service
  ) {
    super();
    this.getAllProducts = this.getAllProducts.bind(this);
    this.getProduct = this.getProduct.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.searchProduct = this.searchProduct.bind(this);
    this.getNoStockProducts = this.getNoStockProducts.bind(this);
    this.getProductsByCategory = this.getProductsByCategory.bind(this);
  }

  public async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.productUseCase.getProducts();
      if (!(response instanceof ErrorHandler)) {
        const updatedResponse = await Promise.all(
          response.map(async (item: any) => {
            const images = item.images;
            const updatedImages = await Promise.all(
              images.map(async (image: any) => {
                const url = await this.s3Service.getUrlObject(
                  image + ".jpg"
                );
                return url;
              })
            );
            item.images = updatedImages;
            return item;
          })
        );

        this.invoke(updatedResponse, 200, res, "", next);
      }

    } catch (error) {
      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }


  public async getProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const response = await this.productUseCase.getProduct(id);

      if (!(response instanceof ErrorHandler) && response !== null) {
        if (response.images) {
          const updatedImages = await Promise.all(
            response.images.map(async (image: any) => {
              const url = await this.s3Service.getUrlObject(image + ".jpg");
              return url;
            })
          );
          response.images = updatedImages;
        }

      }

      this.invoke(response, 200, res, "", next);
    } catch (error) {
      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }

  async getNoStockProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products: any[] = await this.productUseCase.getProducts(); // Asegúrate de definir el tipo correcto para getProducts()
      const stock: any[] = await this.stockStoreHouseUseCase.getStockNoDetail('662fe69b9ba1d8b3cfcd3634'); // Asegúrate de definir el tipo correcto para getStockNoDetail()

      // Obtener los IDs de productos y stock
      const productIds = new Set(products.map((product) => product._id.toString()));
      const stockProductIds = new Set(stock.map((item) => item.product_id.toString()));

      // Filtrar productos que no tienen stock asociado
      const productsNotInStock = products.filter((product) => !stockProductIds.has(product._id.toString()));

      // Filtrar elementos de stock que no están asociados a productos
      const stockNotInProducts = stock.filter((item) => !productIds.has(item.product_id.toString()));

      // Combinar ambos resultados
      const uniqueElements = [...productsNotInStock, ...stockNotInProducts];


      this.invoke(uniqueElements, 200, res, "", next);
    } catch (error) {
     
      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }
  
  



  public async createProduct(req: Request, res: Response, next: NextFunction) {
    const { name, price, description, size, tag, category, subCategory, weight } = req.body;

    const createSlug = (slug: string): string => {
      let processedSlug = slug
        .replace(/[`~!@#$%^&*()_\-+=\[\]{};:'"\\|\/,.<>?\s]/g, ' ') // Caracteres especiales
        .toLowerCase() // Minúsculas
        .trim() // Espacios al principio y al final
        .replace(/\s+/g, '_'); // Reemplazo de espacios con guiones bajos

      return processedSlug;
    };


    try {
      const slug = createSlug(name);

      let response2: any = []


      if (req.files && req.files.length > 0) {
        const paths: string[] = [];
        const urls: string[] = [];

        let response = await this.productUseCase.createProduct(
          name,
          price,
          description,
          size,
          tag,
          slug,
          category,
          subCategory,
          weight

        );
        if (!(response instanceof ErrorHandler)) {

          await Promise.all(
            req.files.map(async (item: any, index: number) => {
              const pathObject = `${this.path}/${response?._id}/${index}`;
              const { url } = await this.s3Service.uploadToS3AndGetUrl(
                pathObject + '.jpg',
                item,
                'image/jpg'
              );
              paths.push(pathObject);
              urls.push(url);
            })
          );
          response = await this.productUseCase.updateProduct(response?._id, {
            images: paths,
          });
          response.images = urls;
          response2 = response
        }
        else {
          response2 = response
        }

      } else {

        let response = await this.productUseCase.createProduct(
          name,
          price,
          description,
          size,
          tag,
          slug,
          category,
          subCategory,
          weight

        );
        response2 = response
      }

      this.invoke(response2, 201, res, 'Producto creado con éxito', next);

    } catch (error) {


      next(new ErrorHandler('Hubo un error al crear el producto', 500));
    }
  }


  public async updateProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { name, price, description, slug, size, category, subCategory,weight } = req.body;

    try {

      if (req.files && req.files.length > 0) {
        const paths: string[] = [];
        const urls: string[] = [];
        await Promise.all(req.files.map(async (item: any, index: number) => {
          const pathObject: string = `${this.path}/${id}/${index}`;
          const { url } = await this.s3Service.uploadToS3AndGetUrl(
            pathObject + ".jpg",
            item,
            "image/jpg"
          );
          paths.push(pathObject);
          urls.push(url)
        }));

        const response = await this.productUseCase.updateProduct(id, {
          slug,
          name,
          price,
          description,
          size,
          category,
          subCategory,
          images: paths,
          weight
        });
        response.images = urls

        this.invoke(response, 201, res, 'Se actualizó con éxito', next);
      } else {
        const response = await this.productUseCase.updateProduct(id, {
          name,
          price,
          description,
          slug,
          size,
          category,
          subCategory,
          weight
        });

        this.invoke(response, 201, res, 'Se actualizó con éxito', next);

      }
    } catch (error) {
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }


  public async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const available = await this.stockStoreHouseUseCase.getProductStock(id,'662fe69b9ba1d8b3cfcd3634')
      if (available?.stock > 0) {return  next(new ErrorHandler("No se puede eliminar hay existencias de este producto", 500));
      }else{
        const response = await this.productUseCase.deleteProduct(id);
        this.invoke(response, 201, res, "Eliminado con exito", next);
      }
    } catch (error) {
      next(new ErrorHandler("Hubo un error eliminar", 500));
    }
  }
  public async searchProduct(req: Request, res: Response, next: NextFunction) {
    const { search } = req.body


    try {
      const response = await this.productUseCase.searchProduct(search)
      this.invoke(response, 201, res, 'Busqueda exitosa', next);
    } catch (error) {

      next(new ErrorHandler("Hubo un error al buscar", 500));
    }

  }
  public async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    const { category } = req.body

    try {
      const categoria = await this.categoryUseCase.getDetailCategoryByName(category);
      const response = await this.productUseCase.searchProductsByCategory(categoria._id);
      this.invoke(response, 201, res, '', next);
    } catch (error) {

      next(new ErrorHandler("Hubo un error al obtener la información", 500));
    }

  }
}
