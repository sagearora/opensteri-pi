import express from 'express';
import printHandler from './printHandler';

const app = express();
const port = 8001;

app.use(express.json());

const printer = printHandler.create();

app.get('/printer/status', (req, res) => {
    const status = printer.checkStatus();
    res.json({ status });
});

app.post('/printer/print', async (req, res) => {
    const { labels } = req.body;
    if (!labels || !Array.isArray(labels)) {
        return res.status(400).json({ error: "Invalid labels format" });
    }

    try {
        const result = await printer.printLabels(labels);
        res.json({ success: true, printedLabels: result });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Printer API running on port ${port}`);
});
