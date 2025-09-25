import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || 'guest';

        let limit;
        let message;

        switch(role) {
            case 'admin':
                limit=20;
                message='Admin request limit exceeded (20 requests per minute). Slow down!';
            break;
            case 'user':
                limit=10;
                message='user request limit exceeded (10 requests per minute). Slow down!';
            break;
            case 'guest':
                limit=5;
                message='guest request limit exceeded (5 requests per minute). Slow down!';
            break;
        }

        const client = aj.withRule(slidingWindow({
            mode: 'LIVE',
            interval: '1m',
            max: limit,
            name: `${role}-rate-limit`
        }));

        const decision = await client.protect(req)
        console.log(decision);
        if(decision.isDenied() && decision.reason.isBot()){
            logger.warn('Bot request blocked', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });
            return res.status(403).json({ error: 'Forbidden', message: 'Bot traffic is not allowed' });
        }
        if(decision.isDenied() && decision.reason.isShield()){
            logger.warn('Shield Blocked request', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });

            return res.status(403).json({ error: 'Forbidden', message: 'Reqwest blocked by security policy' });
        }
        if(decision.isDenied() && decision.reason.isRateLimit()){
            logger.warn('Rate limit ecessse', { ip: req.ip, userAgent: req.get('User-Agent'), path: req.path });

            return res.status(403).json({ error: 'Forbidden', message: 'Reqwest blocked by security policy' });
        }
        next();
    } catch (error) {
        console.error('Error in security middleware:', error);
        res.status(500).json({error: 'Internal server error', message: 'Something went wrong from  security middleware' });
    }
}

export default securityMiddleware;