/** Keep aligned with backend app/core/password_policy.py. */
export const PASSWORD_RULES = 'Mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
export const PASSWORD_PATTERN = String.raw`(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\p{Nd})(?=.*[\p{P}\p{S}]).{10,72}`;
export const INITIAL_PASSWORD_PATTERN = `1234|${PASSWORD_PATTERN}`;

export function passwordPolicyError(value: string): string | null {
  if (new TextEncoder().encode(value).length > 72) return 'La contraseña no puede superar 72 bytes.';
  return new RegExp(`^(?:${PASSWORD_PATTERN})$`, 'u').test(value) ? null : PASSWORD_RULES;
}
