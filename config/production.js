const config = {};

config.mongo = process.env.MONGO;
config.openaiKey = process.env.OPENAI_API_KEY;
config.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
config.jwtAccessSecret = process.env.JWT_ACCESS_SECRET;
config.stabilityKey = process.env.STABILITY_KEY;
config.geminiKey = process.env.GEMINI_KEY;

config.cloudpayments = {
  username: process.env.CLOUDPAYMENTS_USERNAME,
  password: process.env.CLOUDPAYMENTS_PASSWORD,
};

module.exports = config;
