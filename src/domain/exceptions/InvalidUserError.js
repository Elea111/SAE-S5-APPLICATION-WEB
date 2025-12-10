class InvalidUserError extends Error {
    constructor(message, code = 'INVALID_USER') {
        super(message);
        this.name = 'InvalidUserError';
        this.code = code;
    }
}

export default InvalidUserError;
