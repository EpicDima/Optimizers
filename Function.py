import numpy as np
import re

class Function:
    def __init__(self):

        self.from_x = -5
        self.to_x = 5
        self.from_y = -5
        self.to_y = 5

        self.count = 200

        self.for_replace = "+-*/()"
        self.re_replace = "".join(["\\" + i + "|" for i in self.for_replace[:-1]]) + "\\" + self.for_replace[-1]

        self.standard_functions = {"Функция сферы": "x^2 + y^2",
                                   "Функция трёхгорбого верблюда": "2 * x^2 - 1.05 * x^4 + x^6/6 + x*y + y^2",
                                   "Функция Экли": "-20 * exp(-0.2 * sqrt(0.5 * (x^2 + y^2))) - exp(0.5 * (cos(2 * pi * x) + cos(2 * pi * y))) + e + 20",
                                   "Функция Розенброка": "(1 - x)^2 + 100 * (y - x^2)^2",
                                   "Функция Била": "(1.5 - x + x * y)^2 + (2.25 - x + x * y^2)^2 + (2.625 - x + x * y^3)^2",
                                   "Функция Гольдман-Прайса": "(1 + (x + y + 1)^2 * (19 - 14 * x + 3 * x^2 - 14 * y + 6 * x * y + 3*y^2)) * (30 + (2 * x - 3 * y)^2 * (18 - 32 * x + 12 * x^2 + 48 * y - 36 * x * y + 27 * y^2))",
                                   "Функция Бута": "(x + 2 * y - 7)^2 + (2 * x + y - 5)^2",
                                   "Функция Букина": "100 * sqrt(abs(y - 0.01 * x^2)) + 0.01 * abs(x + 10)",
                                   "Функция Матьяса": "0.26 * (x^2 + y^2) - 0.48 * x * y",
                                   "Функция Леви": "sin(3 * pi * x)^2 + (x - 1)^2 * (1 + sin(3 * pi * y)^2) + (y - 1)^2 * (1 + sin(2 * pi * y)^2)",
                                   "Функция Химмельблау": "(x^2 + y - 11)^2 + (x + y^2 - 7)^2",
                                   "Функция Растригина": "10 + (x^2 - 10 * cos(2 * pi * x)) + (y^2 - 10 * cos(2 * pi * y))",
                                   "Функция Изома": "-cos(x) * cos(y) * exp(-((x - pi)^2 + (y - pi)^2))",
                                   "Функция Cross-in-tray": "-0.0001 * (abs(sin(x) * sin(y) * exp(abs(100 - (sqrt(x^2 + y^2) / pi)))) + 1)^0.1",
                                   "Функция Хольдера": "-abs(sin(x) * cos(y) * exp(abs(1 - (sqrt(x^2 + y^2) / pi))))",
                                   "Функция МакКормика": "sin(x + y) + (x - y)^2 - 1.5 * x + 2.5 * y + 1",
                                   "Функция Стыбинского-Танга": "(x^4 - 16 * x^2 + 5 * x + y^4 - 16 * y^2 + 5 * y) / 2",
                                   "Функция Шаффера": "0.5 + (sin(x^2 - y^2)^2 - 0.5) / (1 + 0.001 * (x^2 + y^2))^2"}

        self.raw_str_fx = self.standard_functions["Функция сферы"]
        self.str_fx = self.convert(self.raw_str_fx)

        self.create_surface()

        self.eps = 1e-05
        self.double_eps = 2 * self.eps
        self.eps1 = np.array([self.eps, 0])
        self.eps2 = np.array([0, self.eps])

        self.grad1 = lambda x, f: (f(x + self.eps1) - f(x - self.eps1)) / self.double_eps
        self.grad2 = lambda x, f: (f(x + self.eps2) - f(x - self.eps2)) / self.double_eps


    def create_surface(self):
        mesh_x = np.linspace(self.from_x, self.to_x, self.count)
        mesh_y = np.linspace(self.from_y, self.to_y, self.count)
        self.x = np.array(np.meshgrid(mesh_x, mesh_y))
        self.reset_fx()

    
    def get_params(self):
        return (self.from_x, self.to_x, self.from_y, self.to_y, self.count)


    def set_params(self, values):
        self.from_x, self.to_x, self.from_y, self.to_y, self.count = values


    def __call__(self, x):
        return self.fx(x)


    def reset_fx(self):
        self.fx = lambda x: eval(self.str_fx)
        self.y = self.fx(self.x)


    def grad(self, x):
        x = x.flatten()
        return np.array([self.grad1(x, self.fx), self.grad2(x, self.fx)])
    

    def convert(self, s):
        chars = []
        for i in s:
            if i in self.for_replace:
                chars.append(i)

        s0 = re.split(self.re_replace, s)

        for idx, i in enumerate(s0):
            t = i.strip()
            if t in np.__dict__:
                s0[idx] = s0[idx].replace(t, "np." + t)
            else:
                s0[idx] = s0[idx].replace("x", "x[0]")
                s0[idx] = s0[idx].replace("y", "x[1]")
                
        s1 = ""
        for idx, i in enumerate(s0[:-1]):
            s1 += i + chars[idx]
        s1 += s0[-1]
        return s1.replace("^", "**")


    def check_function(self, s):
        if self.raw_str_fx == s:
            return 1
        try:
            s1 = self.convert(s)
            t = lambda x: eval(s1)
            t(np.array([0, 0]))
        except:
            return 0
        self.raw_str_fx = s
        self.str_fx = s1
        self.reset_fx()
        return 2