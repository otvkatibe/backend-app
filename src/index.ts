import express, { type Request, type Response } from 'express';

import userRoute from './routes/user.route';
import { errorHandler } from './middlewares/errorHandler';
import { globalLimiter } from './middlewares/rateLimiter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

app.use(userRoute);

app.get('/status', (req: Request, res: Response) => {
    res.status(200).send({ status: 'server is running' });
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log('App running on port 3000');
});
