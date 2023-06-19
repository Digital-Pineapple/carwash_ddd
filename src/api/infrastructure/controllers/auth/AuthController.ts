import { NextFunction, Request, Response } from 'express';

import { CustomerEntity } from '../../../domain/customer/CustomerEntity';
import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';

import { AuthUseCase } from '../../../application/auth/AuthUseCase';
import { IAuth } from '../../../application/authentication/AuthenticationService';

import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { TwilioService } from '../../../../shared/infrastructure/twilio/TwilioService';

import { ResponseData } from '../../../../shared/infrastructure/validation/ResponseData';
import { generateRandomCode } from '../../../../shared/infrastructure/validation/Utils';


import { IPhoneRequest } from '../../../application/auth/interfaces';

export class AuthController extends ResponseData {
    protected path = '/customers';

    constructor(private readonly authUseCase: AuthUseCase, private readonly s3Service: S3Service, private readonly twilioService: TwilioService) {
        super();
        this.login                      =   this.login.bind(this);
        this.register                   =   this.register.bind(this);
        this.loginWithGoogle            =   this.loginWithGoogle.bind(this);
        this.changePassword             =   this.changePassword.bind(this);
        this.uploadProfilePhoto         =   this.uploadProfilePhoto.bind(this);
        this.revalidateToken            =   this.revalidateToken.bind(this);
        this.verifyCode                 =   this.verifyCode.bind(this);
        this.savePhoneNumberAndSendCode =   this.savePhoneNumberAndSendCode.bind(this);
        this.updateCustomer             =   this.updateCustomer.bind(this);
        this.uploadFiles                =   this.uploadFiles.bind(this);
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password } = req.body;
        try {
            const response = await this.authUseCase.signIn(email, password);
            if(!(response instanceof ErrorHandler)) response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image);
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async register(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password, fullname, type_customer, phone } = req.body;
        try {
            const response = await this.authUseCase.signUp({ fullname, email, password, type_customer, phone });
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log(error)
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async loginWithGoogle(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { idToken, type_customer } = req.body;
        try {
            const response = await this.authUseCase.signInWithGoogle(idToken, type_customer);
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async changePassword(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { password, new_password } = req.body;
        const { user } = req;
        try {
            const response = await this.authUseCase.changePassword(password, new_password, user);
            this.invoke(response, 200, res, 'La contraseña se cambio con exito', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al cambiar la contraseña', 500));
        }
    }

    public async uploadProfilePhoto(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        try {
            const pathObject = `${this.path}/${user._id}/${req.file?.fieldname}`;
            const { message, key, url, success } = await this.s3Service.uploadToS3AndGetUrl(pathObject, req.file);
            if(!success) return new ErrorHandler('Hubo un error al subir la imagen', 400)
            const response = await this.authUseCase.updateProfilePhoto(key, user._id);
            console.log(response)
            response.profile_image = url;
            this.invoke(response, 200, res, message, next);
        } catch (error) {
            console.log(error)
            next(new ErrorHandler('Hubo un error al subir la foto', 500));
        }
    }

    public async updateCustomer(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        const { email, fullname } = req.body;
        try {
            const response = await this.authUseCase.updateCustomer(user._id, email, fullname);
            response.profile_image = await this.s3Service.getUrlObject(response?.profile_image);
            this.invoke(response, 200, res, 'El usuario se actualizo con exito', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al actualizar la información', 500));
        }
    }

    public async revalidateToken(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        try {
            const customer = await this.authUseCase.findUser(user.email);
            const response = await this.authUseCase.generateToken(customer);
            if (!response.user.profile_image) {
                response.user.profile_image = await this.s3Service.getUrlObject(response.user?.profile_image);
            }
            
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al generar el token', 500));
        }
    }

    public async savePhoneNumberAndSendCode(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        const { prefix, phone_number } : IPhoneRequest = req.body;
        try {
            const code = generateRandomCode();
            //await this.twilioService.sendSMS(`Verifica tu número de teléfono con el siguiente codigo - ${code}`);
            const response = await this.authUseCase.registerPhoneNumber(user, { prefix, phone_number }, +code);
            this.invoke(response, 200, res, 'El telefono se registro correctamente', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al guardar el telefono', 500));
        }
    }

    public async verifyCode(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        const { code } = req.body;
        try {
            const response = await this.authUseCase.verifyPhoneNumber(user._id, +code);
            this.invoke(response, 200, res, 'El código de verificación se envió correctamente', next);
        } catch (error) {
            next(new ErrorHandler('El codigo no se ha enviado', 500));
        }
    }

    public async uploadFiles({ files, user}: Request, res: Response, next: NextFunction) {
        const documents = [ files?.ine, files?.curp, files?.prook_address, files?.criminal_record ];
        let keys: any = [];
        try {

            if(!files?.ine || !files?.curp || !files?.prook_address || !files?.criminal_record) return next(new ErrorHandler('los archivos son requeridos', 400));

            await Promise.all(documents?.map(async (file) => {
                const pathObject = `${this.path}/${user._id}/${file[0].fieldname}`;
                keys.push({ field: file[0].fieldname, key: pathObject })
                await this.s3Service.uploadToS3(pathObject+ ".pdf", file[0])
            }));
            const response = await this.authUseCase.uploadCustomerFiles(user._id, keys);
            this.invoke(response, 200, res, 'Los archivos se subieron correctamente', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al subir los archivos', 500));
        }
    }

}