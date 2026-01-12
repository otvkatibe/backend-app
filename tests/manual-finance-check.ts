
import 'dotenv/config';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';

async function runTest() {
    console.log('Iniciando Verificacao Manual E2E para Fase 2...');

    try {
        // Cleanup
        console.log('Limpando banco de dados...');
        await prisma.transaction.deleteMany();
        await prisma.budget.deleteMany();
        await prisma.goal.deleteMany();
        await prisma.category.deleteMany();
        await prisma.wallet.deleteMany();
        await prisma.user.deleteMany();

        // 1. Register User
        console.log('Registrando Usuario...');
        const userRes = await request(app).post('/users').send({
            name: 'Manual Test User',
            email: 'manual@test.com',
            password: 'password123'
        });
        if (userRes.status !== 201) throw new Error(`Register failed: ${userRes.text}`);
        const userId = userRes.body.id;
        console.log('Usuario Criado:', userId);

        // 2. Login
        console.log('Realizando login...');
        const loginRes = await request(app).post('/login').send({
            email: 'manual@test.com',
            password: 'password123'
        });
        if (loginRes.status !== 200) throw new Error(`Login failed: ${loginRes.text}`);
        const token = loginRes.body.token;
        console.log('Logado. Token adquirido.');

        // 3. Create Category
        console.log('Criando Categoria...');
        const catRes = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Essential' });
        if (catRes.status !== 201) throw new Error(`Category failed: ${catRes.text}`);
        const categoryId = catRes.body.id;
        console.log('Categoria Criada:', categoryId);

        // 4. Upsert Budget
        console.log('Definindo Orcamento...');
        const budgetRes = await request(app)
            .post('/budgets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                categoryId,
                amount: 1000,
                month: 12,
                year: 2025
            });
        if (budgetRes.status !== 200) throw new Error(`Budget failed: ${budgetRes.text}`);
        console.log('Orcamento Definido:', budgetRes.body.amount);

        // 5. Create Goal
        console.log('Criando Meta...');
        const goalRes = await request(app)
            .post('/goals')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Vacation',
                targetAmount: 5000,
                deadline: new Date('2025-12-31').toISOString()
            });
        if (goalRes.status !== 201) throw new Error(`Goal failed: ${goalRes.text}`);
        const goalId = goalRes.body.id;
        console.log('Meta Criada:', goalId);

        // 6. Add Funds to Goal
        console.log('Adicionando Fundos a Meta...');
        const fundRes = await request(app)
            .patch(`/goals/${goalId}/add`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 500 });
        if (fundRes.status !== 200) throw new Error(`Add Funds failed: ${fundRes.text}`);
        console.log('Fundos Adicionados. Novo Saldo:', fundRes.body.currentAmount);

        console.log('\nTODAS AS VERIFICACOES PASSARAM COM SUCESSO!');

    } catch (error) {
        console.error('\nTESTE FALHOU:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
