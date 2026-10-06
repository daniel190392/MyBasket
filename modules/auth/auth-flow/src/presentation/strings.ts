import type { AuthErrorCode } from '../domain/errors';
import type { CredentialsFieldError } from '../domain/validation';

// Default language follows the design reference (Spanish).
export const loginStrings = {
  title: 'Inicia Sesión',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Password',
  submit: 'Ingresar',
  forgotPassword: 'Olvidé mi contraseña',
  signUpPrompt: '¿No tienes cuenta?',
  signUp: 'Regístrate',
  logoLabel: 'PantryHub',
  fieldErrors: {
    required: 'Este campo es obligatorio',
    'invalid-email': 'Ingresa un email válido',
  } satisfies Record<CredentialsFieldError, string>,
  submitErrors: {
    'invalid-credentials': 'Email o contraseña incorrectos',
    network: 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo',
    unknown: 'Algo salió mal. Inténtalo de nuevo',
  } satisfies Record<AuthErrorCode, string>,
} as const;
