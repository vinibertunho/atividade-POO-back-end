import prisma from '../utils/prismaClient.js';

export default class UsuarioModel {
    constructor({
        id = null,
        nome,
        telefone,
        email,
        cpf,
        cep,
        ativo = true,
    } = {}) {
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
            return res
                .status(400)
                .json({
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
}
