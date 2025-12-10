import { v4 as uuidv4 } from 'uuid';
import Email from '../value-objects/Email';
import Location from '../value-objects/Location';
import UserRole from '../value-objects/UserRole';

class User {
    constructor({
        id = uuidv4(),
        email,
        passwordHash,
        firstName,
        lastName,
        companyName = null,
        siret = null,
        phone = null,
        address = null,
        latitude = null,
        longitude = null,
        avatarUrl = null,
        isPro = false,
        rating = 0,
        reviewCount = 0,
        createdAt = new Date(),
        updatedAt = new Date(),
        emailVerified = false,
        verificationToken = null,
    }) {
        this.id = id;
        this.email = new Email(email);
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.companyName = companyName;
        this.siret = siret;
        this.phone = phone;
        this.address = address;
        this.location = latitude && longitude ? new Location(latitude, longitude) : null;
        this.avatarUrl = avatarUrl;
        this.isPro = isPro;
        this.rating = rating;
        this.reviewCount = reviewCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.emailVerified = emailVerified;
        this.verificationToken = verificationToken;
    }

    // ==================== GETTERS ====================
    
    getFullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    getDisplayName() {
        return this.isPro && this.companyName ? this.companyName : this.getFullName();
    }

    getAverageRating() {
        if (this.reviewCount === 0) return null;
        return (this.rating / this.reviewCount).toFixed(2);
    }

    getRole() {
        return this.isPro ? UserRole.PROFESSIONAL : UserRole.INDIVIDUAL;
    }

    isVerified() {
        return this.emailVerified;
    }

    // ==================== BUSINESS RULES ====================

    /**
     * Register a new user
     * @throws {InvalidUserError} if business rules are violated
     */
    static create({
        email,
        passwordHash,
        firstName,
        lastName,
        isPro = false,
        companyName = null,
        siret = null,
    }) {
        // Validate required fields
        if (!email || typeof email !== 'string') {
            throw new Error('Email is required and must be a string');
        }
        if (!passwordHash || typeof passwordHash !== 'string') {
            throw new Error('Password hash is required');
        }
        if (!firstName || typeof firstName !== 'string') {
            throw new Error('First name is required');
        }
        if (!lastName || typeof lastName !== 'string') {
            throw new Error('Last name is required');
        }

        // Professional-specific validations
        if (isPro) {
            if (!companyName || typeof companyName !== 'string') {
                throw new Error('Company name is required for professional users');
            }
            if (!siret || typeof siret !== 'string') {
                throw new Error('SIRET is required for professional users');
            }
            if (!this._isValidSiret(siret)) {
                throw new Error('SIRET format is invalid');
            }
        }

        return new User({
            email,
            passwordHash,
            firstName,
            lastName,
            isPro,
            companyName,
            siret,
        });
    }

    /**
     * Update user profile information
     */
    updateProfile({
        firstName = null,
        lastName = null,
        phone = null,
        address = null,
        latitude = null,
        longitude = null,
        avatarUrl = null,
    }) {
        if (firstName !== null) {
            if (typeof firstName !== 'string' || firstName.trim() === '') {
                throw new Error('First name must be a non-empty string');
            }
            this.firstName = firstName;
        }

        if (lastName !== null) {
            if (typeof lastName !== 'string' || lastName.trim() === '') {
                throw new Error('Last name must be a non-empty string');
            }
            this.lastName = lastName;
        }

        if (phone !== null) {
            if (!this._isValidPhone(phone)) {
                throw new Error('Phone number format is invalid');
            }
            this.phone = phone;
        }

        if (address !== null) {
            if (typeof address !== 'string' || address.trim() === '') {
                throw new Error('Address must be a non-empty string');
            }
            this.address = address;
        }

        if (latitude !== null && longitude !== null) {
            this.location = new Location(latitude, longitude);
        }

        if (avatarUrl !== null) {
            if (!this._isValidUrl(avatarUrl)) {
                throw new Error('Avatar URL format is invalid');
            }
            this.avatarUrl = avatarUrl;
        }

        this.updatedAt = new Date();
    }

