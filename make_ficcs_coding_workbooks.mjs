import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const packetPath = 'ficcs/coding/blind_claim_packet_v1.jsonl';
const outputDir = 'outputs/01a0bc0d-6825-7f03-a634-a1c583c931ed';
const claims = readFileSync(packetPath, 'utf8').trim().split('\n').map(JSON.parse);
const constructs = ['O', 'P', 'A', 'C', 'D', 'E', 'R', 'I'];
const edges = [['A','O'], ['C','P'], ['P','A'], ['C','D'], ['engagement','E'], ['E','R'], ['R','I']];
const consequences = ['none_descriptive','account_enforcement','content_enforcement','public_attribution','sanctions_or_diplomacy','legislation_or_regulation','resource_allocation','public_warning','other'];

const headerStyle = { fill: '#17365D', font: { bold: true, color: '#FFFFFF' }, wrapText: true, verticalAlignment: 'center' };
const lockedStyle = { fill: '#E7EEF8', wrapText: true, verticalAlignment: 'top' };
const entryStyle = { fill: '#FFF2CC', wrapText: true, verticalAlignment: 'top' };

function setTable(sheet, headers, rows, widths, editableFrom) {
  const all = [headers, ...rows];
  const range = sheet.getRangeByIndexes(0, 0, all.length, headers.length);
  range.values = all;
  sheet.getRangeByIndexes(0, 0, 1, headers.length).format = headerStyle;
  if (rows.length) {
    sheet.getRangeByIndexes(1, 0, rows.length, editableFrom).format = lockedStyle;
    sheet.getRangeByIndexes(1, editableFrom, rows.length, headers.length - editableFrom).format = entryStyle;
  }
  widths.forEach((width, index) => { sheet.getRangeByIndexes(0, index, all.length, 1).format.columnWidth = width; });
  sheet.freezePanes.freezeRows(1);
  range.format.rowHeight = 30;
  range.format.borders = { bottom: { color: '#B4C7E7', style: 'thin' } };
}

function validateList(sheet, column, rowCount, values) {
  sheet.getRange(`${column}2:${column}${rowCount + 1}`).dataValidation = { rule: { type: 'list', values } };
}

