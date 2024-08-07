import mongoose from "mongoose";
import { SubCategory } from "../subCategory/SubCategoryEntity";
import { Category } from "../category/CategoryEntity";
import { PaymentEntity } from "../payments/PaymentEntity";
import { BranchOfficeEntity, ILocation } from "../branch_office/BranchOfficeEntity";
import { UserEntity } from "../user/UserEntity";

export interface ProductEntity {

  name: string;
  price: number;
  description?: string;
  slug?: string;
  size?: string;
  tag: string;
  category?: Category;
  subCategory?: SubCategory;
  images?: string[];
  status?:boolean;
  weight ?: string;
  video ?: string;
  product_key : string;
  createdAt        :   NativeDate;
  updatedAt        :   NativeDate;
}

export interface ProductImage  {
   
    url: string;
    createdAt        :   NativeDate;
    updatedAt        :   NativeDate;
  }

  export interface ProductShopping  {
   
    item ?: mongoose.Types.ObjectId,
      
    quantity? :number
   
  }

  export interface ProductOrderEntity{
    order_id: string,
    payment: PaymentEntity;
    payment_status ?: string; 
    user_id:UserEntity
    products?: [ProductEntity];
    discount?: number;
    subTotal?: number;
    total?: number;
    shipping_cost?: number;
    branch?: BranchOfficeEntity;
    deliveryLocation?:ILocation;
    storeHouseStatus?:boolean;
    supply_detail: ProductOrderSupply; 
    route_status?: boolean;
    route_detail?:PORouteDetail
    point_pickup_status?: boolean;
    deliveryStatus?: boolean;
    verification?: POVerificationDetail;
    status?:boolean;
    paymentType?: string;
    download_ticket?:string;
    createdAt        :   NativeDate;
    updatedAt        :   NativeDate;
  }

  export interface ILocationOrder {
    state_id?: string;
    state?: string;
    municipality_id?: string;
    municipality?: string;
    lat?: number;
    lgt?: number;
    address?: string;
    intNumber?:number;
    extNumber?:number
    references?:string;
    createdAt        :   NativeDate;
    updatedAt        :   NativeDate;
  }

  export interface ProductOrderResume {
    ordersDay ?: number,
    ordersWeek?: number,
    ordersMonth?: number
    ordersYear?: number,
    cashDay ?: number,
    cashWeek ?: number,
    cashMonth ?: number,
    cashYear?: number,
    recivedCashDay?: number,
    recivedCashWeek?: number,
    recivedCashMonth?: number,
    recivedCashYear?: number,
    commissionPayedDay?: number,
    commissionPayedWeek?: number,
    commissionPayedMonth?: number,
    commissionPayedYear?: number
    salesDayByHour?: object,
    topProductsMonth?: any,
    lastTen?: any

  }
  export interface ProductOrderSupply{
    user: UserEntity,
    date: string,

  }
  export interface PORouteDetail{
    user: UserEntity,
    route_status?: string,
    deliveryDate?: string
  }
  export interface POVerificationDetail{
      verification_code   ?: string,
      verification_status ?: boolean,
      verification_time   ?: string,
      signature           ?: string,
      photo_proof         ?: string,
      notes               ?: string,
  }

