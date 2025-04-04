import { NextFunction, Request, Response, response } from 'express';

import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';
import { TwilioService } from '../../../../shared/infrastructure/twilio/TwilioService';

import { ResponseData } from '../../../../shared/infrastructure/validation/ResponseData';
import { generateRandomCode, generateUUID } from '../../../../shared/infrastructure/validation/Utils';
import { UserPhoneUseCase } from '../../../application/user/UserPhoneUseCase';
import { IPhone, UserEntity } from '../../../domain/user/UserEntity';
import { UserUseCase } from '../../../application/user/UserUseCase';
import { TypeUserUseCase } from '../../../application/typeUser/TypeUserUseCase';
import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { sendMail } from '../../../../shared/infrastructure/nodemailer/emailer';
import { IGoogleResponse } from '../../../application/authentication/AuthenticationService';
import { ShoppingCartUseCase } from '../../../application/shoppingCart.ts/ShoppingCartUseCase';
import { AddressUseCase } from '../../../application/address/AddressUseCase';
import { SNService } from '../../../../shared/infrastructure/aws/SNService';
import { relativeTimeThreshold } from 'moment';
// import { whatsappService } from '../../../../shared/infrastructure/whatsapp/WhatsappService..external';


export class UserController extends ResponseData {
    protected path = '/user';    
    // protected whatsappService =  whatsappService

    constructor(private readonly phoneUserUseCase: UserPhoneUseCase,
        private readonly userUseCase: UserUseCase,
        private readonly typeUserUseCase: TypeUserUseCase,
        private readonly shoppingCartUseCase: ShoppingCartUseCase,
        private readonly addressUseCase: AddressUseCase,
        private readonly twilioService: TwilioService,
        private readonly s3Service: S3Service,
        private readonly snsService: SNService,        

    ) {
        super();
        this.allPhones = this.allPhones.bind(this);
        this.onePhone = this.onePhone.bind(this);
        this.allUsers = this.allUsers.bind(this);
        this.getUser = this.getUser.bind(this);
        this.getVerifyEmail = this.getVerifyEmail.bind(this)
        this.sendCode = this.sendCode.bind(this); 
        this.sendCodeWhatsapp = this.sendCodeWhatsapp.bind(this);       
        this.resendCode = this.resendCode.bind(this);
        this.verifyPhone = this.verifyPhone.bind(this);
        this.verifyEmail = this.verifyEmail.bind(this);
        this.loginPhonePartner = this.loginPhonePartner.bind(this)
        this.deletePhone = this.deletePhone.bind(this);
        this.signUpByPhone = this.signUpByPhone.bind(this);
        this.signUpPartnerByPhone = this.signUpPartnerByPhone.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.loginPhone = this.loginPhone.bind(this);
        this.physicalDeletePhone = this.physicalDeletePhone.bind(this);
        this.validateUser = this.validateUser.bind(this);
        this.updateCollectionPoint = this.updateCollectionPoint.bind(this);
        this.RegisterCarrierDriver = this.RegisterCarrierDriver.bind(this);
        this.getAllCarrierDrivers = this.getAllCarrierDrivers.bind(this);
        this.createAddress = this.createAddress.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.getAddresses = this.getAddresses.bind(this);
        this.deleteAddress = this.deleteAddress.bind(this);
        this.getAllInfoUser = this.getAllInfoUser.bind(this);
        this.deleteCarrierDriver = this.deleteCarrierDriver.bind(this);
        this.UpdateCarrierDriver = this.UpdateCarrierDriver.bind(this)
        this.RegisterWarehouseman = this.RegisterWarehouseman.bind(this);
        this.getAllWarehouseman = this.getAllWarehouseman.bind(this);
        this.UpdateWarehouseman = this.UpdateWarehouseman.bind(this);
    }


