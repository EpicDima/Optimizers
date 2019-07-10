
# СТАРАЯ ВЕРСИЯ, МОЖНО СКАЗАТЬ НАЧАЛЬНАЯ


import numpy as np




    


class Newton(Optimizer):
    def __init__(self, initial_x, function, lr=0.01):
        super().__init__(initial_x, function, lr)

    def next_point(self):
        gradient = self.function.grad(self.x)
        hesse = self.function.hesse(self.x)

        if (self.is_pos_def(hesse)):
            hesse_inverse = np.linalg.inv(hesse)
            gradient_array = np.array(gradient)
            update = np.dot(hesse_inverse, gradient_array)
            next_x = self.x - self.lr * update
        else:
            next_x = self.x - self.lr * gradient

        return self.move_next(next_x)

    def is_pos_def(self, hesse):
        return np.all(np.linalg.eigvals(hesse) > 0)


class NewtonGauss(Optimizer):
    def __init__(self, initial_x, function, lr=0.01):
        super().__init__(initial_x, function, lr)

    def next_point(self):
        jacobi = self.function.jacobi(self.x)

        left_jacobi = np.dot(jacobi.T, jacobi)
        left_jacobi_inverse = np.linalg.pinv(left_jacobi)
        jjj = np.dot(left_jacobi_inverse, jacobi.T)
        update = np.dot(jjj, self.function.function_array(self.x)).reshape((-1))
        next_x = self.x - self.lr * update

        return self.move_next(next_x)


class LevenbergMarquardt(Optimizer):
    def __init__(self, initial_x, function, lr=0.01, eps=1e-8):
        super().__init__(initial_x, function, lr)
        self.eps = eps

        self.v = 2
        self.alpha = 1e-03
        self.m = self.alpha * np.max(self.get_a(self.function.jacobi(self.x)))

    def get_a(self, jacobi):
        return np.dot(jacobi.T, jacobi)

    def get_f(self, x):
        return 0.5 * np.dot(self.function.function_array(x).T, self.function.function_array(x))

    def next_point(self):
        jacobi = self.function.jacobi(self.x)
        a = self.get_a(jacobi)
        g = np.dot(jacobi.T, self.function.function_array(self.x)).reshape((-1, 1))

        left_part_inverse = np.linalg.inv(a + self.m * np.eye(a.shape[0], a.shape[1]))
        d_lm = -np.dot(left_part_inverse, g)

        next_x = self.x + self.lr * d_lm.reshape((-1))

        grain_numerator = (self.get_f(self.x) - self.get_f(next_x))
        gain_divisor = 0.5 * np.dot(d_lm.T, self.m * d_lm - g) + self.eps
        gain = grain_numerator / gain_divisor

        if gain > 0:
            self.move_next(next_x)
            self.m = self.m * max(1 / 3, 1 - (2 * gain - 1) ** 3)
            self.v = 2
        else:
            self.m *= self.v
            self.v *= 2

        return self.move_next(self.x)








class CG_PR(Optimizer):
    def __init__(self, initial_x, function, lr=0.01):
        super().__init__(initial_x, function, lr)
        self.last_gradient = 1
        self.step_size = 1

    def next_point(self):
        gradient = self.function.grad(self.x)
        
        next_x = self.x - np.sign(gradient) * self.step_size
        return self.move_next(next_x)




        
class EnvironmentConstants:
    def __init__(self):
        self.x0 = np.array([4, 3])
        self.steps = 100
        self.lr = 0.01

        self.function = Function()

