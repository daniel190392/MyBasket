const UNKNOWN_USER_INITIAL = '?';

// The avatar shows the first letter of the name; a blank name still needs a
// glyph so the avatar does not look broken.
export function userInitial(userName: string): string {
  const firstCharacter = Array.from(userName.trim())[0];
  return firstCharacter ? firstCharacter.toUpperCase() : UNKNOWN_USER_INITIAL;
}
