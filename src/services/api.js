import AsyncStorage from '@react-native-async-storage/async-storage';

// Defina EXPO_PUBLIC_API_URL no arquivo .env (veja .env.example) com o
// endereço do backend. NÃO use "localhost" para testar em celular físico ou
// emulador — localhost ali se refere ao próprio aparelho, não ao seu
// computador. Use o IP da sua máquina na rede local (ex: http://192.168.1.10:8080/api)
// ou a URL do backend já hospedado (ex: https://seu-backend.onrender.com/api).
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

const TOKEN_KEY = '@verdenovo:token';
const USUARIO_KEY = '@verdenovo:usuario';

let _tokenMemoria = null;
let _onUnauthorized = null;

// Decodificador base64 -> texto escrito à mão, sem depender de atob/Buffer
// (cujo suporte varia entre versões do Hermes, o motor JS do React Native).
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64UrlDecode(input) {
  const normalizado = input.replace(/-/g, '+').replace(/_/g, '/');
  let buffer = 0;
  let bits = 0;
  let output = '';
  for (let i = 0; i < normalizado.length; i++) {
    const char = normalizado[i];
    if (char === '=') break;
    const index = BASE64_CHARS.indexOf(char);
    if (index === -1) continue;
    buffer = (buffer << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xFF);
    }
  }
  return output;
}

function tokenExpirado(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(base64UrlDecode(payloadBase64));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
}

class ApiService {
  /** Permite que o AuthContext seja avisado quando o token expirar/for inválido (401). */
  setOnUnauthorized(callback) {
    _onUnauthorized = callback;
  }

  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (_tokenMemoria) headers.Authorization = `Bearer ${_tokenMemoria}`;
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    let response;
    try {
      response = await fetch(url, {
        headers: this.getHeaders(),
        ...options,
      });
    } catch (e) {
      throw new Error('Não foi possível conectar ao servidor. Verifique sua internet e o endereço configurado em EXPO_PUBLIC_API_URL.');
    }

    if (response.status === 401) {
      await this.logout();
      if (_onUnauthorized) _onUnauthorized();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let mensagem;
      try {
        mensagem = JSON.parse(errorText).message || `Erro ${response.status}`;
      } catch {
        mensagem = errorText || `Erro ${response.status}`;
      }
      throw new Error(mensagem);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    return { message: await response.text() };
  }

  async login(email, senha) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
    if (response.token) {
      _tokenMemoria = response.token;
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
    }
    return response;
  }

  async cadastrar(usuario) {
    return this.request('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify({
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
        nivelAcesso: 'USER',
      }),
    });
  }

  async logout() {
    _tokenMemoria = null;
    await AsyncStorage.multiRemove([TOKEN_KEY, USUARIO_KEY]);
  }

  async listarPontos() { return this.request('/pontos'); }
  async listarMeusPontos() { return this.request('/pontos/meus'); }

  isAuthenticated() {
    return !!_tokenMemoria && !tokenExpirado(_tokenMemoria);
  }

  /** Restaura a sessão salva (chamado uma vez ao abrir o app). */
  async restoreSession() {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (tokenExpirado(token)) {
      await this.logout();
      return null;
    }
    _tokenMemoria = token;
    const usuarioStr = await AsyncStorage.getItem(USUARIO_KEY);
    return usuarioStr ? JSON.parse(usuarioStr) : null;
  }
}

export const apiService = new ApiService();
export { API_BASE_URL };
