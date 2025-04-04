import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';
import { ResponseData } from '../../../../shared/infrastructure/validation/ResponseData';
import { SizeGuideUseCase } from '../../../application/sizeGuide/SizeGuideUseCase';


export class SizeGuideController extends ResponseData {
    protected path = '/sizeGuides';

    constructor(
        private sizeGuideUseCase: SizeGuideUseCase,
       
    ) {
        super();
        this.getMySizeGuides = this.getMySizeGuides.bind(this);
        this.getSizeGuides = this.getSizeGuides.bind(this);
        this.getOneGuide = this.getOneGuide.bind(this);
        this.createOneGuide = this.createOneGuide.bind(this);
        this.updateOneGuide = this.updateOneGuide.bind(this);
        this.deleteOneGuide = this.deleteOneGuide.bind(this);
        
    }

    public async getMySizeGuides(req: Request, res: Response, next: NextFunction) {
        const { id } = req.user;
        try {
            if (!id) {
                return next(new ErrorHandler('No tiene los permisos necesarios', 403));
            }
            const response = await this.sizeGuideUseCase.getAllMyGuides(id);
            return this.invoke(response, 200, res, '', next);
        } catch (error) {
            return next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getSizeGuides(req: Request, res: Response, next: NextFunction) {
        const { id } = req.user;
        try {
            if (!id) {
                return next(new ErrorHandler('No tiene los permisos necesarios', 403));
            }
            const response = await this.sizeGuideUseCase.getAllGuides()
            return this.invoke(response, 200, res, '', next);
        } catch (error) {
            return next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }
    public async getOneGuide(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
    
        try {
            const response = await this.sizeGuideUseCase.getOneGuide(id);
            return this.invoke(response, 200, res, '', next);
        } catch (error) {
            return next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }
    public async createOneGuide(req: Request, res: Response, next: NextFunction) {
        const { id } = req.user;
        const { values } = req.body;
    
        // Validación para dimensions
        if (values.dimensions && Array.isArray(values.dimensions) && values.dimensions.length === 0) {
            return next(new ErrorHandler('Las dimensiones no pueden estar vacías', 400));
        }
    
        // Crear objeto sizeGuide
        const sizeGuide = {
            name: values.name,
            dimensions: values.dimensions,
            user_id: id,
            unit: 'cm',
            typePackage: values.typePackage || null, // Usar el operador de cortocircuito
            type: values.type,
        };
    
        try {
            // Llamar al caso de uso para crear la guía
            const response = await this.sizeGuideUseCase.createOneGuide({ ...sizeGuide });
    
            // Devolver respuesta exitosa
            return this.invoke(response, 200, res, 'Guía creada con éxito', next);
        } catch (error) {
    
            return next(new ErrorHandler(`Hubo un error al crear la guía`, 500));
        }
    }
    

    public async updateOneGuide(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params
        const { values } = req.body
        if (values.dimensions && Array.isArray(values.dimensions && values.dimensions.length <= 0 )) {
            return next(new ErrorHandler('Datos incompletos ', 500));
        }  
        try {
            const response = await this.sizeGuideUseCase.updateOneGuide(id, {...values})
            return this.invoke(response, 200, res, 'Editado correctamente', next);
        } catch (error) {
            return next(new ErrorHandler('Hubo un error ', 500));
        }
    }
    public async deleteOneGuide(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params

        try {
            const response = await this.sizeGuideUseCase.deleteOneGuide(id)
            return this.invoke(response, 200, res, 'Se eliminó correctamente', next);
        } catch (error) {
            return next(new ErrorHandler('Hubo un error ', 500));
        }
    }
  
    




}
