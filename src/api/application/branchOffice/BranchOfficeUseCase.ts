import { ErrorHandler } from "../../../shared/domain/ErrorHandler";
import { BranchPopulateConfig } from "../../../shared/domain/PopulateInterfaces";
import { BranchOfficeEntity, ILocation } from "../../domain/branch_office/BranchOfficeEntity";
import { BranchOfficeRepository } from "../../domain/branch_office/BranchOfficeRepository";
import { body } from 'express-validator';

export class BranchOfficeUseCase {
  constructor(
    private readonly branchOfficeRepository: BranchOfficeRepository
  ) { }

  public async getAllBranchOffices(): Promise<
    BranchOfficeEntity[] | ErrorHandler | null
  > {
    return await this.branchOfficeRepository.findAll();
  }

  public async getDetailBranchOffice(
    _id: string
  ): Promise<BranchOfficeEntity | null> {
    return await this.branchOfficeRepository.findByIdPupulate(_id, BranchPopulateConfig);
  }

  public async getBranchesUser(
    _id: string
  ): Promise<BranchOfficeEntity[] | null> {
    return await this.branchOfficeRepository.findByUser(_id)
  }


  public async createBranchOffice(
    body: any
  ): Promise<BranchOfficeEntity | ErrorHandler> {
    const newBranch = {
      ...body,
      location: JSON.parse(body.location)
    }

    const noRepeat = await this.branchOfficeRepository.findOneItem({ name: body.name })
    if (noRepeat) {
      return new ErrorHandler('Esta sucursal ya existe', 401)
    }

    return await this.branchOfficeRepository.createOne({ ...newBranch });
  }

  public async updateBranchOffice(
    _id: string,
    updated: any
  ): Promise<BranchOfficeEntity | ILocation | null> {
    return await this.branchOfficeRepository.updateOne(_id, updated);
  }


  public async deleteOneBranchOffice(
    _id: string
  ): Promise<BranchOfficeEntity | null> {
    return this.branchOfficeRepository.updateOne(_id, { deleted: true });
  }
}
