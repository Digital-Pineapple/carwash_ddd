"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const ErrorHandler_1 = require("../../../../shared/domain/ErrorHandler");
const ResponseData_1 = require("../../../../shared/infrastructure/validation/ResponseData");
class CustomerController extends ResponseData_1.ResponseData {
    constructor(customerUseCase, s3Service) {
        super();
        this.customerUseCase = customerUseCase;
        this.s3Service = s3Service;
        this.path = '/customers';
        this.getAllCustomers = this.getAllCustomers.bind(this);
        this.createCustomer = this.createCustomer.bind(this);
        this.getCustomerDetail = this.getCustomerDetail.bind(this);
        this.updateCustomer = this.updateCustomer.bind(this);
        this.deleteCustomer = this.deleteCustomer.bind(this);
    }
    getAllCustomers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customers = yield this.customerUseCase.getCustomers();
                yield Promise.all(customers === null || customers === void 0 ? void 0 : customers.map((customer) => __awaiter(this, void 0, void 0, function* () {
                    const ine = yield this.s3Service.getUrlObject(customer.ine + ".pdf");
                    customer.ine = ine;
                    const curp = yield this.s3Service.getUrlObject(customer.curp + ".pdf");
                    customer.curp = curp;
                    const criminal_record = yield this.s3Service.getUrlObject(customer.criminal_record + ".pdf");
                    customer.criminal_record = criminal_record;
                    const prook_address = yield this.s3Service.getUrlObject(customer.prook_address + ".pdf");
                    customer.prook_address = prook_address;
                    customer.profile_image = yield this.s3Service.getUrlObject(customer.profile_image);
                })));
                this.invoke(customers, 200, res, '', next);
            }
            catch (error) {
                console.log(error);
                next(new ErrorHandler_1.ErrorHandler('Hubo un error al consultar los usuarios', 500));
            }
        });
    }
    getCustomerDetail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const customer = yield this.customerUseCase.getDetailCustomer(id);
                customer.ine = yield this.s3Service.getUrlObject((customer === null || customer === void 0 ? void 0 : customer.ine) + ".pdf");
                customer.curp = yield this.s3Service.getUrlObject((customer === null || customer === void 0 ? void 0 : customer.curp) + ".pdf");
                customer.criminal_record = yield this.s3Service.getUrlObject((customer === null || customer === void 0 ? void 0 : customer.criminal_record) + ".pdf");
                customer.prook_address = yield this.s3Service.getUrlObject((customer === null || customer === void 0 ? void 0 : customer.prook_address) + ".pdf");
                this.invoke(customer, 200, res, '', next);
            }
            catch (error) {
                next(new ErrorHandler_1.ErrorHandler('Error al encontrar el usuario', 404));
            }
        });
    }
    createCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fullname, email, password } = req.body;
            try {
                const customer = yield this.customerUseCase.createNewCustomer(fullname, email, password);
                this.invoke(customer, 201, res, 'El usuario se creo con exito', next);
            }
            catch (error) {
                next(new ErrorHandler_1.ErrorHandler('Hubo un error al crear el usuario', 500));
            }
        });
    }
    updateCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { fullname } = req.body;
            try {
                const customer = yield this.customerUseCase.updateOneCustomer(id, { fullname });
                this.invoke(customer, 200, res, 'El usuario se actualizo con exito', next);
            }
            catch (error) {
                console.log(error);
                next(new ErrorHandler_1.ErrorHandler('Hubo un error al actualizar el usuario', 500));
            }
        });
    }
    deleteCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const customer = yield this.customerUseCase.updateOneCustomer(id, { status: false });
                this.invoke(customer, 200, res, 'El usuario ha sido eliminado', next);
            }
            catch (error) {
                console.log(error);
                next(new ErrorHandler_1.ErrorHandler('Hubo un error al eliminar el usuario', 500));
            }
        });
    }
    convertUserToPartner(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req;
            try {
                const customer = yield this.customerUseCase.becomeAPartner(user._id);
                this.invoke(customer, 200, res, 'Felicidades ahora formas parte de nuestra familia', next);
            }
            catch (error) {
                console.log(error);
                next(new ErrorHandler_1.ErrorHandler('Hubo un error al eliminar el usuario', 500));
            }
        });
    }
}
exports.CustomerController = CustomerController;
