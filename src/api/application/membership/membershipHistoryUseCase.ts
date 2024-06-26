import { ErrorHandler } from '../../../shared/domain/ErrorHandler';
import { PopulateDetailMembership} from '../../../shared/domain/PopulateInterfaces';
import {  MembershipHistory } from '../../domain/membership/MembershipEntity';
import { MembershipHistoryRepository } from '../../domain/membership/MembershipRepository'


export class MembershipHistoryUseCase {

    constructor(private readonly membershipHistoryRepository: MembershipHistoryRepository) { }
 
 public async createOneHistoryMembership( membershipBenefit_id:string ): Promise<MembershipHistory> {
        return await this.membershipHistoryRepository.createOne({membershipBenefit_id, status:true});
    }
    
    public async deleteHistoryMembership(id:string, date_service: Date): Promise<MembershipHistory> {
        return await this.membershipHistoryRepository.softDelete(id, date_service)
    }
    public async getHistoryMembership(): Promise<MembershipHistory[]> {
        return await this.membershipHistoryRepository.findAll()
    }
    public async getOneHistoryMembership(id:any): Promise<MembershipHistory> {
        return await this.membershipHistoryRepository.findOneItem({_id:id})
    }

    public async getSalesDay(date_service:any, branch_office_id:any,): Promise<MembershipHistory[] | ErrorHandler | null> {
        return await this.membershipHistoryRepository.getSalesDayByBranch(date_service,branch_office_id, PopulateDetailMembership)
    }
    
    public async getOneMemHistory(id:any): Promise<MembershipHistory> {
        return await this.membershipHistoryRepository.getOneMemHistory({_id:id, status:true})
    }
    public async consumeBenefit(id:any, membershipBenefit_id:any, date_service:string, typeCar_id:any, car_color:string, plate_number:string, branch_office_id:any, service:any ): Promise<MembershipHistory | ErrorHandler> {
        const item = await this.membershipHistoryRepository.getOneMemHistory({_id:id})
        
     if (item.status === false) {
        return new ErrorHandler('Beneficio ya consumido',500)
     } else {
        const item2 = await this.membershipHistoryRepository.updateOne(id,{membershipBenefit_id, date_service, typeCar_id, car_color, plate_number, branch_office_id,status:false, service})
        return item2
     }
    } 
  
   
}
