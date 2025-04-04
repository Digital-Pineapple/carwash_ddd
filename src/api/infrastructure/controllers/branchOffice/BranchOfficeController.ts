import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';
import { ResponseData } from '../../../../shared/infrastructure/validation/ResponseData';
import { BranchOfficeUseCase } from '../../../application/branchOffice/BranchOfficeUseCase';
import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { BranchOfficeResponse, ILocation } from '../../../domain/branch_office/BranchOfficeEntity';
import { DocumentationUseCase } from '../../../application/documentation/DocumentationUseCase';
import mongoose from 'mongoose';
import { ProductOrderUseCase } from '../../../application/product/productOrderUseCase';
import { retrieveAWSFiles } from '../../../../helpers/retrieveImages';


export class BranchOfficeController extends ResponseData {
    protected path = '/branch_office';

    constructor(private branchOfficeUseCase: BranchOfficeUseCase,
        private documentationUseCase: DocumentationUseCase,
        private productOrderUseCase : ProductOrderUseCase,
        private s3Service: S3Service
    ) {
        super();
        this.getAllBranchOffices = this.getAllBranchOffices.bind(this);
        this.getBranchOfficesInfo = this.getBranchOfficesInfo.bind(this);
        this.getBranchOfficeDetail = this.getBranchOfficeDetail.bind(this);
        this.getBranchesByUser = this.getBranchesByUser.bind(this);
        this.createBranchOffice = this.createBranchOffice.bind(this);
        this.updateBranchOffice = this.updateBranchOffice.bind(this);
        this.deleteBranchOffice = this.deleteBranchOffice.bind(this);
        this.verifyBranchOffice = this.verifyBranchOffice.bind(this);
        this.desactivateBranchOffice = this.desactivateBranchOffice.bind(this);
        this.deleteImage = this.deleteImage.bind(this);
        this.getCloserBranches = this.getCloserBranches.bind(this);
    }

