# Login Access Instructions

## Problem
The login page might seem "missing" because:

1. **Auto-redirect**: If you're already logged in, visiting `/` will automatically redirect you to the appropriate dashboard
2. **Direct access needed**: You need to access `/login` directly

## Solutions

### Option 1: Direct Access
Go directly to: `http://127.0.0.1:3000/login`

### Option 2: Clear Browser Data
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear LocalStorage
4. Refresh the page

### Option 3: Use Debug Page
Visit: `http://127.0.0.1:3000/test-login`
This page shows your current login status and allows you to clear data

### Option 4: Test Login API
Use the test HTML file: `test-auth.html`
1. Open `test-auth.html` in your browser
2. Use the test credentials to login
3. Check if the API works

## Test Credentials
- **Admin**: admin@pesantren.sch.id / admin123
- **Kepala Kepengasuhan**: kepala@pesantren.sch.id / kepala123  
- **Wali Kamar**: walikamar@pesantren.sch.id / wali123
- **Wali Santri**: walisantri@pesantren.sch.id / walisantri123

## How the Login System Works
1. Visit `/` → Checks localStorage for login data
2. If logged in → Redirects to appropriate dashboard
3. If not logged in → Redirects to `/login`
4. Login page at `/login` is always accessible

## Troubleshooting
If you still can't see the login page:
1. Check browser console for errors
2. Try incognito/private browsing mode
3. Verify the dev server is running: `http://127.0.0.1:3000`
4. Check that the login API works: Test with curl or the test-auth.html file