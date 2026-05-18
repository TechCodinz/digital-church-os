import os
import glob

for filename in glob.glob('app/**/*.tsx', recursive=True) + glob.glob('app/**/*.ts', recursive=True):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    if len(content.strip().split('\n')) <= 2 and 'export' not in content:
        print(f"Fixing {filename}")
        with open(filename, 'w', encoding='utf-8') as f:
            if filename.endswith('page.tsx'):
                f.write('export default function Page() { return <div>Under Construction</div>; }\n')
            elif filename.endswith('route.ts'):
                f.write('import { NextResponse } from "next/server";\nexport async function GET() { return NextResponse.json({ status: "under construction" }); }\n')
            elif filename.endswith('index.ts'):
                f.write('export type Index = {};\n')
