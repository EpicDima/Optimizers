from .Optimizer import Optimizer, np


class Rprop(Optimizer):
    def __init__(self, initial_x, function, dec_factor=0.5, inc_factor=1.2, step_min=1e-06, step_max=50):
        params = dict(dec_factor=dec_factor, inc_factor=inc_factor, step_min=step_min, step_max=step_max)
        super().__init__(initial_x, function, params)


    def next_point(self):
        gradient = self.function.grad(self.x)
        
        mul = gradient * self.last_gradient
        self.step_size = (mul > 0) * self.step_size * self.params["inc_factor"] + (mul < 0) * self.step_size * self.params["dec_factor"]
        self.step_size = np.clip(self.step_size, self.params["step_min"], self.params["step_max"])

        self.last_gradient = gradient
        next_x = self.x - np.sign(gradient) * self.step_size
        return self.move_next(next_x)


    def reset(self):
        super().reset()
        self.last_gradient = np.ones([2])
        self.step_size = np.ones([2])