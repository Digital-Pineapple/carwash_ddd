import { ErrorHandler } from "../../../shared/domain/ErrorHandler";
import { ProductEntity } from "../../domain/product/ProductEntity";
import { ProductRepository } from "../../domain/product/ProductRepository";


export class ProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  public async getProducts(): Promise<ProductEntity[] | ErrorHandler> {
    return await this.productRepository.findAll();
  }

  public async getProduct(
    _id: string
  ): Promise<ProductEntity | ErrorHandler | null> {
    return await this.productRepository.findById(_id);
  }

  public async createProduct(
    name: string,price: number, description: string,sizes:[string],tag:string
  ): Promise<ProductEntity | ErrorHandler | null> {
    const product = await this.productRepository.findOneItem({ name });
    if (product) return new ErrorHandler("Producto ya registrado", 400);
    return await this.productRepository.createOne({ name,price,description,sizes,tag });
  }

  public async updateProduct(
    _id: string,
    updated: any
  ): Promise<ProductEntity> {
    console.log(updated);
    
    return await this.productRepository.updateOne(_id, updated);
  }
  public async deleteProduct(_id: string): Promise<ProductEntity | null> {
    return this.productRepository.updateOne(_id, { deleted: false });
  }
}