async function build(role) {
  const wb = Workbook.create();
  const instructions = wb.worksheets.add('Instructions');
  instructions.getRange('A1:B12').values = [
    ['FICCS independent coding packet', `Reviewer ${role}`],
    ['Purpose', 'Code each claim independently before viewing any other reviewer decisions.'],
    ['Blue cells', 'Immutable source and claim context. Do not edit.'],
    ['Yellow cells', 'Reviewer entries. Complete every required cell.'],
    ['Construct decisions', 'supported, contradicted, or unknown for the exact subject, unit, and period.'],
    ['Evidence stage', 'direct, proxy, platform_disclosure, measurement_validation, or unknown.'],
    ['Edges', 'Code only the seven preregistered links shown; asserted is yes, no, or unclear.'],
    ['Consequences', 'Use yes/no for each category and record recommendation/taken status plus severity.'],
    ['Independence', 'Do not collaborate. Disclose conflicts. Preserve this original file.'],
    ['Reviewer ID', 'Enter in Summary!B3.'],
    ['Source checking', 'Open the canonical or archive URL and give a precise locator.'],
    ['No inference promotion', 'Coordination, attribution, engagement, and exposure do not automatically establish another construct.'],
  ];
  instructions.getRange('A1:B1').format = headerStyle;
  instructions.getRange('A2:A12').format = lockedStyle;
  instructions.getRange('B2:B12').format = { ...lockedStyle, columnWidth: 95 };
  instructions.getRange('A1:A12').format.columnWidth = 24;

  const summary = wb.worksheets.add('Summary');
  summary.getRange('A1:B10').values = [
    ['Field', 'Value'], ['Reviewer role', role], ['Reviewer ID', ''], ['Conflict disclosure', ''],
    ['No-collaboration attestation', ''], ['Completed at UTC', ''], ['Claims', claims.length],
    ['Construct slots', claims.length * 8], ['Registered edge slots', claims.length * 7], ['Packet SHA-256', createHash('sha256').update(readFileSync(packetPath)).digest('hex')],
  ];
  summary.getRange('A1:B1').format = headerStyle;
  summary.getRange('A2:A10').format = lockedStyle;
  summary.getRange('B2:B10').format = entryStyle;
  summary.getRange('B2').format = lockedStyle;
  summary.getRange('B7:B10').format = lockedStyle;
  summary.getRange('A1:A10').format.columnWidth = 34;
  summary.getRange('B1:B10').format.columnWidth = 85;
  summary.getRange('B5').dataValidation = { rule: { type: 'list', values: ['I attest'] } };

  const constructSheet = wb.worksheets.add('Constructs');
  const ch = ['claim_id','document_id','source_type','title','canonical_url','archive_url','locator','claim_excerpt','claim_paraphrase','subject','unit','platform','period','construct','asserted_by_source','decision','evidence_stage','evidence_locator','rationale','confidence','source_checked','decided_at_utc'];
  const cr = claims.flatMap(c => constructs.map(k => [c.claim_id,c.source.document_id,c.source.source_type,c.source.title,c.source.canonical_url,c.source.archive_url ?? '',c.source.locator,c.claim.verbatim_excerpt,c.claim.paraphrase,c.claim.subject,c.claim.unit,c.claim.platform.join('; '),c.claim.period,k,c.claim.asserted_constructs.includes(k) ? 'yes':'no','','','','','','','']));
  setTable(constructSheet, ch, cr, [25,26,14,42,48,40,36,46,58,38,14,20,28,12,18,18,24,34,54,14,16,24], 15);
  validateList(constructSheet, 'P', cr.length, ['supported','contradicted','unknown']);
  validateList(constructSheet, 'Q', cr.length, ['direct','proxy','platform_disclosure','measurement_validation','unknown']);
  validateList(constructSheet, 'T', cr.length, ['high','moderate','low']);
  validateList(constructSheet, 'U', cr.length, ['yes']);

  const edgeSheet = wb.worksheets.add('Edges');
  const eh = ['claim_id','document_id','source_type','title','canonical_url','locator','claim_paraphrase','from','to','asserted','status','rationale','source_checked','decided_at_utc'];
  const er = claims.flatMap(c => edges.map(([from,to]) => [c.claim_id,c.source.document_id,c.source.source_type,c.source.title,c.source.canonical_url,c.source.locator,c.claim.paraphrase,from,to,'','','','','']));
  setTable(edgeSheet, eh, er, [25,26,14,42,48,36,58,14,12,16,24,54,16,24], 9);
  validateList(edgeSheet, 'J', er.length, ['yes','no','unclear']);
  validateList(edgeSheet, 'K', er.length, ['supported_link','measured_association','proxy_only','untested','contradicted_link']);
  validateList(edgeSheet, 'M', er.length, ['yes']);

  const consequenceSheet = wb.worksheets.add('Consequences');
  const qh = ['claim_id','document_id','source_type','title','canonical_url','locator','claim_paraphrase',...consequences,'action_basis','severity','rationale','source_checked','decided_at_utc'];
  const qr = claims.map(c => [c.claim_id,c.source.document_id,c.source.source_type,c.source.title,c.source.canonical_url,c.source.locator,c.claim.paraphrase,...consequences.map(() => ''),'','','','','']);
  setTable(consequenceSheet, qh, qr, [25,26,14,42,48,36,58,...consequences.map(() => 22),24,14,54,16,24], 7);
  for (let col = 8; col <= 16; col++) validateList(consequenceSheet, String.fromCharCode(64 + col), qr.length, ['yes','no']);
  validateList(consequenceSheet, 'Q', qr.length, ['none_descriptive','recommended','documented_taken','both','unclear']);
  validateList(consequenceSheet, 'R', qr.length, ['low','moderate','high']);
  validateList(consequenceSheet, 'T', qr.length, ['yes']);

  const suffix = role.toLowerCase();
  const path = `${outputDir}/ficcs_reviewer_${suffix}_coding.xlsx`;
  mkdirSync(outputDir, { recursive: true });
  const file = await SpreadsheetFile.exportXlsx(wb);
  await file.save(path);
  const preview = await wb.render({ sheetName: 'Summary', range: 'A1:B10', autoCrop: 'all', scale: 1.5, format: 'png' });
  await writeFile(`${outputDir}/ficcs_reviewer_${suffix}_summary_preview.png`, new Uint8Array(await preview.arrayBuffer()));
  return path;
}

const outputs = [];
for (const role of ['A','B']) outputs.push(await build(role));
writeFileSync('ficcs/coding/WORKBOOK_MANIFEST.json', JSON.stringify({
  status: 'blinded_workbooks_generated', packet: packetPath,
  outputs: outputs.map(path => ({ path, sha256: createHash('sha256').update(readFileSync(path)).digest('hex') })),
  decisions_prefilled: false,
}, null, 2) + '\n');
console.log(JSON.stringify({ outputs }));
