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
exports.Authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generate_password_1 = __importDefault(require("generate-password"));
const google_auth_library_1 = require("google-auth-library");
class Authentication {
    constructor() {
        this.googleKey = process.env.GOOGLE_CLIENT_ID;
        this.client = new google_auth_library_1.OAuth2Client(this.googleKey);
    }
    generateJWT(user, uuid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const payload = { uuid };
                jsonwebtoken_1.default.sign(payload, process.env.SECRET_JWT_KEY || '', {
                    expiresIn: '24h',
                }, (error, token) => {
                    if (error)
                        return reject('Error to generate JWT');
                    resolve({ token, user });
                });
            });
        });
    }
    generateJWTRP(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const payload = { data };
                jsonwebtoken_1.default.sign(payload, process.env.SECRET_JWT_KEY || '', {
                    expiresIn: '24h',
                }, (error, token) => {
                    if (error)
                        return reject('Error to generate JWT');
                    resolve({ token });
                });
            });
        });
    }
    validateGoogleToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const ticket = yield this.client.verifyIdToken({
                    idToken: token,
                    audience: this.googleKey,
                });
                if (!ticket)
                    reject('El token de google no es valido');
                const payload = ticket.getPayload();
                resolve({ fullname: payload === null || payload === void 0 ? void 0 : payload.name, email: payload === null || payload === void 0 ? void 0 : payload.email, picture: payload === null || payload === void 0 ? void 0 : payload.picture });
            }));
        });
    }
    encryptPassword(password) {
        const salt = bcrypt_1.default.genSaltSync();
        return bcrypt_1.default.hashSync(password, salt);
    }
    decryptPassword(password, encryptedPassword) {
        return bcrypt_1.default.compareSync(password, encryptedPassword);
    }
    generateRandomPassword() {
        return generate_password_1.default.generate({
            length: 16,
            numbers: true,
            symbols: true,
            strict: true,
        });
    }
    validateToken() {
        return generate_password_1.default.generate({
            length: 16,
            numbers: true,
            symbols: true,
            strict: true,
        });
    }
}
exports.Authentication = Authentication;
