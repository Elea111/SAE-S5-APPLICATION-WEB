import { z } from 'zod';

/**
 * Middleware pour valider req.body contre un schéma Zod
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.validated = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.') || 'root',
          message: e.message
        }));
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      // Fallback pour les autres erreurs
      return res.status(400).json({ 
        message: err.message || 'Validation error',
        type: err.constructor.name
      });
    }
  };
}

/**
 * Middleware pour valider req.query contre un schéma Zod
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.validated = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.') || 'root',
          message: e.message
        }));
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      return res.status(400).json({ 
        message: err.message || 'Validation error',
        type: err.constructor.name
      });
    }
  };
}

/**
 * Middleware pour valider req.params contre un schéma Zod
 */
export function validateParams(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.validated = validated;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors = err.errors.map(e => ({
          field: e.path.join('.') || 'root',
          message: e.message
        }));
        return res.status(400).json({ 
          message: 'Validation error', 
          errors 
        });
      }
      return res.status(400).json({ 
        message: err.message || 'Validation error',
        type: err.constructor.name
      });
    }
  };
}
