from app.domain.validation import validate_mood

def test_mood_in_range_is_valid():
    assert validate_mood(4) is True

def test_mood_out_of_range_is_invalid():
    assert validate_mood(6) is False