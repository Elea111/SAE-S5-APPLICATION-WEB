class UserAlreadyExistsError extends Error {
    constructor(email) {
        super(`User with email "${email}" already exists`);
        this.name = 'UserAlreadyExistsError';
        this.email = email;
    }
}

export default UserAlreadyExistsError;
