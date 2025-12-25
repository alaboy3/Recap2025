# Image Matching Report

## Images Referenced in Website vs. Files Found

### ✅ Found Matches:

1. **BadBo.jpg**
   - Found: `Agosto/BadBo.JPEG` ✅
   - Found: `Agosto/badBo.HEIC` ✅

2. **nyc.jpg**
   - Found: `nyc.HEIC` ✅

3. **apartmentNuevo.jpg**
   - Found: `Apa/apartment 1.HEIC` ✅
   - Found: `Apa/apartment 2.HEIC` ✅
   - Found: `Apa/apartment 3.HEIC` ✅
   - *Note: Multiple apartment files found, may need to select one or use apartmentNuevo specifically*

4. **fam.jpg**
   - Found: `Niagaras/fam.jpg` ✅

5. **fashion.jpg**
   - Found: `Fashion/fashionInspo.PNG` ✅
   - Found: `Fashion/fashionInspo2.PNG` ✅
   - Found: `Fashion/fashionInspo3.PNG` ✅
   - Found: `Fashion/fashionInspo5.PNG` ✅
   - *Note: Multiple fashion files found*

6. **YOSEMITE.jpg**
   - Found: `Yosemite/` folder ✅
   - Contains: `yosemite.MOV`, `yosemite 2.MOV`, `SF.HEIC`
   - *Note: No direct YOSEMITE.jpg file, but Yosemite folder exists*

7. **Restaurant Images (for Notes window)**
   - **Dirty Candy**: 
     - Found: `Restaurants/dirt candy.JPG` ✅
     - Found: `Restaurants/dirt candy 2.JPG` ✅
   - **Reverie**:
     - Found: `Restaurants/reverie.HEIC` ✅
     - Found: `Restaurants/reverie 2.HEIC` ✅
   - **GEMELLO**: ❌ Not found
   - **Kora**: ❌ Not found

### ❌ Missing Files:

1. **outfit1.jpg, outfit2.jpg, outfit3.jpg**
   - Not found in images folder
   - *Note: Check if these exist with different names or in a different location*

2. **restaurant3.jpg, restaurant4.jpg** (for GEMELLO)
   - Not found

3. **restaurant7.jpg, restaurant8.jpg** (for Kora)
   - Not found

4. **YOSEMITE.jpg** (specific file)
   - Yosemite folder exists but no direct YOSEMITE.jpg file

## Recommendations:

1. **Update file paths in desktopData.json** to match actual file locations:
   - `BadBo.jpg` → `Agosto/BadBo.JPEG` or `Agosto/badBo.HEIC`
   - `nyc.jpg` → `nyc.HEIC`
   - `apartmentNuevo.jpg` → `Apa/apartment 1.HEIC` (or select appropriate one)
   - `fashion.jpg` → `Fashion/fashionInspo.PNG` (or select appropriate one)
   - `YOSEMITE.jpg` → Select from Yosemite folder or create a specific file

2. **For restaurant images in NotesWindow**:
   - Dirty Candy: Use `Restaurants/dirt candy.JPG` and `Restaurants/dirt candy 2.JPG`
   - Reverie: Use `Restaurants/reverie.HEIC` and `Restaurants/reverie 2.HEIC`
   - GEMELLO: Need to add images or find them
   - Kora: Need to add images or find them

3. **For outfit images**:
   - Search for outfit-related images or create/rename files to match

4. **Consider organizing**:
   - All images are already in organized folders (Agosto, Apa, Fashion, Niagaras, Restaurants, Yosemite, etc.)
   - The website references flat filenames, but actual files are in subfolders

