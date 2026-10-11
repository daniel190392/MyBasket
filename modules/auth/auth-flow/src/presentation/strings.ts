import type { AuthErrorCode } from '../domain/errors';
import type {
  ConfirmationFieldError,
  CredentialsFieldError,
  RegistrationFieldError,
  ResetPasswordFieldError,
} from '../domain/validation';

// Default language follows the design reference (Spanish).
const submitErrors = {
  'invalid-credentials': 'Email o contraseña incorrectos',
  'email-already-in-use': 'Ya existe una cuenta con este email',
  'weak-password':
    'La contraseña debe tener al menos 8 caracteres, con mayúscula, minúscula y número',
  'invalid-code': 'El código es incorrecto',
  'expired-code': 'El código caducó. Solicita uno nuevo',
  'too-many-requests': 'Demasiados intentos. Inténtalo más tarde',
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

export const recoveryStrings = {
  title: 'Recupera tu contraseña',
  description:
    'Ingresa tu email y te enviaremos un código para crear una nueva contraseña',
  emailPlaceholder: 'Email',
  submit: 'Enviar código',
  backToSignIn: 'Volver a iniciar sesión',
  logoLabel: 'PantryHub',
  fieldErrors: loginStrings.fieldErrors,
  submitErrors,
} as const;

export const confirmationStrings = {
  title: 'Confirma tu email',
  description: 'Ingresa el código de 6 dígitos que enviamos a',
  codePlaceholder: 'Código',
  submit: 'Confirmar',
  resend: 'Reenviar código',
  resendIn: 'Reenviar código en',
  resentMessage: 'Te enviamos un nuevo código',
  backToSignIn: 'Volver a iniciar sesión',
  logoLabel: 'PantryHub',
  fieldErrors: {
    required: 'Este campo es obligatorio',
    'invalid-code-format': 'Ingresa el código de 6 dígitos',
  } satisfies Record<ConfirmationFieldError, string>,
  submitErrors,
} as const;

export const resetPasswordStrings = {
  title: 'Crea una nueva contraseña',
  description: 'Si existe una cuenta con este email, enviamos un código a',
  codePlaceholder: confirmationStrings.codePlaceholder,
  newPasswordPlaceholder: 'Nueva contraseña',
  confirmPasswordPlaceholder: 'Confirmar contraseña',
  submit: 'Cambiar contraseña',
  resend: confirmationStrings.resend,
  resendIn: confirmationStrings.resendIn,
  resentMessage: confirmationStrings.resentMessage,
  backToSignIn: 'Volver a iniciar sesión',
  logoLabel: 'PantryHub',
  fieldErrors: {
    ...confirmationStrings.fieldErrors,
    'weak-password': submitErrors['weak-password'],
    'passwords-mismatch': 'Las contraseñas no coinciden',
  } satisfies Record<ResetPasswordFieldError, string>,
  submitErrors,
} as const;
