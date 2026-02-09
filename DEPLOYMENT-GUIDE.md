# 🚀 GitHub Pages Deployment Guide

## Step 1: Setup Repository

```bash
# Navigate to your project folder
cd edtech-platform

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: EdTech Platform"

# Create main branch
git branch -M main
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `edtech-platform` (or any name)
3. Keep it **Public**
4. Don't initialize with README (we already have one)
5. Click "Create repository"

## Step 3: Connect and Push

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/edtech-platform.git

# Push to GitHub
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Pages** (left sidebar)
4. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

Wait 2-3 minutes, your site will be live at:
`https://YOUR_USERNAME.github.io/edtech-platform/`

## Step 5: Configure Firebase

1. Go to https://console.firebase.google.com
2. Create new project
3. Enable:
   - Authentication (Google, Email/Password)
   - Firestore Database
   - Storage
4. Copy your config from Project Settings > General > Your apps
5. Update `firebase-config.js` with your config

## Step 6: Configure Razorpay

1. Sign up at https://razorpay.com
2. Go to Settings > API Keys
3. Copy your Test Key
4. Update `payment.js` line 8:
   ```javascript
   key: "rzp_test_YOUR_KEY_HERE"
   ```

## Step 7: Configure Daily.co (Live Classes)

1. Sign up at https://www.daily.co
2. Free tier gives 10,000 minutes/month
3. Create rooms in Dashboard
4. Room URLs work automatically

## 🎉 That's it!

Your EdTech platform is now live on GitHub Pages!

## 📝 Future Updates

To update your site:

```bash
# Make changes to files
# Then:
git add .
git commit -m "Update: description of changes"
git push
```

Changes will be live in 1-2 minutes!

## ⚠️ Important Notes

- GitHub Pages is FREE forever
- 100GB bandwidth/month
- 1GB storage limit
- No backend hosting needed (we use Firebase)
- SSL certificate is automatic

## 🆘 Troubleshooting

**Site not loading?**
- Wait 5 minutes after enabling GitHub Pages
- Check if repository is Public
- Clear browser cache

**Firebase not working?**
- Verify you copied correct config
- Check Firebase rules allow read/write
- Check browser console for errors

**Daily.co not working?**
- Verify you're using correct room URL format
- Check Daily.co dashboard for room status

## 💡 Tips

- Test locally by opening `index.html` in browser
- Use Chrome DevTools (F12) to debug
- Check Firebase Console for data/errors
- Use Incognito mode to test fresh

---

Need help? Check README.md for more details!
