import express, { type Request, type Response } from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/status', (req: Request, res: Response) => {
    res.status(200).send({ status: 'server is running' });
});

app.listen(3000, () => {
    console.log('App running on port 3000');
});
