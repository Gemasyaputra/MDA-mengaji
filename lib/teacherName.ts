const PREFIX_PATTERN = /^ustadz(ah)?\s+/i;

/**
 * Formats a teacher's display name with an Ustadz/Ustadzah prefix based on gender.
 * Strips any existing manually-typed prefix first so it's never doubled.
 */
export function formatTeacherName(name: string | null | undefined, jenisKelamin: string | null | undefined): string {
  if (!name) return name ?? '';
  const bare = name.replace(PREFIX_PATTERN, '').trim();
  if (jenisKelamin === 'LAKI-LAKI') return `Ustadz ${bare}`;
  if (jenisKelamin === 'PEREMPUAN') return `Ustadzah ${bare}`;
  return bare;
}

/**
 * Applies formatTeacherName over an array of query result rows in place,
 * reading `genderField` and rewriting `nameField`.
 */
export function applyTeacherNameFormatting(
  rows: Record<string, any>[],
  nameField: string = 'teacher_name',
  genderField: string = 'teacher_jenis_kelamin',
): Record<string, any>[] {
  for (const row of rows) {
    if (row && row[nameField]) {
      row[nameField] = formatTeacherName(row[nameField], row[genderField]);
    }
  }
  return rows;
}
