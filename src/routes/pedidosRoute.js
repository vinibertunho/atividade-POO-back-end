import express from "express"

import {criarPedido,listarPedidos,buscarPedido,adicionarItem,cancelarPedido,atualizarPedido,deletarPedido} from "../controllers/pedidosController.js"

const router = express.Router()

router.post("/", criarPedido)

router.get("/", listarPedidos)

router.get("/:id", buscarPedido)

router.post("/item", adicionarItem)

router.put("/:id/cancelar", cancelarPedido)

router.put("/:id", atualizarPedido)

router.delete("/:id", deletarPedido)

export default router
