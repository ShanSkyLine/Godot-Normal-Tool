import struct, zipfile, zlib
from pathlib import Path
for scenario in ('single','animation'):
    archive=Path('.test-output')/scenario/'package.zip'
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        assert 'project.godot' in z.namelist()
        for name in z.namelist():
            data=z.read(name)
            if name.endswith('.png'):
                assert data[:8]==b'\x89PNG\r\n\x1a\n'
                pos=8
                while pos<len(data):
                    size=struct.unpack('>I',data[pos:pos+4])[0]
                    payload=data[pos+4:pos+8+size]
                    assert zlib.crc32(payload)==struct.unpack('>I',data[pos+8+size:pos+12+size])[0]
                    pos+=12+size
print('ZIP extraction and PNG CRC validation passed.')
