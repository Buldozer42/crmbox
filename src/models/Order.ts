import Address from './Address';

class Order {
    constructor(
        public id: number,
        public date: Date,
        public state: string,
        public deliveryAddress: Address,
        public billingAddress: Address,
        public client: string,
        public orderedProducts: string[],
    ) {}
}
export default Order;