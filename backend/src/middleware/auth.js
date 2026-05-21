import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const header = req.header('Authorization') || '';
  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No esta autorizado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'programacion3-1C-2026');
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'No esta autorizado.' });
  }
};
