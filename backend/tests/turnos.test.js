const { createShift, assignShiftToUser } = require('../src/controllers/turnosControllers');
const pool = require('../src/database/conection');

jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

describe('Turnos Controller - Testing de Seguridad y Reglas', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createShift', () => {
    beforeEach(() => {
      req = {
        user: { id: 1, rol_id: 1 },
        body: { nombre: 'Mañana', hora_inicio: '08:00', hora_fin: '16:00', empresa_id: 5 }
      };
    });

    test('Debe devolver 404 si la empresa donde se quiere crear el turno está inactiva o no es del usuario', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // Simula que la consulta del JOIN falla

      await createShift(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No puedes hacer cambios en esta empresa" });
    });
  });

  describe('assignShiftToUser', () => {
    beforeEach(() => {
      req = {
        user: { id: 1, rol_id: 1 },
        params: { empresa_id: '5', turno_id: '10' },
        body: { usuario_id: 2, fecha: '2026-05-10' }
      };
    });

    test('Debe devolver 409 si se intenta asignar el mismo turno en la misma fecha al trabajador', async () => {
      // 1ª BD: Verifica turno (existe)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // 2ª BD: Verifica que el requester es dueño (sí)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // 3ª BD: Verifica que el usuario destino pertenece a la empresa (sí)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      
      // 4ª BD: Verifica duplicados (encuentra uno)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      await assignShiftToUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "Este usuario ya tiene asignado este turno, en la misma fecha" });
    });
  });
});
