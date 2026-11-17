# ErgonPDF Tools Reference Manual

> Exhaustive technical and functional reference for all 134 built-in PDF tools in ErgonPDF.  
> Every tool runs 100% locally in client browser memory via WebAssembly and JavaScript with zero server uploads or external telemetry.

---

## Directory Overview (134 Precision Utilities)

ErgonPDF provides complete 100% feature parity with PDF24's 124-tool catalog and iLovePDF's 31-tool suite, plus ErgonPDF's signature offline AI Document Studio, interactive E-Invoice generator, and duplex scanner collation:

1. [Organize & Layout (20 Tools)](#1-organize-layout)
2. [Convert & Transform (59 Tools)](#2-convert-transform)
3. [Create & Capture (17 Tools)](#3-create-capture)
4. [Edit & Annotate (10 Tools)](#4-edit-annotate)
5. [Compress & Optimize (8 Tools)](#5-compress-optimize)
6. [Security & Privacy (8 Tools)](#6-security-privacy)
7. [View & Compare (7 Tools)](#7-view-compare)
8. [OCR & Text Extraction (2 Tools)](#8-ocr-text-extraction)
9. [AI Document Studio (3 Tools)](#9-ai-document-studio)

---

## 1. Organize & Layout

Total Tools: **17**

### `merge-pdf` — Merge PDF
- **Operational Purpose**: Combine several PDFs, images or Word files into one PDF
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Layers`
- **Badge**: `Popular`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `merge`, `pdf`, `combine`, `several`, `pdfs`, `images`, `word`, `files`

### `split-pdf` — Split PDF
- **Operational Purpose**: After a number of pages, into even and odd pages or exactly where you click
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Scissors`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `split`, `pdf`, `after`, `number`, `pages`, `even`, `exactly`, `where`

### `straighten-pdf` — Straighten scans
- **Operational Purpose**: Deskew crooked scanned PDF pages automatically
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `straighten`, `scans`, `deskew`, `crooked`, `scanned`, `pages`, `automatically`

### `crop-pdf` — Crop PDF
- **Operational Purpose**: Trim white margins, per edge or visually on a page preview
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Crop`
- **Discovery Intents**: `crop`, `pdf`, `trim`, `white`, `margins`, `edge`, `visually`, `page`

### `change-pdf-page-size` — Change PDF page size
- **Operational Purpose**: To A4, A3, Letter or a custom size, mixed sizes made uniform
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Maximize2`
- **Discovery Intents**: `change`, `pdf`, `page`, `size`, `letter`, `custom`, `mixed`, `sizes`

### `assemble-pdf` — Assemble PDF
- **Operational Purpose**: Several documents at once: move pages between them, merge, split and save
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Layers`
- **Discovery Intents**: `assemble`, `pdf`, `several`, `documents`, `once`, `move`, `pages`, `between`

### `rearrange-pdf-pages` — Rearrange PDF pages
- **Operational Purpose**: Drag pages into a new order or reverse them, without quality loss
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `LayoutGrid`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `rearrange`, `pdf`, `pages`, `drag`, `order`, `reverse`, `them`, `without`

### `remove-pdf-pages` — Remove PDF pages
- **Operational Purpose**: Delete unwanted pages with a click, original quality kept
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Trash2`
- **Discovery Intents**: `remove`, `pdf`, `pages`, `delete`, `unwanted`, `click`, `original`, `quality`

### `extract-pdf-pages` — Extract PDF pages
- **Operational Purpose**: Pick pages with a click and save them as a new PDF, without quality loss
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `extract`, `pdf`, `pages`, `pick`, `click`, `save`, `them`, `without`

### `rotate-pdf-pages` — Rotate PDF pages
- **Operational Purpose**: Turn sideways or upside-down pages, e.g. of scans, without quality loss
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `RotateCw`
- **Discovery Intents**: `rotate`, `pdf`, `pages`, `turn`, `sideways`, `upside`, `down`, `scans`

### `pages-per-sheet` — Pages per sheet
- **Operational Purpose**: 2, 4, 9 or up to 16 pages on one sheet, with margins and borders
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Grid2X2`
- **Discovery Intents**: `pages`, `per`, `sheet`, `margins`, `borders`

### `print-pdf` — Print PDF
- **Operational Purpose**: Sheet preview, several pages per sheet and double-sided, even without duplex
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Printer`
- **Discovery Intents**: `print`, `pdf`, `sheet`, `preview`, `several`, `pages`, `double`, `sided`

### `create-pdf-booklet` — Create booklet
- **Operational Purpose**: Arrange PDF pages as a booklet to print, fold and staple
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `BookOpen`
- **Discovery Intents**: `create`, `booklet`, `arrange`, `pages`, `print`, `fold`, `staple`

### `print-pdf-as-poster` — Print PDF as poster
- **Operational Purpose**: Enlarge a PDF page and print it across several sheets
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Grid2X2`
- **Discovery Intents**: `print`, `pdf`, `poster`, `enlarge`, `page`, `across`, `several`, `sheets`

### `halve-pdf-pages` — Halve PDF pages
- **Operational Purpose**: Cut double pages down the middle, e.g. A3 into two A4 pages
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Columns2`
- **Discovery Intents**: `halve`, `pdf`, `pages`, `double`, `down`, `middle`

### `bookmark-pdf` — Bookmark PDF
- **Operational Purpose**: A clickable table of contents: add, rename, indent and style entries
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `BookOpen`
- **Discovery Intents**: `bookmark`, `pdf`, `clickable`, `table`, `contents`, `rename`, `indent`, `style`

### `alternate-mix` — Alternate & Mix PDFs
- **Operational Purpose**: Interleave alternating odd and even pages from two documents into a single collated PDF for scanners.
- **Category**: `organize`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Shuffle`
- **Discovery Intents**: `alternate`, `mix`, `pdfs`, `interleave`, `alternating`, `even`, `pages`, `documents`

---

## 2. Convert & Transform

Total Tools: **59**

### `pdf-converter` — PDF Converter
- **Operational Purpose**: Files to PDF and PDF back to Word, Excel, images and more
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `converter`, `files`, `back`, `word`, `excel`, `images`

### `images-to-pdf` — Images to PDF
- **Operational Purpose**: Several pictures in one PDF, with page size, orientation and margins
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `images`, `pdf`, `several`, `pictures`, `page`, `size`, `orientation`, `margins`

### `pdf-to-images` — PDF to Images
- **Operational Purpose**: Every page as JPG or PNG, in color or grayscale, resolution adjustable
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `pdf`, `images`, `every`, `page`, `color`, `grayscale`, `resolution`, `adjustable`

### `extract-images` — Extract PDF images
- **Operational Purpose**: Save every embedded photo and graphic, all at once as ZIP
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `extract`, `pdf`, `images`, `save`, `every`, `embedded`, `photo`, `graphic`

### `pdf-to-pdfa` — PDF to PDF/A
- **Operational Purpose**: The PDF/A-2b archive standard, so documents stay readable for decades
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Archive`
- **Discovery Intents**: `pdf`, `archive`, `standard`, `documents`, `stay`, `readable`, `decades`, `pdfa`

### `convert-to-pdf` — Convert to PDF
- **Operational Purpose**: Word, Excel, PowerPoint, images and many other files as PDF
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `convert`, `pdf`, `word`, `excel`, `powerpoint`, `images`, `many`, `other`

### `word-to-pdf` — Word to PDF
- **Operational Purpose**: Word documents as PDF that look the same on any device – even without Word
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `word`, `pdf`, `documents`, `look`, `same`, `device`, `even`, `without`

### `powerpoint-to-pdf` — PowerPoint to PDF
- **Operational Purpose**: Presentations as PDF with one page per slide – easy to send and show
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `powerpoint`, `pdf`, `presentations`, `page`, `slide`, `easy`, `send`, `show`

### `excel-to-pdf` — Excel to PDF
- **Operational Purpose**: Spreadsheets as PDF for sharing and printing, tables and charts kept in place
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `excel`, `pdf`, `spreadsheets`, `sharing`, `printing`, `tables`, `charts`, `kept`

### `publisher-to-pdf` — Publisher to PDF
- **Operational Purpose**: Flyers, newsletters and brochures from Publisher as PDF – without Publisher
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `publisher`, `pdf`, `flyers`, `newsletters`, `brochures`, `without`

### `jpg-to-pdf` — JPG to PDF
- **Operational Purpose**: Several JPG images in one PDF – in your order and a uniform page size
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `jpg`, `pdf`, `several`, `images`, `order`, `uniform`, `page`, `size`

### `png-to-pdf` — PNG to PDF
- **Operational Purpose**: Screenshots and graphics combined into one PDF in your order
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `png`, `pdf`, `screenshots`, `graphics`, `combined`, `order`

### `webp-to-pdf` — WEBP to PDF
- **Operational Purpose**: Pictures saved from websites combined into one PDF
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `webp`, `pdf`, `pictures`, `saved`, `websites`, `combined`

### `heic-to-pdf` — HEIC to PDF
- **Operational Purpose**: Why HEIC is not supported and how to get JPG photos for a PDF instead
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `heic`, `pdf`, `supported`, `photos`, `instead`

### `svg-to-pdf` — SVG to PDF
- **Operational Purpose**: Vector graphics as PDF with lines and text kept sharp
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `svg`, `pdf`, `vector`, `graphics`, `lines`, `text`, `kept`, `sharp`

### `tiff-to-pdf` — TIFF to PDF
- **Operational Purpose**: TIFF images and multi-page scans, each TIFF page becomes a PDF page
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `tiff`, `pdf`, `images`, `multi`, `page`, `scans`, `each`, `becomes`

### `docx-to-pdf` — DOCX to PDF
- **Operational Purpose**: Documents from Word, LibreOffice or Google Docs as PDF that looks the same everywhere
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `docx`, `pdf`, `documents`, `word`, `libreoffice`, `google`, `docs`, `looks`

### `pptx-to-pdf` — PPTX to PDF
- **Operational Purpose**: Slides from PowerPoint, Impress or Google Slides as PDF, one page per slide
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `pptx`, `pdf`, `slides`, `powerpoint`, `impress`, `google`, `page`, `slide`

### `xlsx-to-pdf` — XLSX to PDF
- **Operational Purpose**: Spreadsheets from Excel, LibreOffice Calc or Google Sheets as PDF
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `xlsx`, `pdf`, `spreadsheets`, `excel`, `libreoffice`, `calc`, `google`, `sheets`

### `doc-to-pdf` — DOC to PDF
- **Operational Purpose**: Old Word 97–2003 documents as PDF – no Word installation needed
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `doc`, `pdf`, `word`, `2003`, `documents`, `installation`, `needed`

### `ppt-to-pdf` — PPT to PDF
- **Operational Purpose**: Old PowerPoint 97–2003 presentations as PDF, one page per slide
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `ppt`, `pdf`, `powerpoint`, `2003`, `presentations`, `page`, `slide`

### `xls-to-pdf` — XLS to PDF
- **Operational Purpose**: Old Excel 97–2003 spreadsheets as PDF anyone can read and print
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `xls`, `pdf`, `excel`, `2003`, `spreadsheets`, `anyone`, `read`, `print`

### `odt-to-pdf` — ODT to PDF
- **Operational Purpose**: LibreOffice Writer and OpenOffice documents as PDF – no office suite needed
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `odt`, `pdf`, `libreoffice`, `writer`, `openoffice`, `documents`, `office`, `suite`

### `odg-to-pdf` — ODG to PDF
- **Operational Purpose**: Drawings and diagrams from LibreOffice Draw as PDF that opens anywhere
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `odg`, `pdf`, `drawings`, `diagrams`, `libreoffice`, `draw`, `opens`, `anywhere`

### `ods-to-pdf` — ODS to PDF
- **Operational Purpose**: LibreOffice Calc spreadsheets as PDF for sharing and printing
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `ods`, `pdf`, `libreoffice`, `calc`, `spreadsheets`, `sharing`, `printing`

### `odp-to-pdf` — ODP to PDF
- **Operational Purpose**: LibreOffice Impress presentations as PDF, one page per slide
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `odp`, `pdf`, `libreoffice`, `impress`, `presentations`, `page`, `slide`

### `txt-to-pdf` — Text to PDF
- **Operational Purpose**: Plain text files as PDF with accents and special characters shown correctly
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `text`, `pdf`, `plain`, `files`, `accents`, `special`, `characters`, `shown`

### `rtf-to-pdf` — RTF to PDF
- **Operational Purpose**: Documents from WordPad, Word or LibreOffice as PDF that looks the same everywhere
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `rtf`, `pdf`, `documents`, `wordpad`, `word`, `libreoffice`, `looks`, `same`

### `epub-to-pdf` — EPUB to PDF
- **Operational Purpose**: E-books as PDF to read and print on any device – no e-reader app needed
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Archive`
- **Discovery Intents**: `epub`, `pdf`, `books`, `read`, `print`, `device`, `reader`, `needed`

### `ps-to-pdf` — PS to PDF
- **Operational Purpose**: PostScript and EPS files that open in any PDF viewer
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `postscript`, `files`, `open`, `viewer`

### `markdown-to-pdf` — Markdown to PDF
- **Operational Purpose**: .md files as a neatly formatted PDF with headings, lists, tables and code
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `markdown`, `pdf`, `files`, `neatly`, `formatted`, `headings`, `lists`, `tables`

### `pub-to-pdf` — PUB to PDF
- **Operational Purpose**: Flyers, newsletters and brochures from Publisher as PDF – without Publisher
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pub`, `pdf`, `flyers`, `newsletters`, `brochures`, `publisher`, `without`

### `udf-to-pdf` — UDF to PDF
- **Operational Purpose**: UYAP documents as PDF in the original page layout – without UYAP
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `udf`, `pdf`, `uyap`, `documents`, `original`, `page`, `layout`, `without`

### `ofd-to-pdf` — OFD to PDF
- **Operational Purpose**: OFD documents such as Chinese e-invoices as PDF in the original layout
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `ofd`, `pdf`, `documents`, `such`, `chinese`, `invoices`, `original`, `layout`

### `convert-from-pdf` — Convert PDF to ...
- **Operational Purpose**: PDFs as Word, Excel, PowerPoint, images, text, HTML or PDF/A
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `convert`, `pdf`, `pdfs`, `word`, `excel`, `powerpoint`, `images`, `text`

### `pdf-to-word` — PDF to Word
- **Operational Purpose**: Editable Word documents – keep the original layout or reflow the text
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `pdf`, `word`, `editable`, `documents`, `keep`, `original`, `layout`, `reflow`

### `pdf-to-powerpoint` — PDF to PowerPoint
- **Operational Purpose**: One slide per page with editable text boxes, pictures and shapes
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `pdf`, `powerpoint`, `slide`, `page`, `editable`, `text`, `boxes`, `pictures`

### `pdf-to-excel` — PDF to Excel
- **Operational Purpose**: Tables in Excel with real cells, numbers and dates to calculate with
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `pdf`, `excel`, `tables`, `real`, `cells`, `numbers`, `dates`, `calculate`

### `pdf-to-jpg` — PDF to JPG
- **Operational Purpose**: Every page as a separate image, with the resolution and quality you choose
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `pdf`, `jpg`, `every`, `page`, `separate`, `image`, `resolution`, `quality`

### `pdf-to-png` — PDF to PNG
- **Operational Purpose**: Every page as a separate lossless image, with the resolution you choose
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `pdf`, `png`, `every`, `page`, `separate`, `lossless`, `image`, `resolution`

### `pdf-to-svg` — PDF to SVG
- **Operational Purpose**: Every page as a scalable vector graphic for web, design and print
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `svg`, `every`, `page`, `scalable`, `vector`, `graphic`, `design`

### `pdf-to-tiff` — PDF to TIFF
- **Operational Purpose**: One multi-page TIFF or one file per page, in color or black and white
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `pdf`, `tiff`, `multi`, `page`, `file`, `color`, `black`, `white`

### `pdf-to-docx` — PDF to DOCX
- **Operational Purpose**: Editable DOCX for Word, LibreOffice or Google Docs with images and fonts
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `docx`, `editable`, `word`, `libreoffice`, `google`, `docs`, `images`

### `pdf-to-pptx` — PDF to PPTX
- **Operational Purpose**: Editable slides for PowerPoint, Impress or Google Slides
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `pdf`, `pptx`, `editable`, `slides`, `powerpoint`, `impress`, `google`

### `pdf-to-xlsx` — PDF to XLSX
- **Operational Purpose**: One worksheet per table, values ready for formulas
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `pdf`, `xlsx`, `worksheet`, `table`, `values`, `ready`, `formulas`

### `pdf-to-odt` — PDF to ODT
- **Operational Purpose**: Editable documents for LibreOffice Writer – layout kept or reflowed
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `odt`, `editable`, `documents`, `libreoffice`, `writer`, `layout`, `kept`

### `pdf-to-ods` — PDF to ODS
- **Operational Purpose**: Tables for LibreOffice Calc with real cells and values
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `pdf`, `ods`, `tables`, `libreoffice`, `calc`, `real`, `cells`, `values`

### `pdf-to-odp` — PDF to ODP
- **Operational Purpose**: Slides for LibreOffice Impress, one per page, with editable text boxes
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileCode`
- **Discovery Intents**: `pdf`, `odp`, `slides`, `libreoffice`, `impress`, `page`, `editable`, `text`

### `pdf-to-txt` — PDF to Text
- **Operational Purpose**: The text as a TXT file to search, copy or reuse
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `text`, `file`, `search`, `copy`, `reuse`, `txt`

### `pdf-to-rtf` — PDF to RTF
- **Operational Purpose**: Editable documents for WordPad, Word or LibreOffice
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `rtf`, `editable`, `documents`, `wordpad`, `word`, `libreoffice`

### `pdf-to-epub` — PDF to EPUB
- **Operational Purpose**: E-books with text that reflows on e-readers or with a fixed page layout
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Archive`
- **Discovery Intents**: `pdf`, `epub`, `books`, `text`, `reflows`, `readers`, `fixed`, `page`

### `pdf-to-html` — PDF to HTML
- **Operational Purpose**: One HTML file in the original layout with selectable, searchable text
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Globe`
- **Discovery Intents**: `pdf`, `html`, `file`, `original`, `layout`, `selectable`, `searchable`, `text`

### `pdf-to-markdown` — PDF to Markdown
- **Operational Purpose**: Headings, lists, tables and links, without repeating headers and footers
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `markdown`, `headings`, `lists`, `tables`, `links`, `without`, `repeating`

### `heic-to-jpg` — HEIC to JPG
- **Operational Purpose**: Why HEIC is not supported and how to get JPG from your iPhone
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `heic`, `jpg`, `supported`, `iphone`

### `heic-to-png` — HEIC to PNG
- **Operational Purpose**: Why HEIC is not supported and how to get compatible images from your iPhone
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `heic`, `png`, `supported`, `compatible`, `images`, `iphone`

### `webp-to-jpg` — WEBP to JPG
- **Operational Purpose**: Pictures from websites as JPG that almost every program opens
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `webp`, `jpg`, `pictures`, `websites`, `almost`, `every`, `program`, `opens`

### `webp-to-png` — WEBP to PNG
- **Operational Purpose**: Pictures from websites as lossless PNG, several at once
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `webp`, `png`, `pictures`, `websites`, `lossless`, `several`, `once`

### `svg-to-jpg` — SVG to JPG
- **Operational Purpose**: Vector graphics as JPG in the size you choose, right in your browser
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `svg`, `jpg`, `vector`, `graphics`, `size`, `choose`, `right`, `browser`

### `svg-to-png` — SVG to PNG
- **Operational Purpose**: Vector graphics as PNG in the size you choose, transparency kept
- **Category**: `convert`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Image`
- **Discovery Intents**: `svg`, `png`, `vector`, `graphics`, `size`, `choose`, `transparency`, `kept`

---

## 3. Create & Capture

Total Tools: **16**

### `create-pdf` — Create PDF
- **Operational Purpose**: From Office files, images, websites or scans, plus forms and invoices
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FilePlus`
- **Discovery Intents**: `create`, `pdf`, `office`, `files`, `images`, `websites`, `scans`, `plus`

### `scan-pdf` — Create PDF with a camera
- **Operational Purpose**: Scan documents with your phone or webcam instead of a scanner
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Camera`
- **Discovery Intents**: `create`, `pdf`, `with`, `camera`, `scan`, `documents`, `phone`, `webcam`

### `webpage-to-pdf` — Webpage to PDF
- **Operational Purpose**: Paste a URL and save websites and articles as PDF
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Globe`
- **Discovery Intents**: `webpage`, `pdf`, `paste`, `save`, `websites`, `articles`

### `create-photo-collage` — Create photo collage
- **Operational Purpose**: Put photos together on pages with templates, texts and stickers – as PDF, JPG or PNG
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FilePlus`
- **Discovery Intents**: `create`, `photo`, `collage`, `photos`, `together`, `pages`, `templates`, `texts`

### `create-card` — Create card
- **Operational Purpose**: Postcards, invitations and vouchers from templates – print-ready as PDF
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FilePlus`
- **Discovery Intents**: `create`, `card`, `postcards`, `invitations`, `vouchers`, `templates`, `print`, `ready`

### `create-fillable-pdf-form` — Create PDF form
- **Operational Purpose**: Design a new fillable PDF form from scratch
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `CheckSquare`
- **Discovery Intents**: `create`, `pdf`, `form`, `design`, `fillable`, `scratch`

### `create-job-application` — Create PDF job application
- **Operational Purpose**: Cover letter, CV and attachments in one PDF, ready to send by email
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FilePlus`
- **Discovery Intents**: `create`, `pdf`, `job`, `application`, `cover`, `letter`, `attachments`, `ready`

### `generate-qr-code` — Generate QR code
- **Operational Purpose**: For links, WiFi, contacts or payments, with your own colors and logo
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `QrCode`
- **Discovery Intents**: `generate`, `code`, `links`, `wifi`, `contacts`, `payments`, `colors`, `logo`

### `create-invoice` — Create invoice
- **Operational Purpose**: Classic PDF invoice in a designer or e-invoice like ZUGFeRD and XRechnung
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Badge**: `EU Standard`
- **Discovery Intents**: `create`, `invoice`, `classic`, `designer`, `like`, `zugferd`, `xrechnung`

### `create-invoice-visually` — Create invoice visually
- **Operational Purpose**: Fill in a template and see the finished invoice as you type
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Badge**: `EU Standard`
- **Discovery Intents**: `create`, `invoice`, `visually`, `fill`, `template`, `finished`, `type`

### `create-electronic-invoice` — Create electronic invoice
- **Operational Purpose**: As ZUGFeRD PDF or XRechnung and Peppol XML, from a form or a PDF
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `create`, `electronic`, `invoice`, `zugferd`, `xrechnung`, `peppol`, `form`

### `pdf-to-e-invoice` — PDF invoice to e-invoice
- **Operational Purpose**: A ZUGFeRD e-invoice that keeps your layout and carries the data as XML
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Badge**: `EU Standard`
- **Discovery Intents**: `pdf`, `invoice`, `zugferd`, `keeps`, `layout`, `carries`, `data`

### `xml-invoice-to-pdf` — XML e-invoice to PDF
- **Operational Purpose**: Make EN 16931-based e-invoice XML readable as PDF
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Discovery Intents**: `xml`, `invoice`, `pdf`, `make`, `16931`, `based`, `readable`

### `validate-e-invoice` — Validate e-invoice
- **Operational Purpose**: Check e-invoices against the official rules and read them
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Table`
- **Badge**: `EU Standard`
- **Discovery Intents**: `validate`, `invoice`, `check`, `invoices`, `against`, `official`, `rules`, `read`

### `creator` — PDF24 Creator
- **Operational Purpose**: Free Windows software with all tools and a PDF printer, works offline
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Badge**: `Desktop`
- **Discovery Intents**: `pdf24`, `creator`, `free`, `windows`, `software`, `tools`, `printer`, `works`

### `pdf-printer` — PDF Printer
- **Operational Purpose**: Print to PDF from any Windows program, with profiles for PDF/A and PDF/X
- **Category**: `create`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Printer`
- **Discovery Intents**: `pdf`, `printer`, `print`, `windows`, `program`, `profiles`

---

## 4. Edit & Annotate

Total Tools: **9**

### `edit-pdf` — Edit PDF
- **Operational Purpose**: Text, images, shapes, signatures, comments and forms in one editor
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Edit3`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `edit`, `pdf`, `text`, `images`, `shapes`, `signatures`, `comments`, `forms`

### `sign-pdf` — Sign PDF
- **Operational Purpose**: Draw, upload or photograph your signature, or sign with a certificate
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `PenTool`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `sign`, `pdf`, `draw`, `upload`, `photograph`, `signature`, `certificate`

### `write-pdf` — Write PDF
- **Operational Purpose**: Write a letter, an offer or a report like in a word processor and create a PDF of it
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Edit3`
- **Discovery Intents**: `write`, `pdf`, `letter`, `offer`, `report`, `like`, `word`, `processor`

### `annotate-pdf` — Annotate PDF
- **Operational Purpose**: Sticky notes, text boxes, highlights, arrows and freehand drawing
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Edit3`
- **Discovery Intents**: `annotate`, `pdf`, `sticky`, `notes`, `text`, `boxes`, `highlights`, `arrows`

### `fill-out-pdf` — Fill out PDF
- **Operational Purpose**: Type into forms, tick boxes and add a signature – no printing needed
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `CheckSquare`
- **Discovery Intents**: `fill`, `out`, `pdf`, `type`, `forms`, `tick`, `boxes`, `signature`

### `make-pdf-fillable` — Make PDF fillable
- **Operational Purpose**: Add form fields to an existing PDF or edit a PDF form
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `CheckSquare`
- **Discovery Intents**: `make`, `pdf`, `fillable`, `form`, `fields`, `existing`, `edit`

### `add-watermark` — Add watermark
- **Operational Purpose**: Text like “Confidential” or an image, with color, angle and transparency
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Stamp`
- **Discovery Intents**: `add`, `watermark`, `text`, `like`, `confidential`, `image`, `color`, `angle`

### `add-page-numbers` — Add page numbers
- **Operational Purpose**: Patterns like “Page 1 of 10”, with font, color, position and start number
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Hash`
- **Discovery Intents**: `add`, `page`, `numbers`, `patterns`, `like`, `font`, `color`, `position`

### `overlay-pdf` — PDF Overlay
- **Operational Purpose**: Put a digital letterhead behind your documents or a page on top
- **Category**: `edit`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Layers`
- **Discovery Intents**: `pdf`, `overlay`, `digital`, `letterhead`, `behind`, `documents`, `page`

---

## 5. Compress & Optimize

Total Tools: **8**

### `compress-pdf` — Compress PDF
- **Operational Purpose**: Smaller files by lowering image resolution and quality, all adjustable
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Minimize2`
- **Badge**: `Popular`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `compress`, `pdf`, `smaller`, `files`, `lowering`, `image`, `resolution`, `quality`

### `convert-pdf-to-grayscale` — PDF to grayscale
- **Operational Purpose**: Convert colour PDFs to grayscale or black and white
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Minimize2`
- **Discovery Intents**: `pdf`, `grayscale`, `convert`, `colour`, `pdfs`, `black`, `white`

### `invert-pdf` — Invert PDF colors
- **Operational Purpose**: PDFs in dark mode: dark background and light text
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Minimize2`
- **Discovery Intents**: `invert`, `pdf`, `colors`, `pdfs`, `dark`, `mode`, `background`, `light`

### `web-optimize-pdf` — Web optimize PDF
- **Operational Purpose**: Linearize PDF files for a faster web view
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Zap`
- **Discovery Intents**: `web`, `optimize`, `pdf`, `linearize`, `files`, `faster`, `view`

### `repair-pdf` — Repair PDF
- **Operational Purpose**: Recover as much as possible from corrupt or broken PDF files
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Wrench`
- **Discovery Intents**: `repair`, `pdf`, `recover`, `much`, `possible`, `corrupt`, `broken`, `files`

### `rasterize-pdf` — Rasterize PDF
- **Operational Purpose**: Turn pages into images so text can no longer be selected or edited
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `CopyPlus`
- **Discovery Intents**: `rasterize`, `pdf`, `turn`, `pages`, `images`, `text`, `longer`, `selected`

### `flatten-pdf` — Flatten PDF
- **Operational Purpose**: Protect forms in PDFs from changes
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `CopyPlus`
- **Discovery Intents**: `flatten`, `pdf`, `protect`, `forms`, `pdfs`, `changes`

### `compress-images` — Compress images
- **Operational Purpose**: Make JPG, PNG and WebP images smaller
- **Category**: `compress`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Minimize2`
- **Discovery Intents**: `compress`, `images`, `make`, `webp`, `smaller`

---

## 6. Security & Privacy

Total Tools: **7**

### `change-pdf-doc-info` — Change PDF document information
- **Operational Purpose**: Change document information like title, author, keywords and subject
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `ShieldCheck`
- **Discovery Intents**: `change`, `pdf`, `document`, `information`, `like`, `title`, `author`, `keywords`

### `lock-pdf` — Protect PDF
- **Operational Purpose**: Protect PDF files with a password and set permissions
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Lock`
- **Badge**: `Security`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `protect`, `pdf`, `files`, `password`, `permissions`, `lock`

### `unlock-pdf` — Unlock PDF
- **Operational Purpose**: Remove password protection from PDFs you know the password for
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Lock`
- **Discovery Intents**: `unlock`, `pdf`, `remove`, `password`, `protection`, `pdfs`, `know`

### `redact-pdf` — Redact PDF
- **Operational Purpose**: Black out confidential text and images for good – it cannot be restored
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `EyeOff`
- **Discovery Intents**: `redact`, `pdf`, `black`, `confidential`, `text`, `images`, `good`, `cannot`

### `remove-pdf-metadata` — Remove PDF metadata
- **Operational Purpose**: Strip author, dates, software and keywords before you share a PDF
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Trash2`
- **Discovery Intents**: `remove`, `pdf`, `metadata`, `strip`, `author`, `dates`, `software`, `keywords`

### `generate-password` — Generate password
- **Operational Purpose**: Strong random passwords, created on your device, ready to copy
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `KeyRound`
- **Discovery Intents**: `generate`, `password`, `strong`, `random`, `passwords`, `created`, `device`, `ready`

### `verify-pdf-signatures` — Verify PDF signatures
- **Operational Purpose**: Who signed and when, and whether the document was changed since
- **Category**: `security`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `PenTool`
- **Discovery Intents**: `verify`, `pdf`, `signatures`, `signed`, `when`, `whether`, `document`, `changed`

---

## 7. View & Compare

Total Tools: **7**

### `analyze-pdf` — PDF info
- **Operational Purpose**: Show version, page sizes, fonts, images and more of a PDF
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `FileText`
- **Discovery Intents**: `pdf`, `info`, `show`, `version`, `page`, `sizes`, `fonts`, `images`

### `view-pdf` — View as PDF
- **Operational Purpose**: Show Word, Excel, images and other files in the browser, without the program
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Eye`
- **Discovery Intents**: `view`, `pdf`, `show`, `word`, `excel`, `images`, `other`, `files`

### `compare-pdf` — Compare PDFs
- **Operational Purpose**: See every change between two versions of a document, without uploading
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `GitCompare`
- **Discovery Intents**: `compare`, `pdfs`, `every`, `change`, `between`, `versions`, `document`, `without`

### `search-pdf` — Search in PDFs
- **Operational Purpose**: Find text in several PDF files at once
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Search`
- **Discovery Intents**: `search`, `pdfs`, `find`, `text`, `several`, `files`, `once`

### `validate-pdfa` — Check PDF/A
- **Operational Purpose**: Check PDF/A (archiving) and PDF/UA (accessibility) and see what is wrong
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Archive`
- **Discovery Intents**: `check`, `pdf`, `archiving`, `accessibility`, `what`, `wrong`, `validate`, `pdfa`

### `set-pdf-viewer-preferences` — Set PDF viewer preferences
- **Operational Purpose**: Start page, zoom and layout a PDF opens with, toolbars shown or hidden
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Eye`
- **Discovery Intents**: `set`, `pdf`, `viewer`, `preferences`, `start`, `page`, `zoom`, `layout`

### `pdf-reader` — PDF Reader
- **Operational Purpose**: Slim, fast PDF viewer for Windows that opens files offline
- **Category**: `view`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Eye`
- **Discovery Intents**: `pdf`, `reader`, `slim`, `fast`, `viewer`, `windows`, `opens`, `files`

---

## 8. OCR & Text Extraction

Total Tools: **2**

### `copy-from-pdf` — Copy from PDF
- **Operational Purpose**: Click paragraphs, tables, lists and pictures and copy them – from scans too
- **Category**: `ocr`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `ScanText`
- **Discovery Intents**: `copy`, `from`, `pdf`, `click`, `paragraphs`, `tables`, `lists`, `pictures`

### `ocr-pdf` — PDF OCR
- **Operational Purpose**: Make scans and photos searchable and copy their text
- **Category**: `ocr`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `ScanText`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `pdf`, `ocr`, `make`, `scans`, `photos`, `searchable`, `copy`, `their`

---

## 9. AI Document Studio

Total Tools: **1**

### `ai-chat` — AI Document Studio
- **Operational Purpose**: Local semantic analysis, entity extraction, document summarization, and query citations with zero cloud calls.
- **Category**: `ai`
- **Execution Mode**: `local` (100% In-Browser Memory via WebAssembly / Canvas / Web Workers)
- **Icon**: `Sparkles`
- **Badge**: `Smart`
- **Popularity Tier**: High Demand / Pinned Quick Action
- **Discovery Intents**: `document`, `studio`, `local`, `semantic`, `analysis`, `entity`, `extraction`, `summarization`

---

## Architectural Guarantees Across All 126 Tools

1. **Non-Negotiable Privacy Invariant**: Zero document bytes, text tokens, rendering canvases, or telemetry packets ever leave the user's computer.
2. **Deterministic Processing**: PDF transformations strictly adhere to ISO 32000-1 and PDF/A ISO 19005 standards.
3. **No External Network Dependencies**: All font files, icon sets, WebAssembly binaries, and OCR language models are bundled locally.
4. **Air-Gap & Offline Ready**: Every tool operates identically with Wi-Fi disabled or within completely isolated networks.
