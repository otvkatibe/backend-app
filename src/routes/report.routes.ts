import { Router } from 'express';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';
import * as ReportController from '../controllers/report.controller';

const router = Router();

router.use(ensureAuthenticated);

router.get('/monthly-expenses', ReportController.getMonthlyExpenses);
router.get('/cash-flow', ReportController.getCashFlow);
router.get('/budget-vs-actual', ReportController.getBudgetVsActual);
router.get('/export', ReportController.exportReport);

export default router;
