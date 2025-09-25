import { signupSchema } from "#validations/auth.validation.js";
import { formatValidationError } from "#validations/format.js";
import logger from "#config/logger.js";

export const signup = async( req, res, next ) => {
    try {
        const validationResult = signupSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            });
        }

        const { name, email, password, role } = validationResult.data;

        // AUTH SERVICE
        
        logger.info(`User registered successfully: ${email} and role: ${role}`);
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: 1, name, email, role
            }
        });

    } catch (error) {
        logger.error('Error in signup controller:', error);

        if(error.message === 'user already exists') {
            return res.status(409).json({ message: 'Email already exists' });
        }
        next(error);
    }
};