# SENSIX Vault — File Sharing Website

Simple static website: files ko `assets/` folder mein daalo, `manifest.json` mein entry likho, done. GitHub Pages pe free host ho jayega.

## Folder Structure

```
filevault-share/
├── index.html       # Main page (Home + View All Files)
├── style.css         # Light/minimal styling
├── script.js         # Loads manifest.json, renders cards, handles download
├── manifest.json     # File list — YE FILE EDIT KARNI HAI
└── assets/           # Actual files yaha daalo
```

## Naya File Add Karna Hai? (2 Steps)

1. Apni file ko `assets/` folder mein daal do.
   Example: `assets/movie.mp4`

2. `manifest.json` mein entry add karo:

```json
{
  "files": [
    {
      "name": "movie.mp4",
      "description": "Sample movie file",
      "size": 52000000
    }
  ]
}
```

- `name` → exact file name jo `assets/` mein hai (case-sensitive)
- `description` → optional, chota sa text card pe dikhega
- `size` → optional, bytes mein (approx bhi chalega, sirf display ke liye — 1 MB = 1000000 bytes maan lo)

Bas save karo aur GitHub pe push kar do — website apne aap update ho jayegi.

## GitHub Pages Pe Deploy Kaise Kare

1. GitHub pe naya repository banao (public), naam kuch bhi rakho — jaise `sensix-vault`.

2. Is poore `filevault-share` folder ka content us repo mein upload/push karo:

```bash
git init
git add .
git commit -m "Initial commit - SENSIX Vault"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sensix-vault.git
git push -u origin main
```

3. GitHub repo pe jao → **Settings** → **Pages** (left sidebar mein).

4. **Source** mein select karo: `Deploy from a branch`
   Branch: `main`, Folder: `/ (root)` → **Save**.

5. 1-2 minute wait karo. Tera site live ho jayega:
   `https://YOUR_USERNAME.github.io/sensix-vault/`

## Notes

- Ye pura static site hai — koi backend/server nahi chahiye.
- GitHub Pages pe file size limit hai: single file ideally 100MB se kam rakho (GitHub hard limit 100MB per file, warning 50MB pe aati hai). Bade files ke liye Releases feature ya external hosting (jaise tera FreeHosting.com FileVault) better rahega.
- Large binary files (APK, video, etc.) ke liye Git LFS use kar sakta hai agar zarurat pade.
- Search bar automatically file name + description dono pe kaam karta hai.
