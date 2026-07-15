import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface TeacherTokenPayload {
  userId: number;
  email: string;
  role: string;
  name?: string;
}

export function signTeacherToken(payload: TeacherTokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyTeacherToken(token: string | null | undefined): TeacherTokenPayload | null {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TeacherTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Resolves the numeric teacher id from a signed token only. Deliberately does NOT
 * accept a raw client-supplied teacherId as a fallback — that pattern let any caller
 * impersonate any teacher by simply passing `?teacherId=<n>` with no token at all.
 */
export function resolveTeacherId(token: string | null | undefined): number | null {
  const payload = verifyTeacherToken(token);
  if (!payload?.userId) return null;
  const id = Number(payload.userId);
  return Number.isFinite(id) ? id : null;
}
