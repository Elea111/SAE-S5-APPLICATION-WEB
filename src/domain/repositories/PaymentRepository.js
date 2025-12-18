export default class PaymentRepository {
    async charge(paymentData) { throw new Error('PaymentRepository.charge not implemented'); }
    async refund(paymentId, amount) { throw new Error('PaymentRepository.refund not implemented'); }
    async findById(paymentId) { throw new Error('PaymentRepository.findById not implemented'); }
}
