from fastapi.testclient import TestClient

from api.config import MAX_RUNS, MAX_TOTAL_STEPS
from api.main import app

client = TestClient(app)


def test_list_optimizers():
    response = client.get("/api/v1/optimizers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 29
    adam = next(o for o in data if o["name"] == "Adam")
    assert set(adam["params"]) == {"lr", "beta1", "beta2", "eps"}
    assert adam["params"]["lr"]["default"] == 0.01
    assert adam["params"]["lr"]["description"]


def test_list_schedulers_constant_first():
    response = client.get("/api/v1/schedulers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 14
    assert data[0]["name"] == "Constant"
    assert data[0]["params"] == {}
    assert [s["name"] for s in data[1:]] == sorted((s["name"] for s in data[1:]), key=str.lower)


def test_list_functions():
    response = client.get("/api/v1/functions")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 30
    sphere = next(f for f in data if f["name"] == "Функция сферы")
    assert sphere["formula"] == "x^2 + y^2"
    assert sphere["range"] == [-5, 5, -5, 5]


def test_preview_valid_formula_returns_grid_and_minimum():
    response = client.post(
        "/api/v1/function/preview",
        json={"formula": "x^2 + y^2", "range": [-5, 5, -5, 5], "count": 20},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert len(data["meshX"]) == 20
    assert len(data["meshY"]) == 20
    assert len(data["z"]) == 20 and len(data["z"][0]) == 20
    assert len(data["minima"]) == 1
    x, y, z_value = data["minima"][0]
    assert abs(x) < 1e-4 and abs(y) < 1e-4
    assert abs(z_value) < 1e-4


def test_preview_invalid_formula_reports_error_not_exception():
    response = client.post(
        "/api/v1/function/preview",
        json={"formula": "__import__('os')", "range": [-5, 5, -5, 5], "count": 20},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False
    assert data["error"]


def test_preview_rejects_inverted_range():
    response = client.post(
        "/api/v1/function/preview",
        json={"formula": "x^2 + y^2", "range": [5, -5, -5, 5], "count": 20},
    )
    assert response.status_code == 422


def test_function_value():
    response = client.post("/api/v1/function/value", json={"formula": "x^2 + y^2", "x": 1.0, "y": 2.0})
    assert response.status_code == 200
    assert response.json() == {"valid": True, "error": None, "value": 5.0}


def test_function_value_invalid_formula():
    response = client.post("/api/v1/function/value", json={"formula": "x +* y", "x": 1.0, "y": 2.0})
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


def _optimize_request(steps=50, reset=True):
    return {
        "function": {"formula": "x^2 + y^2"},
        "runs": [
            {
                "slotId": "a",
                "optimizer": "Adam",
                "optimizerParams": {"lr": 0.3, "beta1": 0.9, "beta2": 0.999, "eps": 1e-8},
                "scheduler": "Constant",
                "schedulerParams": {},
                "start": [-4.0, 4.0],
                "reset": reset,
            }
        ],
        "steps": steps,
    }


def test_optimize_basic_run_shape():
    response = client.post("/api/v1/optimize", json=_optimize_request(steps=50))
    assert response.status_code == 200
    (run,) = response.json()["runs"]
    assert run["error"] is None
    assert len(run["x"]) == len(run["y"]) == len(run["value"]) == 51
    assert len(run["lr"]) == 51
    assert all(lr == 0.3 for lr in run["lr"])
    # сходится к минимуму (0, 0) сферы
    assert abs(run["x"][-1]) < abs(run["x"][0])
    assert abs(run["y"][-1]) < abs(run["y"][0])


def test_optimize_unknown_optimizer_is_a_per_run_error():
    payload = _optimize_request()
    payload["runs"][0]["optimizer"] = "NoSuchOptimizer"
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 200
    (run,) = response.json()["runs"]
    assert run["error"] is not None
    assert run["x"] == []


def test_optimize_bad_params_is_a_per_run_error():
    payload = _optimize_request()
    payload["runs"][0]["optimizerParams"] = {"lr": 0.1, "not_a_real_param": 1.0}
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 200
    (run,) = response.json()["runs"]
    assert run["error"] is not None


def test_optimize_invalid_formula_is_a_hard_error():
    payload = _optimize_request()
    payload["function"]["formula"] = "not a valid formula ???"
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 422


def test_optimize_rejects_too_many_total_steps():
    payload = _optimize_request(steps=MAX_TOTAL_STEPS)
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 422


def test_optimize_rejects_too_many_runs():
    payload = _optimize_request()
    payload["runs"] = payload["runs"] * (MAX_RUNS + 1)
    for i, run in enumerate(payload["runs"]):
        run["slotId"] = f"slot-{i}"
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 422


def test_optimizer_without_lr_ignores_scheduler():
    payload = _optimize_request(steps=10)
    payload["runs"][0]["optimizer"] = "Rprop"
    payload["runs"][0]["optimizerParams"] = {"dec_factor": 0.5, "inc_factor": 1.2, "step_min": 1e-6, "step_max": 1.0}
    payload["runs"][0]["scheduler"] = "OneCycle"
    payload["runs"][0]["schedulerParams"] = {"pct_start": 0.3, "div": 25.0, "final_div": 10000.0}
    response = client.post("/api/v1/optimize", json=payload)
    assert response.status_code == 200
    (run,) = response.json()["runs"]
    assert run["error"] is None
    assert run["lr"] is None


def test_optimize_continue_without_reset_needs_session():
    headers = {"X-Session-Id": "pytest-session"}

    first = client.post("/api/v1/optimize", json=_optimize_request(steps=20, reset=True), headers=headers)
    (first_run,) = first.json()["runs"]

    second = client.post("/api/v1/optimize", json=_optimize_request(steps=20, reset=False), headers=headers)
    (second_run,) = second.json()["runs"]

    assert second_run["x"][0] == first_run["x"][-1]
    assert second_run["y"][0] == first_run["y"][-1]


def test_optimize_reset_false_without_session_still_starts_fresh():
    response = client.post("/api/v1/optimize", json=_optimize_request(steps=5, reset=False))
    (run,) = response.json()["runs"]
    assert run["x"][0] == -4.0
    assert run["y"][0] == 4.0
