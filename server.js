const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const atob = require('atob');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_KEYS = new Set(["SIGMA-"]); // Example prefix

app.use(cors());
app.use(bodyParser.json());

// Root route to test server
app.get('/', (req, res) => {
    res.send('Server is running!'); // This responds to a GET request on "/"
});

// Route to generate the key and display it
app.get('/generate-key', (req, res) => {
    const key = generateKey(); // Generate the key
    res.send(`
        <html>
            <head>
                <title>Your SIGMA Key</title>
            </head>
            <body>
                <h1>Your SIGMA Key</h1>
                <p>Here is your generated SIGMA key: <strong>${key}</strong></p>
                <p>This key will expire in 30 days.</p>
            </body>
        </html>
    `);
});

// Function to generate the key
function generateKey() {
    const prefix = "SIGMA-";  // Prefix for the key
    const key = generateRandomString(10);  // Random 10-character string for the key
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  // Expiry 30 days from now

    // Create the key payload
    const payload = {
        key: key,
        expiry: expiryDate.toISOString(),
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64'); // Encode the payload in Base64
    return `${prefix}${encodedPayload}`;
}

// Helper function to generate random strings (used in key generation)
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

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

// Serve static files (for any other client-side content, like your HTML)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
