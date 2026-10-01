# Deploy SocietySphere on GitHub + Vercel

## Option 1: Upload the files to GitHub

1. Create a new GitHub repository.
2. Upload the contents of this folder, preserving `data/` and `public/` directories.
3. In Vercel, choose **Add New → Project** and import the GitHub repository.
4. Use these settings:
   - Framework Preset: **Other**
   - Build Command: leave blank
   - Output Directory: `.`, or leave the default if Vercel detects the static project
   - Install Command: leave blank
5. Deploy.

`vercel.json` handles the client-side routes such as `/societies/gdg-nsut`, `/about`, and `/find-your-society`.

## Option 2: Deploy from the terminal

```bash
npm i -g vercel
cd societysphere
vercel
```

Accept the default prompts. For production deployment:

```bash
vercel --prod
```

No environment variables or database are required. Applications are intentionally client-side demo submissions and are logged to the browser console.
