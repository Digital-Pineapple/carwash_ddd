"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerValue = void 0;
class CustomerValue {
    constructor({ _id, name, email, password, stripe_customer, profile_image }) {
        this._id = _id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.stripe_customer = stripe_customer !== null && stripe_customer !== void 0 ? stripe_customer : '';
        this.profile_image = profile_image !== null && profile_image !== void 0 ? profile_image : '';
    }
}
exports.CustomerValue = CustomerValue;
