# SENSIX Vault — Code-Based File Sharing Website

Simple static website: har file ka ek unique **code** hota hai. User code daalta hai → file detail dikhta hai → download button click karte hi external link pe redirect ho jata hai. No file storage on GitHub — sab links external hain (Google Drive, Mega, ya tera koi bhi hosting).

## Folder Structure

```
filevault-share/
├── index.html       # Main page (code search box)
├── style.css         # Light/minimal styling
├── script.js         # Code search logic + redirect
├── manifest.json     # File list — YE FILE EDIT KARNI HAI
└── README.md
```

## Naya File Add Karna Hai? (1 Step)

`manifest.json` mein ek entry add karo:

```json
{
  "code": "4521",
  "name": "My Movie File",
  "description": "1080p movie download",
  "size": 2147483648,
  "link": "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
}
```

- `code` → unique number/text, isse hi user search karega (jaise "2661", "1523")
- `name` → file ka display naam
- `description` → chota sa detail text
- `size` → bytes mein (optional, sirf display ke liye). 1 GB ≈ `1073741824` bytes
- `link` → actual download URL (Google Drive, Mega, tera FileVault, kahin bhi)

Save karo, GitHub pe push karo — done.

## Google Drive Link Kaise Banaye

1. File ko Google Drive pe upload karo, "Anyone with the link" access do.
2. Share link se File ID nikaalo:
   `https://drive.google.com/file/d/FILE_ID_YAHA_HAI/view`
3. Direct download link banao:
   `https://drive.google.com/uc?export=download&id=FILE_ID_YAHA_HAI`

Bade files (100MB+) ke liye Google Drive kabhi-kabhi virus-scan warning page dikhata hai — us case mein Mega.nz ya direct hosting link better rahega.

## Website Kaise Kaam Karti Hai

1. User homepage kholta hai — khali page, sirf ek search box.
2. Code type karta hai (jaise `2661`).
3. Agar code match hota hai → uska card dikhta hai (naam, size, description, Download button).
4. Download button click → 0.4 second baad seedha external link pe redirect.
5. Agar code match nahi hota → "No file found for this code" dikhta hai.

## GitHub Pages Pe Deploy Kaise Kare

1. GitHub pe naya repository banao (public).

2. Is poore `filevault-share` folder ka content push karo:

```bash
git init
git add .
git commit -m "Initial commit - SENSIX Vault"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sensix-vault.git
git push -u origin main
```

3. Repo → **Settings** → **Pages** → Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)` → Save.

4. 1-2 minute mein live: `https://YOUR_USERNAME.github.io/sensix-vault/`

## Notes

- File size ki koi limit nahi hai ab, kyunki files GitHub pe store nahi ho rahi — sirf link store ho raha hai.
- Codes unique rakhna zaroori hai warna sirf pehla match milega.
- Agar chahiye to codes ko alphanumeric bhi rakh sakta hai (jaise "SX2661") — search exact match karta hai.
