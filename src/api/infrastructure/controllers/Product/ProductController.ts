import { IProductInput } from './../../../domain/stockBranch/StockBranchEntity';
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
import { StockBranchEntity } from '../../../domain/stockBranch/StockBranchEntity';
import { StockStoreHouseEntity } from '../../../domain/storehouse/stockStoreHouseEntity';
import { Category } from '../../../domain/category/CategoryEntity';
import { SubCategoryUseCase } from '../../../application/subCategory/SubCategoryUseCase';
import { createSlug, generateUUID, RandomCodeId } from '../../../../shared/infrastructure/validation/Utils';
import mongoose, { AnyObject } from 'mongoose';
import sharp from 'sharp';
import { ObjectId } from 'mongodb';


export class ProductController extends ResponseData {
  protected path = "/product";
  private readonly onlineStoreHouse = "662fe69b9ba1d8b3cfcd3634"

  constructor(
    private productUseCase: ProductUseCase,
    private categoryUseCase: CategoryUseCase,
    private stockStoreHouseUseCase: StockStoreHouseUseCase,
    private readonly s3Service: S3Service,
    private subCategoryUseCase: SubCategoryUseCase,
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
    this.getProductsByCategories = this.getProductsByCategories.bind(this);
    this.getProductsBySubCategory = this.getProductsBySubCategory.bind(this);
    this.getVideos = this.getVideos.bind(this);
    this.updateProductVideo = this.updateProductVideo.bind(this);
    this.updateThumbnail = this.updateThumbnail.bind(this);
    this.addOneImageProduct = this.addOneImageProduct.bind(this)
    this.deleteOneImageDetail = this.deleteOneImageDetail.bind(this);
    this.getSimilarProducts = this.getSimilarProducts.bind(this);
    this.updateURLS = this.updateURLS.bind(this);
    this.deleteVideoDetail = this.deleteVideoDetail.bind(this);
    this.addOneVideoProduct = this.addOneVideoProduct.bind(this);
    this.processFiles = this.processFiles.bind(this);

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
            const videos = item.videos;

            const updatedVideos = await Promise.all(
              videos.map(async (video: any) => {
                
                if (typeof video.url === 'string' && video.url.startsWith("https://")) {
                  return video; // Retorna el video original si la URL ya es válida
                }

                // Obtener nueva URL del objeto de S3
                const url = await this.s3Service.getUrlObject(video + ".mp4");
                return { ...video, url }; // Devuelve el objeto video con la nueva URL
              })
            );


            const thumbnail = item.thumbnail
            if (typeof thumbnail === 'string' && thumbnail.startsWith("https://")) {
              item.thumbnail = thumbnail;
            }
            if (thumbnail) {
              item.thumbnail = await this.s3Service.getUrlObject(
                (thumbnail) + ".jpg"
              );
            }

            item.images = updatedImages;
            item.videos = updatedVideos
            return item;
          })
        );

        this.invoke(updatedResponse, 200, res, "", next);
      }
    } catch (error) {
      console.log(error);

      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }


  public async getProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const responseStock = await this.stockStoreHouseUseCase.getProductStock(id, this.onlineStoreHouse)
      const responseProduct: any | null = await this.productUseCase.getProduct(id);
      const parsed = responseProduct.toJSON();
      let response = null;
      if (responseStock && responseStock.stock) {
        response = {
          ...parsed,
          stock: responseStock.stock
        }
      } else {
        response = responseProduct
      }
      if (!(response instanceof ErrorHandler) && response !== null) {

        if (response.images) {
          const updatedImages = await Promise.all(
            response.images.map(async (image: any) => {
              if (typeof image.url === 'string' && image.url.startsWith("https://")) {
                return { url: image.url, _id: image._id };
              }
              const url = await this.s3Service.getUrlObject(image.url + ".jpg");
              return { url: url, _id: image._id };
            })
          );
          response.images = updatedImages;
        }

        const videos = response.videos;

        const updatedVideos = await Promise.all(
          videos.map(async (video: any) => {
            
            if (typeof video.url === 'string' && video.url.startsWith("https://")) {
              return video; // Retorna el video original si la URL ya es válida
            }

            // Obtener nueva URL del objeto de S3
            const url = await this.s3Service.getUrlObject(video + ".mp4");
            return { ...video, url }; // Devuelve el objeto video con la nueva URL
          })
        );
        response.videos = updatedVideos
        const thumbnail = response.thumbnail

        if (typeof thumbnail === 'string' && thumbnail.startsWith("https://")) {
          response.thumbnail = thumbnail;
        } else if (!!thumbnail) {
          response.thumbnail = await this.s3Service.getUrlObject(
            (thumbnail) + ".jpg"
          );
        }
      }

      this.invoke(response, 200, res, "", next);
    } catch (error) {
      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }


  async getNoStockProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await this.productUseCase.getProducts(); // Asegúrate de definir el tipo correcto para getProducts()
      const stock: StockStoreHouseEntity[] = await this.stockStoreHouseUseCase.getStockNoDetail('662fe69b9ba1d8b3cfcd3634'); // Asegúrate de definir el tipo correcto para getStockNoDetail()

      // Obtener los IDs de productos y stock
      const productIds = new Set(products?.map((product: any) => product._id.toString()));
      const stockProductIds = new Set(stock.map((item) => item.product_id.toString()));

      // Filtrar productos que no tienen stock asociado
      const productsNotInStock = products.filter((product: any) => !stockProductIds.has(product._id.toString()));

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
    const data = { ...req.body };
  
    try {
      // Generar slug y SKU
      const slug = createSlug(data.name);
      const sku = RandomCodeId('PR');
  
      // Crear el producto base
      let product : any  = await this.productUseCase.createProduct({ ...data, slug, sku });
      if (product instanceof ErrorHandler) {
        return this.invoke(product, 400, res, 'Error al crear el producto', next);
      }
  
      // Procesar archivos por lotes si existen
      if (req.files && Array.isArray(req.files)) {
        const batchSize = 5; // Tamaño del lote (ajústalo según tus necesidades)
        const { images, videos, thumbnail } = await this.processFiles(req.files, product._id, req.body);
  
        // Actualizar producto con las URLs generadas
        product = await this.productUseCase.updateProduct(product._id, {
          images,
          videos,
          thumbnail,
        });
  
        Object.assign(product, { images, videos, thumbnail });
      }
  
      this.invoke(product, 201, res, 'Producto creado con éxito', next);
    } catch (error: any) {
      console.error(error);
  
      if (error?.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern)[0];
        const duplicatedValue = error.keyValue[duplicatedField];
        return res.status(400).json({
          error: `El campo ${duplicatedField} con valor '${duplicatedValue}' ya está en uso.`,
        });
      }
  
      next(new ErrorHandler(error, 500));
    }
  }
  
  /**
   * Procesa los archivos subidos al servidor.
   */
  public async processFiles(files: any[], productId: string, body: any) {
    const images: { url: string }[] = [];
    const videos: { url: string; type: string }[] = [];
    let thumbnail = '';
  
    await Promise.all(
      files.map(async (file: any, index: number) => {
        if (file.fieldname === 'images') {
          const path = `${this.path}/${productId}/images/${index}`;
          const { url } = await this.s3Service.uploadToS3AndGetUrl(path, file, 'image/webp');
          images.push({ url: url.split('?')[0] });
        } else if (file.fieldname === 'thumbnail') {
          const path = `${this.path}/thumbnail/${productId}`;
          const { url } = await this.s3Service.uploadToS3AndGetUrl(path, file, 'image/webp');
          thumbnail = url.split('?')[0];
        } else if (file.fieldname.startsWith('videos')) {
          const match = file.fieldname.match(/videos\[(\d+)\]\[file\]/);
          if (match) {
            const index = parseInt(match[1], 10);
            const videoType = body.videos?.[index]?.type || 'unknown';
            const path = `${this.path}/${productId}/videos/${index}.mp4`;
            const { url } = await this.s3Service.uploadToS3AndGetUrl(path, file, 'video/mp4');
            videos.push({ url: url.split('?')[0], type: videoType });
          }
        }
      })
    );
  
    return { images, videos, thumbnail };
  }
  


  public async updateProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { values } = req.body
    try {
      const response = await this.productUseCase.updateProduct(id, { ...values });

      this.invoke(response, 201, res, 'Se actualizó con éxito', next);

    } catch (error) {
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }

  public async updateProductVideo(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      let response: any;
      let video_paths: string[] = [];
      let video_urls: string[] = [];

      if (Array.isArray(req.files) && req.files.length > 0) {
        await Promise.all(
          req.files.map(async (item: any, index: number) => {
            const pathVideo = `${this.path}/${id}/${index}`;
            const { url } = await this.s3Service.uploadToS3AndGetUrl(
              pathVideo + ".mp4",
              item,
              "video/mp4"
            );
            video_paths.push(pathVideo);
            video_urls.push(url.split("?")[0] ?? "");
          }
          )
        );
      }

      response = await this.productUseCase.updateProduct(id, { videos: video_urls });
      response.videos = video_urls

      this.invoke(response, 201, res, 'Se actualizó con éxito', next);

    } catch (error) {
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }

  public async updateThumbnail(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      let response: any
      let thumbnail_path: string;
      let thumbnail_url: string;
      response = await this.productUseCase.getProduct(id)
      const pathThumbnail = `${this.path}/thumbnail/${response?._id}`;
      const { url } = await this.s3Service.uploadToS3AndGetUrl(
        pathThumbnail,
        req.file,
        'image/webp'
      );
      thumbnail_path = pathThumbnail
      thumbnail_url = url.split("?")[0] ?? "";
      response = await this.productUseCase.updateProduct(id, { thumbnail: thumbnail_url })
      response.thumbnail = thumbnail_url
      this.invoke(response, 201, res, 'Se actualizó con éxito', next);
    } catch (error) {
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }

  public async addOneImageProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      let response: any;

      response = await this.productUseCase.getProduct(id)
      if (req.file) {
        const imageId = generateUUID()
        const pathObject = `${this.path}/${response?._id}/${imageId}`;
        const { url } = await this.s3Service.uploadToS3AndGetUrl(
          pathObject,
          req.file,
          'image/webp'
        )
        const updatedImages = [...response.images, { url: url.split("?")[0] }];
        await this.productUseCase.updateProduct(id, { images: updatedImages });
      }
      response = await this.productUseCase.getProduct(id)
      // const updatedImages = await Promise.all(
      //   response.images.map(async (image: any) => {
      //     const url = await this.s3Service.getUrlObject(image.url + ".jpg");
      //     return { url: url, _id: image._id };
      //   })
      // );
      // response.images = updatedImages;
      this.invoke(response, 201, res, 'Se actualizó con éxito', next);
    } catch (error) {
      console.log(error);
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }

  public async addOneVideoProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { type } = req.body;

    try {
      const response: any = await this.productUseCase.getProduct(id);

      if (!Array.isArray(req.files) || req.files.length === 0) {
        return next(new ErrorHandler('No se subieron videos', 400)); // Error 400 para peticiones incorrectas
      }

      const newVideos = await Promise.all(
        req.files.map(async (item: any) => {
          const pathVideo = `${this.path}/${id}/${type}`;
          const { url } = await this.s3Service.uploadToS3AndGetUrl(
            pathVideo + ".mp4",
            item,
            "video/mp4"
          );
           const url1 =  url.split("?")[0] 
          return { url : url1, type };
        })
      );

      // Combinar correctamente los videos existentes con los nuevos
      const updatedVideos = [...(response.videos || []), ...newVideos];

      const updatedResponse = await this.productUseCase.updateProduct(id, { videos: updatedVideos });

      this.invoke(updatedResponse, 201, res, 'Se actualizó con éxito', next);
    } catch (error) {
      
      console.error('Error updating video product:', error); // Mensaje de error más descriptivo para logging
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }



  public async deleteOneImageDetail(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // ID del producto
    const { imageId } = req.body; // ID de la imagen a elimina

    try {
      // Obtiene el producto por su ID
      const product: any = await this.productUseCase.getProduct(id);

      if (!product) {
        return next(new ErrorHandler('Producto no encontrado', 404));
      }
      const updated: any = await this.productUseCase.deleteImageProduct(id, imageId)
      // const updatedImagesWithUrls = await Promise.all(
      //   updated.images.map(async (image: any) => {
      //     const url = await this.s3Service.getUrlObject(image.url + ".jpg");
      //     return { _id: image._id, url: url };
      //   })
      // );
      // // Actualiza el campo images con las URLs obtenidas
      // updated.images = updatedImagesWithUrls;

      // Respuesta exitosa
      this.invoke(updated, 201, res, 'Se actualizó con éxito', next);
    } catch (error) {
      console.error(error);
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }

  public async deleteVideoDetail(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params; // ID del producto
    const { video_id } = req.body; // ID de la imagen a elimina

    try {
      // Obtiene el producto por su ID
      const product: any = await this.productUseCase.getProduct(id);

      if (!product) {
        return next(new ErrorHandler('Producto no encontrado', 404));
      }
      const updated: any = await this.productUseCase.deleteVideoProduct(id, video_id)

      this.invoke(updated, 201, res, 'Se actualizó con éxito', next);
    } catch (error) {
      console.error(error);
      next(new ErrorHandler('Hubo un error al actualizar', 500));
    }
  }





  public async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const available = await this.stockStoreHouseUseCase.getProductStock(id, '662fe69b9ba1d8b3cfcd3634')
      if (available?.stock > 0) {
        return next(new ErrorHandler("No se puede eliminar hay existencias de este producto", 500));
      } else {
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
      if (!search) return next(new ErrorHandler("ingresa una busqueda", 404));

      const page = Number(req.query.page) || 1;
      const response: any | null = await this.productUseCase.searchProducts(search, page);

      if (response && response.products) {
        const updatedProducts = await Promise.all(
          response.products.map(async (product: any) => {
            // Procesar thumbnail
            const thumbnail = product.thumbnail;
            if (thumbnail && typeof thumbnail === 'string' && !thumbnail.startsWith("https://")) {
              product.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
            }

            // Procesar imágenes
            if (product?.images && product.images.length > 0) {
              const updatedImages = await Promise.all(
                product.images.map(async (image: any) => {
                  if (typeof image.url === 'string' && !image.url.startsWith("https://")) {
                    image.url = await this.s3Service.getUrlObject(image.url + ".jpg");
                  }
                  return image; // Retornar el objeto completo de la imagen
                })
              );
              product.images = updatedImages;
            }

            return product;
          })
        );

        // Preparar la respuesta final
        this.invoke({
          products: updatedProducts,
          total: response.total
        }, 200, res, "", next);
      }

    } catch (error) {
      console.log("search product error", error);
      next(new ErrorHandler("Hubo un error al buscar", 500));
    }

  }

  public async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    const { category } = req.body;
    const queryparams = req.query;
    try {
      if (!category) return next(new ErrorHandler("El nombre de la categoria es requerida", 404));

      const categoria: any | null = await this.categoryUseCase.getDetailCategoryByName(category);
      if (categoria == null) return next(new ErrorHandler("La categoria no existe", 404));

      const products: any | null = await this.productUseCase.getProductsByCategory(categoria._id, this.onlineStoreHouse, queryparams);

      await Promise.all(
        products.products.map(async (product: any) => {
          // Procesar thumbnail
          const thumbnail = product.thumbnail;
          if (thumbnail && !thumbnail.startsWith("https://")) {
            product.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
          }

          // Procesar imágenes
          if (product?.images && product.images.length > 0) {
            const parsedImages = await Promise.all(
              product.images.map(async (image: any) => {
                if (!image.url.startsWith("https://")) {
                  image.url = await this.s3Service.getUrlObject(image.url + ".jpg");
                }
                return image; // Retornar el objeto completo de la imagen
              })
            );
            product.images = parsedImages;
          }
        })
      );

      const response = {
        category: categoria,
        products: products.products,
        total: products.total
      };

      this.invoke(response, 201, res, '', next);


    } catch (error) {
      // console.log();      
      next(new ErrorHandler("Hubo un error al buscar", 500));
      console.log("category product error", error);
    }
  }

  public async getProductsBySubCategory(req: Request, res: Response, next: NextFunction) {
    const { subcategory } = req.body
    const queryparams = req.query;

    try {
      if (!subcategory) return next(new ErrorHandler("El nombre de la subcategoria es requerida", 404));

      const subcategoria: any | null = await this.subCategoryUseCase.getDetailSubCategoryByName(subcategory);
      if (subcategoria == null) return next(new ErrorHandler("La subcategoria no existe", 404));

      const products: any | null = await this.productUseCase.getProductsBySubCategory(subcategoria._id, this.onlineStoreHouse, queryparams);

      await Promise.all(
        products.products.map(async (product: any) => {
          // Procesar thumbnail
          const thumbnail = product.thumbnail;
          if (thumbnail && !thumbnail.startsWith("https://")) {
            product.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
          }

          // Procesar imágenes
          if (product?.images && product.images.length > 0) {
            const parsedImages = await Promise.all(
              product.images.map(async (image: any) => {
                // Verificar si la imagen tiene una URL completa o solo el path relativo
                if (!image.url.startsWith("https://")) {
                  image.url = await this.s3Service.getUrlObject(image.url + ".jpg");
                }
                return image; // Retornar el objeto completo de la imagen
              })
            );
            product.images = parsedImages;
          }
        })
      );

      const response = {
        subcategory: subcategoria,
        products: products.products,
        total: products.total
      };

      this.invoke(response, 201, res, '', next);

    } catch (error) {
      next(new ErrorHandler("Hubo un error al buscar", 500));
      console.log("subcategory product error", error);
    }
  }

  public async getProductsByCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = ["Hogar, Muebles y jardín", "Belleza y Cuidado Personal"];
      // const categories = ["Nueva categoria"];
      const response: any | null = await this.categoryUseCase.getCategoriesAndProducts(categories, this.onlineStoreHouse);

      await Promise.all(
        response.map(async (category: any) => {
          await Promise.all(
            category.products.map(async (product: any) => {
              // Procesar thumbnail
              const thumbnail = product.thumbnail;
              if (thumbnail && !thumbnail.startsWith("https://")) {
                // Si el thumbnail no es una URL completa y no está vacío, obtener la URL desde S3
                product.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
              }

              // Procesar imágenes
              if (product?.images && product.images.length > 0) {
                const parsedImages = await Promise.all(
                  product.images.map(async (image: any) => {
                    // Verificar si la imagen tiene una URL completa o solo el path relativo
                    if (!image.url.startsWith("https://")) {
                      // Actualizar la URL de la imagen con la URL completa desde S3
                      image.url = await this.s3Service.getUrlObject(image.url + ".jpg");
                    }
                    return image; // Retornar el objeto completo de la imagen
                  })
                );
                product.images = parsedImages;
              }

              return product;
            })
          );
          return category;
        })
      );

      // Llamada de invocación con la respuesta
      this.invoke(response, 201, res, '', next);



    } catch (error) {
      console.log(error, 'ok');
      next(new ErrorHandler("Hubo un error al obtener la información", 500));
    }
  }


  public async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const response: any | null = await this.productUseCase.getVideoProducts();
      if (!(response instanceof ErrorHandler)) {
        const updatedResponse = await Promise.all(
          response.map(async (item: any) => {
            // Procesar thumbnail
            const thumbnail = item.thumbnail;
            if (thumbnail && typeof thumbnail === 'string' && !thumbnail.startsWith("https://")) {
              item.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
            }

            // Procesar videos
            const videos = item.videos.find((i: any)=> i.type === 'vertical')
            const video_url = videos ? videos.url : null
            // const updatedVideos = await Promise.all(
            //   videos.map(async (video: any) => {
            //     if (typeof video === 'string' && !video.startsWith("https://")) {
            //       video = await this.s3Service.getUrlObject(video + ".mp4");
            //     }
            //     return video; // Retornar el objeto completo del video
            //   })
            // );
            // item.videos = updatedVideos;
            item.videos = [video_url]

            return item;
          })
        );

        this.invoke(updatedResponse, 200, res, "", next);
      }

    } catch (error) {
      console.log(error);

      next(new ErrorHandler("Hubo un error al consultar la información", 500));
    }
  }


  public async getSimilarProducts(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params //product id
    try {
      const productDetail: any | null = await this.productUseCase.getProduct(id);
      const category = productDetail?.category._id;

      if (productDetail == null) return next(new ErrorHandler("Este producto no existe", 404));

      let response: any | null = await this.productUseCase.getRandomProductsByCategory(category, productDetail._id, this.onlineStoreHouse);

      if (!(response instanceof ErrorHandler)) {
        const updatedResponse = await Promise.all(
          response.map(async (item: any) => {
            // Procesar thumbnail
            const thumbnail = item?.thumbnail;
            if (thumbnail && !thumbnail.startsWith("https://")) {
              item.thumbnail = await this.s3Service.getUrlObject(thumbnail + ".jpg");
            }
            // Procesar imágenes
            if (item?.images && item.images.length > 0) {
              const parsedImages = await Promise.all(
                item.images.map(async (image: any) => {
                  if (typeof image === "string" && !image.startsWith("https://")) {
                    image = await this.s3Service.getUrlObject(image + ".jpg");
                  }
                  // Verificar si la imagen tiene una URL completa o solo el path relativo
                  if (image.url && !image?.url?.startsWith("https://")) {
                    image.url = await this.s3Service.getUrlObject(image.url + ".jpg");
                  }
                  return image; // Retornar el objeto completo de la imagen
                })
              );
              item.images = parsedImages;
            }

            return item;
          })
        );

        response = updatedResponse; // Asignar el array actualizado a response
      }

      this.invoke(response, 200, res, "", next);

    } catch (error) {
      console.log(error, 'ok');
      next(new ErrorHandler("Hubo un error al obtener la información", 500));
    }
  }


  

  public async updateURLS(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.productUseCase.getProducts();
  
      if (!(response instanceof ErrorHandler)) {
        await Promise.all(
          response.map(async (item: any) => {
            // Update image URLs
            item.images = item.images?.map((image: any) => {
              if (typeof image === "string" && !image.startsWith("https://")) {
                return {
                  _id: new ObjectId(),
                  url: `https://cichmex.s3.us-east-2.amazonaws.com/${process.env.S3_ENVIRONMENT}${image}.jpg`,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
              } else if (image?.url && !image.url.startsWith("https://")) {
                image.url = `https://cichmex.s3.us-east-2.amazonaws.com/${process.env.S3_ENVIRONMENT}${image.url}`;
                image.updatedAt = new Date(); // Update timestamp
              }
              return image;
            }) || [];
  
            // Update video URLs
            item.videos = item.videos?.map((video: any) => {
              if (!video.startsWith("https://")) {
                return `https://cichmex.s3.us-east-2.amazonaws.com/${process.env.S3_ENVIRONMENT}${video}.mp4`;
              }
              return video;
            }) || [];
  
            // Update thumbnail URL
            if (item.thumbnail && !item.thumbnail.startsWith("https://")) {
              item.thumbnail = `https://cichmex.s3.us-east-2.amazonaws.com/${process.env.S3_ENVIRONMENT}${item.thumbnail}`;
            }
  
            // Update product in the database
            await this.productUseCase.updateProduct(item._id, {
              images: item.images,
              videos: item.videos,
              thumbnail: item.thumbnail,
            });
          })
        );
      }
  
      this.invoke(response, 200, res, "", next);
    } catch (error) {
      console.log("Error:", error);
      next(new ErrorHandler("Hubo un error al actualizar la información", 500));
    }
  }
  
  


}


