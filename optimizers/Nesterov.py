from .Optimizer import Optimizer, np


class Nesterov(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, coef=0.9):
        params = dict(lr=lr, coef=coef)
        super().__init__(initial_x, function, params)


    def next_point(self):
        self.v = self.params["coef"] * self.v + self.params["lr"] * self.function.grad(self.x - self.params["coef"] * self.v)
        next_x = self.x - self.v
        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.v = np.zeros([2])