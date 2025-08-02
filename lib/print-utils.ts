import React from "react"
import ReactDOMServer from "react-dom/server"

interface PrintOptions {
  title?: string
}

export const printDocument = (Component: React.ComponentType<any>, props: any, options?: PrintOptions) => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    console.error("Failed to open print window.")
    return
  }

  const htmlContent = ReactDOMServer.renderToStaticMarkup(
    <React.StrictMode>
      <Component {...props} />
    </React.StrictMode>,
  )

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options?.title || "Document"}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