class BuilderOfOptimizers:
    def __init__(self, environment):
        self.environment = environment

    def create(self, name="gd", **params):
        if name == "gd":
            optim = GradientDescent(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "momentum":
            optim = Momentum(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "nesterov":
            optim = Nesterov(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "rmsprop":
            optim = RMSprop(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "adagrad":
            optim = Adagrad(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "adam":
            optim = Adam(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "adamax":
            optim = Adamax(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "adadelta":
            optim = Adadelta(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "newton":
            optim = Newton(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "newtongauss":
            optim = NewtonGauss(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "levengergmarquardt":
            optim = LevenbergMarquardt(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "quickprop":
            optim = QuickProp(self.environment.x0, self.environment.function, self.environment.lr)
        elif name == "rprop":
            optim = Rprop(self.environment.x0, self.environment.function, self.environment.lr)
        else:
            optim = None

        if optim is not None:
            for key in params:
                if key in optim.__dict__:
                    optim.__dict__[key] = params[key]
        return optim

def optimize(optimizer, graphics, steps):
    points_x = [optimizer.x]
    points_y = [optimizer.function(optimizer.x)]
    for i in range(steps):
        x, y = optimizer.next_point()
        points_x.append(x)
        points_y.append(y)

    graphics.draw_plot(np.array(points_x), points_y)


def safe_input(text, type, default):
    try:
        value = type(input(text))
    except ValueError:
        return default
    return value

def safe_input_with_parameters(text, type, default):
    s = input(text).strip().split()
    try:
        value = type(s[0])
    except ValueError:
        return default, {}
    d = {}
    for i in s[1:]:
        t = i.replace(":", "=").split("=")
        if len(t) == 2:
            try:
                d[t[0]] = float(t[1])
            except ValueError:
                pass
    return value, d

def draw_other_menu():
    print("\n\nМеню")
    print("1. График функции")
    print("2. Включение 3D")
    print("3. Отключение 3D")
    print("4. Включение анимации")
    print("5. Отключение анимации")
    print("6. Ввод начального положения точки")
    print("7. Ввод количества итераций")
    print("8. Ввод значения learning rate")
    print("9. Пример ввода с параметрами")
    print("10. Выход из этого меню")


def open_other_menu(graphics, environment):
    while True:
        draw_other_menu()
        k = safe_input("Введите номер пункта меню: ", int, 0)
        print()

        if k == 1:
            graphics.draw_function_plot()
        elif k == 2:
            graphics.threedimensional = True
            print("\n3D Включено\n")
        elif k == 3:
            graphics.threedimensional = False
            print("\n3D Отключено\n")
        elif k == 4:
            graphics.anime = True
            print("\nАнимация Включена\n")
        elif k == 5:
            graphics.anime = False
            print("\nАнимация Отключена\n")
        elif k == 6:
            environment.x0[0] = safe_input("Введите X: ", float, environment.x0[0])
            environment.x0[1] = safe_input("Введите Y: ", float, environment.x0[1])
        elif k == 7:
            environment.steps = safe_input("Введите количество итераций: ", int, environment.steps)
        elif k == 8:
            environment.lr = safe_input("Введите learning rate: ", float, environment.lr)
        elif k == 9:
            print("\nПримеры:")
            print("1) Выбор восьмого пункта без параметров:\n8\n")
            print("2) Выбор второго пункта и значение параметра lr равное 0.001:\n2 lr=0.001\n")
            print("3) Выбор седьмого пункта пункта и значение параметров beta1 и beta2 равным 0.9 и 0.5:\n7 beta1=0.9 beta2=0.5\n")
            print("4) Выбор третьего пункта и значение параметра lr равное 0.05:\n3 lr:0.05\n")
            print("5) Выбор пятого пункта и значение параметра coef равное 0.1 или 1e-1:\n5 lr=1e-1\n")
        elif k == 10:
            return


def draw_main_menu():
    print("\n\nМеню")
    print("1. Другое")
    print("2. GradientDescent          (lr)")
    print("3. Momentum                 (lr, coef)")
    print("4. Nesterov (NAG)           (lr, coef)")
    print("5. RMSprop                  (lr, coef, eps)")
    print("6. Adagrad                  (lr, coef, eps)")
    print("7. Adam                     (lr, beta1, beta2, eps)")
    print("8. Adamax                   (lr, beta1, beta2, eps)")
    print("9. Adadelta                 (lr, rho, eps)")
    print("10. Newton                  (lr)")
    print("11. NewtonGauss             (lr)")
    print("12. LevenbergMarquardt      (lr, eps)")
    print("13. QuickProp               (lr, alpha_max)")
    print("14. Rprop                   (dec_factor, inc_factor, step_min, step_max)")
    print("15. Выход")


def open_main_menu(environment, graphics):
    builder = BuilderOfOptimizers(environment)
    flag = False
    while not flag:
        draw_main_menu()
        k, params = safe_input_with_parameters("Введите номер пункта меню: ", int, 0)
        print()

        if k == 1:
            open_other_menu(graphics, environment)
        elif k == 2:
            optimize(builder.create("gd", **params), graphics, environment.steps)
        elif k == 3:
            optimize(builder.create("momentum", **params), graphics, environment.steps)
        elif k == 4:
            optimize(builder.create("nesterov", **params), graphics, environment.steps)
        elif k == 5:
            optimize(builder.create("rmsprop", **params), graphics, environment.steps)
        elif k == 6:
            optimize(builder.create("adagrad", **params), graphics, environment.steps)
        elif k == 7:
            optimize(builder.create("adam", **params), graphics, environment.steps)
        elif k == 8:
            optimize(builder.create("adamax", **params), graphics, environment.steps)
        elif k == 9:
            optimize(builder.create("adadelta", **params), graphics, environment.steps)
        elif k == 10:
            optimize(builder.create("newton", **params), graphics, environment.steps)
        elif k == 11:
            optimize(builder.create("newtongauss", **params), graphics, environment.steps)
        elif k == 12:
            optimize(builder.create("levengergmarquardt", **params), graphics, environment.steps)
        elif k == 13:
            optimize(builder.create("quickprop", **params), graphics, environment.steps)
        elif k == 14:
            optimize(builder.create("rprop", **params), graphics, environment.steps)
        elif k == 15:
            flag = True


if __name__ == "__main__":
    environment = EnvironmentConstants()
    graphics = Graphics(environment.function)
    open_main_menu(environment, graphics)