"""Synthesise one narration clip with a neural Arabic voice (Microsoft Edge read-aloud, via edge-tts).

Usage: python3 scripts/tts.py "<text>" out.mp3 [voice] [rate]
Requires: pip install edge-tts. Honours HTTPS_PROXY and SSL_CERT_FILE when set.
"""
import asyncio
import os
import ssl
import sys

import aiohttp
import edge_tts


async def main(text: str, out: str, voice: str = 'ar-OM-AyshaNeural', rate: str = '-4%') -> None:
    cafile = os.environ.get('SSL_CERT_FILE') or ('/root/.ccr/ca-bundle.crt' if os.path.exists('/root/.ccr/ca-bundle.crt') else None)
    ctx = ssl.create_default_context(cafile=cafile) if cafile else ssl.create_default_context()
    communicate = edge_tts.Communicate(
        text, voice, rate=rate, connector=aiohttp.TCPConnector(ssl=ctx), proxy=os.environ.get('HTTPS_PROXY')
    )
    await communicate.save(out)


if __name__ == '__main__':
    asyncio.run(main(*sys.argv[1:]))
