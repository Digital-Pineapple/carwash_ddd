import { Authentication, IGoogle, IGoogleReg, IGoogleRegister, IGoogleResponse, IGoogleResponseLogin, IdUserAndVerified } from '../authentication/AuthenticationService';

import { AuthRepository } from '../../domain/auth/AuthRepository';
import { ErrorHandler } from '../../../shared/domain/ErrorHandler';

import { IAuth } from '../authentication/AuthenticationService';

import { MomentService } from '../../../shared/infrastructure/moment/MomentService';
import { IFileKeys, IPhoneRequest } from './interfaces';
import { UserEntity } from '../../domain/user/UserEntity';
import { BranchPopulateConfig, PhonePopulateConfig, PopulatePointStore, TypeUserPopulateConfig, UserPopulateConfig } from '../../../shared/domain/PopulateInterfaces'
import {  sendVerifyMail } from '../../../shared/infrastructure/nodemailer/emailer';

export class AuthUseCase extends Authentication {

    constructor(private readonly authRepository: AuthRepository) {
        super();
    }

    async signIn(email: string, password: string): Promise<ErrorHandler | IAuth> {

        const user = await this.authRepository.findOneItem({ email }, TypeUserPopulateConfig, PhonePopulateConfig,PopulatePointStore);
        
        if (!user) return new ErrorHandler('No exite este usuario', 400);
        const validatePassword = this.decryptPassword(password, user.password)
        

        if (!validatePassword) return new ErrorHandler('El usuario o contraseña no son validos', 400);
        return await this.generateJWT(user);
    }


    async findUser(email: string): Promise<  UserEntity> {
        let customer = await this.authRepository.findOneItem({ email },PhonePopulateConfig, TypeUserPopulateConfig,PopulatePointStore);
        return await (customer);
    }

    async findPhone(phone: number): Promise<ErrorHandler | UserEntity> {
        const phoneString = phone.toString()
        let phone_number = await this.authRepository.findOneItem({ phone: { phone_number: phoneString } }, UserPopulateConfig);
        return await (phone_number);
    }


    async signUp(body: any): Promise<IGoogleResponse | ErrorHandler | null> {
        try {
            const user = await this.authRepository.findOneItem({ email: body.email });

            if (user) {
                if (user.email_verified === false) {
                    const userResponse = { user_id: user._id, verified: user.email_verified, email: user.email };
                    return userResponse;
                } else {
                    return new ErrorHandler('Este correo ya se encuentra verificado', 409);
                }
            } else {
                 const newPassword = await this.encryptPassword(body.password)
                const newUser = await this.authRepository.createOne({ ...body,password:newPassword });
                const newUserResponse = { user_id: newUser._id, verified: newUser.email_verified, email: newUser.email };
                return newUserResponse;
            }
        } catch (error) {

            throw new ErrorHandler('Error en el proceso de registro', 500);
        }
    }

    async signUp2(body: any): Promise<IGoogleReg | IAuth | ErrorHandler | null> {
        try {
            const user = await this.authRepository.findOneItem({ email: body.email });
            if (user) {
                    return new ErrorHandler('Este correo ya se encuentra registrado', 409);
                
            } else {
                 const newPassword = await this.encryptPassword(body.password)
                const newUser = await this.authRepository.createOne({ ...body, password:newPassword});
                const newUserResponse = { user_id: newUser._id,email: newUser.email, fullname:newUser.fullname, profile_image:newUser.profile_image };
                const user = this.generateJWT(newUserResponse)
                return user;
            }
        } catch (error) {

            throw new ErrorHandler('Error en el proceso de registro', 500);
        }
    }

    async signUpPlatform(body: any): Promise<UserEntity | IGoogleResponse | ErrorHandler | null> {
        try {
            const newUser = await this.authRepository.createOne({ ...body });
            await sendVerifyMail(newUser.email, newUser.fullname, newUser.accountVerify);
            const newUserResponse = { user_id: newUser._id, verified: newUser.email_verified, email: newUser.email };
            return newUserResponse;
        } catch (error) {
            return new ErrorHandler('Error en el proceso de registro', 500); //  500 (Internal Server Error)
        }
    }

