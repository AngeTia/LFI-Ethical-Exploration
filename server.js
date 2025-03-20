const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir la page HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route vulnérable à LFI
app.get('/read', (req, res) => {
    let file = req.query.file;

    if (!file) {
        return res.status(400).send("Spécifiez un fichier !");
    }

    // 🚨 VULNÉRABILITÉ : Pas de filtrage, lecture directe du fichier
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send("Fichier non trouvé ou accès refusé.");
        }
        res.send(`<pre>${data}</pre>`);
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur LFI en écoute sur http://localhost:${PORT}`);
});

