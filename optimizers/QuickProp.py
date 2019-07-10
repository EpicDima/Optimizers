from .Optimizer import Optimizer, np


class QuickProp(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, alpha_max=1.75):
        params = dict(lr=lr, alpha_max=alpha_max)
        super().__init__(initial_x, function, params)


    def next_point(self):
        gradient = self.function.grad(self.x)

        denominator = self.previous_gradient - gradient
        temp = np.divide(gradient, denominator, where = (denominator != 0))

        alpha = np.clip(temp, -self.params["alpha_max"], self.params["alpha_max"])

        zeros = self.previous_update == 0
        update = (zeros == False) * alpha * self.previous_update + zeros * self.params["lr"] * gradient

        self.previous_gradient = gradient
        self.previous_update = update

        next_x = self.x - update

        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.previous_update = np.zeros([2])
        self.previous_gradient = np.zeros([2])