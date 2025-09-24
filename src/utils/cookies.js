export const cookies = {
    getoptions: () => ({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 1 day
    }),
    set: (res, name, value, options = {}) => {
        res.cookie(name, value, { ...cookies.getoptions(), ...options });
    },
    clear: (res, name, options = {}) => {
        res.clearCookie(name, { ...cookies.getoptions(), ...options }); // Ensure options match those used when setting the cookie
    },
    get: (req, name) => {
        return req.cookies[name];
    }
}