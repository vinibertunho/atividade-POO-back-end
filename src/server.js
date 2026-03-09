import express from "express";
import "dotenv/config";
import usuarioRoute from "../src/routes/usuarioRoute.js";
import pedidosRoute from "../src/routes/pedidosRoute.js";
import produtosRoute from "../src/routes/produtosRoute.js";
import itemPedidoRoute from "../src/routes/itemPedidoRoute.js";
import autenticarApiKey from "./utils/ApiKey.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🚀 API funcionando");
});

// GET /api/cep/:cep
app.get("/api/cep/:cep", async (req, res) => {
  const { cep } = req.params;

  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return res.status(400).json({
      success: false,
      message: "Formato de CEP inválido. Use 8 dígitos.",
    });
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

    if (!resposta.ok) throw new Error("Falha na comunicação com o ViaCEP");

    const dados = await resposta.json();

    if (dados.erro) {
      return res.status(404).json({
        success: false,
        message: "CEP não encontrado no HoloNet 🔍",
      });
    }

    res.json({ success: true, data: dados });
  } catch (error) {
    console.error("Erro na busca de CEP:", error.message);
    res.status(500).json({
      success: false,
      message: "Erro interno ao buscar o endereço.",
    });
  }
});

// Rotas
app.use("/api", autenticarApiKey, usuarioRoute);
app.use("/api", pedidosRoute);
app.use("/api", produtosRoute);
app.use("/api", itemPedidoRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
