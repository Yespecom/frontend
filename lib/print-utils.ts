import React from "react"
import ReactDOM from "react-dom/client"

interface PrintDocumentOptions {
  title?: string
  styles?: string // CSS string to inject
}

export function printDocument(Component: React.ComponentType<any>, props: any, options?: PrintDocumentOptions) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Please allow pop-ups for printing.")
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options?.title || "Document"}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      ${options?.styles ? `<style>${options.styles}</style>` : ""}
      <style>
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div id="print-root"></div>
    </body>
    </html>
  `)

  printWindow.document.close() // Close the document to ensure content is loaded

  const printRoot = printWindow.document.getElementById("print-root")
  if (printRoot) {
    const root = ReactDOM.createRoot(printRoot)
    root.render(React.createElement(Component, props))
  }

  // Wait for content to render and then print
  printWindow.onload = () => {
    printWindow.focus() // Focus the new window
    printWindow.print() // Trigger print dialog
    // Optional: Close window after print, or leave open for user to save as PDF
    // printWindow.close();
  }
}
