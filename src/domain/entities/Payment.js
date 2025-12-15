import { v4 as uuidv4 } from 'uuid';
import Money from '../value-objects/Money';

class Payment {
    constructor({
                    id = uuidv4(),
                    userId,
                    rentalId,
                    amount,
                    currency = 'EUR',
                    paymentMethod,
                    stripePaymentId = null,
                    status = PaymentStatus.PENDING,
                    description = null,
                    metadata = {},
                    createdAt = new Date(),
                    updatedAt = new Date(),
                    paidAt = null,
                    refundedAt = null,
                    failureReason = null,
                }) {
        this.id = id;
        this.userId = userId;
        this.rentalId = rentalId;
        this.amount = new Money(amount, currency);
        this.paymentMethod = paymentMethod;
        this.stripePaymentId = stripePaymentId;
        this.status = status;
        this.description = description;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.paidAt = paidAt;
        this.refundedAt = refundedAt;
        this.failureReason = failureReason;

        this.validate();
    }

    // ==================== VALIDATION ====================

    validate() {
        if (!this.userId || typeof this.userId !== 'string') {
            throw new Error('User ID is required');
        }

        if (!this.rentalId || typeof this.rentalId !== 'string') {
            throw new Error('Rental ID is required');
        }

        if (!this.amount || !(this.amount instanceof Money)) {
            throw new Error('Valid amount is required');
        }

        if (this.amount.isNegativeOrZero()) {
            throw new Error('Amount must be positive');
        }

        if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
            throw new Error('Invalid payment method');
        }

        if (!Object.values(PaymentStatus).includes(this.status)) {
            throw new Error('Invalid payment status');
        }

        // Validate timestamps consistency
        if (this.paidAt && this.paidAt < this.createdAt) {
            throw new Error('Payment date cannot be before creation date');
        }

