const { createUser } = require('../src/controllers/usuariosControllers');
const pool = require('../src/database/conection');
const nodemailer = require('nodemailer');

jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

// Mockeamos nodemailer para no enviar correos de verdad en los tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue(true)
  })
}));

describe('Usuarios Controller - Testing de Lógica', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createUser', () => {
    beforeEach(() => {
      req = {
        user: { id: 1, rol_id: 1 }, // Propietario
        body: { nombre: 'Nuevo', apellidos: 'Trabajador', email: 'nuevo@test.com', id_empresa: '5', dni: '12345678A' }
      };
    });

    test('Debe devolver 400 si el correo electrónico ya existe en la base de datos', async () => {
      // Simulamos que el email ya está registrado
      pool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Este usuario ya existe" });
    });

    test('Debe devolver 403 si se intenta crear en una empresa inactiva o que no le pertenece', async () => {
      // 1ª BD: Email no existe (pasa el filtro)
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // 2ª BD: La empresa está inactiva o no es del dueño (JOIN devuelve vacío)
      pool.query.mockResolvedValueOnce({ rows: [] });

      await createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "No tienes permisos" });
    });
  });
});
