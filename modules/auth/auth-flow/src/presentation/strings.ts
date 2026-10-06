import type { AuthErrorCode } from '../domain/errors';
import type {
  CredentialsFieldError,
  RegistrationFieldError,
} from '../domain/validation';

// Default language follows the design reference (Spanish).
const submitErrors = {
  'invalid-credentials': 'Email o contraseña incorrectos',
  'email-already-in-use': 'Ya existe una cuenta con este email',
  network: 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo',
  unknown: 'Algo salió mal. Inténtalo de nuevo',
} satisfies Record<AuthErrorCode, string>;

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
  submitErrors,
} as const;

export const registerStrings = {
  title: 'Crea tu cuenta',
  emailPlaceholder: 'Email',
  passwordPlaceholder: 'Contraseña',
  confirmPasswordPlaceholder: 'Confirmar contraseña',
  displayNamePlaceholder: 'Nombre',
  submit: 'Registrarse',
  signInPrompt: '¿Ya tienes cuenta?',
  signIn: 'Inicia sesión',
  logoLabel: 'PantryHub',
  fieldErrors: {
    ...loginStrings.fieldErrors,
    'passwords-mismatch': 'Las contraseñas no coinciden',
  } satisfies Record<RegistrationFieldError, string>,
  submitErrors,
} as const;