        if (this.refundedAt && this.refundedAt < this.paidAt) {
            throw new Error('Refund date cannot be before payment date');
        }
    }

    // ==================== GETTERS ====================

    getAmountWithCurrency() {
        return `${this.amount.amount} ${this.amount.currency}`;
    }

    getFormattedAmount() {
        return this.amount.format();
    }

    isSuccess() {
        return this.status === PaymentStatus.SUCCEEDED;
    }

    isFailed() {
        return this.status === PaymentStatus.FAILED;
    }

    isRefunded() {
        return this.status === PaymentStatus.REFUNDED;
    }

    isPending() {
        return this.status === PaymentStatus.PENDING;
    }

    isRefundable() {
        const refundableStatuses = [PaymentStatus.SUCCEEDED];
        const timeLimit = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

        return (
            refundableStatuses.includes(this.status) &&
            this.paidAt &&
            (Date.now() - new Date(this.paidAt).getTime()) < timeLimit
        );
    }

    // ==================== BUSINESS RULES ====================

    /**
     * Create a new payment
     */
    static create({
                      userId,
                      rentalId,
                      amount,
                      currency,
                      paymentMethod,
                      description = null,
                      metadata = {},
                  }) {
        // Validate required fields
        if (!userId) throw new Error('User ID is required');
        if (!rentalId) throw new Error('Rental ID is required');
        if (!amount || amount <= 0) throw new Error('Valid amount is required');
        if (!paymentMethod) throw new Error('Payment method is required');

        // Business rule: Minimum payment amount
        if (amount < 1.00) {
            throw new Error('Minimum payment amount is 1.00');
        }

        // Business rule: Maximum payment amount
        if (amount > 10000.00) {
            throw new Error('Maximum payment amount is 10,000.00');
        }

        return new Payment({
            userId,
            rentalId,
            amount,
            currency: currency || 'EUR',
            paymentMethod,
            description,
            metadata,
            status: PaymentStatus.PENDING,
        });
    }

    /**
     * Process payment (mark as succeeded)
     * @param {string} stripePaymentId - Stripe payment ID
     */
    process(stripePaymentId) {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Only pending payments can be processed');
        }

        if (!stripePaymentId || typeof stripePaymentId !== 'string') {
            throw new Error('Stripe payment ID is required');
        }

        this.status = PaymentStatus.SUCCEEDED;
        this.stripePaymentId = stripePaymentId;
        this.paidAt = new Date();
        this.updatedAt = new Date();
        this.failureReason = null;
    }

    /**
     * Mark payment as failed
     * @param {string} reason - Failure reason
     */
    markAsFailed(reason) {
        if (![PaymentStatus.PENDING, PaymentStatus.PROCESSING].includes(this.status)) {
            throw new Error('Only pending or processing payments can be marked as failed');
        }

        if (!reason || typeof reason !== 'string') {
            throw new Error('Failure reason is required');
        }

        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.updatedAt = new Date();
    }

    /**
     * Refund payment
     * @param {number} amount - Amount to refund (partial refund)
     * @param {string} reason - Refund reason
     */
    refund(amount = null, reason = null) {
        if (!this.isRefundable()) {
            throw new Error('Payment is not refundable');
        }

        // Full refund by default
        const refundAmount = amount || this.amount.amount;

        // Validate refund amount
        if (refundAmount <= 0) {
            throw new Error('Refund amount must be positive');
        }

        if (refundAmount > this.amount.amount) {
            throw new Error('Refund amount cannot exceed original amount');
        }

        // Business rule: Minimum refund amount
        if (refundAmount < 0.50) {
            throw new Error('Minimum refund amount is 0.50');
        }

        if (refundAmount === this.amount.amount) {
            // Full refund
            this.status = PaymentStatus.REFUNDED;
        } else {
            // Partial refund
            this.status = PaymentStatus.PARTIALLY_REFUNDED;
            this.metadata.partialRefunds = [
                ...(this.metadata.partialRefunds || []),
                {
                    amount: refundAmount,
                    reason,
                    date: new Date().toISOString(),
                }
            ];
        }

        this.refundedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Cancel pending payment
     */
    cancel() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Only pending payments can be cancelled');
        }

        // Business rule: Cannot cancel if payment was created more than 24 hours ago
        const hoursSinceCreation = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreation > 24) {
            throw new Error('Pending payments can only be cancelled within 24 hours');
        }

        this.status = PaymentStatus.CANCELLED;
        this.updatedAt = new Date();
    }

    /**
     * Mark payment as processing
     */
    markAsProcessing() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Only pending payments can be marked as processing');
        }

        this.status = PaymentStatus.PROCESSING;
        this.updatedAt = new Date();
    }

    /**
     * Apply discount to payment
     * @param {number} discountAmount - Discount amount
     * @param {string} couponCode - Coupon code used
     */
    applyDiscount(discountAmount, couponCode) {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Discount can only be applied to pending payments');
        }

        if (discountAmount <= 0) {
            throw new Error('Discount amount must be positive');
        }

        if (discountAmount > this.amount.amount) {
            throw new Error('Discount cannot exceed total amount');
        }

        // Business rule: Maximum discount percentage (50%)
        const discountPercentage = (discountAmount / this.amount.amount) * 100;
        if (discountPercentage > 50) {
            throw new Error('Maximum discount allowed is 50%');
        }

        const newAmount = this.amount.amount - discountAmount;

        // Update amount and metadata
        this.amount = new Money(newAmount, this.amount.currency);
        this.metadata.discounts = [
            ...(this.metadata.discounts || []),
            {
                amount: discountAmount,
                couponCode,
                appliedAt: new Date().toISOString(),
            }
        ];

        this.updatedAt = new Date();
    }

    /**
     * Add fee to payment (e.g., service fee, late fee)
     * @param {number} feeAmount - Fee amount
     * @param {string} feeType - Type of fee
     * @param {string} reason - Reason for the fee
     */
    addFee(feeAmount, feeType, reason) {
        if (![PaymentStatus.PENDING, PaymentStatus.SUCCEEDED].includes(this.status)) {
            throw new Error('Fee can only be added to pending or succeeded payments');
        }

        if (feeAmount <= 0) {
            throw new Error('Fee amount must be positive');
        }

        // Business rule: Maximum fee percentage (20%)
        const feePercentage = (feeAmount / this.amount.amount) * 100;
        if (feePercentage > 20) {
            throw new Error('Maximum fee allowed is 20% of the original amount');
        }

        const newAmount = this.amount.amount + feeAmount;

        // Update amount and metadata
        this.amount = new Money(newAmount, this.amount.currency);
        this.metadata.fees = [
            ...(this.metadata.fees || []),
            {
                amount: feeAmount,
                type: feeType,
                reason,
                addedAt: new Date().toISOString(),
            }
        ];

        this.updatedAt = new Date();
    }

    /**
     * Split payment between multiple parties
     * @param {Array} splits - Array of splits with userId and amount
     */
    split(splits) {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Payment can only be split when pending');
        }

        if (!Array.isArray(splits) || splits.length < 2) {
            throw new Error('At least two splits are required');
        }

        const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);

        // Validate total matches payment amount
        if (Math.abs(totalSplit - this.amount.amount) > 0.01) {
            throw new Error('Split total must match payment amount');
        }

        // Validate all splits are positive
        if (splits.some(split => split.amount <= 0)) {
            throw new Error('All split amounts must be positive');
        }

        this.metadata.splits = splits.map(split => ({
            ...split,
            percentage: ((split.amount / this.amount.amount) * 100).toFixed(2),
        }));

        this.updatedAt = new Date();
    }

    // ==================== QUERY METHODS ====================

    /**
     * Calculate fee for platform (e.g., 10% commission)
     */
    calculatePlatformFee(percentage = 10) {
        if (percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }

        const fee = (this.amount.amount * percentage) / 100;

        // Business rule: Minimum platform fee
        const minFee = 0.50;
        return Math.max(fee, minFee);
    }

    /**
     * Get net amount after platform fee
     */
    getNetAmount(percentage = 10) {
        const fee = this.calculatePlatformFee(percentage);
        return this.amount.amount - fee;
    }

    // ==================== SERIALIZATION ====================

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            rentalId: this.rentalId,
            amount: this.amount.amount,
            currency: this.amount.currency,
            formattedAmount: this.getFormattedAmount(),
            paymentMethod: this.paymentMethod,
            stripePaymentId: this.stripePaymentId,
            status: this.status,
            description: this.description,
            metadata: this.metadata,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            paidAt: this.paidAt ? this.paidAt.toISOString() : null,
            refundedAt: this.refundedAt ? this.refundedAt.toISOString() : null,
            failureReason: this.failureReason,
            isRefundable: this.isRefundable(),
            isSuccess: this.isSuccess(),
            isFailed: this.isFailed(),
            isPending: this.isPending(),
            isRefunded: this.isRefunded(),
        };
    }
}

// ==================== ENUMS ====================

const PaymentStatus = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
    PARTIALLY_REFUNDED: 'partially_refunded',
};

const PaymentMethod = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    PAYPAL: 'paypal',
    APPLE_PAY: 'apple_pay',
    GOOGLE_PAY: 'google_pay',
};

export { PaymentStatus, PaymentMethod };
export default Payment;