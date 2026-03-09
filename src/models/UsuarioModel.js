import prisma from '../utils/prismaClient.js';

export default class UsuarioModel {
    constructor({ id = null, nome, telefone, email, cpf, cep, ativo = true } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.cep = cep;
        this.ativo = ativo;
    }

    async preencherEnderecoPorCep() {
        if (!this.cep) return;

        const cepLimpo = this.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const dados = await resposta.json();

            if (!dados.erro) {
                this.logradouro = dados.logradouro;
                this.bairro = dados.bairro;
                this.localidade = dados.localidade;
                this.uf = dados.uf;
            }
        } catch (error) {
            console.error('Erro ao buscar CEP no Model:', error.message);
        }
    }

    async criar() {
        const preencherEnderecoPorCep = async (cep) => {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            return data.erro ? null : data;
        };

        const { nome, telefone, email, cpf, cep } = req.body;

        if (!nome || nome.length < 3 || nome.length > 100)
            return res.status(400).json({
                error: 'O campo "nome" é obrigatório! e deve ter no minimo 3 caracteres e no máximo 100 caracteres',
            });
        if (!telefone) return res.status(400).json({ error: 'O campo "telefone" é obrigatório!' });
        if (!email) return res.status(400).json({ error: 'O campo "email" é obrigatório!' });
        if (!cpf || cpf.length !== 11)
            return res
                .status(400)
                .json({ error: 'O campo "cpf" é obrigatório! E deve conter 11 digitos' });
        if (!cep || cep.length !== 9)
            return res
                .status(400)
                .json({ error: 'O campo "cep" é obrigatório! E deve conter 8 digitos' });

        let endereco = {};
        if (cep) {
            endereco = await preencherEnderecoPorCep(cep);
            if (!endereco) return res.status(400).json({ error: true, message: 'CEP inválido.' });
        }

        await this.preencherEnderecoPorCep();

        return prisma.usuario.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
            },
        });
    }

    async atualizar() {
        await this.preencherEnderecoPorCep();

        return prisma.usuario.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
            },
        });
    }

    async deletar() {
        return prisma.usuario.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.telefone) where.telefone = { contains: filtros.telefone, mode: 'insensitive' };
        if (filtros.email) where.email = { contains: filtros.email, mode: 'insensitive' };
        if (filtros.cpf) where.cpf = { contains: filtros.cpf, mode: 'insensitive' };
        if (filtros.cep) where.cep = { contains: filtros.cep, mode: 'insensitive' };

        return prisma.usuario.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.usuario.findUnique({ where: { id } });
        if (!data) return null;
        return new UsuarioModel(data);
    }

    async buscarCoordenadas() {
        if (!this.localidade) return null;

        try {
            const respostaGeo = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${this.localidade}&count=1&language=pt&countryCode=BR`,
            );
            const data = await respostaGeo.json();

            if (!data.results || data.results.length === 0) return null;

            const { latitude, longitude } = data.results[0];

            return { latitude, longitude };
        } catch (error) {
            console.error('Erro na Geocoding API', error);
            return null;
        }
    }

    async buscarClima(coordenadas) {
        if (!coordenadas || !coordenadas.latitude || !coordenadas.longitude) {
            console.error(`Coordenadas são fornecidas para buscarClima`);
        }

        try {
            const respostaClima = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&current_weather=true`,
            );

            const data = await respostaClima.json();

            if (!data.current_weather) {
                console.error(`Estrutura da API inesperada:`, data || 'Desconhecido');
            }

            const temperaturaAtual = data.current_weather.temperature;
            const codigoDoTempo = data.current_weather.weathercode;

            return { codigoDoTempo, temperaturaAtual };
        } catch (error) {
            console.error('Erro ao buscar clima por localidade:', error.message);
            return null;
        }
    }

    async buscarClimaPorLocalidade() {
        if (!this.localidade) {
            console.error(`Localidade não definida`);
            return null;
        }

        try {
            const coordenadas = await this.buscarCoordenadas();

            if (!coordenadas || !coordenadas.latitude || !coordenadas.longitude) {
                console.error('Não foi possível obter as coordenadas para ' + this.localidade);
                return null;
            }

            const dados = await this.buscarClima(coordenadas);
            if (!dados) return null;

            return await this.interpretarClima(dados.temperaturaAtual, dados.codigoDoTempo);
        } catch (error) {
            console.error('Erro no fluxo buscarClimaPorLocalidade:', error.message);
            return null;
        }
    }

    async interpretarClima(temperaturaAtual, codigoDoTempo) {
        const chove = codigoDoTempo >= 51;
        const quente = temperaturaAtual >= 28;
        const frio = temperaturaAtual <= 18;

        let sugestao = 'Ótimo dia para fazer um pedido!';

        if (chove) {
            sugestao = 'Está chovendo, destaque promoções para Delivery!';
        } else if (quente) {
            sugestao = 'O dia está quente, destaque ofertas de sorvetes e bebidas geladas!';
        } else if (frio) {
            sugestao = 'Está frio, destaque cafés e lanches quentes!';
        } else {
            sugestao =
                'Hoje o dia está perfeito para qualquer opção do nosso cardápio, destaque ofertas de combos da casa!';
        }

        return {
            temperatura: temperaturaAtual,
            weathercode: codigoDoTempo,
            chove: chove,
            quente: quente,
            frio: frio,
            sugestao: sugestao,
        };
    }
}

async function executaTeste() {
    console.log('Iniciando Teste...');

    const usuario = new UsuarioModel({
        nome: 'Cliente Teste',
        cep: '13276-520',
    });

    try {
        console.log('Buscando Endereço (ViaCEP)...\n');
        await usuario.preencherEnderecoPorCep();
        console.log(`Localidade: ${usuario.localidade} - ${usuario.uf}`);

        console.log('Buscando Clima (Open-Meteo)...\n');
        const dadosClima = await usuario.buscarClimaPorLocalidade();

        if (dadosClima) {
            console.log(dadosClima, "\n");
        } else {
            console.log('Falha: O clima retornou vazio. Verifique os logs de erro.');
        }
    } catch (error) {
        console.error('Erro no teste:', error.message);
    }
}

executaTeste();
