/**
 * Utilitários para gerenciamento de token JWT no cliente
 */

/**
 * Decodifica um token JWT sem verificar a assinatura
 * Útil para ler o payload e verificar expiração no cliente
 */
function decodeToken(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64 URL-safe: substitui - por + e _ por /, e adiciona padding se necessário
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    // Adiciona padding se necessário
    while (base64.length % 4) {
      base64 += "=";
    }
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se um token JWT está expirado
 */
export function isTokenExpired(token) {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp está em segundos, Date.now() está em milissegundos
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Obtém o token do storage (sessionStorage ou localStorage)
 */
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token") || localStorage.getItem("token") || null;
}

/**
 * Verifica se existe um token válido e não expirado
 */
export function hasValidToken() {
  if (typeof window === "undefined") return false;
  const token = getStoredToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Limpa o token e dados do usuário do storage
 */
export function clearAuthData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
}

/**
 * Redireciona para a página de login e limpa os dados de autenticação
 */
export function redirectToLogin(router) {
  clearAuthData();
  if (router) {
    router.replace("/login");
  } else if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Função helper para fazer requisições fetch com tratamento automático de token expirado
 * Intercepta respostas 401 e redireciona para login
 */
export async function apiFetch(url, options = {}) {
  const token = getStoredToken();
  
  // Adiciona o token ao header se existir
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se receber 401 (não autorizado), o token pode estar expirado
    if (response.status === 401) {
      clearAuthData();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Token expirado ou inválido");
    }

    return response;
  } catch (error) {
    // Se for erro de token expirado, já foi tratado acima
    if (error.message === "Token expirado ou inválido") {
      throw error;
    }
    // Outros erros são repassados
    throw error;
  }
}

