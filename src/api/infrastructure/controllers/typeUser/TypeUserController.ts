import { Request, Response, NextFunction, response } from 'express';

import { ResponseData } from "../../../../shared/infrastructure/validation/ResponseData";

import { ErrorHandler } from '../../../../shared/domain/ErrorHandler';
import { TypeUserUseCase } from '../../../application/typeUser/TypeUserUseCase';
import typeUser from '../../../../seeders/TypeUsers'
import { generate } from 'generate-password';
import { generateUUID } from '../../../../shared/infrastructure/validation/Utils';

export class TypeUserController extends ResponseData {
    protected path = '/type-user'

    constructor(private typeUserUseCase: TypeUserUseCase) {
        super();
        this.getAllTypeUser = this.getAllTypeUser.bind(this);
        this.getTypeUser     = this.getTypeUser.bind(this);
        this.createTypeUser  = this.createTypeUser.bind(this);
        this.updateTypeUser  = this.updateTypeUser.bind(this);
        this.deleteTypeUser  = this.deleteTypeUser.bind(this);
        this.TypeUserSeed = this.TypeUserSeed.bind(this);
    }

    public async getAllTypeUser(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await this.typeUserUseCase.getTypeUsers();
            this.invoke(response, 200, res, '', next);
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async getTypeUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
           const response = await this.typeUserUseCase.getTypeUser(id);
           this.invoke(response,200,res,"", next)
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }

    public async createTypeUser(req: Request, res: Response, next: NextFunction) {
        const { system, roles } = req.body;
        const uuid =  generateUUID()
        try {
            const response = await this.typeUserUseCase.createNewTypeUser({system:system, role:roles}, uuid)
            this.invoke(response, 200, res, '', next)
        } catch (error) {
            next(new ErrorHandler('Hubo un error al dar de alta', 500));
        }
    }

    public async updateTypeUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const { name } = req.body;
        try{
        
            const response = await this.typeUserUseCase.updateTypeUser(id,{name:name})
            this.invoke(response, 201, res, 'Se actualizó con éxito', next);
            
        } catch (error) {
            next(new ErrorHandler('Hubo un error al editar la información', 500));
        }
    }

    public async deleteTypeUser(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const response = await this.typeUserUseCase.deleteTypeUser(id)
            this.invoke(response, 200, res, '', next)
        } catch (error) {
            next(new ErrorHandler('Hubo un error al consultar la información', 500));
        }
    }
    public async TypeUserSeed(req: Request, res: Response, next: NextFunction) {
        
        try {

          const historyPromises = typeUser.map(async item =>{
              const uuid =  generateUUID()
              await this.typeUserUseCase.createNewTypeUser( {...item}, uuid)
          }
          );
          const todos = await Promise.all(historyPromises);
          
          this.invoke(todos, 201, res, "Alta con éxito", next);
          
        } catch (error) {
           
            
          // Ajusta el código de estado y mensaje de error según tus necesidades.
          next(new ErrorHandler('Hubo un error al crear tipos de usuario', 500));
        }
      }

}