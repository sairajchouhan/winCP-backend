const isEmpty = (string) => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = (email) => {
  const emailRegEx = /^(([^<>([\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

module.exports.validateSignupData = (
  username,
  email,
  password,
  confirmPassword
) => {
  let errors = {};

  if (isEmpty(username)) {
    errors.username = 'Username cannot not be empty';
  }
  if (!isEmail(email)) {
    errors.email = 'Invalid email adress';
  }
  if (isEmpty(password)) {
    errors.password = 'Password cannot not be empty';
    errors.confirmPassword = '';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match ';
  }
  const valid = Object.keys(errors).length === 0;

  return { errors, valid };
};

module.exports.validateLoginData = (email, password) => {
  const errors = {};
  if (isEmpty(email)) {
    errors.email = 'Email cannot not be empty';
  }
  if (isEmpty(password)) {
    errors.password = 'Password cannot be empty';
  }
  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
};

module.exports.reduceUserDetails = (data) => {
  let userDetails = {};
  if (!isEmpty(data.bio.trim())) {
    userDetails.bio = data.bio;
  }
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`;
    } else {
      userDetails.website = data.website;
    }
  }
  if (!isEmpty(data.location.trim())) {
    userDetails.location = data.location;
  }

  return userDetails;
};
