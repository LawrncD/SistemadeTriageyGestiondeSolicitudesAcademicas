const fs = require('fs');
const pd = 'src/app/components/solicitud-list/solicitud-list.component.ts';
let d = fs.readFileSync(pd, 'utf8');

// Find where styles start
const stylesStart = d.indexOf('styles: [`');
if (stylesStart === -1) throw new Error('Could not find styles start');

const pre = d.substring(0, d.indexOf('styles: [`') + 10);

// We know the class starts with "export class SolicitudListComponent"
const classStart = d.indexOf('export class SolicitudListComponent');
const post = d.substring(classStart - 6); // Keep the `]\n})` before export class

const newStyles = `
    .page { padding: 3rem; background: #fff; color: #222; font-family: inherit; }
    .page-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2.5rem; border-bottom: 2px solid #000; padding-bottom: 0.75rem; }
    .page-title { font-size: 2.2rem; font-weight: normal; color: #000; font-variant: small-caps; letter-spacing: 0.5px; margin: 0; }
    .btn { padding: 0.6rem 1.5rem; border: 1px solid #000; background: #fff; color: #000; font-family: inherit; font-variant: small-caps; font-size: 1rem; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-block; }
    .btn:hover { background: #000; color: #fff; }
    .filters { background: #fbfbfb; border: 1px dashed #000; padding: 1.5rem; margin-bottom: 2.5rem; display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; min-width: 200px; }
    .filter-group label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #555; }
    .filter-group select { padding: 0.5rem; border: none; border-bottom: 1px solid #000; font-family: inherit; font-size: 0.95rem; background: transparent; width: 100%; border-radius: 0; }
    .filter-group select:focus { border-bottom-width: 2px; outline: none; padding-bottom: 0.5rem; }
    .table-card { margin-top: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 1rem; border-bottom: 2px solid #000; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; color: #000; font-weight: normal; font-variant: small-caps; }
    .data-table td { padding: 1rem; border-bottom: 1px dotted #000; font-size: 0.95rem; color: #222; vertical-align: middle; }
    .data-table tr:hover td { background: #fbfbfb; }
    .badge { padding: 0.25rem 0.75rem; font-size: 0.75rem; letter-spacing: 1px; text-transform: uppercase; border: 1px solid currentColor; background: transparent !important; color: #000; white-space: nowrap; }
    .badge-tipo { border-style: dotted; color: #555; }
    .badge-cerrada { text-decoration: line-through; color: #555; border-style: dashed; }
    .badge-p-baja, .badge-p-media { color: #555; border-style: dotted; }
    .badge-p-alta, .badge-p-critica { color: #000; font-weight: bold; border-width: 2px; }
    .btn-sm { padding: 0.25rem 0.75rem; border: 1px solid #000; background: transparent; color: #000; font-variant: small-caps; font-size: 0.85rem; text-decoration: none; cursor: pointer; transition: all 0.2s; display: inline-block; }
    .btn-sm:hover { background: #000; color: #fff; }
    .table-footer { padding: 1rem 0; font-size: 0.9rem; color: #555; font-style: italic; border-top: 2px solid #000; margin-top: 2rem; display: flex; justify-content: space-between; }
    .loading, .empty { text-align: center; padding: 4rem; color: #555; font-style: italic; border: 1px dashed #999; margin-top: 2rem; }
    .text-muted { color: #777; font-style: italic; }
    @media (max-width: 900px) {
      .filters { flex-direction: column; gap: 1rem; }
      .data-table { font-size: 0.85rem; }
      .data-table th, .data-table td { padding: 0.75rem 0.5rem; }
      .page { padding: 1.5rem; }
    }
`;

fs.writeFileSync(pd, pre + '\n' + newStyles + post);
console.log('Fixed solicitud-list styles!');
