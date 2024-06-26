import Validator from "validator";
import { isEmpty } from "./isEmpty";

export const validateRegisterInput = (data: any) => {
  console.log(data)
  let errors: any = {};
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.email = !isEmpty(data.email) ? data.email : "";

  if (!Validator.isLength(data.firstName, { min: 2, max: 30 })) {
    errors.firstName = "Name must be between 2 and 30 characters";
  }

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "Name field is required";
  }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last Name field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
    errors.inValidEmail = true;
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
}

// module.exports = function validateLoginInput(data) {
export const validateLoginInput = (data: any) => {
  interface CustValid {
    email?: string;
    password?: string;
  }

  let errors = <CustValid>{};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export const validateUpdateInput = (data: any) => {
  interface CustValid {
    firstName?: string;
    lastName?: string;
  }

  let errors = <CustValid>{};

  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";

  if (Validator.isEmpty(data.firstName)) {
    errors.firstName = "First name field is required";
  }

  if (Validator.isEmpty(data.lastName)) {
    errors.lastName = "Last name field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};


export const validateSupportInput = (data: any) => {
  interface CustValid {
    checkoutSessionId?: string;
    amount?: string;
  }

  let errors = <CustValid>{};

  data.checkoutSessionId = !isEmpty(data.checkoutSessionId) ? data.checkoutSessionId : "";
  data.amount = !isEmpty(data.amount) ? data.amount : "";

  if (Validator.isEmpty(data.checkoutSessionId)) {
    errors.checkoutSessionId = "Checkout Session Id is required";
  }

  if (!data.amount) {
    errors.amount = "Amount is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

