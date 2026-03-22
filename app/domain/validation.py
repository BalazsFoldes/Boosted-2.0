def validate_hydration(amount_ml: int) -> bool:
    return amount_ml > 0

def validate_mood(value: int) -> bool:
    return 1 <= value <= 5