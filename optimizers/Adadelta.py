from .Optimizer import Optimizer, np


class Adadelta(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, rho=0.975, eps=1e-02):
        params = dict(lr=lr, rho=rho, eps=eps)
        super().__init__(initial_x, function, params)


    def next_point(self):
        gradient = self.function.grad(self.x)
        self.acc1 = self.params["rho"] * self.acc1 + (1 - self.params["rho"]) * gradient ** 2
        update = gradient * np.sqrt(self.acc2 + self.params["eps"]) / np.sqrt(self.acc1 + self.params["eps"])
        self.acc2 = self.params["rho"] * self.acc2 + (1 - self.params["rho"]) * update ** 2
        next_x = self.x - self.params["lr"] * update
        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.acc1 = np.zeros([2])
        self.acc2 = np.zeros([2])