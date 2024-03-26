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

const paymentRouter = Router();

const paymentRepository = new PaymentRepository(PaymentModel);
const membershipRepository = new MembershipRepository(MembershipModel)
const membershipHistoryRepository = new MembershipHistoryRepository(MembershipHistoryModel)
const membershipHistoryUseCase = new MembershipHistoryUseCase(membershipHistoryRepository)
const membershipBenefitsRespository = new MembershipBenefitsRepository(MembershipBenefitsModel)
const membershipBenefitsUseCase= new MembershipBenefitsUseCase(membershipBenefitsRespository)
const membershipUseCase = new MembershipUseCase(membershipRepository)

const paymentUseCase = new PaymentUseCase(paymentRepository);
const mpService = new MPService()
const paymentController = new PaymentController(paymentUseCase, mpService, membershipBenefitsUseCase, membershipUseCase, membershipHistoryUseCase);
const paymentValidation = new PaymentValidations();

paymentRouter
    .get('/', paymentController.getAllPayments)
    .get('/:id', paymentController.getPayment)
    .post('/',paymentValidation.paymentValidation, paymentController.createLMP)
    .post('/success',paymentController.createTicket )
    
    // .post('/ticket', paymentController)
    .delete('/:id', paymentController.deletePayment)


export default paymentRouter;