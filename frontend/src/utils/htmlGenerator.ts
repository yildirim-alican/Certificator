import { CertificateTemplate, CertificateElement } from '@/types/CertificateTemplate';

/**
 * Converts Certificate Template + Data to HTML
 *
 * Generates pixel-perfect HTML markup from template definition
 * with CSS for correct A4 dimensions and print styling.
 *
 * Formula for scaling:
 * - Editor: 1240x1754px (A4 @ 150 DPI)
 * - Print: 3508x2480px (A4 @ 300 DPI)
 * - Scale factor: 300/150 = 2x upscaling in PDF
 */
export const generateTemplateHTML = (
  template: CertificateTemplate,
  data: Record<string, string> = {}
): string => {
  const A4_WIDTH = 210; // mm
  const A4_HEIGHT = 297; // mm
  const A4_WIDTH_PX_300DPI = 3508; // pixels at 300 DPI
  const A4_HEIGHT_PX_300DPI = 2480; // pixels at 300 DPI

  // Determine canvas dimensions based on orientation
  const isLandscape = template.orientation === 'landscape';
  const width = isLandscape ? A4_HEIGHT : A4_WIDTH;
  const height = isLandscape ? A4_WIDTH : A4_HEIGHT;

  const widthPx = isLandscape ? A4_HEIGHT_PX_300DPI : A4_WIDTH_PX_300DPI;
  const heightPx = isLandscape ? A4_WIDTH_PX_300DPI : A4_HEIGHT_PX_300DPI;

  // Generate element styles
  const elementStyles = template.elements.map((element) => {
    const leftPx = (element.x / 100) * widthPx;
    const topPx = (element.y / 100) * heightPx;
    const widthElementPx = (element.width / 100) * widthPx;
    const heightElementPx = (element.height / 100) * heightPx;

    let css = `
      #element-${element.id} {
        position: absolute;
        left: ${leftPx}px;
        top: ${topPx}px;
        width: ${widthElementPx}px;
        height: ${heightElementPx}px;
        transform: rotate(${element.rotation}deg);
        z-index: ${element.zIndex};
        ${!element.visible ? 'opacity: 0.5;' : ''}
      }
    `;

    // Type-specific styles
    if (element.type === 'text') {
      css += `
        #element-${element.id} {
          font-family: ${element.fontFamily || 'Arial'};
          font-size: ${element.fontSize || 16}px;
          font-weight: ${element.fontWeight || 'normal'};
          color: ${element.color || '#000000'};
          text-align: ${element.textAlign || 'left'};
          line-height: ${element.lineHeight || 1.5};
          display: flex;
          align-items: center;
          justify-content: center;
          word-wrap: break-word;
          padding: 8px;
          box-sizing: border-box;
          overflow: hidden;
        }
      `;
    } else if (element.type === 'image') {
      css += `
        #element-${element.id} img {
          width: 100%;
          height: 100%;
          object-fit: ${element.objectFit || 'contain'};
          opacity: ${element.opacity ?? 1};
        }
      `;
    } else if (element.type === 'shape') {
      css += `
        #element-${element.id} {
          background-color: ${element.backgroundColor || '#ffffff'};
          border: ${element.borderWidth || 1}px solid ${element.borderColor || '#000000'};
          ${element.shapeType === 'circle' ? 'border-radius: 50%;' : ''}
        }
      `;
    }

    return css;
  });

  // Generate element HTML
  const elementHTML = template.elements.map((element) => {
    let content = '';

    if (element.type === 'text') {
      // Replace variables with data
      let text = element.content || '';
      Object.entries(data).forEach(([key, value]) => {
        text = text.replace(key, value || key);
      });
      content = `<span>${escapeHtml(text)}</span>`;
    } else if (element.type === 'image') {
      content = `<img src="${element.src || ''}" alt="${element.label}" />`;
    }

    return `
      <div id="element-${element.id}" class="certificate-element">
        ${content}
      </div>
    `;
  }).join('');

  // Complete HTML document
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${template.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: white;
          margin: 0;
          padding: 0;
        }

        .certificate-canvas {
          width: ${widthPx}px;
          height: ${heightPx}px;
          position: relative;
          background-color: ${template.backgroundColor || '#ffffff'};
          margin: 0 auto;
          page-break-after: always;
        }

        .certificate-element {
          position: absolute;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          .certificate-canvas {
            width: 100%;
            height: auto;
            margin: 0;
            page-break-after: always;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .certificate-element {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        ${elementStyles.join('\n')}
      </style>
    </head>
    <body>
      <div class="certificate-canvas">
        ${elementHTML}
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Convert template to minimal data structure for backend
 */
export const serializeTemplateForPDF = (
  template: CertificateTemplate,
  data: Record<string, string> = {}
) => {
  return {
    template: {
      name: template.name,
      orientation: template.orientation,
      width: template.width,
      height: template.height,
      backgroundColor: template.backgroundColor,
      elements: template.elements.map((el) => ({
        id: el.id,
        type: el.type,
        label: el.label,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        rotation: el.rotation,
        zIndex: el.zIndex,
        visible: el.visible,
        // Type-specific
        ...(el.type === 'text' && {
          content: el.content,
          fontSize: el.fontSize,
          fontFamily: el.fontFamily,
          fontWeight: el.fontWeight,
          color: el.color,
          textAlign: el.textAlign,
          lineHeight: el.lineHeight,
        }),
        ...(el.type === 'image' && {
          src: el.src,
          objectFit: el.objectFit,
          opacity: el.opacity,
        }),
        ...(el.type === 'shape' && {
          shapeType: el.shapeType,
          backgroundColor: el.backgroundColor,
          borderColor: el.borderColor,
          borderWidth: el.borderWidth,
        }),
      })),
    },
    data,
  };
};
