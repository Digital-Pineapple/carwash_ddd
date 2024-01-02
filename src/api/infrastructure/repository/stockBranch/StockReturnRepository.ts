import { Model } from 'mongoose';
import {  StockBranchRepository as StockInventoryConfig } from '../../../domain/stockBranch/StockBranchRepository';
import { MongoRepository } from '../MongoRepository';



export class StockReturnRepository extends MongoRepository implements  StockInventoryConfig {
  
    constructor(protected StockBranchModel: Model<any>) {
      super (StockBranchModel)
    }
  
    async getAllStockInBranch(branchId: string): Promise<any[]> {
      return await this.findStockByBranch(`branch_id : ${branchId}`);
    }
  
    // Implementa otros métodos requeridos por la interfaz
  }