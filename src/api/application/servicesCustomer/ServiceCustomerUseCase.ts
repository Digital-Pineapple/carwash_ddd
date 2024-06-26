import { ErrorHandler } from "../../../shared/domain/ErrorHandler";
import {
  IServices,
  ServiceCustomer,
} from "../../domain/servicesCustomer/ServicesCustomerEntity";
import { TypeCarEntity } from "../../domain/typeCar/TypeCarEntity";
import { ServicesCustomerRepository } from "../../infrastructure/repository/ServicesCustomer/ServicesCustomerRepository";

export class ServiceCustomerUseCase {
  constructor(
    private readonly servicesCustomerRepository: ServicesCustomerRepository
  ) {}

  public async getServicesCustomer(): Promise<
    ServiceCustomer[] | ErrorHandler | null
  > {
    return await this.servicesCustomerRepository.findAll();
  }

  public async getDetailServiceCustomer(
    _id: string
  ): Promise<ServiceCustomer | null> {
    return await this.servicesCustomerRepository.findById(_id);
  }

  public async getServiceCustomerByCustomer(
    customer_id: string
  ): Promise<ServiceCustomer | ErrorHandler | null> {
    return await this.servicesCustomerRepository.findByUser(customer_id);
  }

  public async createNewServiceCustomer(
    customer_id: string,
    services: IServices
  ): Promise<ServiceCustomer | ErrorHandler | null> {
    const response = await this.servicesCustomerRepository.findOneItem({
      customer_id,
      status: true,
    });
    if (response) {
      return new ErrorHandler("Ya existen los servicios en este usuario", 400);
    } else {
      return await this.servicesCustomerRepository.createOne({
        customer_id,
        services,
      });
    }
  }

  public async updateOneServiceCustomer(
    _id: string,
    updated: ServiceCustomer
  ): Promise<ServiceCustomer | null> {
    const service = await this.servicesCustomerRepository.findById(_id);
    // service.services.map((service: IServices) => = {service._id == updated._id})
    service.services = service.services.concat(updated);
    return await this.servicesCustomerRepository.updateOne(_id, service);
  }

  public async findTypeCarService(
    _id: string
  ): Promise<TypeCarEntity | null | any> {
    try {
      const response = await this.servicesCustomerRepository.findTypeCarById(
        _id
      );
    } catch (error) {
      return (error);
    }
  }

  public async updateOneSCTypeCars(
    _id: string,
    service_id: string,
    updated: object
  ): Promise<ServiceCustomer | null | ErrorHandler> {
    const response = await this.servicesCustomerRepository.findById(_id);
    if (response) {
      const service = response.services.find(
        (service: IServices) => service._id == service_id
      );
      service.typeCarService = updated;
      return await this.servicesCustomerRepository.updateOne(_id, response);
    } else {
      return new ErrorHandler("No se encontro el servicio", 404);
    }
  }
  public async deleteOneServiceCustomer(
    _id: string,
    service_id: string
  ): Promise<ServiceCustomer | null> {
    
    const service = await this.servicesCustomerRepository.findById(_id);
    
    return await this.servicesCustomerRepository.updateOne(_id, service);
  }
}
