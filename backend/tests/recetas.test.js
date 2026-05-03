const { createRecipe, getRecipes } = require('../src/controllers/recetasControllers');
const pool = require('../src/database/conection');

jest.mock('../src/database/conection', () => ({
  query: jest.fn()
}));

describe('Recetas Controller - Testing de Lógica', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createRecipe', () => {
    beforeEach(() => {
      req = {
        user: { id: 1, rol_id: 1 }, // Propietario
        body: { nombre: 'Tortilla', ingredientes: 'Huevo, Patata', preparacion: 'Mezclar y freir' },
        params: { empresa_id: '5' }, query: {}
      };
    });

    test('Debe bloquear la creación si el usuario es TRABAJADOR', async () => {
      req.user.rol_id = 3; // Cambiamos a trabajador
      await createRecipe(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "No tienes permisos" });
    });
  });

  describe('getRecipes', () => {
    beforeEach(() => {
      req = {
        user: { id: 2, rol_id: 3 }, // Trabajador (los trabajadores SÍ pueden ver recetas)
        params: { empresa_id: '5' }, query: {}
      };
    });

    test('Debe devolver 404 si la empresa no tiene recetas', async () => {
      // 1ª BD: Pertenece a la empresa (sí)
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      
      // 2ª BD: Busca las recetas (devuelve vacío)
      pool.query.mockResolvedValueOnce({ rows: [] });

      await getRecipes(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No hay recetas" });
    });
  });
});
