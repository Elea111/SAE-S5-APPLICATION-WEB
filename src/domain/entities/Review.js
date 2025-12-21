import { v4 as uuidv4 } from 'uuid';

class Review {
    constructor({
                    id = uuidv4(),
                    authorId,
                    targetId,
                    rentalId,
                    rating,
                    title = null,
                    content = null,
                    response = null,
                    responseDate = null,
                    isVerifiedRental = false,
                    helpfulCount = 0,
                    reportCount = 0,
                    isHidden = false,
                    hiddenReason = null,
                    metadata = {},
                    createdAt = new Date(),
                    updatedAt = new Date(),
                }) {
        this.id = id;
        this.authorId = authorId;
        this.targetId = targetId;
        this.rentalId = rentalId;
        this.rating = rating;
        this.title = title;
        this.content = content;
        this.response = response;
        this.responseDate = responseDate;
        this.isVerifiedRental = isVerifiedRental;
        this.helpfulCount = helpfulCount;
        this.reportCount = reportCount;
        this.isHidden = isHidden;
        this.hiddenReason = hiddenReason;
        this.metadata = metadata;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.validate();
    }

    // ==================== VALIDATION ====================

    validate() {
        if (!this.authorId || typeof this.authorId !== 'string') {
            throw new Error('Author ID is required');
        }

        if (!this.targetId || typeof this.targetId !== 'string') {
            throw new Error('Target ID (user or tool) is required');
        }

        if (!this.rentalId || typeof this.rentalId !== 'string') {
            throw new Error('Rental ID is required');
        }

        if (!this.rating || typeof this.rating !== 'number') {
            throw new Error('Rating is required and must be a number');
        }

        if (this.rating < 1 || this.rating > 5 || !Number.isInteger(this.rating)) {
            throw new Error('Rating must be an integer between 1 and 5');
        }

        // Validate timestamps
        if (this.responseDate && this.responseDate < this.createdAt) {
            throw new Error('Response date cannot be before creation date');
        }

        if (this.updatedAt < this.createdAt) {
            throw new Error('Update date cannot be before creation date');
        }

        // Validate content if provided
        if (this.content !== null && typeof this.content !== 'string') {
            throw new Error('Content must be a string if provided');
        }

        if (this.title !== null && typeof this.title !== 'string') {
            throw new Error('Title must be a string if provided');
        }
    }

    // ==================== GETTERS ====================

    getRatingStars() {
        return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
    }

    getRatingDescription() {
        const descriptions = {
            1: 'Terrible',
            2: 'Mauvais',
            3: 'Moyen',
            4: 'Bon',
            5: 'Excellent'
        };
        return descriptions[this.rating] || 'Inconnu';
    }

    hasResponse() {
        return !!this.response;
    }

