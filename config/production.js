const config = {};

config.mongo = process.env.MONGO;
config.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
config.jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
config.stabilityKey = process.env.STABILITY_KEY;
config.geminiKey = process.env.GEMINI_KEY;

module.exports = config;
