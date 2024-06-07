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
exports.AuthRepository = void 0;
const MongoRepository_1 = require("../MongoRepository");
class AuthRepository extends MongoRepository_1.MongoRepository {
    constructor(UserModel) {
        super(UserModel);
        this.UserModel = UserModel;
    }
    verifyCode(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.UserModel.findByIdAndUpdate(_id, { 'phone.verified': true }, { new: true });
        });
    }
    validatePhoneNumber(phone, customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.UserModel.findOne({ 'phone.phone_number': phone, _id: { $ne: customer_id } });
        });
    }
    verifyCodeRegister(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.UserModel.findByIdAndUpdate(_id, { 'phone.verified': true }, { new: true });
        });
    }
    findUser(query, populateConfig1, populateConfig2, populateConfig3) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.findOne(Object.assign({}, query)).populate(populateConfig1).populate(populateConfig2).populate(populateConfig3);
        });
    }
    verifyUserCode(email, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCode = parseInt(code);
            return yield this.MODEL.findOne({ email: email, 'verify_code.code': newCode });
        });
    }
}
exports.AuthRepository = AuthRepository;
