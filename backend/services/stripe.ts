const stripe = require('stripe')(process.env.STRIPE_API_KEY);
export default class Stripe {
    name?:string;
    email?: string
    paymentMethod?: string
    customerId?: string
    constructor(data?: any){
        this.name = data?.name
        this.email = data?.email
        this.paymentMethod = data?.paymentMethodId
        this.customerId = data?.customerId
    }
    async createCustomer(){
      console.log({
        name: this.name,
        email: this.email,
        payment_method: this.paymentMethod,
        invoice_settings: {
          default_payment_method: this.paymentMethod,
        },
    })
        const customer = await stripe.customers.create({
            name: this.name,
            email: this.email,
            payment_method: this.paymentMethod,
            invoice_settings: {
              default_payment_method: this.paymentMethod,
            },
        });
        return customer
    }

    async createSubscriptions(priceId: string){
        const subscription = await stripe.subscriptions.create({
            customer: this.customerId,
            items: [{ price: priceId }],
            payment_settings: {
              payment_method_options: {
                card: {
                  request_three_d_secure: 'any',
                },
              },
              payment_method_types: ['card'],
              save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
        });
        return subscription
    }

    async getPrices(productId: string | null = null){
        const prices = await stripe.prices.list({
            expand: ['data.product'],
            product: productId ? productId : process.env.STRIPE_PRODUCT_ID
        });
        console.log(prices)
        const updated = prices
        // const updated = await (
        //   Promise.all(
        //     prices?.data?.map(async (price: any) => {
        //       const converetdPrice = await stripe.payouts.create({amount: price.unit_amount, currency: price.currency});
        //       return {...price, converetdPrice}
        //     })
        //   )
        // )
        return prices
    }
    async fetchPayment(paymentIntentId: string) {
      return await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
    }

    async getSubscriptionDetails(subId: string){
      const subDetails = await stripe.subscriptions.retrieve(
        subId
      );
      return subDetails
    }

    async getCustomerDetails(custId: string){
      const custDetails = await stripe.customers.retrieve(
        custId,
        { expand: ["default_source"] }
    )
      return custDetails
    }

    async cancelSubscription(subId: string) {
      return await stripe.subscriptions.del(subId);
    }

    async getPaymentMethodDetails(id: string){
      return await stripe.paymentMethods.retrieve(id);
    }

    async getCheckoutSession(obj: any){
      const session = await stripe.checkout.sessions.create(obj);
      return session
    }
}