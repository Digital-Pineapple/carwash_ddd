
import MongooseDelete = require("mongoose-delete");
import { ProductEntity } from "../product/ProductEntity";
import { BranchOfficeEntity } from "../branch_office/BranchOfficeEntity";
import { UserEntity } from "../user/UserEntity";
import { storeHouseEntity } from "./storeHouseEntity";

export interface StockStoreHouseEntity extends MongooseDelete.SoftDeleteInterface {
  _id: string;
  StoreHouse_id : storeHouseEntity;
  product_id: ProductEntity;
  stock: number;
  inputs?: SHProductInput[];
  outputs?: SHProductOutput[];
  returns?:SHProductReturn[];
  status?: boolean;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface SHProductInput extends MongooseDelete.SoftDeleteInterface{
    SHStock_id ?: string,
    quantity: number,
    newQuantity: number
    createdAt: NativeDate;
    status?:boolean;
  }
  export interface SHProductOutput extends MongooseDelete.SoftDeleteInterface{
    SHStock_id ?: string,
    quantity: number,
    newQuantity: number,
    responsible?:  UserEntity,
    createdAt: NativeDate;
    status?:boolean;
  }
  export interface SHProductReturn extends MongooseDelete.SoftDeleteInterface{
    SHStock_id ?: string,
    quantity: number,
    newQuantity: number,
    responsible_id: UserEntity,
    createdAt: NativeDate;
    status?:boolean;
  }
  