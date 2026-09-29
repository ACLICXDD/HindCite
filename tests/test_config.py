from backend.config import load_brand


def test_load_brand_has_required_fields():
    brand = load_brand()
    assert brand["bank_id"]
    assert brand["queries"], "brand.yaml must list at least one buyer-intent query"
    assert "price" in brand["ground_truth"]
    assert "features" in brand["ground_truth"]
