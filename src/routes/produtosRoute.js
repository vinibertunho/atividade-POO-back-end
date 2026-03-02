import express from 'express';
import * as controller from '../controllers/exemploController.js';

const router = express.Router();

router.post('/produtos', controller.criar);
router.get('/produtos', controller.buscarTodos);
router.get('/produtos/:id', controller.buscarPorId);
router.put('/e/produto:id', controller.atualizar);
router.delete('/produto/:id', controller.deletar);

export default router;
