"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = __importDefault(require("multer"));
exports.multerConfig = {
    storage: multer_1.default.diskStorage({
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    }),
    fileFilter: (req, file, cb) => {
        cb(null, true);
    },
    // Aumentar el límite de tamaño de archivo a 50 MB
    // limits: {
    //     fileSize: 50 * 1024 * 1024, // 50 MB
    // },
};
