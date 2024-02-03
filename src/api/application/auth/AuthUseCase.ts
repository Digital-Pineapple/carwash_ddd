import { Authentication } from '../authentication/AuthenticationService';

import { AuthRepository } from '../../domain/auth/AuthRepository';
import { ErrorHandler } from '../../../shared/domain/ErrorHandler';

import { IAuth } from '../authentication/AuthenticationService';

import { MomentService } from '../../../shared/infrastructure/moment/MomentService';
import { IFileKeys,IPhoneRequest } from './interfaces';
import { IPhone, UserEntity } from '../../domain/user/UserEntity';
import {UserPopulateConfig } from '../../../shared/domain/PopulateInterfaces'
export class AuthUseCase extends Authentication {

    constructor(private readonly authRepository: AuthRepository) {
        super();
    }

    async signIn(email: string,password: string): Promise<ErrorHandler | IAuth> {
        const user = await this.authRepository.findOneItem({ email }, UserPopulateConfig );
        if (!user) return new ErrorHandler('El usuario o contraseña no son validos',400);
        const validatePassword = this.decryptPassword(password,user.password)
        if (!validatePassword) return new ErrorHandler('El usuario o contraseña no son validos',400);
        return await this.generateJWT(user);
    }

    async findUser(email: string): Promise<ErrorHandler | IAuth> {
        let customer = await this.authRepository.findOneItem({ email }, UserPopulateConfig );
        return await (customer);
    }

    async findPhone(phone: number): Promise<ErrorHandler | UserEntity> {
       const phoneString = phone.toString()
        let phone_number = await this.authRepository.findOneItem({ phone:{phone_number:phoneString} }, UserPopulateConfig );
        return await (phone_number);
    }
  

    async signUp(body: any): Promise<IAuth | ErrorHandler | null> {
        
        
        let user = await this.authRepository.findOneItem({ email: body.email }, UserPopulateConfig);

        
        if (user) return new ErrorHandler('El usuario ya ha sido registrado',400);
        
        const password = await this.encryptPassword(body.password);
    
        
        user = await this.authRepository.createOne({ ...body, password });
        
        return await this.generateJWT(user);
    }

    async signUpByPhone(body: any): Promise<IAuth | ErrorHandler | null> {
        
        
        let user = await this.authRepository.findOneItem({ phone: body.phone }, UserPopulateConfig);

        if (user) return new ErrorHandler('El usuario ya ha sido registrado',400);
        
        user = await this.authRepository.createOne({});
        
        return await this.generateJWT(user);
    }

    async signInWithGoogle(idToken: string): Promise<IAuth | ErrorHandler | null> {
        let { fullname,email,picture } = await this.validateGoogleToken(idToken);
        let user = await this.authRepository.findOneItem({ email }, UserPopulateConfig);
        if (user) return await this.generateJWT(user);
        let password = this.generateRandomPassword();
        password = this.encryptPassword(password);

        user = await this.authRepository.createOne({ fullname,email,profile_image: picture,password,google: true });

        return await this.generateJWT(user);
    }
    async signUpWithGoogle(idToken: string): Promise<IAuth | ErrorHandler | null> {
        let { fullname,email,picture,  } = await this.validateGoogleToken(idToken);
        let user = await this.authRepository.findOneItem({ email }, UserPopulateConfig);
        console.log(fullname,email,picture,);
        
        // if (user) return await this.generateJWT(user);
        // let password = this.generateRandomPassword();
        // password = this.encryptPassword(password);

        // user = await this.authRepository.createOne({ fullname,email,profile_image: picture,password,google: true });

        return await this.generateJWT(user);
    }

    async changePassword(password: string,newPassword: string,user: UserEntity): Promise<ErrorHandler | IAuth | null> {
        let customer = await this.authRepository.findById(user._id);
        const currentPassword = this.decryptPassword(password,customer.password);
        if (!currentPassword) return new ErrorHandler('Error la contraseña actual no es valida',400);
        const newPass = this.encryptPassword(newPassword);
        return await this.authRepository.updateOne(customer._id,{ password: newPass });
    }

    async updateProfilePhoto(photo: string,customer_id: string): Promise<UserEntity> {
        return await this.authRepository.updateOne(customer_id,{ profile_image: photo });
    }

    async updateCustomer(customer_id: string,email: string,fullname: string): Promise<UserEntity> {
        return await this.authRepository.updateOne(customer_id,{ email,fullname });
    }

    async generateToken(user: UserEntity) {
        return await this.generateJWT(user)
    }

    async registerPhoneNumber(user: UserEntity | UserEntity,phone: IPhoneRequest,code: number) {
        const { phone_number,prefix } = phone;

        const phoneData = await this.authRepository.validatePhoneNumber(phone_number,user._id);
        if (phoneData) return new ErrorHandler('El telefono ya ha sido registrado',400);

        const data = { phone: { code,prefix,phone_number,expiration_date: new MomentService().addMinutesToDate(5) } }
        return await this.authRepository.updateOne(user._id,data, );
    }


    async verifyPhoneNumber(_id: string,currentCode: number) {
        const customer = await this.authRepository.findById(_id, );
        if (!customer.phone.phone_number) return new ErrorHandler('Ingresa un numero telefonico antes de continuar',400);

        if (customer.phone.verified) return new ErrorHandler('El telefono ya ha sido verificado',400);

        const { expiration_date,code } = customer.phone;
        if (code !== currentCode) return new ErrorHandler('El código no es correcto',400)
        if (!new MomentService().verifyExpirationDate(expiration_date)) return new ErrorHandler('El código ha expirado',400);

        return await this.authRepository.verifyCode(customer._id);
    }

    async uploadCustomerFiles(customer_id: string,keys: Array<IFileKeys>) {
        let customer = await this.authRepository.findById(customer_id, );
        keys.forEach(async ({ key,field }) => {
            customer[field] = key
        })
        return await customer.save();

    }

    async registerPhone(phone:IPhoneRequest) {
        const  response = await this.authRepository.findAll()
        return response

    }

}