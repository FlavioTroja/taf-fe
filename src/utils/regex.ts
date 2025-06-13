export function getFiscalCodeRegex() {
  return new RegExp(/^[A-Za-z]{3}[A-Za-z]{3}\d{2}[ABCDEHLMPRSTabcdehlmprst]{1}\d{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$/);
}

export function getPhoneNumberRegExp() {
  return new RegExp(/^([+]39)?((3[\d]{2})([ ,\-,\/]){0,1}([\d, ]{6,9}))|(((0[\d]{1,4}))([ ,\-,\/]){0,1}([\d, ]{5,10}))$/);
}
