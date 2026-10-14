import {
  validateCredentials,
  validateConfirmationCode,
  validateRecovery,
  validateRegistration,
  validateResetPassword,
} from '../validation';

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
    password: 'Secret123',
    confirmPassword: 'Secret123',
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

  it('rejects a password that does not meet the policy', () => {
    expect(
      validateRegistration({
        ...validRegistration,
        password: 'secret',
        confirmPassword: 'secret',
      })
    ).toEqual({ password: 'weak-password' });
  });

  it('rejects a confirmation that differs from the password', () => {
    expect(
      validateRegistration({ ...validRegistration, confirmPassword: 'other' })
    ).toEqual({ confirmPassword: 'passwords-mismatch' });
  });
});

describe('validateRecovery', () => {
  it('accepts a well-formed email', () => {
    expect(validateRecovery('demo@mybasket.test')).toEqual({});
  });

  it('requires the email', () => {
    expect(validateRecovery('   ')).toEqual({ email: 'required' });
  });

  it('rejects a malformed email', () => {
    expect(validateRecovery('not-an-email')).toEqual({
      email: 'invalid-email',
    });
  });
});

describe('validateConfirmationCode', () => {
  it('accepts a code of six digits', () => {
    expect(validateConfirmationCode('123456')).toEqual({});
  });

  it('ignores the spaces around the code', () => {
    expect(validateConfirmationCode(' 123456 ')).toEqual({});
  });

  it('requires the code', () => {
    expect(validateConfirmationCode('   ')).toEqual({ code: 'required' });
  });

  it.each(['12345', '1234567', '12345a', 'abcdef'])('rejects %s', (code) => {
    expect(validateConfirmationCode(code)).toEqual({
      code: 'invalid-code-format',
    });
  });
});

describe('validateResetPassword', () => {
  const validInput = {
    code: '123456',
    newPassword: 'Newpass1',
    confirmPassword: 'Newpass1',
  };

  it('accepts a code and a password that meets the policy', () => {
    expect(validateResetPassword(validInput)).toEqual({});
  });

  it('requires every field', () => {
    expect(
      validateResetPassword({ code: '', newPassword: '', confirmPassword: '' })
    ).toEqual({
      code: 'required',
      newPassword: 'required',
      confirmPassword: 'required',
    });
  });

  it('rejects a malformed code', () => {
    expect(validateResetPassword({ ...validInput, code: '12ab' })).toEqual({
      code: 'invalid-code-format',
    });
  });

  it.each([
    ['too short', 'Ab1'],
    ['without lowercase', 'NEWPASS12'],
    ['without uppercase', 'newpass12'],
    ['without a digit', 'Newpasswd'],
  ])('rejects a password %s', (_reason, newPassword) => {
    expect(
      validateResetPassword({
        ...validInput,
        newPassword,
        confirmPassword: newPassword,
      })
    ).toEqual({ newPassword: 'weak-password' });
  });

  it('rejects a confirmation that differs from the password', () => {
    expect(
      validateResetPassword({ ...validInput, confirmPassword: 'Other1234' })
    ).toEqual({ confirmPassword: 'passwords-mismatch' });
  });
});