    public async allPhones(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        try {
            const response = await this.phoneUserUseCase.allPhones()
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }
    public async onePhone(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { id } = req.params
        try {
            const response = await this.phoneUserUseCase.getPhone(id)
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async allUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const response = await this.userUseCase.allUsers();
          if (response instanceof ErrorHandler) {
            this.invoke(response, 500, res, 'Hubo un error al consultar la información', next);
            return;
          }
      
          if (response) {
            await Promise.all(
              response.map(async (customer: any) => {
                if (!customer.google && customer.profile_image && !customer.profile_image.startsWith('https')) {
                  const url = await this.s3Service.getUrlObject(customer.profile_image + ".jpeg");
                  customer.profile_image = url;
                }
              })
            );
          }
      
          this.invoke(response, 200, res, '', next);
        } catch (error) {
          next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
      }
      
    public async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id } = req.params;
      
        try {
          const response = await this.userUseCase.getOneUser(id);
      
          if (!(response instanceof ErrorHandler) && response?.profile_image) {
            // Solo si el usuario no es de Google y la imagen no es una URL completa, se obtiene la URL desde S3.
            if (!response.google && !response.profile_image.startsWith('https')) {
              const url = await this.s3Service.getUrlObject(response.profile_image);
              response.profile_image = url;
            }
          }
      
          this.invoke(response, 200, res, '', next);
        } catch (error) {
          next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
      }
      

    public async getAllCarrierDrivers(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const response = await this.userUseCase.allCarrierDrivers()
            this.invoke(response, 200, res, '', next);
        } catch (error) {

            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getAllWarehouseman(req: Request, res: Response, next: NextFunction): Promise<void> {
        const {_id , type_user} = req.user
        let response : any  = []
        try {
            const users = await this.userUseCase.allWarehouseman()
            if (type_user?.role[0] === 'WAREHOUSEMAN' || type_user?.role[0] === "WAREHOUSE-MANAGER") {
                const myUsers = response.filter((i:any)=> i.employee_detail.store_house._id === _id)
                response = myUsers
                
            }
            response = users
            this.invoke(response, 200, res, '', next);
        } catch (error) {

            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getAllInfoUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id } = req.params
        try {
            const response = await this.userUseCase.getOneUserAll(id)
            this.invoke(response, 200, res, '', next);
        } catch (error) {

            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }
    public async sendCode(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { phone_number, prefix, system = "CICHMEX" } = req.body;
        try {
            const code = generateRandomCode();
            const phoneString = prefix + phone_number
            // const phoneString = JSON.stringify(phoneC)            
            const phone : any = await this.phoneUserUseCase.findOnePhone(phone_number)
            // console.log("code", code);
            
            if(!phone){
                console.log("no existe este telefono y se va a registrar");           
                // await this.whatsappService.sendMessage(phoneString, `${system}. Código de verificación - ${code}`)
                // await this.snsService.publishMessage(phoneString, `${system}. Código de verificación - ${code}`); 
                // console.log(code);
                
                await this.twilioService.sendSMS(phoneString, `${system}. Código de verificación - ${code}`)
                const newPhone = await this.phoneUserUseCase.createUserPhone({ code, phone_number: phone_number, prefix }, phone_number);
                return this.invoke(newPhone, 200, res, `Codigo enviado con éxito al ${phoneString}`, next);
            }    
            const userPhoneOwner : any | null = await this.userUseCase.findUserByPhone(phone._id);                    
            if(userPhoneOwner) return next(new ErrorHandler('El telefono ya esta registrado', 500))            
            await this.twilioService.sendSMS(phoneString, `${system}. Código de verificación - ${code}`)

            // await this.snsService.publishMessage(phoneString, `${system}. Código de verificación - ${code}`); 
            // await this.whatsappService.sendMessage(phoneString, `${system}. Código de verificación - ${code}`)
            const updated = await this.phoneUserUseCase.updateUserPhone(phone._id, { code: code })            
            return this.invoke(updated, 200, res, `Codigo enviado con éxito al ${phoneString}`, next);  
        } catch (error) {            
            this.invoke(error, 500, res, 'Error interno del servidor', next);
        }
    }  
    public async sendCodeWhatsapp(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { phone_number, prefix, system = "CICHMEX" } = req.body;
        try {
            const code = generateRandomCode();
            const phoneC = prefix + phone_number;
            const phoneString = JSON.stringify(phoneC)            
            const phone : any = await this.phoneUserUseCase.findOnePhone(phone_number)                        
            if(!phone){
                await this.twilioService.sendWhatsappMessage(phoneString, `${system}. Código de verificación - ${code}`)
                const newPhone = await this.phoneUserUseCase.createUserPhone({ code, phone_number: phone_number, prefix }, phone_number);
                return this.invoke(newPhone, 200, res, `Codigo enviado con éxito al ${phoneString}`, next);
            }    
            const userPhoneOwner : any | null = await this.userUseCase.findUserByPhone(phone._id);                    
            if(userPhoneOwner) return next(new ErrorHandler('El telefono ya esta registrado', 500))            
            await this.twilioService.sendWhatsappMessage(phoneString, `${system}. Código de verificación - ${code}`)
            const updated = await this.phoneUserUseCase.updateUserPhone(phone._id, { code: code })            
            return this.invoke(updated, 200, res, `Codigo enviado con éxito al ${phoneString}`, next);  
        } catch (error) {            
            this.invoke(error, 500, res, 'Error interno del servidor', next);
        }
    }  

    public async resendCode(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { id } = req.params;
        try {
            const newcode = generateRandomCode()
            const response = await this.phoneUserUseCase.getOnePhone(id)
            if (!(response instanceof ErrorHandler) && response?.phone_number !== undefined && response.prefix !== undefined) {
                const phoneC = response?.prefix + response?.phone_number
                const phoneString = phoneC.toString()
                const updated = await this.phoneUserUseCase.updateUserPhone(id, { code: newcode })
                const info = await this.twilioService.sendSMS(phoneString, `CICHMEX. Código de verificación - ${newcode}`)
                return this.invoke(updated, 400, res, '', next)
            }
        } catch (error) {

            next(new ErrorHandler('Hubo un error al enviar código de verificacion', 500));
        }
    }
    public async verifyPhone(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { id } = req.params
        const { code } = req.body;
        try {
            const infoPhone = await this.phoneUserUseCase.getOnePhone(id)
            if (!(infoPhone instanceof ErrorHandler)) {
                if (infoPhone?.code === code) {
                    const verified = await this.phoneUserUseCase.verifyCode(id)

                    this.invoke(verified, 200, res, '', next)
                } else {
                    next(new ErrorHandler('El codigo no coincide', 400))
                }
            }
        } catch (error) {

            next(new ErrorHandler('Hubo un error ', 500));
        }
    }

    public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<UserEntity | ErrorHandler | void> {
        const { id } = req.params
        const { code } = req.body;

        try {
            const infoUser = await this.userUseCase.getUser(id)
            if (!(infoUser instanceof ErrorHandler)) {
                if (infoUser?.accountVerify === code) {
                    const response = this.userUseCase.updateRegisterUser(id, { email_verified: true, google: true })


                    this.invoke(response, 200, res, '', next)
                } else {
                    next(new ErrorHandler('El codigo no coincide', 400))
                }
            }
        } catch (error) {

            next(new ErrorHandler('Hubo un error ', 500));
        }
    }

    public async deletePhone(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { id } = req.params
        try {
            const response = await this.phoneUserUseCase.deletePhone(id)
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al eliminar', 500));
        }
    }


    public async physicalDeletePhone(req: Request, res: Response, next: NextFunction): Promise<IPhone | ErrorHandler | void> {
        const { id } = req.params
        try {
            const response = await this.phoneUserUseCase.deletePhysicalPhone(id)
            this.invoke(response, 200, res, '', next);
        } catch (error) {


            next(new ErrorHandler('Hubo un error al eliminar', 500));
        }
    }


    public async getVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<IGoogleResponse | ErrorHandler | void> {
        const { id } = req.params

        try {
            const response = await this.userUseCase.getUserEmail(id)
            this.invoke(response, 200, res, '', next);
        } catch (error) {

            next(new ErrorHandler('Hubo un error', 500));
        }
    }

    public async signUpByPhone(req: Request, res: Response, next: NextFunction): Promise<UserEntity | ErrorHandler | void> {
        const { fullname, email, password, phone_id, system } = req.body
        const uuid = generateUUID()

        try {
            const TypeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: "CUSTOMER" })
            console.log("TypeUser", TypeUser);            
            if (!(TypeUser?._id)) {
                next(new ErrorHandler('No existe tipo de usuario', 500))
            }
            const response: any = await this.userUseCase.createUser({ fullname, email, password, phone_id, type_user: TypeUser?._id, uuid: uuid })
            // console.log("response", response);                        
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log("error:" , error);            
            next(new ErrorHandler('Hubo un error ', 500));
        }
    }

    public async signUpPartnerByPhone(req: Request, res: Response, next: NextFunction): Promise<UserEntity | ErrorHandler | void> {
        const { fullname, email, password, phone_id, system } = req.body
        const uuid = generateUUID()
        try {

            const TypeUser = await this.typeUserUseCase.findTypeUser({ system: system, role: "PARTNER" })
            console.log(TypeUser);

            if (!(TypeUser?._id)) {
                next(new ErrorHandler('No existe tipo de usuario', 500))
            }
            const response = await this.userUseCase.createUser({ fullname, email, password, phone_id, type_user: TypeUser?._id, uuid: uuid })
            this.invoke(response, 200, res, '', next);

        } catch (error) {

            next(new ErrorHandler('Hubo un error ', 500));
        }
    }

    public async loginPhone(req: Request, res: Response, next: NextFunction): Promise<UserEntity | IPhone | ErrorHandler | void> {
        const { password, phone_number } = req.body

        try {

            const phoneInfo = await this.phoneUserUseCase.findPhone(phone_number)
            if (!(phoneInfo instanceof ErrorHandler)) {
                const response: any = await this.userUseCase.signInByPhone(phoneInfo.phone_id, password)
                if (!(response instanceof ErrorHandler) && response.user.profile_image !== undefined) {
                    response.user.profile_image ?
                        response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image + ".jpg") :
                        'No hay imagen de perfil'
                }
                this.invoke(response, 200, res, '', next);

            }
            else {
                next(new ErrorHandler('No existe el telefono', 500));
            }


        } catch (error) {
            console.log(error);

            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async loginPhonePartner(req: Request, res: Response, next: NextFunction): Promise<UserEntity | IPhone | ErrorHandler | void> {
        const { password, phone_number } = req.body


        try {

            const phoneInfo = await this.phoneUserUseCase.findPhone(phone_number)

            if (!(phoneInfo instanceof ErrorHandler)) {
                const response: any = await this.userUseCase.signInByPhone(phoneInfo.phone_id, password)
                if (!(response instanceof ErrorHandler) && response.user.profile_image !== undefined) {
                    response.user.profile_image ?
                        response.user.profile_image = await this.s3Service.getUrlObject(response.user.profile_image + ".jpg") :
                        'No hay imagen de perfil'
                }
                this.invoke(response, 200, res, '', next);

            }
            else {
                this.invoke(phoneInfo, 200, res, '', next);
            }


        } catch (error) {

            next(new ErrorHandler('Hubo un error al iniciar sesión', 500));
        }
    }

    public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<UserEntity | ErrorHandler | void> {
        const { id } = req.params
        try {
            const response = await this.userUseCase.deleteUser(id)
            this.invoke(response, 200, res, 'Se eliminó con éxito', next);
        } catch (error) {
            next(new ErrorHandler(`Error: ${error}`, 500));
        }
    }
    public async updateUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { fullname, type_user } = req.body;
      
        try {
          // Preparar los datos a actualizar
          let updateData: { fullname: string; type_user: string; profile_image?: string } = {
            fullname,
            type_user,
          };
      
          // Si existe un archivo, se intenta subir y actualizar la imagen
          if (req.file) {
            // Opcional: Sanitizar el nombre para evitar problemas en la URL o en el sistema de archivos
            const sanitizedFullname = fullname.replace(/\s+/g, '_');
            const pathObject = `${this.path}/${id}/${sanitizedFullname}`;
            const { url, success } = await this.s3Service.uploadToS3AndGetUrl(`${pathObject}.webp`, req.file, "image/*");
      
            if (!success) {
              return next(new ErrorHandler('Hubo un error al subir la imagen', 400));
            }
      
            // Actualizamos directamente con la URL obtenida
            updateData.profile_image = url.split('?')[0];
          }
      
          // Se realiza la actualización del usuario con los datos preparados
          const response = await this.userUseCase.updateUser(id, updateData);
      
          this.invoke(response, 201, res, "El usuario se actualizó con éxito", next);
        } catch (error) {
          next(new ErrorHandler("Hubo un error al editar la información", 500));
        }
      }
      

    public async updatePhone(req: Request, res: Response, next: NextFunction) {
        const { phone } = req.body;
        const user = req.user;
    }

    public async updateCollectionPoint(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { store } = req.body;

        try {
            const response = await this.userUseCase.updateUser(id, { store: store })


            this.invoke(
                response,
                201,
                res,
                "Cambio exitoso",
                next
            );
        } catch (error) {
            next(new ErrorHandler("Hubo un error al editar la información", 500));
        }
    }

    public async validateUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { accountVerified } = req.body
        const data = Boolean(accountVerified)

        try {
            const response = await this.userUseCase.updateUser(id, { accountVerify: data })
            if (!(response instanceof ErrorHandler)) {
                if (!response?.google && response !== null) {
                    const url = await this.s3Service.getUrlObject(response?.profile_image + ".jpg");
                    response.profile_image = url;
                }
            }
            this.invoke(response, 200, res, 'Verificado con éxito', next);
        } catch (error) {
            next(new ErrorHandler("Hubo un error al editar la información", 500));
        }
    }