    /**
     * Complete professional profile
     */
    completeProfessionalProfile({ companyName, siret, address, latitude, longitude }) {
        if (!this.isPro) {
            throw new Error('Only professional users can complete professional profile');
        }

        if (!companyName || typeof companyName !== 'string') {
            throw new Error('Company name is required');
        }

        if (!siret || !this._isValidSiret(siret)) {
            throw new Error('Valid SIRET is required');
        }

        this.companyName = companyName;
        this.siret = siret;

        if (address) {
            this.address = address;
        }

        if (latitude && longitude) {
            this.location = new Location(latitude, longitude);
        }

        this.updatedAt = new Date();
    }

    /**
     * Verify email
     */
    verifyEmail(token) {
        if (!this.verificationToken) {
            throw new Error('No verification token exists for this user');
        }

        if (this.verificationToken !== token) {
            throw new Error('Invalid verification token');
        }

        this.emailVerified = true;
        this.verificationToken = null;
        this.updatedAt = new Date();
    }

    /**
     * Add a review/rating to the user
     */
    addReview(ratingValue) {
        if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
            throw new Error('Rating must be a number between 1 and 5');
        }

        this.rating += ratingValue;
        this.reviewCount += 1;
        this.updatedAt = new Date();
    }

    /**
     * Upgrade user to professional status
     */
    upgradeToProfessional({ companyName, siret }) {
        if (this.isPro) {
            throw new Error('User is already a professional');
        }

        if (!companyName || !siret) {
            throw new Error('Company name and SIRET are required');
        }

        if (!this._isValidSiret(siret)) {
            throw new Error('Invalid SIRET format');
        }

        this.isPro = true;
        this.companyName = companyName;
        this.siret = siret;
        this.updatedAt = new Date();
    }

    /**
     * Downgrade user from professional to individual
     */
    downgradeToIndividual() {
        if (!this.isPro) {
            throw new Error('User is not a professional');
        }

        this.isPro = false;
        this.companyName = null;
        this.siret = null;
        this.updatedAt = new Date();
    }

    /**
     * Check if user can rent items
     */
    canRentItems() {
        return this.emailVerified;
    }

    /**
     * Check if user can list items (for professionals)
     */
    canListItems() {
        if (!this.isPro) {
            throw new Error('Only professional users can list items');
        }
        return this.emailVerified;
    }

    // ==================== VALIDATION HELPERS ====================

    static _isValidSiret(siret) {
        // SIRET: 14 digits
        if (!/^\d{14}$/.test(siret)) {
            return false;
        }

        // Luhn algorithm validation
        let sum = 0;
        let factor = 3;

        for (let i = 0; i < 13; i++) {
            let digit = parseInt(siret.charAt(i));
            let product = digit * factor;

            if (product > 9) {
                product = Math.floor(product / 10) + (product % 10);
            }

            sum += product;
            factor = factor === 3 ? 1 : 3;
        }

        const checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit === parseInt(siret.charAt(13));
    }

    static _isValidPhone(phone) {
        // Basic phone validation - at least 10 digits
        const digitsOnly = phone.replace(/\D/g, '');
        return digitsOnly.length >= 10;
    }

    static _isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // ==================== SERIALIZATION ====================

    toJSON() {
        return {
            id: this.id,
            email: this.email.value,
            firstName: this.firstName,
            lastName: this.lastName,
            fullName: this.getFullName(),
            companyName: this.companyName,
            siret: this.siret,
            phone: this.phone,
            address: this.address,
            location: this.location ? this.location.toJSON() : null,
            avatarUrl: this.avatarUrl,
            isPro: this.isPro,
            rating: this.rating,
            reviewCount: this.reviewCount,
            averageRating: this.getAverageRating(),
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
            emailVerified: this.emailVerified,
            role: this.getRole(),
        };
    }
}

export default User;
