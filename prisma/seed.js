import 'dotenv/config';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Configuração da conexão com suporte ao Driver Adapter do PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Iniciando processo de Seed...');

    // 1. Limpeza das tabelas (Ordem importa por causa das FKs)
    console.log('🧹 Limpando tabelas existentes...');
    await prisma.itemPedido.deleteMany();
    await prisma.pedido.deleteMany();
    await prisma.produto.deleteMany();
    await prisma.usuario.deleteMany();

    // 2. Criando Usuários
    console.log('👤 Criando 3 Usuários...');
    const u1 = await prisma.usuario.create({
        data: {
            nome: 'Alice Silva',
            email: 'alice@email.com',
            telefone: '11911111111',
            cpf: '111',
            cep: '01001000',
        },
    });

    const u2 = await prisma.usuario.create({
        data: {
            nome: 'Bruno Souza',
            email: 'bruno@email.com',
            telefone: '11922222222',
            cpf: '222',
            cep: '20040000',
            logradouro: 'Av. Rio Branco',
            bairro: 'Centro',
            localidade: 'RJ',
            uf: 'RJ',
        },
    });

    const u3 = await prisma.usuario.create({
        data: {
            nome: 'Carla Dias',
            email: 'carla@email.com',
            telefone: '11933333333',
            cpf: '333',
            cep: '30140010',
        },
    });

    // 3. Criando Produtos
    console.log('🍔 Criando 3 Produtos...');
    const p1 = await prisma.produto.create({
        data: { nome: 'X-Bacon', preco: 35.0, categoria: 'LANCHE', descricao: 'Bacon e cheddar' },
    });
    const p2 = await prisma.produto.create({
        data: { nome: 'Coca-Cola', preco: 8.0, categoria: 'BEBIDA', descricao: 'Lata 350ml' },
    });
    const p3 = await prisma.produto.create({
        data: {
            nome: 'Batata Frita',
            preco: 15.0,
            categoria: 'LANCHE',
            descricao: 'Porção individual',
        },
    });

    // 4. Criando Pedidos e Itens
    console.log('🛒 Criando Pedidos...');

    // Pedido 1 (Alice): X-Bacon + Coca
    await prisma.pedido.create({
        data: {
            clienteId: u1.id,
            total: 43.0,
            status: 'PAGO',
            itens: {
                create: [
                    { produtoId: p1.id, quantidade: 1, precoUnitario: p1.preco },
                    { produtoId: p2.id, quantidade: 1, precoUnitario: p2.preco },
                ],
            },
        },
    });

    // Pedido 2 (Bruno): 2 Cocas
    await prisma.pedido.create({
        data: {
            clienteId: u2.id,
            total: 16.0,
            status: 'ABERTO',
            itens: {
                create: [{ produtoId: p2.id, quantidade: 2, precoUnitario: p2.preco }],
            },
        },
    });

    // Pedido 3 (Carla): Batata Frita
    await prisma.pedido.create({
        data: {
            clienteId: u3.id,
            total: 15.0,
            status: 'ABERTO',
            itens: {
                create: [{ produtoId: p3.id, quantidade: 1, precoUnitario: p3.preco }],
            },
        },
    });

    console.log('✅ Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro durante o seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end(); // Fecha a conexão do pool de drivers
    });
