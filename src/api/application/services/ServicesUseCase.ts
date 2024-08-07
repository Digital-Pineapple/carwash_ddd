import { ErrorHandler } from "../../../shared/domain/ErrorHandler";
import { ServicesEntity } from "../../domain/services/ServicesEntity";
import { ServicesRepository } from "../../domain/services/ServicesRepository";
import { ServicesCustomerRepository } from "../../domain/servicesCustomer/ServicesCustomerRepository";
import { SubCategory } from "../../domain/subCategory/SubCategoryEntity";

export class ServicesUseCase {

    constructor(public servicesRepository: ServicesRepository, public servicesCustomerRepository: ServicesCustomerRepository) { }

    public async getServices(): Promise<ServicesEntity[] | null> {
        return this.servicesRepository.findAll();
    }

    public async getDetailService(_id: string): Promise<ServicesEntity|ErrorHandler | null> {

        return this.servicesRepository.findById(_id);
    }

    public async createNewService(body:any): Promise<ServicesEntity | ErrorHandler | null> {
        const service = await this.servicesRepository.findOneItem({name:body.name , status:true});
        if (service) return new ErrorHandler('El servicio ha sido registrado',400);
        return await this.servicesRepository.createOne({...body });
    }

    public async updateOneService(_id: string, updated: any): Promise<ServicesEntity> {
        return this.servicesRepository.updateOne(_id, updated);
    }

    public async deleteOneService(_id: string): Promise<ServicesEntity | null> {
        return this.servicesRepository.updateOne(_id,{status:false})
    }
    
}