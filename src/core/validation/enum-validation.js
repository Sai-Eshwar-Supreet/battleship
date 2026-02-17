function assertEnum(enumObj, value, type = 'value') {
  if (!Object.values(enumObj).includes(value)) {
    throw new Error(`Invalid ${type}: ${value}`);
  }
}

export { assertEnum };
