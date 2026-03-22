from app.domain.validation import validate_hydration

def test_hydration_positive_value_is_valid():
    assert validate_hydration(500) is True

def test_hydration_negative_value_is_invalid():
    assert validate_hydration(-100) is False
