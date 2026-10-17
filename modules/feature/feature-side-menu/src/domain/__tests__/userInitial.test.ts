import { userInitial } from '../userInitial';

describe('userInitial', () => {
  it('uses the first letter in upper case', () => {
    expect(userInitial('ana gómez')).toBe('A');
  });

  it('ignores the spaces before the name', () => {
    expect(userInitial('   Daniel')).toBe('D');
  });

  it('keeps an accented letter whole', () => {
    expect(userInitial('Álvaro')).toBe('Á');
  });

  it('does not split a character made of two code units', () => {
    expect(userInitial('😀 Pepe')).toBe('😀');
  });

  it.each([[''], ['   ']])('falls back to a question mark for "%s"', (name) => {
    expect(userInitial(name)).toBe('?');
  });
});
