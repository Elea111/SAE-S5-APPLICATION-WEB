import { 
  RegisterSchema, 
  LoginSchema, 
  PublishEquipmentSchema,
  BookEquipmentSchema 
} from '../schemas.js';

describe('Validation Schemas', () => {
  describe('RegisterSchema', () => {
    test('should validate correct register data', () => {
      const data = {
        firstName: 'Max',
        lastName: 'Robinson',
        email: 'max@example.com',
        password: 'secret123'
      };
      const result = RegisterSchema.parse(data);
      expect(result.firstName).toBe('Max');
    });

    test('should reject short password', () => {
      const data = {
        firstName: 'Max',
        lastName: 'Robinson',
        email: 'max@example.com',
        password: 'short'
      };
      expect(() => RegisterSchema.parse(data)).toThrow();
    });

    test('should reject invalid email', () => {
      const data = {
        firstName: 'Max',
        lastName: 'Robinson',
        email: 'not-an-email',
        password: 'secret123'
      };
      expect(() => RegisterSchema.parse(data)).toThrow();
    });
  });

  describe('BookEquipmentSchema', () => {
    test('should validate correct booking data', () => {
      const data = {
        item_id: '550e8400-e29b-41d4-a716-446655440000',
        start_date: '2025-02-01T10:00:00Z',
        end_date: '2025-02-05T10:00:00Z'
      };
      const result = BookEquipmentSchema.parse(data);
      expect(result.item_id).toBe(data.item_id);
    });

    test('should reject end_date before start_date', () => {
      const data = {
        item_id: '550e8400-e29b-41d4-a716-446655440000',
        start_date: '2025-02-05T10:00:00Z',
        end_date: '2025-02-01T10:00:00Z'
      };
      expect(() => BookEquipmentSchema.parse(data)).toThrow();
    });
  });
});
