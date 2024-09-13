import { Router } from 'express';
import { PaymentRepository } from '../../repository/payments/PaymentRespository';

import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';
import PaymentModel from '../../models/payments/PaymentModel';
import { PaymentUseCase } from '../../../application/payment/paymentUseCase';
import { PaymentController } from '../../controllers/paymentsController/paymentController';
import { MPService } from '../../../../shared/infrastructure/mercadopago/MPService';
import { PaymentValidations } from '../../../../shared/infrastructure/validation/Payment/PaymentValidation';
import { MembershipBenefitsUseCase } from '../../../application/membership/membershipBenefitsUseCase';
import { MembershipBenefitsRepository } from '../../repository/membership/MembershipBenefitRepository';
import MembershipBenefitsModel from '../../models/Memberships/MembershipBenefitsModel';
import { MembershipHistoryRepository } from '../../repository/membership/MembershipHistoryRepository';
import { MembershipHistoryUseCase } from '../../../application/membership/membershipHistoryUseCase';
import MembershipHistoryModel from '../../models/Memberships/MembershipHistoryModel';
import { MembershipRepository } from '../../repository/membership/MembershipRepository';
import MembershipModel from '../../models/Memberships/MembershipModel';
import { MembershipUseCase } from '../../../application/membership/membershipUseCase';
import { ProductOrderRepository } from '../../repository/product/ProductOrderRepository';
import ProductOrderModel from '../../models/products/ProductOrderModel';
import { ProductOrderUseCase } from '../../../application/product/productOrderUseCase';
import { StockSHOutputRepository } from '../../repository/stockStoreHouse/StockSHOutputRepository';
import StockSHoutputModel from '../../models/stockStoreHouse/StockSHoutputModel';
import { StockSHoutputUseCase } from '../../../application/storehouse/stockSHoutputUseCase';
import StockStoreHouseModel from '../../models/stockStoreHouse/StockStoreHouseModel';
import { StockStoreHouseRepository } from '../../repository/stockStoreHouse/StockStoreHouseRepository';
import { StockStoreHouseUseCase } from '../../../application/storehouse/stockStoreHouseUseCase';
import { S3Service } from '../../../../shared/infrastructure/aws/S3Service';
import { ShoppingCartRepository } from '../../repository/shoppingCart/ShoppingCartRepository';
import ShoppingCartModel from '../../models/ShoppingCartModel';
import { ShoppingCartUseCase } from '../../../application/shoppingCart.ts/ShoppingCartUseCase';

const paymentRouter = Router();

const paymentRepository = new PaymentRepository(PaymentModel);
const productOrderRepository = new ProductOrderRepository(ProductOrderModel)
const membershipRepository = new MembershipRepository(MembershipModel)
const membershipHistoryRepository = new MembershipHistoryRepository(MembershipHistoryModel)
const stockStoreHouseRepository = new StockStoreHouseRepository(StockStoreHouseModel);
const stockSHOutputRepository = new StockSHOutputRepository(StockSHoutputModel)
const shoppingCartRepository = new ShoppingCartRepository(ShoppingCartModel)


const membershipHistoryUseCase = new MembershipHistoryUseCase(membershipHistoryRepository)
const productOrderUseCase = new ProductOrderUseCase(productOrderRepository)

const membershipBenefitsRespository = new MembershipBenefitsRepository(MembershipBenefitsModel)
const membershipBenefitsUseCase = new MembershipBenefitsUseCase(membershipBenefitsRespository)
const membershipUseCase = new MembershipUseCase(membershipRepository)
const stockStoreHouseUseCase = new StockStoreHouseUseCase(stockStoreHouseRepository);
const stockSHoutputUseCase = new StockSHoutputUseCase(stockSHOutputRepository)
const shoppingCartUseCase = new ShoppingCartUseCase(shoppingCartRepository)

const paymentUseCase = new PaymentUseCase(paymentRepository);
const mpService = new MPService()
const s3Service = new S3Service()
const paymentController = new PaymentController(paymentUseCase, productOrderUseCase, mpService, membershipBenefitsUseCase, membershipUseCase, membershipHistoryUseCase, stockStoreHouseUseCase, stockSHoutputUseCase, shoppingCartUseCase, s3Service);
const paymentValidation = new PaymentValidations();
const userValidations = new UserValidations()

paymentRouter
    .get('/', paymentController.getAllPayments)
    .get('/:id', paymentController.getPayment)
    .get("/expired/sales", userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN"]), paymentController.autoCancelPO)
    .post('/addTicket', paymentValidation.ImageValidation, userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN", "CUSTOMER"]), paymentController.addTicket)
    .post('/rejectTicket', paymentValidation.ImageValidation, userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN"]), paymentController.rejectProofOfPayment)
    .post('/', paymentValidation.paymentValidation, paymentController.createLMP)
    .post('/Membership-Pay', paymentController.createPaymentMP)
    .post('/Products-Pay', userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN", "CUSTOMER"]), paymentController.createPaymentProductMP)
    .post('/transfer-payment', userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN", "CUSTOMER"]), paymentController.transferPayment)
    // .post('/Products-PayLocation', paymentController.createPaymentProductMPLocation)
    .post('/success', paymentController.createTicket)
    .post('/Mem-Payment-success', paymentController.PaymentSuccess)
    .post("/validatePaymentProof", userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN"]), paymentController.validateProofOfPayment)
    // .post('/ticket', paymentController)
    .post('/deleteTicket', userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN", "CUSTOMER"]), paymentController.deleteVoucher)
    .put('/updateTicket', paymentValidation.ImageValidation, userValidations.authTypeUserValidation(["SUPER-ADMIN", "ADMIN", "CUSTOMER"]), paymentController.editVoucher)
    .delete('/:id', paymentController.deletePayment)


export default paymentRouter;