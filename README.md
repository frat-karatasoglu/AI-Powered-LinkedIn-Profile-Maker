# ✨ AI Professional Photo Studio

Transform your casual photos into professional headshots with AI!

![Main App](./screenshots/main-app.png)

## 🎯 Features

- 🤖 **Flux AI** powered professional photo generation
- 👤 User authentication with credit system (10 free credits)
- 🎨 Customizable gender and background options (Neutral, Office, Outdoor, Studio)
- ⚡ Results in 10-30 seconds
- 📱 Fully responsive modern UI

## 📸 Screenshots

<table>
  <tr>
    <td><img src="./screenshots/login.png" alt="Login" width="400"/><br/><b>Login Screen</b></td>
    <td><img src="./screenshots/register.png" alt="Register" width="400"/><br/><b>Register Screen</b></td>
  </tr>
  <tr>
    <td colspan="2"><img src="./screenshots/main-app.png" alt="Main App" width="100%"/><br/><b>Main Application - Photo Generation</b></td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.9+ ([Download](https://www.python.org/))
- Replicate account ([Sign up](https://replicate.com/))

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/ai-photo-studio.git
cd ai-photo-studio
```

### 2. Get Replicate API Key

1. Go to [replicate.com](https://replicate.com/) and sign up
2. Navigate to Account Settings → API Tokens
3. Create a new token
4. Copy the token (starts with `r8_...`)

![Replicate Token](./screenshots/replicate-token.png)

### 3. Backend Setup

```
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux
```

**Edit `.env` file:**
```
REPLICATE_API_TOKEN=r8_paste_your_token_here
JWT_SECRET_KEY=strong_secret_key_123456
```

**Create database:**
```
python
>>> from server import app, db
>>> with app.app_context(): db.create_all()
>>> exit()
```

**Start backend:**
```
python server.py
```

### 4. Frontend Setup

**Open new terminal:**
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

### 5. Open in Browser

```
http://localhost:3000
```

## 🎨 Background Options

- ⚪ **Neutral** - Passport, official documents
- 🏢 **Office** - LinkedIn, CV, job applications
- 🌳 **Outdoor** - Social media, website
- 📷 **Studio** - Portfolio, agency applications

## 🛠️ Tech Stack

**Backend:** Flask, SQLAlchemy, JWT, Replicate API  
**Frontend:** React, Vite, Axios  
**AI Model:** Flux-Kontext Professional Headshot

## 📖 Usage

1. **Register** - Sign up and get 10 free credits
2. **Upload Photo** - Choose a clear photo showing your face
3. **Select Options** - Choose gender and background
4. **Generate** - Wait 10-30 seconds (uses 1 credit)
5. **Download** - Save your professional photo

## 🐛 Troubleshooting

**Backend not working:**
```bash
deactivate
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
python server.py
```

**Frontend not working:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**API Token error:**
```bash
# Check if .env exists in backend/
cat backend/.env  # Mac/Linux
type backend\.env  # Windows
```

**Database error:**
```bash
cd backend
rm site.db
python
>>> from server import app, db
>>> with app.app_context(): db.create_all()
```

## 📦 Deployment

### Render.com (Free)

**Backend:**
1. render.com → "New Web Service"
2. Root: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `gunicorn server:app`
5. Env vars: `REPLICATE_API_TOKEN`, `JWT_SECRET_KEY`

**Frontend:**
1. render.com → "New Static Site"
2. Build: `npm install && npm run build`
3. Publish: `dist`

## 💰 Cost

- Replicate: ~$0.005 per image
- Render: Free tier (750 hours/month)

## 🤝 Contributing

```bash
git checkout -b feature/amazing-feature
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

Open a Pull Request!

## 📄 License

MIT License - Use freely!

## ⭐ Support

If you like this project, give it a star!

---

**Made with ❤️ by Fırat Karataşoğlu**
