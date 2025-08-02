import React from "react"
import ReactDOMServer from "react-dom/server"

interface PrintOptions {
  title?: string
  // Add other print-specific options if needed, e.g., paper size, orientation
}

/**
 * Renders a React component into a new window and triggers the print dialog.
 * @param Component The React component to print.
 * @param props The props to pass to the component.
 * @param options Optional print options like title for the new window.
 */
export const printDocument = <P extends object>(
  Component: React.ComponentType<P>,
  props: P,
  options?: PrintOptions,
) => {
  // Render the React component to a static HTML string
  const htmlContent = ReactDOMServer.renderToStaticMarkup(
    <React.StrictMode>
      <Component {...props} />
    </React.StrictMode>,
  )

  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    console.error("Failed to open print window. Pop-ups might be blocked.")
    return
  }

  // Write the HTML content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options?.title || "Print Document"}</title>
      <style>
        /* Basic print styles to ensure readability */
        body {
          font-family: sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
        }
        /* Add any global styles or Tailwind CSS output here if needed for printing */
        /* For example, if you want to include Tailwind's base styles: */
        /* @import url('https://unpkg.com/tailwindcss@^2/dist/base.min.css'); */
        /* @import url('https://unpkg.com/tailwindcss@^2/dist/components.min.css'); */
        /* @import url('https://unpkg.com/tailwindcss@^2/dist/utilities.min.css'); */
        
        /* Or, if you have a compiled CSS file for print: */
        /* @import url('/path/to/your/print.css'); */

        /* Example: Ensure elements are visible and not cut off */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Add specific styles for your components if they need adjustments for print */
        }
      </style>
    </head>
    <body>
      <div id="print-root">
        ${htmlContent}
      </div>
    </body>
    </html>
  `)

  // Close the document to ensure all content is loaded
  printWindow.document.close()

  // Wait for the content to load, then print
  printWindow.onload = () => {
    printWindow.focus() // Focus the new window
    printWindow.print() // Trigger the print dialog
    // printWindow.close(); // Optionally close the window after printing
  }
}
