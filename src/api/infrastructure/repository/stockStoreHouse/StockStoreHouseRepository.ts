import { Model } from 'mongoose';
import {  StockStoreHouseRepository as StockSHConfig } from '../../../domain/storehouse/stockStoreHouseRepository';
import { MongoRepository } from '../MongoRepository';
import ProductModel from '../../models/products/ProductModel';
import { VariantProductModel } from '../../models/variantProduct/VariantProductModel';


 interface IPopulateProducts {
  path : string;
  select : string[];
  model : any  
}

const PopulateProduct : IPopulateProducts={
  path: 'product_id',
  select: ["name", "price", "tag", "size", "weight" ],
  model: ProductModel
}
const PopulateVariant : IPopulateProducts={
  path: 'variant_id',
  select: ["attributes", 'price', 'discountPrice', 'dimensions', 'tag' ],
  model: VariantProductModel
}

export class StockStoreHouseRepository extends MongoRepository implements  StockSHConfig {
  
    constructor(protected StockStoreHouseModel: Model<any>) {
      super (StockStoreHouseModel)
    }
  
    async findStockByStoreHouse(branchId: string, populateConfig1?:any): Promise<any> {
     return await this.StockStoreHouseModel.find({StoreHouse_id:branchId, status:true}).populate(PopulateProduct).populate(PopulateVariant)
      
    }

    async findStockByStoreHouseNoDetail(branchId: string): Promise<any[]> {
      return await this.StockStoreHouseModel.find({StoreHouse_id:branchId, status:true})
  
    }
    async findAllInputs(): Promise<any[]> {
      const result = await this.MODEL.aggregate([
        { $lookup: { from: "shstockinputs", localField: "_id", foreignField: "SHStock_id", as: "Inputs" } },
        { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as :'product' } },
      ]);
      return result;
    }

    async findAllOutputs(): Promise<any[]> {
      const result = await this.MODEL.aggregate([
        { $lookup: { from: "shstockoutputs", localField: "_id", foreignField: "SHStock_id", as: "Outputs" } },
        { $lookup: { from: "products", localField: "product_id", foreignField: "_id", as :'product' } },
      ]);
      return result;
    }

    async dailyFeedStocks(id: any): Promise<any[]> {
      const resp = await this.MODEL.aggregate([
          { $match: { StoreHouse_id: id } },
          { $lookup: { 
              from: "products", 
              localField: "product_id", 
              foreignField: "_id", 
              as: "product" 
          }},
          { $unwind: "$product" },
          { $lookup: { 
              from: "categories", 
              localField: "product.category", 
              foreignField: "_id", 
              as: "Category" 
          }},
          { $lookup: { 
              from: "subcategories", 
              localField: "product.subCategory", 
              foreignField: "_id", 
              as: "SubCategory" 
          }},
          {
            $project:{
              id:  '$product._id' ,
              title: '$product.name',
              sku: '$product.sku',
              price: '$product.price',
              stock :'$stock',
              discountPrice: '$product.discountPrice',
              description: '$product.description', 
              brand: '$product.brand',
              category: { $arrayElemAt: ['$Category.name', 0] },
              SubCategory: { $arrayElemAt: ['$SubCategory.name', 0] },
              image: '$product.thumbnail',
            }
          }
      ]);
      return resp;
  }
  

  }
  
  