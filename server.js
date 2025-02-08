const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// API to fetch holidays from Firestore
app.get("/holidays", async (req, res) => {
    try {
        const holidaysRef = db.collection("holidays");
        const snapshot = await holidaysRef.get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "No holidays found" });
        }

        let holidays = [];
        snapshot.forEach(doc => holidays.push(doc.data()));

        res.json(holidays);
    } catch (error) {
        console.error("Error fetching holidays:", error);
        res.status(500).json({ error: "Failed to fetch holidays" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
