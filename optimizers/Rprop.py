from .Optimizer import Optimizer, np


class Rprop(Optimizer):
    """
    Rprop — метод с индивидуальными адаптивными шагами по знакам градиента
    (resilient backpropagation).

    Первоисточник: Riedmiller M., Braun H. "A Direct Adaptive Method for Faster
    Backpropagation Learning: The RPROP Algorithm". IEEE International Conference
    on Neural Networks, 1993.
    https://doi.org/10.1109/ICNN.1993.298623
    Реализация следует алгоритму из документации PyTorch:
    https://docs.pytorch.org/docs/stable/generated/torch.optim.Rprop.html
    """

    param_descriptions = {
        "dec_factor": "множитель уменьшения длины шага при смене знака градиента (минимум проскочен)",
        "inc_factor": "множитель увеличения длины шага, пока знак градиента по координате не меняется",
        "step_min": "нижняя граница длины шага по каждой координате",
        "step_max": "верхняя граница длины шага по каждой координате",
    }

    last_gradient: np.ndarray
    step_size: np.ndarray

    def __init__(
        self,
        initial_x: np.ndarray,
        function,
        dec_factor: float = 0.5,
        inc_factor: float = 1.2,
        step_min: float = 1e-06,
        step_max: float = 50,
    ) -> None:
        params = dict(dec_factor=dec_factor, inc_factor=inc_factor, step_min=step_min, step_max=step_max)
        super().__init__(initial_x, function, params)

    def next_point(self) -> tuple[np.ndarray, float]:
        gradient = self.function.grad(self.x)

        mul = gradient * self.last_gradient
        factor = np.where(mul > 0, self.params["inc_factor"], np.where(mul < 0, self.params["dec_factor"], 1.0))
        self.step_size = np.clip(self.step_size * factor, self.params["step_min"], self.params["step_max"])
        gradient = np.where(mul < 0, 0.0, gradient)

        self.last_gradient = gradient
        next_x = self.x - np.sign(gradient) * self.step_size
        return self.move_next(next_x)

    def reset(self) -> None:
        super().reset()
        self.last_gradient = np.zeros([2])
        self.step_size = np.ones([2])
