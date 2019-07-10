from .Optimizer import Optimizer, np


class Adamax(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, beta1=0.9, beta2=0.999, eps=1e-08):
        params = dict(lr=lr, beta1=beta1, beta2=beta2, eps=eps)
        super().__init__(initial_x, function, params)


    def next_point(self):
        gradient = self.function.grad(self.x)
        self.v = self.params["beta1"] * self.v + (1 - self.params["beta1"]) * gradient
        self.acc = np.clip(self.params["beta2"] * self.acc, np.fabs(gradient), self.params["beta2"] * self.acc)
        adaptive_lr = self.params["lr"] / np.sqrt(self.acc + self.params["eps"])
        next_x = self.x - adaptive_lr * self.v
        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.v = np.zeros([2])
        self.acc = np.zeros([2])