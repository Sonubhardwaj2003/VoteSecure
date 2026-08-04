import { useCallback, useState } from "react";
import { validateAll, hasErrors } from "../utils/validators";

/**
 * Small reusable form-state hook: tracks values/errors/touched, validates
 * a field live as it changes (once it has been touched), and exposes
 * validateForm() to run everything at once on submit.
 *
 * schema: { fieldName: (value) => errorStringOrEmpty }
 */
export default function useFormValidation(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setValues((v) => ({ ...v, [name]: value }));
      setErrors((err) =>
        touched[name] && schema[name] ? { ...err, [name]: schema[name](value) } : err
      );
    },
    [schema, touched]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((t) => ({ ...t, [name]: true }));
      setErrors((err) =>
        schema[name] ? { ...err, [name]: schema[name](values[name]) } : err
      );
    },
    [schema, values]
  );

  const validateForm = useCallback(() => {
    const newErrors = validateAll(values, schema);
    setErrors(newErrors);
    setTouched(Object.keys(schema).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return !hasErrors(newErrors);
  }, [values, schema]);

  const reset = useCallback(
    (next = initialValues) => {
      setValues(next);
      setErrors({});
      setTouched({});
    },
    [initialValues]
  );

  return { values, errors, touched, handleChange, handleBlur, validateForm, setValues, reset };
}
