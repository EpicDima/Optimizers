from .Optimizer import Optimizer, np


class Adagrad(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, eps=1e-08):
        params = dict(lr=lr, eps=eps)
        super().__init__(initial_x, function, params)


    def next_point(self):
        gradient = self.function.grad(self.x)
        self.acc += gradient ** 2
        adaptive_lr = self.params["lr"] / np.sqrt(self.acc + self.params["eps"])
        next_x = self.x - adaptive_lr * gradient
        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.acc = np.zeros([2])