def divide(a, b):
    return a / b  # no zero-check


def fetch(data):
    try:
        return data['key']
    except:  # bare except
        return None
