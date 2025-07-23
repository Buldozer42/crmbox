import Address from './Address';

class Client {
    constructor(
        public id: number,
        public lastname: string,
        public firstname: string,
        public company: string | null,
        public phone: string,
        public note: string,
        public deliveryAddress: Address,
        public billingAddress: Address,
    ) {}

    get fullName(): string {
        return `${this.firstname} ${this.lastname}`;
    }
}
export default Client;