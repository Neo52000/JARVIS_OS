# Jarvis Business OS

Syst\u00e8me d'ex\u00e9cution business pilot\u00e9 par IA multi-agents.

## Installation rapide (Windows)

```bash
# 1. Cloner
git clone https://github.com/Neo52000/JARVIS_OS.git
cd JARVIS_OS/jarvis-business-os

# 2. Installer
install.bat

# 3. Configurer
# Ouvrir .env et ajouter votre cl\u00e9 Mistral API
# MISTRAL_API_KEY=votre_cle_ici

# 4. Lancer
start.bat

# 5. Ouvrir http://localhost:8000
```

## Installation (Linux/Mac)

```bash
chmod +x install.sh start.sh
./install.sh
# Editer .env
./start.sh
```

## Architecture

- **5 Agents IA** : Strategist (Tier 1), Marketing, Dev, Automation, Data (Tier 3)
- **Orchestrateur** : routage automatique par mots-cl\u00e9s
- **M\u00e9moire vectorielle** : ChromaDB persistante
- **Voice** : Whisper (STT) + EdgeTTS (TTS)
- **Scheduler** : t\u00e2ches automatis\u00e9es APScheduler
- **CRM** : gestion clients + plans tarifaires + facturation

## Modules

| Module | Description |
|--------|-------------|
| Chat | Terminal IA avec routage auto vers agents |
| POD | G\u00e9n\u00e9ration produits print-on-demand + fiches Etsy |
| Business Local | Posts sociaux + calendrier + campagnes |
| CRM | Clients + plans (49/99/199\u20ac) + facturation |
| Delivery | Livraison hebdo contenu par client |
| Scheduler | T\u00e2ches automatiques quotidiennes |

## API Docs

Apr\u00e8s lancement : http://localhost:8000/docs
