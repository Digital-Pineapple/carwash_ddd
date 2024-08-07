import { Router } from 'express';
import { StockBranchRepository } from '../../repository/stockBranch/StockBranchRepository';
import { StockInputRepository } from '../../repository/stockBranch/StockInputRepository';
import { StockOutputRepository } from '../../repository/stockBranch/StockOutputRepository';
import { StockReturnRepository } from '../../repository/stockBranch/StockReturnRepository';

import { StockBranchUseCase } from '../../../application/stockBranch/stockBranchUseCase';
import { StockInputhUseCase } from '../../../application/stockBranch/stockInputUseCase';
import { StockOutputhUseCase } from '../../../application/stockBranch/stockOutputUseCase';
import { StockReturnUseCase } from '../../../application/stockBranch/stockReturnUseCase';


import { StockBranchController } from '../../controllers/stockBranch/StockBranchController';
import StockBranchModel from '../../models/stock/StockBranchModel';
import StockInputModel from '../../models/stock/StockInputModel';
import StockOutputModel from '../../models/stock/StockOutputModel';
import StockReturnModel from '../../models/stock/StockReturnModel';
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';


const stockBranchRouter = Router();
const stockInputRepository  = new StockInputRepository(StockInputModel);
const stockOutputRepository  = new StockOutputRepository(StockOutputModel);
const stockReturnRepository  = new StockReturnRepository(StockReturnModel)

const stockBranchRepository    = new StockBranchRepository(StockBranchModel);
const stockInputUseCase    = new StockInputhUseCase(stockInputRepository)
const stockOutputhUseCase   = new StockOutputhUseCase(stockOutputRepository);
const stockReturnUseCase   = new StockReturnUseCase(stockReturnRepository)
const stockBranchUseCase      = new StockBranchUseCase (stockBranchRepository);

const stockBranchController   = new StockBranchController(stockBranchUseCase,stockInputUseCase,stockOutputhUseCase,stockReturnUseCase );
const userValidations = new UserValidations();

stockBranchRouter

    .get('/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.getAllStockInBranch)
    .post('/', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.createStockBranch)
    .get('/one/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.getOneStockBranchDetail)
    .patch('/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.updateStockBranch)
    .patch('/add/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.addStocInkBranch)
    .patch('/remove/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.removeStocInkBranch)
    .patch('/return/:id', userValidations.authTypeUserValidation(['SUPER-ADMIN']), stockBranchController.returnStocInkBranch)

    

export default stockBranchRouter;

