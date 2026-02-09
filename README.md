# 🎓 EdTech Platform - Physics Wallah Clone

Complete education platform with live classes, mock tests, courses, and payment integration.

## 🚀 Features

- 📹 Live Classes with Daily.co
- 📝 Mock Tests with Timer
- 📚 Course Management
- 💰 Payment Integration (Razorpay)
- 🏆 Certificate Generation
- 👨‍🎓 Student Dashboard
- 👨‍🏫 Teacher Dashboard
- 📊 Analytics
- 🔔 Notifications

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript
- Firebase (Auth, Firestore, Storage)
- Daily.co (Live Classes)
- Razorpay (Payments)
- jsPDF (Certificates)

## 📦 Installation

1. Clone or download the repository
2. Update Firebase configuration in `firebase-config.js`
3. Update Razorpay key in `payment.js`
4. Open `index.html` in browser

## 🌐 Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/edtech-platform.git
git push -u origin main

# Enable GitHub Pages in repository settings
```

## 🔧 Configuration

### Firebase Setup:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, Storage
3. Copy config to `firebase-config.js`

### Daily.co Setup:
1. Sign up at https://www.daily.co
2. Get API key (free tier: 10,000 mins/month)
3. Create rooms for live classes

### Razorpay Setup:
1. Sign up at https://razorpay.com
2. Get API key
3. Update in `payment.js`

## 💡 Usage

### For Students:
- Register/Login
- Browse courses
- Enroll in courses
- Join live classes
- Take mock tests
- Download certificates

### For Teachers:
- Create courses
- Upload videos
- Schedule live classes
- Create tests
- View analytics

## 📱 Mobile Support

The platform is fully responsive and works on all devices.

## 🤝 Contributing

Feel free to fork and contribute!

## 📄 License

MIT License

## 👨‍💻 Developer

Created by Aditya
