import { validateCredentials } from '../validation';

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
});
