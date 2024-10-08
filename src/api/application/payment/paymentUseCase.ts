import { ErrorHandler } from '../../../shared/domain/ErrorHandler';
import { PaymentRepository } from '../../domain/payments/PaymentRepository'
import {PaymentEntity }from '../../domain/payments/PaymentEntity';

export class PaymentUseCase {

    constructor(private readonly paymentRepository: PaymentRepository) { }

    public async getPayments(): Promise<PaymentEntity[] | ErrorHandler > {
        return await this.paymentRepository.findAll();
    }
    public async getPaymentsMPExpired(): Promise<PaymentEntity[] | null > {
        return await this.paymentRepository.getMPPayments()
    }
    public async getPaymentsTransferExpired(): Promise<PaymentEntity[] | null > {
        return await this.paymentRepository.getTransferPaymentsExpired()
    }

    public async getDetailPayment(_id: string): Promise<PaymentEntity | ErrorHandler | null> {
        return await this.paymentRepository.findById(_id);
    }
    public async getInfoPayment(_id: string): Promise<PaymentEntity | ErrorHandler | null> {
        return  await this.paymentRepository.findById(_id);
          
    } 
    public async createNewPayment(object:any): Promise<PaymentEntity > {
            return await this.paymentRepository.createOne({...object});
    }

    public async updateOnePayment(_id: string, updated: PaymentEntity): Promise<PaymentEntity> {
        return this.paymentRepository.updateOne(_id, {...updated});
    }
    public async deleteOnePayment(_id: string): Promise<PaymentEntity | null> {
        return this.paymentRepository.updateOne(_id, {status: false})
    }

}