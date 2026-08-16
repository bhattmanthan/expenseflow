const levels = ['error', 'warn', 'info', 'debug'];

function log(level, message, meta) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };
  console.log(JSON.stringify(entry));
}

const logger = {};
levels.forEach((level) => {
  logger[level] = (message, meta) => log(level, message, meta);
});

module.exports = logger;