    public async RegisterCarrierDriver(req: Request, res: Response, next: NextFunction) {
        const { values } = req.body;
        const p = values.phone.split(' ');
        const prefix = p[0];
        const phone_number = JSON.parse(p[1] + p[2] + p[3]);
        const info_phone = {
            prefix,
            phone_number,
            code: generateRandomCode()
        };
        const uuid = generateUUID()
        let response: any = '';

        const noRepeatPhone = await this.phoneUserUseCase.findOnePhone(phone_number)
        if (noRepeatPhone) return next(new ErrorHandler('El telefono ya ha sido registrado', 400));

        const noRepeatUser = await this.userUseCase.findUser(values.email)

        if (noRepeatUser) return next(new ErrorHandler('El usuario ya ha sido registrado', 400));

        try {
            const r_phone: any = await this.phoneUserUseCase.createEmployeePhone(info_phone);

            try {
                const responsedefault = await this.typeUserUseCase.findTypeUser({ role: ['CARRIER-DRIVER'] })

                if (responsedefault) {
                    const TypeUser_id = responsedefault._id;
                    const response1 = await this.userUseCase.createUser({ ...values, type_user: TypeUser_id, phone_id: r_phone?._id, uuid: uuid });
                    response = response1;
                    this.invoke(response, 200, res, 'Creado con éxito', next);
                } else {
                    next(new ErrorHandler("Tipo de usuario 'CarrierDriver' no encontrado", 400));
                }
            } catch (error) {
                console.log(error);

                next(new ErrorHandler("Correo existente", 500));
            }

        } catch (error) {
            next(new ErrorHandler("Error al crear telefono", 500));
        }
    }

