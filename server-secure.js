const express = require('express'); 
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Définition d'un dossier sécurisé contenant uniquement des fichiers autorisés
const SAFE_DIR = path.join(__dirname, 'safe_files');

// Route principale servant la page HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route sécurisée pour lire des fichiers spécifiques
app.get('/read', (req, res) => {
    let file = req.query.file;

    // Vérification si un fichier a bien été spécifié
    if (!file) {
        return res.status(400).send("Erreur : spécifiez un fichier !");
    }

    // 🔒 Protection contre LFI : Vérification des caractères interdits
    if (file.includes("..") || file.includes("/") || file.includes("\\") || file.startsWith("/")) {
        return res.status(403).send("Accès refusé !");
    }

    // 🔒 Restreindre les fichiers accessibles aux seuls fichiers du dossier sécurisé
    let safePath = path.join(SAFE_DIR, file);

    // Vérification si le fichier demandé est bien dans le dossier sécurisé
    if (!safePath.startsWith(SAFE_DIR)) {
        return res.status(403).send("Accès refusé !");
    }

    // 🔒 Vérification des extensions autorisées (évite la lecture de fichiers système)
    const allowedExtensions = ['.txt', '.log', '.json']; // Extensions autorisées
    if (!allowedExtensions.includes(path.extname(file))) {
        return res.status(403).send("Format de fichier non autorisé !");
    }

    // Lecture du fichier uniquement si les vérifications de sécurité sont passées
    fs.readFile(safePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(404).send("Fichier introuvable !");
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur sécurisé en écoute sur http://localhost:${PORT}`);
    console.log("🔐 LFI bloqué ! Seuls les fichiers du dossier 'safe_files' peuvent être lus.");
});

