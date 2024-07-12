import { ErrorHandler } from "../../../shared/domain/ErrorHandler"
import { MongoRepository } from "../../infrastructure/repository/MongoRepository"
import { ProductEntity, ProductOrderEntity, ProductOrderResume } from "./ProductEntity"

export interface ProductOrderRepository extends MongoRepository {

     getProductOrdersByUser( _id: string, populateConfig1?:any): Promise<ProductOrderEntity[] | ErrorHandler| null > 
     
     getProductOrdersByBranch( _id: string, populateConfig1?:any): Promise<ProductOrderEntity[] | ErrorHandler| null > 
     
     findAllProductOrders(populateConfig1?:any): Promise<ProductOrderEntity[] | ErrorHandler | null> 

     ResumeProductOrders(): Promise<ProductOrderResume> 
      


}
