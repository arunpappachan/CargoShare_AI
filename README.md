# CargoShare AI

CargoShare AI is a comprehensive platform built to revolutionize container space sharing by connecting exporters with available partial container space across major carriers. 

This repository houses the complete full-stack architecture, encompassing the frontend, backend, and integrated Artificial Intelligence systems.

## 6. Technologies Used

Our architecture strictly adheres to the following technology stack to ensure scalability, security, and advanced AI capabilities:

* **Frontend:** React.js / Next.js, Tailwind CSS
* **Backend:** Node.js with Express.js
* **Database:** PostgreSQL, MongoDB, Redis
* **Programming Languages:** JavaScript, Python
* **Artificial Intelligence:** Scikit-learn, XGBoost, TensorFlow/PyTorch, Pandas, NumPy
* **Cloud & DevOps:** AWS / Google Cloud / Azure, Docker, Kubernetes
* **Authentication & Security:** JWT, bcrypt, HTTPS
* **Payment Gateway:** Razorpay / Stripe
* **Version Control:** Git & GitHub
* **Development Tools:** Visual Studio Code, Postman
* **APIs & Services:** Google Maps API, Email & SMS Notification APIs

## Project Structure

```text
cargoshare-ai/
├── src/                # Frontend (React.js, Tailwind CSS)
│   ├── components/     # Reusable UI components
│   ├── pages/          # Full page views
│   └── index.css       # Tailwind entry and global styles
├── backend/            # Backend (Node.js, Express.js)
│   ├── server.js       # Express entry point
│   └── package.json    # Backend dependencies (mongoose, pg, redis, etc.)
├── ai_models/          # Artificial Intelligence (Python)
│   ├── predict.py      # Model inference entry point
│   └── requirements.txt# AI dependencies (tensorflow, scikit-learn, etc.)
└── package.json        # Frontend dependencies
```

## Getting Started

### Frontend Development
To run the React frontend:
```bash
npm install
npm run dev
```

### Backend Development
To run the Express backend:
```bash
cd backend
npm install
node server.js
```

### AI Environment Setup
To set up the Python AI environment:
```bash
cd ai_models
pip install -r requirements.txt
python predict.py
```
