/**
 * Patch html2canvas to gracefully handle modern CSS color functions
 * (oklab, oklch, color-mix, light-dark, etc.) that Tailwind CSS v4 uses.
 *
 * Without this patch, html2canvas throws:
 *   "Attempting to parse an unsupported color function 'oklab'"
 *
 * This script replaces the `throw` with a `return` of a fallback gray color,
 * so unsupported color functions are silently treated as gray
 * instead of crashing the entire PDF generation.
 *
 * Run automatically via the "postinstall" npm script.
 */
const fs = require('fs');
const path = require('path');

const filesToPatch = [
    path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.js'),
    path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.esm.js'),
    path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'lib', 'css', 'types', 'color.js'),
];

// Include the full throw statement with closing ");
const SEARCH = 'throw new Error("Attempting to parse an unsupported color function \\"" + value.name + "\\"")';
const REPLACE = 'return 0x808080ff /* patched: unsupported color fn → gray fallback */';

// Also handle the case where our earlier patch left a broken ); at the end
const BROKEN_PATCH = 'return 0x808080ff /* patched: unsupported color fn fallback */);';
const BROKEN_FIX = 'return 0x808080ff /* patched: unsupported color fn → gray fallback */;';

let patchedCount = 0;

for (const filePath of filesToPatch) {
    try {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, 'utf-8');
        let changed = false;

        // Fix any previously broken patches first
        if (content.includes(BROKEN_PATCH)) {
            content = content.split(BROKEN_PATCH).join(BROKEN_FIX);
            changed = true;
        }

        // Apply the real patch
        if (content.includes(SEARCH)) {
            content = content.split(SEARCH).join(REPLACE);
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf-8');
            patchedCount++;
            console.log('  ✔ Patched: ' + path.relative(process.cwd(), filePath));
        } else if (content.includes('patched: unsupported color fn')) {
            console.log('  ⏭ Already patched: ' + path.relative(process.cwd(), filePath));
        } else {
            console.log('  ⚠ Pattern not found: ' + path.relative(process.cwd(), filePath));
        }
    } catch (err) {
        console.error('  ✖ Error patching ' + filePath + ': ' + err.message);
    }
}

console.log('\nhtml2canvas color patch: ' + patchedCount + ' file(s) patched.\n');
