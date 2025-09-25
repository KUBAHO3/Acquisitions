import { signupSchema, signinSchema } from "#validations/auth.validation.js";
import { formatValidationError } from "#validations/format.js";
import logger from "#config/logger.js";
import { createUser, authenticateUser } from "#services/auth.service.js";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";

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

        const user = await createUser({ name, email, password, role });

        const token = jwttoken.sign({id: user.id, email: user.email, role: user.role});
        
        cookies.set(res, 'token', token)

        logger.info(`User registered successfully: ${email} and role: ${role}`);
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: user.id, name: user.name, email:user.email, role:user.role
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

export const signin = async (req, res, next) => {
    try {
        const validationResult = signinSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error)
            });
        }

        const { email, password } = validationResult.data;

        const user = await authenticateUser({ email, password });

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        
        cookies.set(res, 'token', token);

        logger.info(`User signed in successfully: ${email}`);
        res.status(200).json({ 
            message: 'User signed in successfully',
            user: {
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role
            }
        });

    } catch (error) {
        logger.error('Error in signin controller:', error);

        if (error.message === 'User not found' || error.message === 'Invalid password') {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        next(error);
    }
};

export const signout = async (req, res, next) => {
    try {
        cookies.clear(res, 'token');
        
        logger.info('User signed out successfully');
        res.status(200).json({ 
            message: 'User signed out successfully'
        });

    } catch (error) {
        logger.error('Error in signout controller:', error);
        next(error);
    }
};
