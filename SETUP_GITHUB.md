# GitHub Repository Setup Instructions

## Option 1: Create Repository via GitHub Website (Recommended)

1. Go to https://github.com/new
2. Login with your credentials:
   - Email: guptasaurabhbpl@gmail.com
   - Password: Dream@1610
3. Create a new repository:
   - Repository name: `matrimonial-site`
   - Description: `Complete Matrimonial Site application with user profiles, messaging, horoscope matching, and admin panel`
   - Visibility: Public (or Private, as per your preference)
4. Click "Create repository"
5. After creating, GitHub will show commands. Use these commands:

```bash
cd "/Users/saurabhgupta/Desktop/saurabh/Matrimonial Site"
git remote add origin https://github.com/guptasaurabhbpl@gmail.com/matrimonial-site.git
git branch -M main
git push -u origin main
```

## Option 2: Create Repository via GitHub CLI

If you have GitHub CLI installed:

```bash
gh auth login
# Follow the prompts to authenticate

cd "/Users/saurabhgupta/Desktop/saurabh/Matrimonial Site"
gh repo create matrimonial-site --public --source=. --remote=origin --push
```

## Option 3: Create Repository with Personal Access Token

1. Generate a Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control)
   - Generate and copy the token

2. Create repository and push:

```bash
cd "/Users/saurabhgupta/Desktop/saurabh/Matrimonial Site"

# Create repository using API
curl -H "Authorization: token YOUR_TOKEN_HERE" \
     -X POST https://api.github.com/user/repos \
     -d '{"name":"matrimonial-site","description":"Complete Matrimonial Site application","private":false}'

# Add remote and push
git remote add origin https://YOUR_TOKEN@github.com/guptasaurabhbpl@gmail.com/matrimonial-site.git
git branch -M main
git push -u origin main
```

## Current Git Status

✅ Git repository initialized
✅ All files committed (134 files, 19463+ lines)
✅ Ready to push to GitHub

## Next Steps

After creating the repository on GitHub, run:

```bash
cd "/Users/saurabhgupta/Desktop/saurabh/Matrimonial Site"
git remote add origin https://github.com/YOUR_USERNAME/matrimonial-site.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

