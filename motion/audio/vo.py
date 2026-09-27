"""
Voice-over: generate the lines with ElevenLabs, or use takes you recorded.

    ELEVENLABS_API_KEY=… ELEVENLABS_VOICE_ID=… python3 vo.py
        -> audio/vo/01.mp3 … one file per line in vo_script.json

Lines that already have a file in audio/vo/ (mp3 or wav, named by id) are
kept, so a human take can replace any generated one: drop in 03.wav and
re-run. Then `python3 mix.py --vo` (and `--vo --outro 3.5`) lays them on
their beats with the music ducked underneath.
"""
import json, os, pathlib, sys, urllib.request

HERE = pathlib.Path(__file__).parent
VO = HERE / 'vo'
VO.mkdir(exist_ok=True)
MODEL = os.environ.get('ELEVENLABS_MODEL', 'eleven_multilingual_v2')


def tts(text, voice, key):
    req = urllib.request.Request(
        f'https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_192',
        data=json.dumps({
            'text': text,
            'model_id': MODEL,
            # steady and warm rather than performed: this is a product voice
            'voice_settings': {'stability': 0.55, 'similarity_boost': 0.8, 'style': 0.15, 'use_speaker_boost': True},
        }).encode(),
        headers={'xi-api-key': key, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    script = json.loads((HERE / 'vo_script.json').read_text())['lines']
    key = os.environ.get('ELEVENLABS_API_KEY')
    voice = os.environ.get('ELEVENLABS_VOICE_ID')
    for ln in script:
        have = [p for p in (VO / f"{ln['id']}.wav", VO / f"{ln['id']}.mp3") if p.exists()]
        if have:
            print(f"{ln['id']}  keep  {have[0].name}")
            continue
        if not (key and voice):
            sys.exit('set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID, or put your own takes in audio/vo/')
        (VO / f"{ln['id']}.mp3").write_bytes(tts(ln['text'], voice, key))
        print(f"{ln['id']}  made  {ln['text']}")


if __name__ == '__main__':
    main()
