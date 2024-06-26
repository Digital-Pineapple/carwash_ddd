"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CustomerUseCase_1 = require("../../../application/customer/CustomerUseCase");
const CustomerController_1 = require("../../controllers/customer/CustomerController");
const CustomerRepository_1 = require("../../repository/customer/CustomerRepository");
const S3Service_1 = require("../../../../shared/infrastructure/aws/S3Service");
const AuthValidatons_1 = require("../../../../shared/infrastructure/validation/Auth/AuthValidatons");
const UserModel_1 = __importDefault(require("../../models/UserModel"));
const customerRouter = (0, express_1.Router)();
const customerRepository = new CustomerRepository_1.CustomerRepository(UserModel_1.default);
const customerUserCase = new CustomerUseCase_1.CustomerUseCase(customerRepository);
const s3Service = new S3Service_1.S3Service();
const customerValidations = new AuthValidatons_1.AuthValidations();
const customerController = new CustomerController_1.CustomerController(customerUserCase, s3Service);
customerRouter
    .get('/', customerController.getAllCustomers)
    .get('/:id', customerController.getCustomerDetail)
    .post('/', customerController.createCustomer)
    .post('/update/:id', customerValidations.profilePhotoValidation, customerController.updateCustomer)
    .post('/validate/:id', customerController.validateCustomer);
// .delete('/:id', customerController.deleteCustomer)
exports.default = customerRouter;