    async signUpByPhone(body: any): Promise<IAuth | ErrorHandler | null> {


        let user = await this.authRepository.findOneItem({ phone: body.phone }, UserPopulateConfig);

        if (user) return new ErrorHandler('El usuario ya ha sido registrado', 400);

        user = await this.authRepository.createOne({});

        return await this.generateJWT(user);
    }

    async signInWithGoogle(idToken: string): Promise<IGoogleResponseLogin | IAuth | ErrorHandler | null> {
        let { email, picture } = await this.validateGoogleToken(idToken);
        
        let user = await this.authRepository.findOneItem({ email },TypeUserPopulateConfig, PhonePopulateConfig,PopulatePointStore);
        // if (user.email_verified === true) {
        //     user.profile_image === picture
        //     user = await this.generateJWT(user);
        // }
        // if (user.email_verified === false) {
        //     const user2: IGoogleResponseLogin = { user_id: user?._id, verified: user?.email_verified, email: user?.email, profile_image: picture }
        //     user = user2
        // }
        if (!user) return new ErrorHandler('No existe usuario', 409)
        user.profile_image = picture
        user = await this.generateJWT(user)
        
        return user
    }

    async signUpWithGoogle(idToken: string): Promise<IGoogle | ErrorHandler | null> {

        let {email,fullname,picture} = await this.validateGoogleToken(idToken);
    
        
        let user = await this.authRepository.findOneItem({ email: email, deleted:false }, TypeUserPopulateConfig,PhonePopulateConfig)
        if (user) {
            return new ErrorHandler('El usuario ya exite favor de iniciar sesión', 401)
        }
        if (!user) {
            user = { email, fullname, picture }
        }

        return user
       

    }

    async changePassword(password: string, newPassword: string, id: string): Promise<ErrorHandler | IAuth | null> {
        let customer = await this.authRepository.findById(id);
        const currentPassword = this.decryptPassword(password, customer.password);
        if (!currentPassword) return new ErrorHandler('Error la contraseña actual no es valida', 400);
        const newPass = this.encryptPassword(newPassword);
        return await this.authRepository.updateOne(customer._id, { password: newPass });
    }

    async updateProfilePhoto(photo: string, customer_id: string): Promise<UserEntity> {
        return await this.authRepository.updateOne(customer_id, { profile_image: photo });
    }

    async updateCustomer(customer_id: string, email: string, fullname: string): Promise<UserEntity> {
        return await this.authRepository.updateOne(customer_id, { email, fullname });
    }

    async generateToken(user: UserEntity) {
        return await this.generateJWT(user)
    }

    async registerPhoneNumber(user: UserEntity | UserEntity, phone: IPhoneRequest, code: number) {
        const { phone_number, prefix } = phone;

        const phoneData = await this.authRepository.validatePhoneNumber(phone_number, user._id);
        if (phoneData) return new ErrorHandler('El telefono ya ha sido registrado', 400);

        const data = { phone: { code, prefix, phone_number, expiration_date: new MomentService().addMinutesToDate(5) } }
        return await this.authRepository.updateOne(user._id, data,);
    }


    async verifyPhoneNumber(_id: string, currentCode: number) {
        const customer = await this.authRepository.findById(_id,);
        if (!customer.phone.phone_number) return new ErrorHandler('Ingresa un numero telefonico antes de continuar', 400);

        if (customer.phone.verified) return new ErrorHandler('El telefono ya ha sido verificado', 400);

        const { expiration_date, code } = customer.phone;
        if (code !== currentCode) return new ErrorHandler('El código no es correcto', 400)
        if (!new MomentService().verifyExpirationDate(expiration_date)) return new ErrorHandler('El código ha expirado', 400);

        return await this.authRepository.verifyCode(customer._id);
    }

    async uploadCustomerFiles(customer_id: string, keys: Array<IFileKeys>) {
        let customer = await this.authRepository.findById(customer_id,);
        keys.forEach(async ({ key, field }) => {
            customer[field] = key
        })
        return await customer.save();

    }

    async registerPhone(phone: IPhoneRequest) {
        const response = await this.authRepository.findAll()
        return response

    }

}