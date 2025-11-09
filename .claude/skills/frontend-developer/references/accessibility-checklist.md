# Next.js Accessibility (a11y) Checklist

A checklist to ensure your Next.js application is accessible to all users, including those with disabilities.

## 1. Semantic HTML
- [ ] **Use HTML5 semantic elements** correctly (`<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`, `<section>`, `<aside>`).
- [ ] **Ensure a logical document structure.** Headings (`<h1>` through `<h6>`) should be nested correctly and not skip levels.
- [ ] **Use landmarks.** Use ARIA `role` attributes (e.g., `role="search"`) to define regions of a page, but prefer native HTML elements when possible.
- [ ] **Use lists (`<ul>`, `<ol>`, `<dl>`)** for list content, not just for styling.

## 2. Keyboard Navigation
- [ ] **Ensure all interactive elements are focusable and operable with a keyboard.** This includes links, buttons, form fields, and custom components.
- [ ] **The focus order should be logical and intuitive.** It should generally follow the visual layout of the page.
- [ ] **Provide a visible focus indicator.** Do not disable the `outline` property on focusable elements without providing an alternative (e.g., `outline: none` is bad practice unless you replace it).
- [ ] **Implement "skip to main content" links** for users who want to bypass navigation.

## 3. Forms & Inputs
- [ ] **Associate labels with all form controls.** Use `<label htmlFor="id">` or wrap the input with the label.
- [ ] **Use `aria-label` or `aria-labelledby`** for inputs that don't have a visible label.
- [ ] **Provide clear and accessible error messages.** Associate errors with the corresponding input using `aria-describedby`.
- [ ] **Ensure form validation is accessible.** Announce errors to screen readers.

## 4. Images & Media
- [ ] **Provide descriptive `alt` text for all informative images.**
- [ ] **Use an empty `alt=""` attribute for decorative images** so screen readers can ignore them.
- [ ] **Provide transcripts and/or captions for audio and video content.**
- [ ] **Ensure video players are keyboard accessible.**

## 5. Dynamic Content & ARIA
- [ ] **Manage focus for dynamic content.** When a modal dialog opens, focus should be moved into the dialog. When it closes, focus should return to the element that opened it.
- [ ] **Use ARIA live regions (`aria-live`)** to announce dynamic content changes to screen readers (e.g., for notifications, live chat messages, or validation errors).
- [ ] **Use `aria-busy`** to indicate when a part of the page is loading or updating.
- [ ] **Use correct ARIA roles and attributes for custom components.** For example, a custom dropdown should have `role="combobox"`, `aria-expanded`, etc.

## 6. Next.js Specifics
- [ ] **Use `next/link` for navigation.** It correctly handles client-side routing while still being a standard `<a>` tag.
- [ ] **Set the document language.** Use the `lang` attribute in `app/layout.tsx` or `pages/_document.tsx`.
- [ ] **Manage page titles.** Ensure each page has a unique and descriptive `<title>`. In the App Router, use the `metadata` object.
- [ ] **Announce route changes to screen readers.** While Next.js routing is fast, ensure screen readers announce the new page title or a message indicating the page has changed. This is often handled by modern browsers, but should be tested.

## 7. Styling & Readability
- [ ] **Ensure sufficient color contrast.** Text should have a contrast ratio of at least 4.5:1 against its background (3:1 for large text). Use tools to check this.
- [ ] **Allow users to resize text.** Use relative units (`rem`, `em`) for font sizes instead of pixels.
- [ ] **Ensure content reflows without loss of information** when the browser is zoomed or resized.

## Tools
- **Linters:** `eslint-plugin-jsx-a11y` (often included in `create-next-app`).
- **Browser Extensions:** axe DevTools, WAVE Evaluation Tool.
- **Automated Testing:** `@axe-core/react` for integration into your test suite (Jest/Vitest).
