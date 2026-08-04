// Central place for all form validation rules used across VoteSecure.
// Each validator takes a raw field value and returns an error string
// ("" means valid) so it can be plugged straight into form state.

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const validators = {
  fullName: (value = "") => {
    const v = value.trim();
    if (!v) return "Full name is required";
    if (v.length < 3) return "Name must be at least 3 characters";
    if (v.length > 60) return "Name is too long";
    if (!/^[A-Za-z][A-Za-z.'\s-]*$/.test(v)) return "Name can only contain letters, spaces, and . ' -";
    return "";
  },

  voterId: (value = "") => {
    const v = value.trim();
    if (!v) return "Voter ID is required";
    if (!/^\d{12}$/.test(v)) return "Voter ID must be exactly 12 digits (like an Aadhaar number)";
    return "";
  },

  email: (value = "") => {
    const v = value.trim();
    if (!v) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address";
    return "";
  },

  phone: (value = "") => {
    const v = value.trim();
    if (!v) return "Phone number is required";
    if (!/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number (starting 6-9)";
    return "";
  },

  constituency: (value = "") => {
    const v = value.trim();
    if (!v) return "Constituency is required";
    if (v.length < 2) return "Constituency name looks too short";
    if (v.length > 60) return "Constituency name is too long";
    return "";
  },

  dateOfBirth: (value = "") => {
    if (!value) return "Date of birth is required";
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return "Enter a valid date";
    if (dob > new Date()) return "Date of birth cannot be in the future";
    const age = calculateAge(value);
    if (age < 18) return "You must be at least 18 years old to register as a voter";
    if (age > 120) return "Enter a valid date of birth";
    return "";
  },

  otp: (value = "") => {
    const v = value.trim();
    if (!v) return "OTP is required";
    if (!/^\d{6}$/.test(v)) return "OTP must be exactly 6 digits";
    return "";
  },

  requiredText: (label) => (value = "") => {
    if (!value.trim()) return `${label} is required`;
    return "";
  },

  password: (value = "") => {
    if (!value) return "Password is required";
    return "";
  },
};

// Runs a { field: validatorFn } map against a { field: value } object and
// returns a { field: errorString } map (empty string entries = valid).
export function validateAll(values, schema) {
  const errors = {};
  Object.keys(schema).forEach((field) => {
    errors[field] = schema[field](values[field]);
  });
  return errors;
}

export function hasErrors(errors) {
  return Object.values(errors).some((e) => e);
}