    public async getAllBranchOffices(req: Request, res: Response, next: NextFunction) {
        try {
            const response: any | null = await this.branchOfficeUseCase.getAllBranchOffices()
            response.map(( item: any ) => {
                const images = item.images
                item.images = retrieveAWSFiles(images);                
            });           
            this.invoke(response, 200, res, "", next);
        }catch (error) {
            console.log("error get branches", error);            
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getCichmexBranches(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await this.branchOfficeUseCase;
            this.invoke(response, 200, res, "", next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getBranchOfficesInfo(req: Request, res: Response, next: NextFunction) {
        try {
            // Obtener la información de las sucursales
            const response = await this.branchOfficeUseCase.getInfoBranchOffices();                      
            this.invoke(response, 200, res, "", next);            
        } catch (error) {

        }
    }

    public async getBranchOfficeDetail(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const response: any| null = await this.branchOfficeUseCase.getDetailBranchOffice(id);
            response.images = retrieveAWSFiles(response.images);           
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            console.log(error);            
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getBranchesByUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const response: any | null = await this.branchOfficeUseCase.getBranchesUser(id)
            response.images = retrieveAWSFiles(response.images);
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }   

    public async createBranchOffice(req: Request, res: Response, next: NextFunction) {
        const { name, description, phone_number, location, schedules, type, tag } = req.body; 
        const user = req.user                   
        try {
            // Parse JSON strings
            const user_id = user.id
            const location1 = JSON.parse(location);

            const parseSchedules = JSON.parse(schedules);
            let images: {}[] = [];
            let imageUrls: {}[] = [];

            if (req.files) {
                // Cast req.files to a more specific type if you know what kind of files are being handled
                const files = req.files as Express.Multer.File[];
    
                // Upload files to S3 and collect URLs
                await Promise.all(files.map(async (file, index) => {
                    const pathObject = `${this.path}/${user_id}/${Date.now()}`;
                    const { url, success, key } = await this.s3Service.uploadToS3AndGetUrl(
                        `${pathObject}`,
                        file,
                        'image/jpeg'
                    );
    
                    if (!success) {
                        throw new ErrorHandler('Hubo un error al subir la imagen', 400);
                    }
                    images.push({ url: pathObject});
                    imageUrls.push({ url: pathObject});                    
                }));
            }
    
            // Create branch office entry
            const response : any = await this.branchOfficeUseCase.createBranchOffice(
                {  
                    user_id, 
                    name, 
                    description, 
                    phone_number,
                    location, 
                    schedules: parseSchedules, 
                    type,                             
                    images, 
                    status: true,
                    tag: tag ?? null                                  
                }, 
                {...location1, geoLocation: {
                    coordinates: [location1.lgt, location1.lat]                    
                }}
            );
    
            if (response instanceof ErrorHandler) {
                return next(response);
            }
    
            // Update response with image URLs
            // response.images = imageUrls;
    
            // Send success response
            this.invoke( response, 201, res, "Registro exitoso", next);
        } catch (error) {
            console.error(error);
            next(new ErrorHandler((error as Error).message || 'Hubo un error al crear', 500));
        }
    }

    public async deleteImage(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { image_id } = req.body;
        // console.log(id, "id de sucursal");       
        // console.log("body", req.body);                                     
        try{
            const branchOffice: any | null = await this.branchOfficeUseCase.getDetailBranchOffice(id);
            const filteredImages = branchOffice?.images?.filter((image:any) => image._id.toString() !== image_id);                  
            const branchUpdated = await this.branchOfficeUseCase.updateBranchOffice(branchOffice?._id, {
                images : filteredImages,
                location: branchOffice.location
            }) 
            this.invoke( branchUpdated , 201, res, "Imagen eliminada", next);            
        }catch(error){
            console.log(error);            
            next(new ErrorHandler((error as Error).message || 'Hubo un error al eliminar la imagen', 500));
        }
    } 
    

    public async addServices(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params
        const { services } = req.body;
        try {
            const response = await this.branchOfficeUseCase
            this.invoke( response, 201, res, "Se registró con éxito", next);
        } catch (error) {              
            next(new ErrorHandler('Hubo un error al crear', 500));
        }

    }

    public async updateBranchOffice(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { description, phone_number, location, name, schedules, type } = req.body;
        const parsedSchedules = JSON.parse(schedules);
        const user = req.user;
        try {                       
            const user_id = user.id
            const parsedLocation = JSON.parse(location)
            // Verificar si existen archivos adjuntos
            if (req.files && Array.isArray(req.files)) {
                const paths: {}[] = [];
                const urls: {}[] = [];
                const currentBranch: any = await this.branchOfficeUseCase.getDetailBranchOffice(id);
                currentBranch.images.map((image : any) => paths.push({url: image.url}))

                // Subir archivos a S3 y obtener las URLs
                await Promise.all(req.files.map(async (file: any, index: number) => {
                    const pathObject: string = `${this.path}/${user_id}/${Date.now()}`;
                    const { url, success, key } = await this.s3Service.uploadToS3AndGetUrl(
                        pathObject,
                        file,
                        "image/jpeg"
                    );

                    if (!success) {
                        throw new ErrorHandler("Hubo un error al subir la imagen", 400);
                    }

                    paths.push({ url: pathObject});
                    urls.push({ url: pathObject});
                }));                                               
                // Actualizar la sucursal de la oficina con las URLs de las imágenes
                const response : any = await this.branchOfficeUseCase.updateBranchOffice(id, {
                    name: name,
                    type: type,
                    description: description,
                    phone_number: phone_number,
                    schedules: parsedSchedules,                  
                    location: {...parsedLocation, geoLocation: {
                        coordinates: [parsedLocation.lgt, parsedLocation.lat]                    
                    }}, 
                    images: paths, // Se usan las rutas de los archivos en S3
                });

                // Asignar las URLs de las imágenes a la respuesta
                if (!(response instanceof ErrorHandler && response !== null)) {
                    response.images = urls;
                }

                // Enviar la respuesta al cliente
                this.invoke(response, 201, res, "El usuario se actualizó con éxito", next);
            } else {
                // Si no hay archivos adjuntos, simplemente actualizar la sucursal de la oficina
                const response = await this.branchOfficeUseCase.updateBranchOffice(id, {
                    name: name,
                    type: type,
                    description: description,  
                    phone_number: phone_number,                  
                    schedules: parsedSchedules,
                    location: {...parsedLocation, geoLocation: {
                        coordinates: [parsedLocation.lgt, parsedLocation.lat]                    
                    }},
                });

                // Enviar la respuesta al cliente
                this.invoke(response, 201, res, "Se actualizó con éxito", next);
            }
        } catch (error) {
            console.log("error updated is: " +error);            
            // Manejar cualquier error que ocurra durante el proceso
            this.invoke(error, 500, res, "Error interno del servidor", next);
        }
    }


    public async deleteBranchOffice(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        
        try {
            const noProductOrders = await this.productOrderUseCase.ProductOrdersByBranch(id);
            
            if (noProductOrders!== null ) {
                try {
                    const response = await this.branchOfficeUseCase.deleteOneBranchOffice(id);
                    this.invoke(response, 201, res, 'Se eliminó con éxito', next);
                } catch (error) {
                    next(new ErrorHandler('Hubo un error al eliminar la sucursal', 500));
                }
            } else {
                next(new ErrorHandler('No se puede eliminar la sucursal porque tiene pedidos asociados', 400));
            }
        } catch (error) {
            next(new ErrorHandler('Hubo un error al verificar los pedidos de la sucursal', 500));
        }
    }
    


    public async verifyBranchOffice(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { user_id } = req.body
        try {          
           const response = await this.branchOfficeUseCase.validateBranchOffice(id, { activated: true })
           this.invoke(response, 201, res, 'Activación exitosa', next);          
        } catch (error) {        
            next(new ErrorHandler('Error', 500));
        }
    }

    public async desactivateBranchOffice(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const response = await this.branchOfficeUseCase.validateBranchOffice(id, { activated: false });
            this.invoke(response, 200, res, 'Desactivación exitosa', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al desactivar la sucursal', 500));
        }
    }

    public async getCloserBranches(req: Request, res: Response, next: NextFunction) {
        const { coords } = req.body;
        try{
            const response = await this.branchOfficeUseCase.getCloserBranches(coords);
            this.invoke(response, 200, res, 'ok', next);            
        }catch(error){
            console.log(error);            
            next(new ErrorHandler('Erro al obtener las sucursales cercanas', 500));
        }
    }




}