    public async RegisterWarehouseman(req: Request, res: Response, next: NextFunction) {
        const { values } = req.body;
        const p = values.phone.split(' ');
        const prefix = p[0];
        const phone_number = JSON.parse(p[1] + p[2] + p[3]);
        const info_phone = {
            prefix,
            phone_number,
            code: generateRandomCode()
        };
        const uuid = generateUUID()
        let response: any = '';

        const noRepeatPhone = await this.phoneUserUseCase.findOnePhone(phone_number)
        if (noRepeatPhone) return next(new ErrorHandler('El telefono ya ha sido registrado', 400));

        const noRepeatUser = await this.userUseCase.findUser(values.email)

        if (noRepeatUser) return next(new ErrorHandler('El usuario ya ha sido registrado', 400));
        if (values.type !== 'WAREHOUSEMAN' && values.type !== 'WAREHOUSE-MANAGER') {
            return next(new ErrorHandler('El tipo de usuario no es válido', 400));
        }
        

        try {
            const r_phone: any = await this.phoneUserUseCase.createEmployeePhone(info_phone);

            try {
                const responsedefault = await this.typeUserUseCase.findTypeUser({ role: [values.type] })

                if (responsedefault) {
                    const TypeUser_id = responsedefault._id;
                    const response1 = await this.userUseCase.createUser({ ...values, type_user: TypeUser_id, phone_id: r_phone?._id, uuid: uuid });
                    response = response1;
                    this.invoke(response, 200, res, 'Creado con éxito', next);
                } else {
                    next(new ErrorHandler("Tipo de usuario no encontrado", 400));
                }
            } catch (error) {
                console.log(error);

                next(new ErrorHandler("Correo existente", 500));
            }

        } catch (error) {
            next(new ErrorHandler("Error al crear telefono", 500));
        }
    }

