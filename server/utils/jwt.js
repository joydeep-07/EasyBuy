import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'easybuy_super_secure_jwt_secret_key_2026_987654321';
const COOKIE_EXPIRE_DAYS = 7;

export const generateToken = (id, role = 'CUSTOMER') => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: `${COOKIE_EXPIRE_DAYS}d`,
  });
};

export const setAuthCookie = (res, token, name = 'token') => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

export const clearAuthCookie = (res, name = 'token') => {
  res.cookie(name, '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
