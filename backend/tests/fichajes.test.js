const { createCheckIn } = require('../src/controllers/fichajesControllers');
const pool = require('../src/database/conection');

jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

describe('Fichajes Controller - Testing Lógica de Fichajes', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: 2, rol_id: 3 } // Simulamos un TRABAJADOR
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createCheckIn', () => {
    test('Debe devolver 404 si el usuario intenta fichar en una empresa inactiva/inexistente', async () => {
      // Simulamos que la BD no encuentra empresa activa (rows vacío por el JOIN con is_active=true)
      pool.query.mockResolvedValueOnce({ rows: [] });

      await createCheckIn(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No perteneces a ninguna empresa" });
    });

    test('Debe devolver 409 si el usuario ya tiene un fichaje abierto', async () => {
      // 1ª BD: Encontramos la empresa activa
      pool.query.mockResolvedValueOnce({ rows: [{ empresa_id: 5 }] });
      
      // 2ª BD: Encontramos un fichaje sin hora_fin (fichaje abierto)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await createCheckIn(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Ya estas fichado" });
    });

    test('Debe registrar el fichaje correctamente si la empresa está activa y no hay fichajes previos', async () => {
      // 1ª BD: Empresa activa encontrada
      pool.query.mockResolvedValueOnce({ rows: [{ empresa_id: 5 }] });
      
      // 2ª BD: No hay fichajes abiertos (rows vacío)
      pool.query.mockResolvedValueOnce({ rows: [] });

      // 3ª BD: Se hace el INSERT y devuelve el registro
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 10, hora_inicio: '08:00:00', fecha: new Date(), usuario_id: 2, empresa_id: 5 }]
      });

      await createCheckIn(req, res);

      expect(pool.query.mock.calls[2][0]).toContain('INSERT INTO fichajes');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Usuario fichado correctamente"
      }));
    });
  });
});
