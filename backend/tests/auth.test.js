const { login } = require('../src/controllers/authControllers');
const pool = require('../src/database/conection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mockeamos las dependencias externas para que no hagan su trabajo real durante el test
jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));
jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('Auth Controller - Testing Lógica de Login', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: { email: 'trabajador@test.com', password: 'password123' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('login', () => {
    test('Debe bloquear a un TRABAJADOR si su empresa está inactiva', async () => {
      // 1ª BD: Encontramos al usuario (rol 3 = trabajador)
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 2, email: 'trabajador@test.com', password: 'hash', verified: true, password_changed: true, rol_id: 3 }]
      });

      // Bcrypt dice que la contraseña es correcta
      bcrypt.compare.mockResolvedValueOnce(true);

      // 2ª BD: La comprobación EXTRA de empresa inactiva. Devolvemos is_active = false
      pool.query.mockResolvedValueOnce({
        rows: [{ is_active: false }]
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Tu empresa no está activa. Contacta con tu administrador." });
      // Aseguramos que NO se genera token
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    test('Debe dejar entrar a un TRABAJADOR si su empresa está activa', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 2, nombre: 'Juan', email: 'trabajador@test.com', password: 'hash', verified: true, password_changed: true, rol_id: 3 }]
      });

      bcrypt.compare.mockResolvedValueOnce(true);

      // Comprobación EXTRA: La empresa está activa (is_active = true)
      pool.query.mockResolvedValueOnce({
        rows: [{ is_active: true }]
      });

      // Simulamos el token generado
      jwt.sign.mockReturnValue('fake_jwt_token');

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Login correcto",
        token: 'fake_jwt_token'
      }));
    });
  });
});
