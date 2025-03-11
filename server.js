const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const atob = require('atob');

const app = express();
const PORT = process.env.PORT || 3000; // Use dynamic port for hosting platforms

const VALID_KEYS = new Set(["SIGMA-"]); // Example prefix

app.use(cors());
app.use(bodyParser.json());

// This is the route for the root path ("/")
app.get('/', (req, res) => {
    res.send('Server is running!'); // You can customize this message
});

// Key validation route
app.post('/validate-key', (req, res) => {
    const { key } = req.body;

    try {
        if (key.startsWith("SIGMA-")) {
            const encodedPayload = key.replace("SIGMA-", "");
            const decodedPayload = JSON.parse(atob(encodedPayload));
            
            const { key: actualKey, expiry } = decodedPayload;
            const expiryDate = new Date(expiry);
            const currentDate = new Date();

            if (VALID_KEYS.has(actualKey) && expiryDate > currentDate) {
                return res.json({ success: true });
            } else if (expiryDate <= currentDate) {
                return res.json({ success: false, error: "Key expired" });
            } else {
                return res.json({ success: false, error: "Invalid key" });
            }
        } else {
            return res.json({ success: false, error: "Invalid key format" });
        }
    } catch (error) {
        return res.json({ success: false, error: "Invalid key data" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
