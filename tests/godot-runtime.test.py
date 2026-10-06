"""Run generated export fixtures with a real Godot 4 executable."""
import subprocess, sys
from pathlib import Path
engine = str(Path(sys.argv[1]).resolve())
for scenario in ('single', 'animation', 'relocated'):
    project = str((Path('.test-output') / scenario).resolve())
    commands = [
        [engine, '--headless', '--path', project, '--editor', '--import'],
        [engine, '--headless', '--path', project, '--quit-after', '10', '--script', 'res://smoke.gd'],
    ]
    for index, command in enumerate(commands):
        result = subprocess.run(command, capture_output=True, text=True, timeout=90)
        output = result.stdout + result.stderr
        if result.returncode or 'SCRIPT ERROR:' in output or 'ERROR:' in output or (index == 1 and 'GODOT_EXPORT_OK' not in output):
            print(output)
            raise SystemExit(f'Godot validation failed: {scenario}, step {index}')
    print(f'Godot: {scenario} import, resources, scene and lights passed.')
