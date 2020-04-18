class LinkFromError extends TypeError {
  constructor(value) {
    super(`could not determine if the value \`${value}\` was a string, object or Link.`);
  }
}

module.exports = {
  LinkFromError,
};
