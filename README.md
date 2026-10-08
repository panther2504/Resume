# Resume Studio

A professional A4 resume builder written in plain HTML, CSS and JavaScript. There is no build step and nothing to install. Open `index.html` in a browser.

## Features

**Templates & Content mode**
- 8 templates (Aurora, Executive, Classic, Minimal, Timeline, Tech, Elegant, Bold) with live thumbnails.
- Edit every field. Add custom fields to your personal details and to any entry.
- Add new sections (Experience, Education, Projects, Skills, Languages, Certifications, Awards, Volunteering, Publications, References, Interests, or custom ones). You can rename, hide or delete any section, place it in the main column or the sidebar, and reorder sections and entries by drag and drop.
- Light formatting in descriptions: start a line with `- ` for a bullet, and wrap text in `**double stars**` for bold.
- Design panel: accent color, heading and body fonts, font size, line spacing, margins, section spacing, sidebar width, skill display style, and a photo toggle.
- Content flows onto as many **A4 pages** as needed. Section titles are never left alone at the bottom of a page.
- Click any part of the preview to jump to its form.

**Canvas Designer mode** (build from scratch)
- Drag elements from the palette onto a page: heading, subtitle, section title, paragraph, bullet list, job entry, contact info, skill bar, chips, photo, image, rectangle, circle and line. You can also drop image files from your computer.
- Move, resize (8 handles, Shift keeps the aspect ratio), rotate, change layer order, lock, duplicate and delete. Elements snap to a grid and to smart alignment guides.
- Double-click text to edit it. Bold, italic, underline, font, size, color and highlight work on the selected words or on the whole element.
- Fonts, weight, alignment, line height, letter spacing, uppercase, background, borders, radius, padding, shadow and opacity.
- Multiple A4 pages: add, duplicate, reorder and delete pages, and drag an element onto another page to move it there.
- Start from a blank page, a starter layout, or **convert the current template** into freely editable elements.

**General**
- Light and dark mode switch in the top bar. It follows your system setting until you choose one, and remembers your choice.
- Undo and redo (Ctrl+Z / Ctrl+Y). Changes are saved automatically in the browser.
- Import and export your resume as JSON.
- **Download** menu (works offline, no external libraries):
  - **PDF file**: a real `.pdf` with one A4 page per resume page, drawn exactly as on screen with the real fonts. It includes an invisible text layer, so the text can still be selected and searched, and job-portal (ATS) parsers can read it.
  - **Excel workbook** (`.xlsx`): a "Resume" overview sheet plus one formatted table per section (experience, education, skills with ratings, and so on).
  - **Print / Save as PDF**: the browser print dialog, which gives sharp vector text. Choose "Save as PDF" and set margins to None.
  - **JSON backup**: import it later to keep editing.

## Structure

```
index.html
css/styles.css      app UI (glass theme), canvas, print rules
css/templates.css   A4 page and resume template styles
js/data.js          helpers, icons, fonts, templates, sample data
js/render.js        template renderer and A4 pagination
js/editor.js        content forms, design panel, template gallery
js/canvas.js        canvas designer and properties panel
js/export.js        PDF writer (page rendering + text layer) and XLSX writer
js/app.js           state, undo/redo history, saving, zoom, export
```
