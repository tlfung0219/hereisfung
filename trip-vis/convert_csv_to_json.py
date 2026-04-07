#!/usr/bin/env python3
import csv
import json
from pathlib import Path
from typing import Dict, List

SOURCE_DIR = Path(__file__).resolve().parent / 'generated_csv'
TARGET_DIR = Path(__file__).resolve().parent / 'generated_json'
GLOBAL_VARS_PATH = Path(__file__).resolve().parent / 'global_vars.js'


def convert_file(csv_path: Path) -> List[Dict[str, str]]:
    with csv_path.open('r', newline='', encoding='utf-8') as csv_file:
        reader = csv.DictReader(csv_file)
        rows = []
        for row in reader:
            rows.append({
                'date': row.get('date', '').strip(),
                'time': row.get('time', '').strip(),
                'activity': row.get('activity', '').strip()
            })
    return rows


def write_json_file(json_path: Path, rows: List[Dict[str, str]]) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with json_path.open('w', encoding='utf-8') as json_file:
        json.dump(rows, json_file, ensure_ascii=False, indent=2)
    print(f'Converted {json_path.stem}.csv -> {json_path.name}')


def write_global_vars(global_path: Path, examples: Dict[str, List[Dict[str, str]]]) -> None:
    with global_path.open('w', encoding='utf-8') as js_file:
        js_file.write('// Auto-generated example data from generated_csv/*.csv\n')
        js_file.write('const examples = ')
        json.dump(examples, js_file, ensure_ascii=False, indent=2)
        js_file.write(';\n')
    print(f'Wrote global example variable to {global_path.name}')


def main() -> None:
    if not SOURCE_DIR.exists() or not SOURCE_DIR.is_dir():
        raise SystemExit(f'Source directory not found: {SOURCE_DIR}')

    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    csv_files = sorted(SOURCE_DIR.glob('*.csv'))
    if not csv_files:
        print(f'No CSV files found in {SOURCE_DIR}')
        return

    examples = {}
    for csv_path in csv_files:
        rows = convert_file(csv_path)
        json_path = TARGET_DIR / f'{csv_path.stem}.json'
        write_json_file(json_path, rows)
        # remove .csv extension for global vars key
        examples[csv_path.stem] = rows

    write_global_vars(GLOBAL_VARS_PATH, examples)
    print(f'Done. JSON files are in {TARGET_DIR} and global vars written to {GLOBAL_VARS_PATH}')


if __name__ == '__main__':
    main()