    public async UpdateCarrierDriver(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params
        const { values } = req.body;
        let response: any = '';
        try {
            response = await this.userUseCase.updateUser(id, { ...values })
            this.invoke(response, 200, res, 'Se actualizó de manera correcta', next);
        } catch (error) {
            console.log(error);
            
            next(new ErrorHandler("Error al acrualizar", 500));
        }
    }
    public async UpdateWarehouseman(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { values } = req.body;
    
        if (!['WAREHOUSEMAN', 'WAREHOUSE-MANAGER'].includes(values.type)) {
            return next(new ErrorHandler('El tipo de usuario no es válido. Los tipos válidos son: WAREHOUSEMAN, WAREHOUSE-MANAGER', 400));
        }
    
        try {
            const typeUserResult = await this.typeUserUseCase.findTypeUser({ role: [values.type] });
            
            if (!typeUserResult) {
                return next(new ErrorHandler('No se encontró el tipo de usuario especificado.', 404));
            }
    
            const TypeUser_id = typeUserResult._id;
            const updatedUser = await this.userUseCase.updateUser(id, { ...values, type_user: TypeUser_id });
    
            if (!updatedUser) {
                return next(new ErrorHandler('No se pudo actualizar el usuario.', 500));
            }
    
            this.invoke(updatedUser, 200, res, 'Se actualizó de manera correcta', next);
        } catch (error) {
            console.error(error);
            next(new ErrorHandler('Error al actualizar', 500));
        }
    }
    






