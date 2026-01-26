const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Duplicate a game file
app.post('/api/duplicate-game', (req, res) => {
    const { originalUrl, newName } = req.body;

    try {
        const originalPath = path.join(__dirname, originalUrl);

        if (!fs.existsSync(originalPath)) {
            return res.status(404).json({ error: 'Original file not found' });
        }

        // Read the original file
        const content = fs.readFileSync(originalPath, 'utf8');

        // Create new filename
        const dir = path.dirname(originalPath);
        const ext = path.extname(originalPath);
        const baseName = path.basename(originalPath, ext);
        let newFileName = `${baseName}-copy${ext}`;
        let newPath = path.join(dir, newFileName);

        // Make sure we don't overwrite existing files
        let counter = 1;
        while (fs.existsSync(newPath)) {
            newFileName = `${baseName}-copy-${counter}${ext}`;
            newPath = path.join(dir, newFileName);
            counter++;
        }

        // Write the new file
        fs.writeFileSync(newPath, content, 'utf8');

        // Return the relative URL
        const relativeUrl = path.relative(__dirname, newPath).replace(/\\/g, '/');

        res.json({
            success: true,
            newUrl: relativeUrl,
            fileName: newFileName
        });
    } catch (error) {
        console.error('Error duplicating file:', error);
        res.status(500).json({ error: 'Failed to duplicate file' });
    }
});

// Delete a game file
app.delete('/api/delete-game', (req, res) => {
    const { url } = req.body;

    try {
        const filePath = path.join(__dirname, url);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        fs.unlinkSync(filePath);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

app.listen(PORT, () => {
    console.log(`Game manager server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT}/index.html in your browser`);
});
