#!/usr/bin/env python3
"""Inline the VFX lab build + its assets into ONE html file (for a phone preview)."""
import base64, glob, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
d = os.path.join(HERE, 'dist-single')
html = open(os.path.join(d, 'vfx.html'), encoding='utf-8').read()
js_files = glob.glob(os.path.join(d, 'assets', 'vfx-*.js'))
assert len(js_files) == 1, js_files
js = open(js_files[0], encoding='utf-8').read().replace('</script', '<\\/script')
out_dir = os.path.join(HERE, 'public', 'assets')
rig = json.load(open(os.path.join(out_dir, 'rig.json'), encoding='utf-8'))
files = set(['bg_sky.png', 'bg_mountains.png'])
for k in rig['kinds'].values():
    files.update(k.values())
assets = {f'assets/{f}': 'data:image/png;base64,' + base64.b64encode(open(os.path.join(out_dir, f), 'rb').read()).decode() for f in sorted(files)}
assets['assets/rig.json'] = json.dumps(rig, ensure_ascii=False)
font = 'data:font/ttf;base64,' + base64.b64encode(open(os.path.join(out_dir, 'fonts', 'NotoSans-Bold-VI.ttf'), 'rb').read()).decode()
html = html.replace("url('./assets/fonts/NotoSans-Bold-VI.ttf')", f"url('{font}')")
html = re.sub(r'<script type="module"[^>]*src="[^"]+"></script>', '', html)
html = html.replace('</body>', '<script>window.__ASSETS=' + json.dumps(assets) + ';</script>\n<script type="module">' + js + '</script>\n</body>')
out = os.path.join(HERE, 'dist-single', 'vfx-lab-single.html')
open(out, 'w', encoding='utf-8').write(html)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB')
