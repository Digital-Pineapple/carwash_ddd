import { Router } from 'express';
import { DynamicRouteRepository } from '../../repository/dynamicRoute/DynamicRouteRepository';
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';
import { DynamicRouteUseCase } from '../../../application/dynamicRoutes/DynamicRouteUseCase';
import { DynamicRouteController } from '../../controllers/dynamicRoute/DynamicRouteController';
import DynamicRoutesModel from '../../models/dynamicRoute/DynamicRoute';

const dynamicRouteRouter = Router();

const dynamicRouteRepository = new DynamicRouteRepository(DynamicRoutesModel);
const dynamicRouteUseCase = new DynamicRouteUseCase(dynamicRouteRepository);
const dynamicRouteController = new DynamicRouteController(dynamicRouteUseCase);
const userValidations = new UserValidations();

dynamicRouteRouter
    .get('/', userValidations.authTypeUserValidation(['SUPER-ADMIN']), dynamicRouteController.getAllRoutes)
    .get('/links', userValidations.authTypeUserValidation(['SUPER-ADMIN']), dynamicRouteController.getRoutes)
    .get('/public-links', dynamicRouteController.getPublicRoutes)
    .post('/', userValidations.authTypeUserValidation(['SUPER-ADMIN']), dynamicRouteController.CreateRoute)
    .put('/update/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), dynamicRouteController.UpdateRoute)
    .delete('/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), dynamicRouteController.DeleteRoute)
export default dynamicRouteRouter;