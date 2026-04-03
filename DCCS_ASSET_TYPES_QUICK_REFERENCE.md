# DCCS Asset Types - Quick Reference

## Universal Creative Ownership Verification

DCCS supports **all creative asset types** with standardized clearance codes.

---

## FORMAT

```
DCCS-[TYPE]-[YEAR]-[UNIQUE_ID]
```

Example: `DCCS-ART-2026-9F3K2L`

---

## ALL SUPPORTED TYPES

### 🎵 Audio (AUD)
**Code:** `DCCS-AUD-2026-XXXXXX`

**Includes:**
- Music tracks
- Audio files
- Podcasts
- Audio recordings
- Sample packs
- Sound effects

**File Types:** MP3, WAV, FLAC, AAC, OGG

---

### 🎬 Video (VID)
**Code:** `DCCS-VID-2026-XXXXXX`

**Includes:**
- Video files
- Films
- Animations
- Video recordings

**File Types:** MP4, MOV, AVI, MKV, WEBM

---

### 📷 Image (IMG)
**Code:** `DCCS-IMG-2026-XXXXXX`

**Includes:**
- Digital images
- Photographs
- Graphics
- Screenshots

**File Types:** JPG, PNG, GIF, WEBP, BMP

---

### 🎨 Artwork (ART)
**Code:** `DCCS-ART-2026-XXXXXX`

**Includes:**
- Digital paintings
- Illustrations
- Digital art
- Scanned physical artwork
- Artistic designs
- Creative artwork

**File Types:** Any image format, PSD, AI, SVG

**Use When:** The creative work is artistic in nature (not just a photo or graphic)

---

### 🔗 NFT (NFT)
**Code:** `DCCS-NFT-2026-XXXXXX`

**Includes:**
- NFT artwork files
- Pre-mint digital assets
- Blockchain-linked creative works
- Crypto art

**Optional Metadata:**
- Blockchain network
- Wallet address
- Token ID
- Contract address

**Important:** DCCS is the primary ownership layer. Blockchain info is supplementary.

**Supported Blockchains:**
- Ethereum
- Polygon
- Solana
- Avalanche
- BNB Chain
- Arbitrum
- Optimism
- Base
- Other

---

### 📄 Document (DOC)
**Code:** `DCCS-DOC-2026-XXXXXX`

**Includes:**
- Documents
- Manuscripts
- Designs
- PDFs
- Written works

**File Types:** PDF, DOC, DOCX, TXT

---

### 🧊 3D Model (MOD)
**Code:** `DCCS-MOD-2026-XXXXXX`

**Includes:**
- 3D models
- 3D assets
- Virtual objects

**File Types:** OBJ, FBX, STL, GLTF, BLEND

---

### 💻 Code (COD)
**Code:** `DCCS-COD-2026-XXXXXX`

**Includes:**
- Source code
- Software
- Applications
- Scripts

**File Types:** Any code files, ZIP archives

---

### ❓ Other (OTH)
**Code:** `DCCS-OTH-2026-XXXXXX`

**Includes:**
- Uncategorized content
- Mixed media
- Other creative works

---

## CHOOSING THE RIGHT TYPE

### Decision Tree

**Is it artwork?**
- Digital painting/illustration → `ART`
- Photo/screenshot → `IMG`

**Is it an NFT?**
- NFT artwork → `NFT`
- Regular digital art → `ART`

**Is it audio?**
- Music/podcast → `AUD`
- Sample pack → `AUD`

**Is it video?**
- Any video content → `VID`

**Is it 3D?**
- 3D models → `MOD`

**Is it code?**
- Software/scripts → `COD`

**Is it a document?**
- Text/PDF → `DOC`

**Something else?**
- Uncategorized → `OTH`

---

## EXAMPLES BY TYPE

| Asset | Type Code | Example Code |
|-------|-----------|--------------|
| Song "Summer Nights" | AUD | DCCS-AUD-2026-9F3K2L |
| Music video | VID | DCCS-VID-2026-X82LMN |
| Digital painting | ART | DCCS-ART-2026-KP91QZ |
| NFT crypto art | NFT | DCCS-NFT-2026-A7B4CD |
| Profile photo | IMG | DCCS-IMG-2026-E5F6GH |
| Novel manuscript | DOC | DCCS-DOC-2026-J8K9LM |
| 3D character model | MOD | DCCS-MOD-2026-N1P2QR |
| Mobile app source | COD | DCCS-COD-2026-S3T4UV |

---

## VERIFICATION

All types verify the same way:
1. Enter clearance code
2. System validates format
3. Returns ownership details
4. Shows asset type clearly

**Backward Compatible:** Legacy codes still work.

---

## NFT SPECIAL FEATURES

When uploading NFT assets, you can optionally include:

```
Blockchain Network: Ethereum
Wallet Address: 0x742d35Cc...
Token ID: #1234
Contract Address: 0xb47e3cd...
```

**Remember:** DCCS verification takes priority over blockchain data.

---

## TECHNICAL DETAILS

### Type Code Mapping (Database)

```sql
CASE project_type
  WHEN 'audio' THEN 'AUD'
  WHEN 'video' THEN 'VID'
  WHEN 'image' THEN 'IMG'
  WHEN 'art' THEN 'ART'
  WHEN 'nft' THEN 'NFT'
  WHEN 'document' THEN 'DOC'
  WHEN '3dmodel' THEN 'MOD'
  WHEN 'code' THEN 'COD'
  ELSE 'OTH'
END
```

### Validation Pattern

```regex
^DCCS-(AUD|VID|IMG|ART|NFT|DOC|MOD|COD|OTH)-\d{4}-[A-Z0-9]{6}$
```

---

## SUMMARY

✅ **9 Asset Types Supported**
✅ **Universal Coverage**
✅ **NFT Integration**
✅ **Backward Compatible**
✅ **Blockchain Agnostic**
✅ **Production Ready**

**DCCS = Universal Creative Ownership Verification** 🎉