    isRecent(days = 30) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        return this.createdAt > daysAgo;
    }

    isHelpful() {
        return this.helpfulCount >= 5;
    }

    isControversial() {
        return this.reportCount >= 3;
    }

    canBeEdited() {
        // Reviews can be edited within 24 hours of creation
        const hoursSinceCreation = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
        return hoursSinceCreation <= 24 && !this.isHidden;
    }

    // ==================== BUSINESS RULES ====================

    /**
     * Create a new review
     */
    static create({
                      authorId,
                      targetId,
                      rentalId,
                      rating,
                      title = null,
                      content = null,
                      isVerifiedRental = false,
                  }) {
        // Validate required fields
        if (!authorId) throw new Error('Author ID is required');
        if (!targetId) throw new Error('Target ID is required');
        if (!rentalId) throw new Error('Rental ID is required');
        if (!rating) throw new Error('Rating is required');

        // Business rule: Rating must be integer 1-5
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error('Rating must be an integer between 1 and 5');
        }

        // Business rule: Content length validation
        if (content && content.length > 2000) {
            throw new Error('Review content cannot exceed 2000 characters');
        }

        if (title && title.length > 100) {
            throw new Error('Review title cannot exceed 100 characters');
        }

        // Business rule: Minimum content length for verified rentals
        if (isVerifiedRental && content && content.length < 10) {
            throw new Error('Reviews for verified rentals must have at least 10 characters of content');
        }

        return new Review({
            authorId,
            targetId,
            rentalId,
            rating,
            title,
            content,
            isVerifiedRental,
        });
    }

    /**
     * Update review content
     */
    update({ title = null, content = null, rating = null }) {
        if (this.isHidden) {
            throw new Error('Cannot update a hidden review');
        }

        if (!this.canBeEdited()) {
            throw new Error('Reviews can only be edited within 24 hours of creation');
        }

        let hasChanges = false;

        // Update title if provided
        if (title !== null) {
            if (typeof title !== 'string') {
                throw new Error('Title must be a string');
            }
            if (title.length > 100) {
                throw new Error('Title cannot exceed 100 characters');
            }
            this.title = title;
            hasChanges = true;
        }

        // Update content if provided
        if (content !== null) {
            if (typeof content !== 'string') {
                throw new Error('Content must be a string');
            }
            if (content.length > 2000) {
                throw new Error('Content cannot exceed 2000 characters');
            }
            if (this.isVerifiedRental && content.length < 10) {
                throw new Error('Reviews for verified rentals must have at least 10 characters of content');
            }
            this.content = content;
            hasChanges = true;
        }

        // Update rating if provided
        if (rating !== null) {
            if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
                throw new Error('Rating must be an integer between 1 and 5');
            }

            // Business rule: Cannot change rating after 1 hour
            const hoursSinceCreation = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceCreation > 1) {
                throw new Error('Rating can only be changed within 1 hour of creation');
            }

            this.rating = rating;
            hasChanges = true;
        }

        if (hasChanges) {
            this.updatedAt = new Date();
            this.metadata.lastEditedAt = new Date().toISOString();
            this.metadata.editCount = (this.metadata.editCount || 0) + 1;
        }

        return hasChanges;
    }

    /**
     * Add a response to the review (by the reviewed user/tool owner)
     */
    addResponse(response) {
        if (this.isHidden) {
            throw new Error('Cannot respond to a hidden review');
        }

        if (this.hasResponse()) {
            throw new Error('Review already has a response');
        }

        if (!response || typeof response !== 'string') {
            throw new Error('Response content is required');
        }

        if (response.length > 1000) {
            throw new Error('Response cannot exceed 1000 characters');
        }

        // Business rule: Can only respond within 30 days
        const daysSinceCreation = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > 30) {
            throw new Error('Can only respond to reviews within 30 days');
        }

        this.response = response;
        this.responseDate = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Edit response
     */
    editResponse(newResponse) {
        if (!this.hasResponse()) {
            throw new Error('No response to edit');
        }

        if (!newResponse || typeof newResponse !== 'string') {
            throw new Error('Response content is required');
        }

        if (newResponse.length > 1000) {
            throw new Error('Response cannot exceed 1000 characters');
        }

        // Business rule: Can only edit response within 7 days
        const daysSinceResponse = (Date.now() - new Date(this.responseDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceResponse > 7) {
            throw new Error('Can only edit response within 7 days');
        }

        this.response = newResponse;
        this.updatedAt = new Date();
        this.metadata.responseEditCount = (this.metadata.responseEditCount || 0) + 1;
    }

    /**
     * Mark review as helpful
     */
    markAsHelpful() {
        if (this.isHidden) {
            throw new Error('Cannot mark hidden review as helpful');
        }

        this.helpfulCount += 1;
        this.updatedAt = new Date();

        // Business rule: Auto-verify if many people find it helpful
        if (this.helpfulCount >= 10 && !this.metadata.autoVerified) {
            this.metadata.autoVerified = true;
            this.metadata.autoVerifiedAt = new Date().toISOString();
        }
    }

    /**
     * Report review
     * @param {string} reason - Reason for reporting
     */
    report(reason) {
        if (!reason || typeof reason !== 'string') {
            throw new Error('Report reason is required');
        }

        if (reason.length > 500) {
            throw new Error('Report reason cannot exceed 500 characters');
        }

        this.reportCount += 1;
        this.updatedAt = new Date();

        // Track individual reports in metadata
        this.metadata.reports = [
            ...(this.metadata.reports || []),
            {
                reason,
                date: new Date().toISOString(),
                reportCount: this.reportCount,
            }
        ];

        // Business rule: Auto-hide if too many reports
        if (this.reportCount >= 5 && !this.isHidden) {
            this.hide('Auto-hidden due to multiple reports');
        }
    }

    /**
     * Hide review (admin/mod action)
     * @param {string} reason - Reason for hiding
     */
    hide(reason) {
        if (this.isHidden) {
            throw new Error('Review is already hidden');
        }

        if (!reason || typeof reason !== 'string') {
            throw new Error('Hide reason is required');
        }

        this.isHidden = true;
        this.hiddenReason = reason;
        this.updatedAt = new Date();
        this.metadata.hiddenAt = new Date().toISOString();
    }

    /**
     * Unhide review (admin/mod action)
     */
    unhide() {
        if (!this.isHidden) {
            throw new Error('Review is not hidden');
        }

        this.isHidden = false;
        this.hiddenReason = null;
        this.updatedAt = new Date();
        this.metadata.unhiddenAt = new Date().toISOString();
    }

    /**
     * Calculate review score based on various factors
     */
    calculateScore() {
        let score = this.rating * 20; // Base score: rating * 20 (max 100)

        // Bonus for verified rental
        if (this.isVerifiedRental) {
            score += 10;
        }

        // Bonus for having content
        if (this.content && this.content.length >= 50) {
            score += 10;
        }

        // Bonus for being helpful
        if (this.isHelpful()) {
            score += 15;
        }

        // Bonus for recent reviews (within 7 days)
        if (this.isRecent(7)) {
            score += 5;
        }

        // Penalty for reports
        if (this.reportCount > 0) {
            score -= this.reportCount * 5;
        }

        // Ensure score is between 0 and 100
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Check if review can be deleted by author
     */
    canBeDeletedByAuthor() {
        // Authors can delete their review if:
        // 1. It's not hidden
        // 2. No one has marked it as helpful
        // 3. It's less than 7 days old OR has no response
        const daysSinceCreation = (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24);

        return !this.isHidden &&
            this.helpfulCount === 0 &&
            (daysSinceCreation < 7 || !this.hasResponse());
    }

    // ==================== STATIC VALIDATION METHODS ====================

    static isValidRating(rating) {
        return Number.isInteger(rating) && rating >= 1 && rating <= 5;
    }

    static isValidContent(content) {
        return typeof content === 'string' && content.length <= 2000;
    }

    static isValidTitle(title) {
        return typeof title === 'string' && title.length <= 100;
    }

    // ==================== SERIALIZATION ====================

    toJSON() {
        return {
            id: this.id,
            authorId: this.authorId,
            targetId: this.targetId,
            rentalId: this.rentalId,
            rating: this.rating,
            ratingStars: this.getRatingStars(),
            ratingDescription: this.getRatingDescription(),
            title: this.title,
            content: this.content,
            response: this.response,
            responseDate: this.responseDate ? this.responseDate.toISOString() : null,
            isVerifiedRental: this.isVerifiedRental,
            helpfulCount: this.helpfulCount,
            reportCount: this.reportCount,
            isHidden: this.isHidden,
            hiddenReason: this.hiddenReason,
            metadata: this.metadata,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            hasResponse: this.hasResponse(),
            isRecent: this.isRecent(),
            isHelpful: this.isHelpful(),
            isControversial: this.isControversial(),
            canBeEdited: this.canBeEdited(),
            canBeDeletedByAuthor: this.canBeDeletedByAuthor(),
            score: this.calculateScore(),
        };
    }
}

// ==================== ENUMS ====================

const ReviewType = {
    USER_REVIEW: 'user_review',      // Review of a user
    TOOL_REVIEW: 'tool_review',      // Review of a tool
    RENTAL_REVIEW: 'rental_review',  // Review of a rental experience
};

const ReportReason = {
    INAPPROPRIATE: 'inappropriate',
    SPAM: 'spam',
    FALSE_INFORMATION: 'false_information',
    HATE_SPEECH: 'hate_speech',
    OTHER: 'other',
};

export { ReviewType, ReportReason };
export default Review;