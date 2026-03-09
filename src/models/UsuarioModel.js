import prisma from "../utils/prismaClient.js";

export default class UsuarioModel {
  constructor({
    id = null,
    nome,
    telefone,
    email,
    cpf,
    cep,
    logradouro,
    bairro,
    localidade,
    uf,
    ativo = true,
    pedidos = [],
  } = {}) {
    this.id = id;
    this.nome = nome;
    this.telefone = telefone;
    this.email = email;
    this.cpf = cpf;
    this.cep = cep;
    this.logradouro = logradouro;
    this.bairro = bairro;
    this.localidade = localidade;
    this.uf = uf;
    this.ativo = ativo;
    this.pedidos = pedidos;
  }

  validar() {
    if (!this.nome || this.nome.length < 3 || this.nome.length > 100) {
      throw new Error("O nome deve ter entre 3 e 100 caracteres.");
    }
    if (!this.telefone) throw new Error('O campo "telefone" é obrigatório.');
    if (!this.email) throw new Error('O campo "email" é obrigatório.');

    const cpfLimpo = this.cpf ? String(this.cpf).replace(/\D/g, "") : "";
    if (cpfLimpo.length !== 11) {
      throw new Error("O CPF deve conter exatamente 11 dígitos.");
    }

    const cepLimpo = this.cep ? String(this.cep).replace(/\D/g, "") : "";
    if (cepLimpo.length !== 8) {
      throw new Error("O CEP deve conter exatamente 8 dígitos.");
    }
  }

  async preencherEnderecoPorCep() {
    if (!this.cep) return;
    const cepLimpo = String(this.cep).replace(/\D/g, "");

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const dados = await resposta.json();

      if (dados.erro) throw new Error("CEP informado não foi encontrado.");

      this.logradouro = dados.logradouro || null;
      this.bairro = dados.bairro || null;
      this.localidade = dados.localidade || null;
      this.uf = dados.uf || null;
    } catch (error) {
      throw new Error("Erro ao buscar endereço: " + error.message);
    }
  }

  async buscarCoordenadas() {
    if (!this.localidade) return null;

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(this.localidade)}&count=1&language=pt&countryCode=BR`;
      const resposta = await fetch(url);
      const data = await resposta.json();

      if (!data.results || data.results.length === 0) return null;

      return {
        latitude: data.results[0].latitude,
        longitude: data.results[0].longitude,
      };
    } catch (error) {
      console.error("Erro Geocoding:", error.message);
      return null;
    }
  }

  // --- CLIMA (Open-Meteo) ---
  async buscarClimaAtual() {
    const coords = await this.buscarCoordenadas();
    if (!coords)
      return { erro: "Não foi possível obter coordenadas para o clima." };

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`;
      const resposta = await fetch(url);
      const data = await resposta.json();

      if (!data.current_weather) return null;

      return this.interpretarClima(
        data.current_weather.temperature,
        data.current_weather.weathercode,
      );
    } catch (error) {
      console.error("Erro ao buscar clima:", error.message);
      return null;
    }
  }

  interpretarClima(temp, code) {
    const chove = code >= 51;
    const quente = temp >= 28;
    const frio = temp <= 18;

    let sugestao = "Hoje o dia está perfeito para qualquer opção do cardápio!";
    if (chove) sugestao = "Está chovendo, destaque promoções para Delivery!";
    else if (quente)
      sugestao = "O dia está quente, destaque sorvetes e bebidas geladas!";
    else if (frio) sugestao = "Está frio, destaque cafés e lanches quentes!";

    return {
      temperatura: temp,
      codigoTempo: code,
      chove,
      quente,
      frio,
      sugestao,
    };
  }

  // --- OPERAÇÕES DE BANCO DE DADOS ---
  async criar() {
    this.validar();
    await this.preencherEnderecoPorCep();

    return prisma.usuario.create({
      data: {
        nome: this.nome,
        telefone: this.telefone,
        email: this.email,
        cpf: this.cpf,
        cep: String(this.cep),
        logradouro: this.logradouro,
        bairro: this.bairro,
        localidade: this.localidade,
        uf: this.uf,
        ativo: this.ativo,
      },
    });
  }

  async atualizar() {
    this.validar();
    if (this.cep) await this.preencherEnderecoPorCep();

    return prisma.usuario.update({
      where: { id: this.id },
      data: {
        nome: this.nome,
        telefone: this.telefone,
        email: this.email,
        cpf: this.cpf,
        cep: String(this.cep),
        logradouro: this.logradouro,
        bairro: this.bairro,
        localidade: this.localidade,
        uf: this.uf,
        ativo: this.ativo,
      },
    });
  }

  async deletar() {
    const temPedidoAberto = this.pedidos.some((p) => p.status === "ABERTO");
    if (temPedidoAberto) {
      throw new Error("Não é possível deletar usuário com pedido em aberto.");
    }
    return prisma.usuario.delete({ where: { id: this.id } });
  }

  static async buscarTodos(filtros = {}) {
    const where = {};

    if (filtros.nome)
      where.nome = { contains: filtros.nome, mode: "insensitive" };
    if (filtros.email)
      where.email = { contains: filtros.email, mode: "insensitive" };
    if (filtros.cpf) where.cpf = { contains: filtros.cpf };

    return prisma.usuario.findMany({
      where,
      orderBy: { id: "asc" },
      include: { pedidos: true },
    });
  }

  static async buscarPorId(id) {
    const data = await prisma.usuario.findUnique({
      where: { id },
      include: { pedidos: true },
    });
    if (!data) return null;
    return new UsuarioModel(data);
  }
}
