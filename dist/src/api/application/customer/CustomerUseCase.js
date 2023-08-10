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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerUseCase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const ErrorHandler_1 = require("../../../shared/domain/ErrorHandler");
class CustomerUseCase {
    constructor(customerRepository) {
        this.customerRepository = customerRepository;
    }
    getCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.findAll();
        });
    }
    getDetailCustomer(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.findById(_id);
        });
    }
    getCustomersByType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.findOneItem({ type });
        });
    }
    createNewCustomer(fullname, email, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield this.customerRepository.findOneItem({ email });
            if (customer)
                return new ErrorHandler_1.ErrorHandler('El usuario ya ha sido registrado', 400);
            const salt = bcrypt_1.default.genSaltSync();
            const password = bcrypt_1.default.hashSync(pass, salt);
            return yield this.customerRepository.createOne({ fullname, email, password });
        });
    }
    updateOneCustomer(_id, updated) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.updateOne(_id, updated);
        });
    }
    becomeAPartner(customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield this.customerRepository.findById(customer_id);
            if (!customer)
                return new ErrorHandler_1.ErrorHandler('El usuario no es correcto', 400);
            return yield this.customerRepository.updateOne(customer_id, { type: '1' });
        });
    }
    validateOneCustomer(_id, accountVerify) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.customerRepository.updateOne(_id, { accountVerify });
        });
    }
}
exports.CustomerUseCase = CustomerUseCase;
