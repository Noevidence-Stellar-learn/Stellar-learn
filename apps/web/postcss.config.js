// PostCSS config — required for Next.js to run Tailwind CSS and Autoprefixer.
// Without this file, the `@tailwind` directives in globals.css are ignored and
// no utility classes are generated (only the custom `@layer` CSS survives).
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
