export default class UserRepository {
    // ... implement in infrastructure layer
    async create(user) { throw new Error('UserRepository.create not implemented'); }
    async findByEmail(email) { throw new Error('UserRepository.findByEmail not implemented'); }
    async findByCredentials(email, password) { throw new Error('UserRepository.findByCredentials not implemented'); }
    async findById(id) { throw new Error('UserRepository.findById not implemented'); }
}
