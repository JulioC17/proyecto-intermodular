const { deleteCompany, restoreCompany } = require('../src/controllers/empresasControllers');
const pool = require('../src/database/conection');

// Mockeamos la base de datos para no tocar datos reales durante los tests
jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

describe('Empresas Controller - Testing Lógica Soft Delete', () => {
  let req, res;

  beforeEach(() => {
    // Limpiamos los mocks antes de cada test para evitar colisiones
    jest.clearAllMocks();

    // Simulamos la request (lo que envía el front)
    req = {
      user: { id: 1, rol_id: 1 }, // Simulamos un Propietario (rol_id: 1)
      params: { id_empresa: '5' } // Simulamos que queremos borrar la empresa 5
    };

    // Simulamos la response (lo que devuelve Express)
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('deleteCompany', () => {
    test('Debe devolver error 400 si el usuario no es dueño de la empresa', async () => {
      // Simulamos que la BD no encuentra relación entre el usuario y la empresa
      pool.query.mockResolvedValueOnce({ rows: [] });

      await deleteCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "No puedes modificar esta empresa" });
    });

    test('Debe hacer un UPDATE is_active=false y devolver 200 si es el dueño', async () => {
      // 1ª llamada a la BD: comprobar propiedad (devuelve OK)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      
      // 2ª llamada a la BD: hacer el UPDATE (simulamos que devuelve la empresa modificada)
      pool.query.mockResolvedValueOnce({ 
          rows: [{ id: 5, nombre: 'Mi Empresa SL', is_active: false }] 
      });

      await deleteCompany(req, res);

      // Comprobamos que la consulta enviada a la BD realmente contenía la instrucción de UPDATE
      expect(pool.query.mock.calls[1][0]).toContain('UPDATE empresas SET is_active = false');
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          message: "Empresa eliminada correctamente"
      }));
    });
  });

  describe('restoreCompany', () => {
    test('Debe hacer un UPDATE is_active=true y devolver 200 si es el dueño', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Es dueño
      pool.query.mockResolvedValueOnce({ 
          rows: [{ id: 5, nombre: 'Mi Empresa SL', is_active: true }] 
      });

      await restoreCompany(req, res);

      // Comprobamos que envía la consulta correcta a Postgres
      expect(pool.query.mock.calls[1][0]).toContain('UPDATE empresas SET is_active = true');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
