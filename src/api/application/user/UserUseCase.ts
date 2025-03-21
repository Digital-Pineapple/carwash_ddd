import { Authentication, IAuth, IGoogleResponse } from '../authentication/AuthenticationService';
import { ErrorHandler } from '../../../shared/domain/ErrorHandler';
import { IPhone, UserEntity } from '../../domain/user/UserEntity';
import { UserRepository } from '../../domain/user/UserRepository';
import { TypeUserPopulateConfig, PhonePopulateConfig, PopulatePointStore, PopulateProductCS, PopulateRegionUser } from '../../../shared/domain/PopulateInterfaces';
export class UserUseCase extends Authentication {

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  public async allUsers(): Promise<UserEntity[] | ErrorHandler | null> {
    return await this.userRepository.findAll(TypeUserPopulateConfig,PhonePopulateConfig)
  }

  public async allCarrierDrivers(): Promise<UserEntity[] | ErrorHandler | null> {
    const allUsers = await this.userRepository.findAll(TypeUserPopulateConfig,PhonePopulateConfig)
    const carrier_drivers = allUsers.filter((item:any)=> item.type_user?.role?.includes('CARRIER-DRIVER'))
    return carrier_drivers
  }
  public async allWarehouseman(): Promise<UserEntity[] | ErrorHandler | null> {
    const allUsers = await this.userRepository.findAll(TypeUserPopulateConfig, PhonePopulateConfig);
    const data = allUsers.filter((item: any) => 
        item.type_user?.role?.includes('WAREHOUSEMAN') || 
        item.type_user?.role?.includes('WAREHOUSE-MANAGER')
    );
    return data;
}
  public async getUser(id: string): Promise<UserEntity | ErrorHandler | null > {
    return await this.userRepository.findAllAll(id)
 }
  public async getOneUser(id: string): Promise<UserEntity | ErrorHandler | null > { 
     return await this.userRepository.findAllAll(id, TypeUserPopulateConfig,PhonePopulateConfig, PopulatePointStore)
  }
  public async getOneUserAll(id: string): Promise<UserEntity | ErrorHandler | null > { 
    return await this.userRepository.findAllAll(id, TypeUserPopulateConfig,PhonePopulateConfig, PopulatePointStore, PopulateRegionUser )
 }
  public async getUserEmail(id: string): Promise<IGoogleResponse | ErrorHandler | null > {
  const user = await this.userRepository.findOneItem({_id:id})
    const user2: IGoogleResponse = {user_id : user?._id, verified : user?.email_verified, email:user?.email}
    return user2
 }

  public async updateUser(id: string, updated:object): Promise<UserEntity | ErrorHandler | null> {
   
    return await this.userRepository.updateOne(id,{...updated})
  }
  public async updateStore(id: string, updated:object): Promise<UserEntity | ErrorHandler | null> {
  
   
    return await this.userRepository.updateOne(id,{updated})
  }

  public async updateRegisterUser(id: string, updated:object): Promise<IAuth | ErrorHandler | null> {
    const user = await this.userRepository.updateOne(id,updated)
    const {uuid,fullname,email,type_user} = await this.userRepository.findOneItem({ email: user.email, status:true });
    const infoToken ={uuid:uuid,fullname:fullname,email:email,type_user:type_user}
     return await this.generateJWT(user,infoToken );
  }

  public async deleteUser(id: string): Promise<UserEntity | ErrorHandler | null> {
    // return await this.userRepository.updateOne(id,{status:false})
    return await this.userRepository.PhysicalDelete(id)
  }


  public async findUser(email:string): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.findOneItem({email:email, status:true})

  }
  public async findUserByPhone(phone_id:string): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.findOneItem({phone_id:phone_id})

  }
  public async findUserById(id:string): Promise<UserEntity | ErrorHandler | null> {
    return await this.userRepository.findById(id)

  }
  public async createUser(body:any): Promise<UserEntity | IAuth |  ErrorHandler | null> {
    const user = await this.userRepository.findOneItem({ email: body.email, status:true });
        if (user) return new ErrorHandler('El correo ya ha sido registrado',400);
        const password = await this.encryptPassword(body.password);
        const {uuid} = await this.userRepository.createOne({ ...body, password });
        const userInfo = await this.userRepository.findOneItem({uuid: uuid}, TypeUserPopulateConfig, PhonePopulateConfig )
        return await this.generateJWT(userInfo,uuid);
    
  }

  public async createCarrierDriver(body:any): Promise<UserEntity | IAuth |  ErrorHandler | null> {
        const user = await this.userRepository.findOneItem({ email: body.email, status:true });
        if (user) return new ErrorHandler('El usuario ya existe',400);
        const password = this.encryptPassword(body.password);
        const {uuid} = await this.userRepository.createOne({ ...body, password });
        const userInfo = await this.userRepository.findOneItem({uuid: uuid}, TypeUserPopulateConfig, PhonePopulateConfig, )
        return await this.generateJWT(userInfo,uuid);
    
  }

  async signInByPhone(phone_id: string, password: string): Promise<ErrorHandler | IAuth> {
    const user = await this.userRepository.findOneItem({phone_id}, TypeUserPopulateConfig, PhonePopulateConfig,PopulatePointStore)
    if (!user) return new ErrorHandler('No exite este usuario', 400);
    const validatePassword = this.decryptPassword(password, user.password)
    if (!validatePassword) return new ErrorHandler('El usuario o contraseña no son validos', 400);
    return await this.generateJWT(user, user.uuid);
}
async signInByPhonePartner(phone_id: string, password: string): Promise<ErrorHandler | IAuth> {
  const user = await this.userRepository.findOneItem({phone_id}, TypeUserPopulateConfig, PhonePopulateConfig,PopulatePointStore)
  if (!user) return new ErrorHandler('No exite este usuario', 400);
  const validatePassword = this.decryptPassword(password, user.password)
  if (!validatePassword) return new ErrorHandler('El usuario o contraseña no son validos', 400);
  return await this.generateJWT(user, user.uuid);
}


}