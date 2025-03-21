import { config } from '../../../../config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import moment, { ISO_8601 } from 'moment'
import { getProperties } from '../../../helpers/products';
import { RandomCodeId } from '../validation/Utils';
import MetadataModel from '../../../api/infrastructure/models/metadata/MetadataModel';

export class MPService {
    private access_token: string;
    private preference: Preference;
    private payment: Payment;


    constructor() {
        this.access_token = config.MERCADOPAGO_TOKEN;
        const client = new MercadoPagoConfig({ accessToken: this.access_token });
        this.preference = new Preference(client);
        this.payment = new Payment(client);
    }

    async createLinkMP(body: any, origin: any) {
        const { products, redirect_urls, cart, total, subtotal, shipping_cost, address_id, branch_id, user_id, type_delivery, discount, coupon_id } = body;
        const order_id = RandomCodeId('CIC')
        const payload = {            
            total: total, 
            subtotal: subtotal,
            shipping_cost: shipping_cost, 
            address_id: address_id, 
            branch_id: branch_id, 
            user_id: user_id, 
            type_delivery: type_delivery, 
            discount: discount,
            coupon_id: coupon_id,
            origin : origin, 
            order_id: order_id,            
        }                          
        // const metadata =  new MetadataModel({ data: payload })
        // const res = await metadata.save();
        // console.log(res, "respuesta");
        
        // console.log(JSON.stringify(metadata).length, "longitud");    
        const path_notification = process.env.URL_NOTIFICATION;
        const itemsMP = products 
        try {
            const response = await this.preference.create({
                body: {
                    items: itemsMP,                    
                    back_urls: redirect_urls,                    
                    notification_url: `${path_notification}/api/payments/webhook`,
                    metadata: payload,
                    external_reference: order_id
                },
            });

            return { response, success: true, message: 'Pago realizado correctamente' };
        } catch (error) {
            console.log(error, "xdxd");
            // console.log(metadata, "metadata xdxd");            
            throw new Error(error.message);                       
        }
    }

    async reciveWebHook(data: any) {
        const payment = data.query;
        const paymentID = data.query['data.id'];
        let info = '';

        try {
            if (payment.type === 'payment') {
                const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentID}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.access_token}`,
                    },
                });
                if (response.ok) {
                    info = await response.json();
                }

                return info;
            }
        } catch (error) {
            console.error('Error receiving webhook:', error);
        }
    }

    async createPaymentMP(item: any, user: any, uuid: string, membership: any) {
        const path_notification = `${process.env.URL_NOTIFICATION}/api/payments/Mem-Payment-success`;

        try {
            const response = await this.payment.create({
                requestOptions: { idempotencyKey: uuid },
                body: {
                    transaction_amount: item.transaction_amount,
                    payment_method_id: item.payment_method_id,
                    payer: {
                        email: item.payer.email,
                        first_name: user.user_id,
                    },
                    additional_info: {
                        items: [
                            {
                                id: membership._id,
                                title: membership.name,
                                quantity: 1,
                                unit_price: membership.price_standard,
                                description: membership.description,
                            },
                        ],
                    },
                    token: item.token,
                    issuer_id: item.issuer_id,
                    installments: item.installments,
                    notification_url: path_notification,
                },
            });

            return { response, success: true, message: 'Pago realizado correctamente' };
        } catch (error) {
            console.error('Error creating payment:', error);
            return { success: false, message: `Error: ${error}` };
        }
    }

    async createPaymentProductsMP(products: any, user: any, uuid: any, values: any) {
        const path_notification = `${process.env.URL_NOTIFICATION}/api/payments/Mem-Payment-success`;

        try {
            const response = await this.payment.create({
                requestOptions: { idempotencyKey: uuid },
                body: {
                    transaction_amount: values.formData.transaction_amount,
                    payment_method_id: values.formData.payment_method_id,
                    payer: {
                        email: values.formData.payer.email,
                        first_name: user.user_id,
                    },
                    additional_info: {
                        items: products,
                        payer: {
                            first_name: user.user_id,
                        },
                    },
                    token: values.formData.token,
                    issuer_id: values.formData.issuer_id,
                    installments: values.formData.installments,
                    notification_url: path_notification,
                },
            });

            return { response, success: true, message: 'Pago realizado correctamente' };
        } catch (error) {
            console.error('Error creating payment for products:', error);
            return { success: false, message: `Error: ${error}` };
        }
    }

    async createPaymentProductsMP2(products: any, user: any, uuid: any, values: any) {
        const path_notification = `${process.env.URL_NOTIFICATION}/api/payments/Mem-Payment-success`;
        const { formData, selectedPaymentMethod } = values;

        const body: any = {
            transaction_amount: formData.transaction_amount,
            payment_method_id: formData.payment_method_id,
            payer: {
                email: formData.payer.email,
                first_name: formData.payer.first_name,
                last_name: formData.payer.last_name,
            },
            additional_info: {
                items: products,
                payer: {
                    first_name: user.user_id,
                },
            },
            notification_url: path_notification,
        };

        if (selectedPaymentMethod === "ticket") {
            body['metadata'] = { payment_point: formData.metadata.payment_point };
        } else {
            body['token'] = formData.token;
            body['issuer_id'] = formData.issuer_id;
            body['installments'] = formData.installments;
        }

        try {
            const response = await this.payment.create({
                requestOptions: { idempotencyKey: `${uuid}`, timeout: 5000 },
                body,
            });

            return { response, success: true };
        } catch (error) {
            console.error('Error creating payment for products (method 2):', error);
            return { success: false, message: `Error: ${error}` };
        }
    }
}
