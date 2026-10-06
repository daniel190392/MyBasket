import { validateCredentials, validateRegistration } from '../validation';

describe('validateCredentials', () => {
  it('accepts a well-formed email and a password', () => {
    expect(
      validateCredentials({ email: 'user@example.com', password: 'secret' })
    ).toEqual({});
  });

  it('requires both fields', () => {
    expect(validateCredentials({ email: '  ', password: '' })).toEqual({
      email: 'required',
      password: 'required',
    });
  });

  it('rejects a malformed email', () => {
    expect(
      validateCredentials({ email: 'not-an-email', password: 'secret' })
    ).toEqual({ email: 'invalid-email' });
  });

  it('ignores surrounding spaces in the email', () => {
    expect(
      validateCredentials({ email: ' user@example.com ', password: 'secret' })
    ).toEqual({});
  });

  it('rejects an email without a domain', () => {
    expect(validateCredentials({ email: 'user@', password: 'secret' })).toEqual(
      { email: 'invalid-email' }
    );
  });
});

describe('validateRegistration', () => {
  const validRegistration = {
    email: 'user@example.com',
    password: 'secret',
    confirmPassword: 'secret',
    displayName: 'Ada',
  };

  it('accepts a complete registration', () => {
    expect(validateRegistration(validRegistration)).toEqual({});
  });

  it('requires every field', () => {
    expect(
      validateRegistration({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '  ',
      })
    ).toEqual({
      email: 'required',
      password: 'required',
      confirmPassword: 'required',
      displayName: 'required',
    });
  });

  it('rejects a malformed email', () => {
    expect(
      validateRegistration({ ...validRegistration, email: 'not-an-email' })
    ).toEqual({ email: 'invalid-email' });
  });

  it('rejects a confirmation that differs from the password', () => {
    expect(
      validateRegistration({ ...validRegistration, confirmPassword: 'other' })
    ).toEqual({ confirmPassword: 'passwords-mismatch' });
  });
});
