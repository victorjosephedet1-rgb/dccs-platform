# AI Faces for V3B Music Community

## 📁 Place Your AI Face Images Here

**Required naming pattern:** `ai-face-1.jpg`, `ai-face-2.jpg`, `ai-face-3.jpg`, etc.

**Full path example:** `public/brand-assets/ai-faces/ai-face-1.jpg`

## 🎨 AI Face Requirements

- **Format:** JPG, PNG, or WebP
- **Size:** Square images (recommended 200x200px or larger)
- **Naming:** Sequential numbers starting from 1
- **Quantity:** 20-30 images for best variety
- **Content:** Diverse, professional-looking AI-generated faces

## 📋 Step-by-Step Instructions

### 1. **Get AI-Generated Faces**
Visit these recommended sources:

**Free Sources:**
- **This Person Does Not Exist:** https://thispersondoesnotexist.com/
  - Refresh the page to get new faces
  - Right-click → "Save image as..."
  - Save as `ai-face-1.jpg`, `ai-face-2.jpg`, etc.

- **Generated Photos (Free):** https://generated.photos/faces
  - Browse free AI faces
  - Download diverse, professional-looking faces

**Premium Sources (if available):**
- **Midjourney:** Generate diverse professional portraits
- **DALL-E:** Create consistent, high-quality face images
- **Stable Diffusion:** Generate varied AI portraits

### 2. **Download & Organize**
1. **Download 20-30 diverse images**
2. **Rename them sequentially:** `ai-face-1.jpg`, `ai-face-2.jpg`, etc.
3. **Place them in this folder:** `public/brand-assets/ai-faces/`
4. **Ensure diversity:** Different ages, ethnicities, genders, styles

### 3. **Update Component**
After adding your images, update this line in `src/components/RandomAIFace.tsx`:

```typescript
const numberOfFaces = 25; // Change this to match your image count
```

## 🎭 Image Guidelines

### **Diversity Checklist:**
- ✅ Different ethnicities and backgrounds
- ✅ Various ages (young adults to middle-aged)
- ✅ Gender diversity
- ✅ Professional, friendly expressions
- ✅ Clean, high-quality images
- ✅ Consistent square format

### **Technical Requirements:**
- **Resolution:** Minimum 200x200px
- **Format:** JPG preferred (smaller file size)
- **Quality:** High quality, clear faces
- **Background:** Any background (will be cropped to circle)

## 🚀 Quick Start (Demo Mode)

The component works immediately with fallback gradients if no images are found. Add your images when ready!

## ❓ Need Help?

If you need assistance:
1. **Can't find good AI faces?** Let me know and I can suggest specific prompts
2. **Technical issues?** Check the browser console for errors
3. **Want custom faces?** I can help create prompts for AI generators

**The system works perfectly right now with gradient fallbacks - add images when you're ready!**