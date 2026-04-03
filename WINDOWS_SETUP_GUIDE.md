# How to Push DCCS Platform to GitHub from Windows

## Step 1: Download Project to Your Computer

1. Click the **Download** button in Bolt (top right of this interface)
2. Save the ZIP file to your Downloads folder
3. Extract the ZIP file to a folder (right-click > Extract All)
4. Remember the location (e.g., `C:\Users\MIKE\Downloads\dccs-platform`)

## Step 2: Install Git (if not already installed)

1. Download Git from: https://git-scm.com/download/win
2. Install with default settings
3. Restart Command Prompt after installation

## Step 3: Navigate to Project Folder

Open Command Prompt and run:

```bash
cd C:\Users\MIKE\Downloads\dccs-platform
```

(Replace with your actual folder path)

## Step 4: Set Up Git

```bash
git init
git config user.email "victorjosephedet1@gmail.com"
git config user.name "Victor Joseph Edet"
git add .
git commit -m "Initial commit: Complete DCCS platform by Victor360 Brand Limited"
git branch -M main
git remote add origin https://github.com/victorjosephedet1-rgb/dccs-platform.git
```

## Step 5: Push to GitHub

```bash
git push -u origin main
```

If it asks for credentials, use:
- Username: victorjosephedet1-rgb
- Password: Your GitHub Personal Access Token (not your password)

### How to Get a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "DCCS Platform"
4. Check: `repo` (all permissions)
5. Click "Generate token"
6. Copy the token and use it as your password

## Done!

Your code will be on GitHub at:
https://github.com/victorjosephedet1-rgb/dccs-platform

Then Netlify will automatically deploy it to:
https://dccs.netlify.app
