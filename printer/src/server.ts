import express from 'express';
import { checkStatus, printLabels } from './printHandler';

const app = express();
const port = 8001;

app.use(express.json());

app.get('/printer/status', async (req, res) => {
    try {
        const status = await checkStatus();
        res.json({
            success: true,
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

app.post('/printer/print', async (req, res) => {
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
