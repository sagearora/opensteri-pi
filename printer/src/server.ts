import express from 'express';
import { checkStatus, printLabels } from './printHandler';
import cors from 'cors'

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors())

app.get('/', (_, res) => {
    res.json({
        name: 'Print server',
    })
})

app.get('/status', async (req, res) => {
    try {
        const force_check = req.query.force_check === '1'
        const status = await checkStatus(force_check);
        res.json({
            ready: status.code === '00',
            ...status
        });
    } catch (e: any) {
        res
            .status(400)
            .json({
                error: e.message
            })
    }
});

app.post('/print', async (req, res) => {
    const { labels } = req.body;
    if (!labels || !Array.isArray(labels)) {
        return res.status(400).json({ error: "Invalid labels format" });
    }

    try {
        const result = await printLabels(labels);
        res.json({ success: true, printedLabels: result });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Printer API running on port ${port}`);
});
