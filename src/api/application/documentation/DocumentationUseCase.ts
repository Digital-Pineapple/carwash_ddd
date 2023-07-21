import bcrypt from 'bcrypt';
import { ErrorHandler } from '../../../shared/domain/ErrorHandler';

import { DocumentationRepository } from '../../domain/documentation/DocumentationRepository';
import { IFile } from '../../domain/documentation/DocumentationsEntity';
import { IFileKeys } from '../auth/interfaces';

export class DocumentationUseCase {

    constructor(private readonly documentRepository: DocumentationRepository) { }

    public async getDocumentations(): Promise<IFile | ErrorHandler | null> {
        return await this.documentRepository.findAll();
    }

    public async getDetailDocumentation(_id: string): Promise<IFile | ErrorHandler | null> {
        return await this.documentRepository.findById(_id);
    }

    public async getDocumentationByCustomer(customer_id: string): Promise<IFile | ErrorHandler | null> {
        return await this.documentRepository.findOneItem({ customer_id });
    }

    public async createNewDocumentation(name: string , message: string, status: boolean, customer_id: any,  url: any ): Promise<IFile | ErrorHandler | null> {
        const customer = await this.documentRepository.findOneItem({ customer_id });
        if (customer) return new ErrorHandler('Ya existe documentacion en este usuario', 400);
        return await this.documentRepository.createOne({ name, url, status, message,customer_id });
    }
    

    public async updateOneDocumentation(_id: string, updated: object): Promise<IFile | ErrorHandler | null> {
        return await this.documentRepository.updateOne(_id, updated);
    }

}