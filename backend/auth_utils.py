import hashlib, os, hmac, base64, json, time

SECRET = os.environ.get('JWT_SECRET', 'hastavastra_secret_2024').encode()

def hash_password(password):
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(password, stored):
    try:
        salt_hex, key_hex = stored.split(':')
        salt = bytes.fromhex(salt_hex)
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return hmac.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def _b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64d(s):
    s += '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s)

def create_token(payload):
    payload = dict(payload)
    payload['exp'] = int(time.time()) + 7 * 24 * 3600
    header = _b64(json.dumps({'alg':'HS256','typ':'JWT'}).encode())
    body = _b64(json.dumps(payload).encode())
    sig = _b64(hmac.new(SECRET, f'{header}.{body}'.encode(), hashlib.sha256).digest())
    return f'{header}.{body}.{sig}'

def verify_token(token):
    try:
        parts = token.split('.')
        if len(parts) != 3: return None
        header, body, sig = parts
        expected = _b64(hmac.new(SECRET, f'{header}.{body}'.encode(), hashlib.sha256).digest())
        if not hmac.compare_digest(sig, expected): return None
        payload = json.loads(_b64d(body))
        if payload.get('exp', 0) < time.time(): return None
        return payload
    except Exception:
        return None
