import { Router } from 'express';
import MembershipBenefitsModel from '../../models/Memberships/MembershipBenefitsModel';
import MembershipHistoryModel from '../../models/Memberships/MembershipHistoryModel'
import { MembershipBenefitsRepository } from '../../repository/membership/MembershipBenefitRepository';
import { MembershipHistoryRepository } from '../../repository/membership/MembershipHistoryRepository';
import { MembershipBenefitsUseCase } from '../../../application/membership/membershipBenefitsUseCase';
import { MembershipHistoryUseCase } from '../../../application/membership/membershipHistoryUseCase';
import { MembershipBenefitsController } from '../../controllers/memberships/membershipBenefitsController'
import { UserValidations } from '../../../../shared/infrastructure/validation/User/UserValidation';


const membershipBenefitRouter = Router();

const membershipBenefitsRespository = new MembershipBenefitsRepository(MembershipBenefitsModel)
const membershipHistoryRepository = new MembershipHistoryRepository(MembershipHistoryModel)
const membershipBenefitsUseCase = new MembershipBenefitsUseCase(membershipBenefitsRespository)
const membershipHistoryUseCase = new MembershipHistoryUseCase(membershipHistoryRepository)
const membershipBenefitsController = new MembershipBenefitsController(membershipBenefitsUseCase,membershipHistoryUseCase)
const userValidations = new UserValidations();



membershipBenefitRouter
    .get('/', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc53']), membershipBenefitsController.getAllMembershipsBenefits)
    .get('/history', membershipBenefitsController.getHistory)
    .get('/:id', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc53']), membershipBenefitsController.getMembershipHistory)
    .get('/user/:id', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc59','65a8193ae6f31eef3013bc57' ]), membershipBenefitsController.getAllMembershipsBenefitsByUser)
    .post('/Qr/Validate/:id', membershipBenefitsController.QrVerify)
    .post('/', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc53']), membershipBenefitsController.createMembershipBenefit)
    .post('/sales-day', membershipBenefitsController.MembershipSales)
    // .patch('/:id', membershipBenefitsController.updateMembershipBenefit)
    .post('/consumeBenefit/:id', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc57']), membershipBenefitsController.consumeBenefit)
    .delete('/:id', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc53']), membershipBenefitsController.deleteMembershipBenefit)
    .delete('/useUp/:id', userValidations.authTypeUserValidation(['65a8193ae6f31eef3013bc59']), membershipBenefitsController.getUpOneBenefit)

    

export default membershipBenefitRouter;