import { ErrorHandler } from "../../../shared/domain/ErrorHandler";
import { InfoBranchOrder, PopulateBranch, PopulateInfoUser, PopulatePayment } from "../../../shared/domain/PopulateInterfaces";
import { MomentService } from "../../../shared/infrastructure/moment/MomentService";
import { RandomCodeId } from "../../../shared/infrastructure/validation/Utils";
import {  ProductOrderEntity, ProductOrderResume } from "../../domain/product/ProductEntity";
import { ProductOrderRepository } from "../../domain/product/ProductOrderRepository";


export class ProductOrderUseCase {
  constructor(private readonly productOrderRepository: ProductOrderRepository) {}

  public async getProductOrders(): Promise<ProductOrderEntity[] | ErrorHandler | null> {
    return await this.productOrderRepository.findAllProductOrders(InfoBranchOrder, PopulatePayment)
  }
  public async getProductOrdersExpired(): Promise<ProductOrderEntity[] | ErrorHandler | null> {
    return await this.productOrderRepository.getPOExpired()
  }
  public async getProductOrdersResume(): Promise<ProductOrderResume> {
    return await this.productOrderRepository.ResumeProductOrders()
  }
  public async getOnePO(body:any): Promise<ProductOrderEntity> {
    
    return await this.productOrderRepository.findOneItem({...body})
  }

  public async getOneProductOrder( _id: string): Promise<ProductOrderEntity | ErrorHandler| null > {
    const response =  await this.productOrderRepository.findById(_id, InfoBranchOrder, PopulateInfoUser, PopulatePayment)
    return response
  }
  public async ProductOrdersByBranch( _id: string): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getProductOrdersByBranch(_id)
    return response
  }
  public async ProductOrdersPaid(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getPaidProductOrders()
    return response
  }
  public async ProductOrdersPaidAndFill(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.findAllItems({payment_status: 'approved',storeHouseStatus:true}, PopulateBranch)
    return response
  }
  public async PendingTransferPO(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getPendingTransferPO()
    return response
  }
  public async POGetAssigned(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getAssignedPO()
    return response
  }
  public async POGetAssignedUser(user_id:any): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getAssignedPOUser(user_id)
    return response
  }
  public async POPaidAndSupplyToPoint(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getPaidAndSuplyToPointPO()
    return response
  }
  public async POReadyToRoute(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getPaidAndVerifyPackageToPointPO()
    return response
  }
  public async PODeliveries(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getDeliveriesPO()
    return response
  }

  public async POPickedUp(): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getPaidAndSuplyToPointPO()
    return response
  }
  public async ProductOrdersByUser( _id: string): Promise<ProductOrderEntity[] | ErrorHandler| null > {
    const response =  await this.productOrderRepository.getProductOrdersByUser(_id, InfoBranchOrder)
    return response
  }

  public async createProductOrder(body:any): Promise<ProductOrderEntity | ErrorHandler | null> {
    return await this.productOrderRepository.createOne({...body})
  }

  public async updateProductOrder(
    _id: any,
    updated: any
  ): Promise<ProductOrderEntity> {
    
    return await this.productOrderRepository.updateOne(_id, updated);
  }

  public async startFillProductOrder(
    _id: string,
    updated: any
  ): Promise<ProductOrderEntity> {
    
    
    return await this.productOrderRepository.updateOne(_id, {storeHouseStatus: updated.storeHouseStatus, supply_detail:updated.supply_detail});
    
  }
  
  public async deleteProductOrder(_id: string): Promise<ProductOrderEntity| ErrorHandler | null> {
    return this.productOrderRepository.updateOne(_id, { status: false });
  }
}
