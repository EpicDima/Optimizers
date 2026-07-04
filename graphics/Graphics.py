import numpy as np
from matplotlib.animation import FuncAnimation


class Graphics:
    def __init__(self, function):
        self.function = function
        self.anime = False
        self.threedimensional = False
        self.animation = None

        self.colormaps = [
            "Accent",
            "Blues",
            "BrBG",
            "BuGn",
            "BuPu",
            "CMRmap",
            "Dark2",
            "GnBu",
            "Greens",
            "Greys",
            "OrRd",
            "Oranges",
            "PRGn",
            "Paired",
            "Pastel1",
            "Pastel2",
            "PiYG",
            "PuBu",
            "PuBuGn",
            "PuOr",
            "PuRd",
            "Purples",
            "RdBu",
            "RdGy",
            "RdPu",
            "RdYlBu",
            "RdYlGn",
            "Reds",
            "Set1",
            "Set2",
            "Set3",
            "Spectral",
            "Wistia",
            "YlGn",
            "YlGnBu",
            "YlOrBr",
            "YlOrRd",
            "afmhot",
            "autumn",
            "binary",
            "bone",
            "brg",
            "bwr",
            "cividis",
            "cool",
            "coolwarm",
            "copper",
            "cubehelix",
            "flag",
            "gist_earth",
            "gist_gray",
            "gist_heat",
            "gist_ncar",
            "gist_stern",
            "gist_yarg",
            "gist_rainbow",
            "gnuplot",
            "gnuplot2",
            "gray",
            "hot",
            "hsv",
            "inferno",
            "jet",
            "magma",
            "nipy_spectral",
            "ocean",
            "pink",
            "plasma",
            "prism",
            "rainbow",
            "seismic",
            "spring",
            "summer",
            "tab10",
            "tab20",
            "tab20b",
            "tab20c",
            "terrain",
            "twilight",
            "twilight_shifted",
            "viridis",
            "winter",
        ]
        self.colors = ["red", "limegreen", "blue", "orange", "cyan"]

        self.contour_type = True
        self.contour_number = 15
        self.cmap = "inferno"
        self.not_disappearing = 0

        self.interval = 30
        self.frames_per_tick = 1

        self.end_animation_func = None
        self.step_function = None

    def draw_function_plot(self, ax):
        if self.threedimensional:
            self.draw_3d_function_plot(ax)
        else:
            self.draw_2d_function_plot(ax)
        self.draw_minimum_marker(ax)

    def draw_minimum_marker(self, ax):
        # минимум ищется по расчётной сетке поверхности, поэтому это
        # приближение с точностью до шага сетки; у функций с несколькими
        # глобальными минимумами отмечается один из них
        idx = np.unravel_index(np.argmin(self.function.y), self.function.y.shape)
        x = [self.function.x[0][idx]]
        y = [self.function.x[1][idx]]
        marker_style = dict(marker="*", markersize=13, color="yellow", markeredgecolor="black")
        if self.threedimensional:
            ax.plot(x, y, [self.function.y[idx]], zorder=101, **marker_style)
        else:
            ax.plot(x, y, zorder=4, **marker_style)

    def draw_plot(self, ax, xs, ys, canvas, names):
        if self.anime:
            self.draw_function_plot(ax)
            self.draw_start_markers(ax, xs, ys)
            lines = self.create_animation_lines(ax, names)
            legend = ax.legend(fontsize=7.5)
            self.fix_limits(ax)
            self.animation = FuncAnimation(
                canvas.fig,
                self.draw_animation_plot,
                # генератор-функция: FuncAnimation создаёт свежую
                # последовательность кадров на каждый запуск
                frames=lambda: self.animation_frames(len(xs[0])),
                fargs=(lines, legend, names, xs, ys),
                repeat=False,
                interval=self.interval,
                # блиттинг перерисовывает только линии поверх кешированного фона,
                # но 3D-осями не поддерживается
                blit=not self.threedimensional,
                cache_frame_data=False,
            )
        else:
            if self.threedimensional:
                self.draw_3d_plot(ax, xs, ys, names)
            else:
                self.draw_2d_plot(ax, xs, ys, names)

    def draw_2d_function_plot(self, ax):
        if self.contour_type:
            ax.contourf(
                self.function.x[0], self.function.x[1], self.function.y, levels=self.contour_number, cmap=self.cmap
            )
        else:
            ax.pcolormesh(self.function.x[0], self.function.x[1], self.function.y, cmap=self.cmap)

    def draw_3d_function_plot(self, ax):
        if self.contour_type:
            ax.contour(self.function.x[0], self.function.x[1], self.function.y, self.contour_number, cmap=self.cmap)
        else:
            ax.plot_surface(self.function.x[0], self.function.x[1], self.function.y, cmap=self.cmap)

    def draw_start_markers(self, ax, xs, ys):
        # стартовые точки могут различаться: без галочки сброса каждый
        # оптимизатор продолжает со своей последней позиции
        marker_style = dict(marker="o", markersize=8, color="white", markeredgecolor="black")
        for x, y in zip(xs, ys):
            if self.threedimensional:
                ax.plot([x[0][0]], [x[0][1]], [y[0]], zorder=101, **marker_style)
            else:
                ax.plot([x[0][0]], [x[0][1]], zorder=4, **marker_style)

    def draw_2d_plot(self, ax, xs, ys, names):
        self.draw_function_plot(ax)
        self.draw_start_markers(ax, xs, ys)
        for idx, x in enumerate(xs):
            ax.plot(x[:, 0], x[:, 1], color=self.colors[idx], label=self.value_label(names[idx], ys[idx][-1]))
        ax.legend(fontsize=7.5)
        self.fix_limits(ax)

    def draw_3d_plot(self, ax, xs, ys, names):
        self.draw_function_plot(ax)
        self.draw_start_markers(ax, xs, ys)
        for idx, (x, y) in enumerate(zip(xs, ys)):
            ax.plot(x[:, 0], x[:, 1], y, zorder=100, color=self.colors[idx], label=self.value_label(names[idx], y[-1]))
        ax.legend(fontsize=7.5)
        self.fix_limits(ax)

    def value_label(self, name, value):
        return f"{name} = {value:.4g}"

    def fix_limits(self, ax):
        # разлетевшийся оптимизатор не должен растягивать оси автомасштабом
        # до пустого белого графика — пределы фиксируются по области функции
        ax.set_xlim(self.function.from_x, self.function.to_x)
        ax.set_ylim(self.function.from_y, self.function.to_y)
        if self.threedimensional:
            ax.set_zlim(self.function.y.min(), self.function.y.max())

    def animation_frames(self, count):
        # число пропускаемых шагов читается на каждом тике, поэтому скорость
        # можно менять на лету; последний кадр выдаётся всегда, чтобы
        # сработало завершение анимации
        frame = 0
        while frame < count - 1:
            yield frame
            frame += self.frames_per_tick
        yield count - 1

    def create_animation_lines(self, ax, names):
        lines = []
        for idx, name in enumerate(names):
            if self.threedimensional:
                (line,) = ax.plot([], [], [], zorder=100, color=self.colors[idx], label=name)
            else:
                (line,) = ax.plot([], [], color=self.colors[idx], label=name)
            lines.append(line)
        return lines

    def draw_animation_plot(self, frame_idx, lines, legend, names, xs, ys):
        self.step_function(frame_idx)

        if self.not_disappearing == 0:
            start = 0
        else:
            start = frame_idx - self.not_disappearing
            start = start if start >= 0 else 0

        for idx, line in enumerate(lines):
            x = xs[idx]
            if self.threedimensional:
                line.set_data_3d(
                    x[start : frame_idx + 1, 0], x[start : frame_idx + 1, 1], ys[idx][start : frame_idx + 1]
                )
            else:
                line.set_data(x[start : frame_idx + 1, 0], x[start : frame_idx + 1, 1])

        # текущее значение функции показывается в легенде; чтобы блиттинг
        # перерисовывал легенду, она возвращается вместе с линиями
        for idx, text in enumerate(legend.get_texts()):
            text.set_text(self.value_label(names[idx], ys[idx][frame_idx]))

        if frame_idx == len(xs[0]) - 1:
            self.end_animation_func()
        return [*lines, legend]
