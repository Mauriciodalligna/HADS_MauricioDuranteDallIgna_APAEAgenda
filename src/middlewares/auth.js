import jwt from "jsonwebtoken";

export function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
}

export function verifyAuthFromHeaders(headers) {
  const authHeader = headers.get?.("authorization") || headers["authorization"];
  const token = extractBearerToken(authHeader);
  if (!token) {
    return { ok: false, status: 401, error: "Token ausente" };
  }
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret);
    return { ok: true, payload };
  } catch (error) {
    return { ok: false, status: 401, error: "Token inválido" };
  }
}

export function verifyToken(token) {
  if (!token) {
    return { ok: false, status: 401, error: "Token ausente" };
  }
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret);
    return { ok: true, payload };
  } catch (error) {
    return { ok: false, status: 401, error: "Token inválido" };
  }
}

export function ensureRole(headers, allowedRoles = []) {
  const auth = verifyAuthFromHeaders(headers);
  if (!auth.ok) return auth;
  if (allowedRoles.length === 0) return auth;
  const userRole = auth.payload?.perfil;
  if (!allowedRoles.includes(userRole)) {
    return { ok: false, status: 403, error: "Acesso negado" };
  }
  return auth;
}

// Função authenticate para compatibilidade com as rotas
export function authenticate(req) {
  const authHeader = req.headers?.get?.("authorization") || req.headers?.["authorization"];
  const token = extractBearerToken(authHeader);
  
  if (!token) {
    return { error: "Token ausente", status: 401 };
  }
  
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    const payload = jwt.verify(token, secret);
    return { user: payload };
  } catch (error) {
    return { error: "Token inválido", status: 401 };
  }
}

// Função authorize para verificar roles
export function authorize(user, allowedRoles = []) {
  if (!user) {
    return { error: "Usuário não autenticado", status: 401 };
  }
  
  if (allowedRoles.length === 0) {
    return null; // Sem restrições de role
  }
  
  const userRole = user.perfil || user.roles?.[0];
  if (!allowedRoles.includes(userRole)) {
    return { error: "Acesso negado", status: 403 };
  }
  
  return null; // Autorizado
}


