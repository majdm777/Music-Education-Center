/** The values React accepts for `aria-invalid`. */
export type AriaInvalid = boolean | 'false' | 'true' | 'grammar' | 'spelling';

/**
 * Reports whether a control should show the error treatment. `aria-invalid`
 * also accepts `grammar` and `spelling`, so every value except `false` or an
 * absent one means the field is invalid. The explicit `invalid` prop wins when
 * `aria-invalid` is absent.
 */
export function isControlInvalid(
  invalid: boolean | undefined,
  ariaInvalid: AriaInvalid | undefined,
): boolean {
  if (ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== 'false') {
    return true;
  }

  return invalid === true;
}
