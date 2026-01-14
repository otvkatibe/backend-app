import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

import { PrismaTransactionRepository } from '../repositories/prisma/PrismaTransactionRepository';
import { PrismaBudgetRepository } from '../repositories/prisma/PrismaBudgetRepository';
import { PrismaCategoryRepository } from '../repositories/prisma/PrismaCategoryRepository';

const transactionRepo = new PrismaTransactionRepository();
const budgetRepo = new PrismaBudgetRepository();
const categoryRepo = new PrismaCategoryRepository();

const reportService = new ReportService(transactionRepo, budgetRepo, categoryRepo);

export const getMonthlyExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

        const userId = req.user!.id;
        const data = await reportService.getMonthlyExpenses(userId, Number(month), Number(year));
        res.json(data);
    } catch (error) {
        next(error);
    }
};

export const getCashFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end date required' });

        const userId = req.user!.id;
        const data = await reportService.getCashFlow(userId, String(startDate), String(endDate));
        res.json(data);
    } catch (error) {
        next(error);
    }
};

export const getBudgetVsActual = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ error: 'Month and year required' });

        const userId = req.user!.id;
        const data = await reportService.getBudgetVsActual(userId, Number(month), Number(year));
        res.json(data);
    } catch (error) {
        next(error);
    }
};

export const exportReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, format, month, year } = req.query;
        if (!type || !format)
            return res.status(400).json({
                error: 'Type (monthly-expenses/budget) and format (csv/pdf) required',
            });

        const userId = req.user!.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any[] = [];
        let fields: string[] = [];

        if (type === 'monthly-expenses') {
            if (!month || !year) return res.status(400).json({ error: 'Month and year required' });
            data = await reportService.getMonthlyExpenses(userId, Number(month), Number(year));
            fields = ['category', 'amount'];
        } else if (type === 'budget') {
            if (!month || !year) return res.status(400).json({ error: 'Month and year required' });
            data = await reportService.getBudgetVsActual(userId, Number(month), Number(year));
            fields = ['category', 'budgeted', 'actual', 'remaining', 'percentUsed'];
        } else {
            return res.status(400).json({ error: 'Invalid report type' });
        }

        if (format === 'csv') {
            const parser = new Parser({ fields });
            const csv = parser.parse(data);
            res.header('Content-Type', 'text/csv');
            res.attachment(`${type}-${month}-${year}.csv`);
            return res.send(csv);
        } else if (format === 'pdf') {
            const doc = new PDFDocument();
            res.header('Content-Type', 'application/pdf');
            res.attachment(`${type}-${month}-${year}.pdf`);
            doc.pipe(res);

            doc.fontSize(20).text(`Report: ${type}`, { align: 'center' });
            doc.moveDown();
            data.forEach((item) => {
                doc.fontSize(12).text(JSON.stringify(item));
            });
            doc.end();
        } else {
            return res.status(400).json({ error: 'Invalid format' });
        }
    } catch (error) {
        next(error);
    }
};
