import { BranchOfficeEntity } from "../branch_office/BranchOfficeEntity";
import { RegionEntity } from "../regions/RegionEntity";
import { storeHouseEntity } from "../storehouse/storeHouseEntity";
import { TypeUserEntity } from "../typeUser/TypeUserEntity";
import mongoose from "mongoose";
export interface IPhone  {
    code             ?:   string;
    prefix           :   string;
    phone_number     :   number;
    expiration_date  ?:   NativeDate;
    verified         ?:   boolean;
    status           ?: boolean;
    createdAt       ?:   NativeDate;
    updatedAt       ?:   NativeDate;
}

export interface IPhoneResponse  {
    phone_id              :   string;
    phone_number     :   number;
    verified         ?:   boolean;
}
export interface IEmployeeResponse  {
    _id ?: string
}
export interface UserEntity {
    _id              :   mongoose.Types.ObjectId;
    id               ?: string,
    uuid             :  string;
    fullname        ?:   string;
    privacity       ?:   boolean;
    email           ?:   string;
    email_verified  ?:   boolean;
    password        ?:   string;
    stripe_user     ?:   string;
    type_user       ?:   TypeUserEntity
    profile_image   ?:   string;
    google          ?:   Boolean;
    facebook        ?:   Boolean;
    facebook_id     ?:   string;
    tiktok_id       ?:   string;
    tiktok          ?:   Boolean;
    phone_id        ?:   IPhone;
    accountVerify   ?:   boolean;
    employee_detail ?:   EmployeeDetail;
    verify_code     ?:   UserVerifyCodeEntity;
    facturapi_id    ?:   string;
    status          ?:   boolean;
    store           ?:   mongoose.Types.ObjectId;
    createdAt        :   NativeDate;
    updatedAt        :   NativeDate;
}

export interface UserVerifyCodeEntity{
    attempts    ?: number,
    code        ?:number,
 }

 export interface EmployeeDetail{
    salary                         ?: number,
    sales_commission_porcent       ?:number,
    branch_office                  ?: [BranchOfficeEntity],
    store_house                    ?: [storeHouseEntity]
    operationRegions               ?: [RegionEntity]
 }
