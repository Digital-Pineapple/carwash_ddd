import axios from 'axios';
import { NextFunction, Request, Response, response } from 'express';

import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';

import { AuthUseCase } from '../../../application/auth/AuthUseCase';
import { IAuth, IGoogleRegister, IGoogleResponse } from '../../../application/authentication/AuthenticationService';

import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { TwilioService } from '../../../../shared/infrastructure/twilio/TwilioService';

import { ResponseData } from '../../../../shared/infrastructure/validation/ResponseData';
import { generateRandomCode, generateUUID } from '../../../../shared/infrastructure/validation/Utils';


import { IPhoneRequest } from '../../../application/auth/interfaces';
import { TypeUserUseCase } from '../../../application/typeUser/TypeUserUseCase';
import { MPService } from '../../../../shared/infrastructure/mercadopago/MPService';
import { sendCodeMail } from '../../../../shared/infrastructure/nodemailer/emailer';
import { google } from 'googleapis';
import { ShoppingCartUseCase } from '../../../application/shoppingCart.ts/ShoppingCartUseCase';
import { TypeUserEntity } from '../../../domain/typeUser/TypeUserEntity';
import { verifyCaptcha } from '../../../../shared/infrastructure/validation/ValidateAuthentication';


export class AuthController extends ResponseData {
    protected path = '/users';

    constructor(private readonly authUseCase: AuthUseCase,
        private readonly typeUserUseCase: TypeUserUseCase,
        private readonly shoppingCartUseCase: ShoppingCartUseCase,
        private readonly s3Service: S3Service,
        private readonly twilioService: TwilioService,
        private readonly mpService: MPService,
        // private readonly 
    ) {
        super();
        this.login = this.login.bind(this);
        this.loginAdmin = this.loginAdmin.bind(this);
        this.loginPartner = this.loginPartner.bind(this);
        this.register = this.register.bind(this);
        this.registerAndPay = this.registerAndPay.bind(this);
        this.registerAdmin = this.registerAdmin.bind(this);
        this.loginWithGoogle = this.loginWithGoogle.bind(this);
        this.loginWithGooglePartner = this.loginWithGooglePartner.bind(this);
        this.registerByGoogle = this.registerByGoogle.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.restorePasswordByEmailAdmin = this.restorePasswordByEmailAdmin.bind(this);
        this.uploadProfilePhoto = this.uploadProfilePhoto.bind(this);
        this.revalidateToken = this.revalidateToken.bind(this);
        this.verifyCode = this.verifyCode.bind(this);
        this.savePhone = this.savePhone.bind(this);
        this.restorePasswordByEmail = this.restorePasswordByEmail.bind(this)
        this.verifyCodeByEmail = this.verifyCodeByEmail.bind(this);
        this.restorePassword = this.restorePassword.bind(this);
        this.loginFacebook = this.loginFacebook.bind(this);
        this.signupFacebook = this.signupFacebook.bind(this);
        this.redirectTikTok = this.redirectTikTok.bind(this);
        this.loginTikTok = this.loginTikTok.bind(this);
        this.changePasswordAdmin = this.changePasswordAdmin.bind(this);
    }

