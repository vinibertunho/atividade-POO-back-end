import express from 'express';
import * as controller from '../controllers/usuariosController.js';

const router = express.Router();

router.post('/usuarios', controller.criar);
router.get('/usuarios', controller.buscarTodos);
router.get('/usuarios/:id', controller.buscarPorId);
router.put('/usuarios/:id', controller.atualizar);
router.delete('/usuarios/:id', controller.deletar);

export default router;
