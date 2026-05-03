const { createRequestOfHollidays, getHollidaysForAdminsAndOwners } = require('../src/controllers/vacacionesControllers');
const pool = require('../src/database/conection');

jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

describe('Vacaciones Controller - Testing de Lógica', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createRequestOfHollidays', () => {
    beforeEach(() => {
      req = {
        user: { id: 2 },
        body: { fecha_inicio: '2026-07-01', fecha_fin: '2026-07-15' }
      };
    });

    test('Debe devolver 409 si ya tiene vacaciones aprobadas que se solapan', async () => {
      // Simulamos que la BD encuentra vacaciones aprobadas en esas fechas
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await createRequestOfHollidays(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Ya tienes vacaciones aprobadas en/durante las fechas seleccionadas" });
    });
  });

  describe('getHollidaysForAdminsAndOwners', () => {
    beforeEach(() => {
      req = {
        user: { id: 1, rol_id: 1 }, // Propietario
        params: { empresa_id: '5' }
      };
    });

    test('Debe devolver 403 si un TRABAJADOR intenta ver todas las vacaciones', async () => {
      req.user.rol_id = 3; // Cambiamos a trabajador
      await getHollidaysForAdminsAndOwners(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "No tienes permisos" });
    });

    test('Debe devolver 403 si el admin no pertenece a la empresa o si la empresa está inactiva', async () => {
      // BD no devuelve resultados en la comprobación de empresa activa
      pool.query.mockResolvedValueOnce({ rows: [] });

      await getHollidaysForAdminsAndOwners(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "No perteneces a esta empresa" });
    });
  });
});
