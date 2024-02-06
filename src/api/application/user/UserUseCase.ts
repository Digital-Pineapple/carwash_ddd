import { Authentication, IAuth, IGoogleResponse } from '../authentication/AuthenticationService';
import { ErrorHandler } from '../../../shared/domain/ErrorHandler';
import { IPhone, UserEntity } from '../../domain/user/UserEntity';
import { UserRepository } from '../../domain/user/UserRepository';
import { TypeUserPopulateConfig, PhonePopulateConfig } from '../../../shared/domain/PopulateInterfaces';
export class UserUseCase extends Authentication {

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  public async allUsers(): Promise<UserEntity[] | ErrorHandler | null> {
    return await this.userRepository.findAll(TypeUserPopulateConfig,PhonePopulateConfig)
  }
  public async getUser(id: string): Promise<UserEntity | ErrorHandler | null > {
    return await this.userRepository.findAllAll(id)
 }
  public async getOneUser(id: string): Promise<UserEntity | ErrorHandler | null > {
     return await this.userRepository.findAllAll(id, TypeUserPopulateConfig,PhonePopulateConfig)
  }
  public async getUserEmail(id: string): Promise<IGoogleResponse | ErrorHandler | null > {
  const user = await this.userRepository.findOneItem({_id:id})
    const user2: IGoogleResponse = {user_id : user?._id, verified : user?.email_verified, email:user?.email}
    return user2
 }

  public async updateUser(id: string, updated:object): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.updateOne(id,updated)
  }
  public async updateRegisterUser(id: string, updated:object): Promise<IAuth | ErrorHandler | null> {
     let user = await this.userRepository.updateOne(id,updated)
     console.log(user);
     return await this.generateJWT(user);
  }

  public async deleteUser(id: string): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.updateOne(id, { deleted: true})
  }
  public async findUser(email:string): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.findOneItem({email:email})

  }
  public async createUser(body:any): Promise<UserEntity | IAuth |  ErrorHandler | null> {
    let user = await this.userRepository.findOneItem({ email: body.email }, TypeUserPopulateConfig);
        if (user) return new ErrorHandler('El usuario ya existe',400);
        const password = await this.encryptPassword(body.password);
        const user1 = await this.userRepository.createOne({ ...body, password });
        return await this.generateJWT(user1);
    
  }


}