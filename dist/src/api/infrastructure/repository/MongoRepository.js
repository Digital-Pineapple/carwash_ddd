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
exports.MongoRepository = void 0;
class MongoRepository {
    constructor(MODEL) {
        this.MODEL = MODEL;
    }
    findAll(populateConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find({ status: true }).populate(populateConfig);
        });
    }
    findAllAll(populateConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find().populate(populateConfig);
        });
    }
    findById(_id, populateConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.findById(_id);
        });
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find({ name });
        });
    }
    findByCustomer(customer_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find({ customer_id: customer_id, status: true });
        });
    }
    findByids(_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find({ _id });
        });
    }
    findByCustomerAndName(customer_id, name, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.find({ customer_id: customer_id, name: name, status });
        });
    }
    updateOne(_id, updated) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.findByIdAndUpdate(_id, updated, { new: true });
        });
    }
    createOne(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const newObject = new this.MODEL(body);
            yield newObject.save();
            return newObject;
        });
    }
    findOneItem(query, populateConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.MODEL.findOne(Object.assign(Object.assign({}, query), { status: true })).populate(populateConfig);
        });
    }
    search(search) {
        return __awaiter(this, void 0, void 0, function* () {
            const noSpecialCharacters = search.replace(/[`~!@#$%^&*()_|+\-=?;:'"<>\{\}\[\]\\\/]/gi, "");
            return yield this.MODEL.find({
                status: true,
                $or: [
                    {
                        name: { $regex: ".*" + noSpecialCharacters + ".*", $options: "i" },
                    },
                ],
            });
        });
    }
    ;
}
exports.MongoRepository = MongoRepository;