    public async login(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {            
        const { email, password, captchaToken } = req.body;
        try {
            
            const isValidCaptcha = await verifyCaptcha(captchaToken);
      

            // if (!isValidCaptcha) {
            //     next(new ErrorHandler('Captcha inválido', 500));
            //   }
              
            const response: any = await this.authUseCase.signIn(email, password);

            if (!(response instanceof ErrorHandler) && response.user.profile_image !== undefined) {
                response.user.profile_image ?
                    response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image + ".jpg") :
                    'No hay imagen de perfil'
            }

            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log(error);
            
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async loginPartner(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password } = req.body;

        try {

            const response: any = await this.authUseCase.signInPartner(email, password);

            if (!(response instanceof ErrorHandler) && response.user.profile_image !== undefined) {
                response.user.profile_image ?
                    response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image + ".jpg") :
                    'No hay imagen de perfil'
            }

            this.invoke(response, 200, res, '', next);
        } catch (error) {


            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }



    public async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password, captchaToken } = req.body;
        try {
            
            const isValidCaptcha = await verifyCaptcha(captchaToken);
      

            // if (!isValidCaptcha) {
            //     next(new ErrorHandler('Captcha inválido', 500));
            //   }
              
            const response: any = await this.authUseCase.signIn(email, password);
            
            if (!(response instanceof ErrorHandler) && response.user.profile_image !== undefined) {
                response.user.profile_image ?
                    response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image + ".jpg") :
                    'No hay imagen de perfil'
            }

            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async register(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password, fullname, phone } = req.body;
        try {
            const responsedefault  = await this.typeUserUseCase.getTypeUsers()
            const def = responsedefault?.filter((item : any) => item.name === 'Customer')
            const TypeUser_id = def?.map(item => item._id)
            const response = await this.authUseCase.signUp({ fullname, email, password, phone, type_user: TypeUser_id });
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler(`Error:${error}`, 500));
        }
    }

    public async registerAndPay(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password, fullname, system } = req.body;
        const uuid = generateUUID()

        try {
            const typeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: "CUSTOMER" });

            if (!typeUser?._id) {
                return next(new ErrorHandler('No existe tipo de usuario', 500));
            }
            const response: any = await this.authUseCase.signUp2({ fullname, email, password, type_user: typeUser?._id, uuid: uuid });
            if (response?.user._id) {
                await this.shoppingCartUseCase.createShoppingCart({ user_id: response?.user._id })
            }

            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler(`Error:${error}`, 500));
        }
    }


    public async registerAdmin(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email, password, fullname, phone, type_user } = req.body;
        const uuid = generateUUID()
        try {
            const response = await this.authUseCase.signUp({ fullname, email, password, phone, type_user: type_user, uuid: uuid });
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log(error);

            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async loginWithGoogle(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { idToken, system, role } = req.body;
        try {       
            if(!idToken) return next(new ErrorHandler('No se proporcionó un token de acceso', 400));
            const typeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: role });            
            if (!typeUser) return next(new ErrorHandler('Hubo un error al inicar sesión', 500))            
            const googleUserResponse = await this.authUseCase.signInWithGoogle(idToken, typeUser._id);            
            this.invoke(googleUserResponse, 200, res, '', next);           
        } catch (error) {
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }
    public async loginWithGooglePartner(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { idToken } = req.body;
        try {
            const response = await this.authUseCase.signInWithGooglePartner(idToken);

            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Usuario no registrado', 500));
        }
    }

    public async registerByGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { idToken, system, role } = req.body;
        try {
            if(!idToken) return next(new ErrorHandler('No se proporcionó un token de acceso', 400));
            const typeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: role });            
            if (!typeUser) return next(new ErrorHandler('Hubo un error al registrar con gooole', 500))            
            const googleUserResponse = await this.authUseCase.signUpWithGoogle(idToken, typeUser?._id);;            
            this.invoke(googleUserResponse, 200, res, '', next);                                        
        } catch (error) {
            console.log(error);            
            next(new ErrorHandler('Hubo un error al registrar', 500));
        }
    }


    public async restorePasswordByEmail(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {

        const { email } = req.body;

        try {
            const response: any = await this.authUseCase.findUser({ email: email })
            if(!response) return next(new ErrorHandler('No existe el usuario', 404));

            const newCode = parseInt(generateRandomCode())
            // const NoAttempts = 2
            if (!response.verify_code) {
                // const { attemps }: any = (response.verify_code);
                // if (attemps >= 1) {
                    // const newAttemps = attemps - 1
                    // try {
                        await this.authUseCase.updateCodeUser(response._id, newCode)
                        const { success, message } = await sendCodeMail(response.email, response.fullname, newCode)
                        this.invoke(success, 200, res, `${message}`, next)
                    // } catch (error) {
                    //     next(new ErrorHandler('Error', 500));
                    // }
                // }
                // if (attemps === 0) {
                //     next(new ErrorHandler('Has alcanzado el limite de intentos', 500));
                // }
            } else {
                // try {
                    await this.authUseCase.updateCodeUser(response._id, newCode)
                    const { success, message } = await sendCodeMail(response.email, response.fullname, newCode)
                    this.invoke(success, 201, res, `${message}`, next)
                // } catch (error) {
                //     next(new ErrorHandler('Error', 500));

                // }
            }

        } catch (error) {
            next(new ErrorHandler(`No existe el usuario: ${email}`, 500));
        }
    }

    public async restorePasswordByEmailAdmin(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { email } = req.user;
        try {
            const response: any = await this.authUseCase.findUser({ email: email })
            if(!response) return next(new ErrorHandler('No existe el usuario', 404));

            const newCode = parseInt(generateRandomCode())
            // const NoAttempts = 2
            if (!response.verify_code) {
                // const { attemps }: any = (response.verify_code);
                // if (attemps >= 1) {
                    // const newAttemps = attemps - 1
                    // try {
                        await this.authUseCase.updateCodeUser(response._id, newCode)
                        const { success, message } = await sendCodeMail(response.email, response.fullname, newCode)
                        this.invoke(success, 200, res, `${message}`, next)
                    // } catch (error) {
                    //     next(new ErrorHandler('Error', 500));
                    // }
                // }
                // if (attemps === 0) {
                //     next(new ErrorHandler('Has alcanzado el limite de intentos', 500));
                // }
            } else {
                // try {
                    await this.authUseCase.updateCodeUser(response._id, newCode)
                    const { success, message } = await sendCodeMail(response.email, response.fullname, newCode)
                    this.invoke(success, 201, res, `${message}`, next)
                // } catch (error) {
                //     next(new ErrorHandler('Error', 500));

                // }
            }

        } catch (error) {
            next(new ErrorHandler(`No existe el usuario: ${email}`, 500));
        }
    }


    public async verifyCodeByEmail(req: Request, res: Response, next: NextFunction) {
        const { code, email } = req.body;

        try {
            const response = await this.authUseCase.ValidateCodeEmail(email, code)

            this.invoke(response, 200, res, 'Código valido', next)
        } catch (error) {
            next(new ErrorHandler(`No existe el usuario: ${email}`, 500));
        }



    }

    public async changePassword(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { password, new_password } = req.body;
        const { id } = req.params;
        try {
            const response = await this.authUseCase.changePassword(password, new_password, id);
            this.invoke(response, 200, res, 'La contraseña se cambio con exito', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al cambiar la contraseña', 500));
        }
    }

    public async changePasswordAdmin(req: Request, res: Response, next: NextFunction): Promise<IAuth | ErrorHandler | void> {
        const { id } = req.user;
        const { password, new_password } = req.query;
        
        try {
            const response = await this.authUseCase.changePassword(password, new_password, id ? id: '' );
            this.invoke(response, 200, res, 'La contraseña se cambio con exito', next);
        } catch (error) {
            console.log(error);
            
            next(new ErrorHandler('Hubo un error al cambiar la contraseña', 500));
        }
    }

    public async uploadProfilePhoto(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const pathObject = `${this.path}/${id}/${req.file?.fieldname}`;
            const { url, success, message } = await this.s3Service.uploadToS3AndGetUrl(pathObject + '.jpg', req.file, 'image/jpeg');
            if (!success) return new ErrorHandler('Hubo un error al subir la imagen', 400)
            const response = await this.authUseCase.updateProfilePhoto(pathObject, id);
            response.profile_image = url;
            this.invoke(response, 200, res, message, next);
        } catch (error) {

            next(new ErrorHandler('Hubo un error al subir la foto', 500));
        }
    }



    public async revalidateToken(req: Request, res: Response, next: NextFunction) {
        
        // #swagger.tags = ['Auth']
        const user = req.user;
        try {
            const userInfo = await this.authUseCase.findUser({ email: user.email, status: true });
            if (userInfo.profile_image) {
                
                const url = await this.s3Service.getUrlObject(userInfo.profile_image + ".jpg")
                userInfo.profile_image = url
            }
            const response = await this.authUseCase.generateToken(userInfo, userInfo.uuid);
            
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            
            next(new ErrorHandler('Hubo un error al generar el token', 500));
        }
    }

    public async savePhone(req: Request, res: Response, next: NextFunction) {
        const { phone_number, prefix }: IPhoneRequest = req.body;

        try {

            const code = generateRandomCode();
            const vcode = parseInt(code)

            // await this.twilioService.sendSMS(`Codigo de verificacion CarWash autolavado y más- ${code}`);
            const response = await this.authUseCase.findPhone(phone_number)

            this.invoke(response, 200, res, 'El telefono se registro correctamente', next);
        } catch (error) {


            next(new ErrorHandler('Hubo un error al guardar el telefono', 500));
        }
    }

    public async verifyCode(req: Request, res: Response, next: NextFunction) {
        const user = req.user.id;
        const { code } = req.body;
        try {
            const response = await this.authUseCase.verifyPhoneNumber(user, + code);
            this.invoke(response, 200, res, 'El código de verificación se envió correctamente', next);
        } catch (error) {
            next(new ErrorHandler('El codigo no se ha enviado', 500));
        }
    }

    public async restorePassword(req: Request, res: Response, next: NextFunction) {
        const { user } = req;
        const { password } = req.body;
        console.log(user, password);

        const id = user.toString()

        try {
            await this.authUseCase.restorePassword(id, password)
            this.invoke('', 200, res, 'Cambio la contraseña exitosamente', next);
        } catch (error) {

            next(new ErrorHandler('Error al cambiar contraseña', 500));
        }
    }

    public async loginFacebook(req: Request, res: Response, next: NextFunction) {
        const { token, system , role } = req.body;
        try {            
            if(!token) return next(new ErrorHandler('No se proporcionó un token de acceso', 400));
            const typeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: role });            
            if (!typeUser) {
                return next(new ErrorHandler('Hubo un error al inicar sesión', 500))
            }
            const facebookUser = await this.authUseCase.signInWithFacebook(token, typeUser._id);                                               
            this.invoke(facebookUser, 200, res, 'Inicio de sesión exitoso', next);
        } catch (error) {
            console.log("the error is: ", error);
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async signupFacebook(req: Request, res: Response, next: NextFunction) {
        const { token, system , role } = req.body;
        try {           
            if(!token) return next(new ErrorHandler('No se proporcionó un token de acceso', 400));
            const typeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: role });
            if (!typeUser) {
                return next(new ErrorHandler('Hubo un error al registar', 500))
            }
            const facebookUser = await this.authUseCase.signUpWithFacebook(token, typeUser._id);
            this.invoke(facebookUser, 200, res, 'Registro exitoso', next);
        } catch (error) {
            console.log("the error is: ", error);
            next(new ErrorHandler('Hubo un error al registrar', 500));
        }
    }

    public async redirectTikTok(req: Request, res: Response, next: NextFunction) { 
        try {
            const csrfState = Math.random().toString(36).substring(2);
            const url = await this.authUseCase.getLoginUrlTikTok(csrfState);                        
            res.cookie('csrfState', csrfState, { maxAge: 60000 });   
            this.invoke({ url: url }, 200, res, '', next);              
        } catch (error) {
            console.log(error, "mi error");            
            next(new ErrorHandler('Ocurrio un error', 500));
        }
    }

    public async loginTikTok(req: Request, res: Response, next: NextFunction) {
        const { code, system, role } = req.body;                
        try {            
            if(!code) return next(new ErrorHandler('No se proporcionó un codigo de acceso', 404));
            const typeUser: any | null = await this.typeUserUseCase.findTypeUser({ system: system, role: role }); 
            if (!typeUser) return next(new ErrorHandler('Hubo un error al iniciar sesión', 500))
            const user = await this.authUseCase.loginWithTikTok(code, typeUser._id);            
            // console.log("the user info is : ", user);  
            this.invoke(user, 200, res, 'Inicio de sesión exitoso', next);
        } catch (error) {
            console.log("the error is: ", error);
            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }   




}