    public async getAddresses(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        try {
            const response = await this.addressUseCase.getAddressesByUser(user.id || "");
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log(error);
            // console.log(user.id);                
            next(new ErrorHandler("Hubo un error padrino", 500));
        }
    }

    public async createAddress(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        const { address } = req.body;
        if (!address) return next(new ErrorHandler("La dirección es requerida", 400));

        try {
            let response = await this.addressUseCase.createAddress(user.id || "", address);
            if (response) {
                const newresponse = await this.addressUseCase.getAddressesByUser(user.id || "");
                this.invoke(newresponse, 200, res, 'la direccion fue creada', next);
            } else {
                next(new ErrorHandler("Hubo un error al crear la dirección", 500));
            }
        } catch (error) {
            console.log(error);

            next(new ErrorHandler("Hubo un error al crear la dirección", 500));
        }
    }

    public async updateAddress(req: Request, res: Response, next: NextFunction) {
        const user = req.user;
        const { id } = req.params;
        const { address } = req.body;
        if (!address) return next(new ErrorHandler("La dirección es requerida", 400));
        try {
            let response = await this.addressUseCase.updateAddress(id, address);
            if (response) {
                const newresponse = await this.addressUseCase.getAddressesByUser(user.id || "");
                this.invoke(newresponse, 200, res, 'la direccion fue actualizada', next);
            } else {
                next(new ErrorHandler("Hubo un error al actualizar la dirección", 500));
            }

        } catch (error) {
            next(new ErrorHandler("Hubo un error al actualizar", 500));
        }
    }

    public async deleteAddress(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const user = req.user;
        try {
            let response = await this.addressUseCase.deleteAddress(id);
            if (response) {
                const newresponse = await this.addressUseCase.getAddressesByUser(user.id || "");
                this.invoke(newresponse, 200, res, 'la direccion fue eliminada', next);
            } else {
                next(new ErrorHandler("Hubo un error al eliminar la dirección", 500));
            }
        } catch (error) {
            next(new ErrorHandler("Hubo un error al eliminar la dirección", 500));
        }
    }
    public async deleteCarrierDriver(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const response = await this.userUseCase.updateUser(id, { status: false })
            this.invoke(response, 200, res, 'Se elimino correctamente', next);
        } catch (error) {
            next(new ErrorHandler("Hubo un error al eliminar", 500));
        }
    }






}