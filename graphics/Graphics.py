from matplotlib.animation import FuncAnimation
from mpl_toolkits.mplot3d import Axes3D


class Graphics:
    def __init__(self, function):
        self.function = function
        self.anime = False
        self.threedimensional = False

        self.colormaps = ["Accent", "Blues", "BrBG", "BuGn", "BuPu", "CMRmap", "Dark2", "GnBu", "Greens", "Greys", "OrRd", "Oranges", "PRGn", "Paired", "Pastel1", "Pastel2", "PiYG", "PuBu", "PuBuGn", "PuOr", "PuRd", "Purples", "RdBu", "RdGy", "RdPu", "RdYlBu", "RdYlGn", "Reds", "Set1", "Set2", "Set3", "Spectral", "Wistia", "YlGn", "YlGnBu", "YlOrBr", "YlOrRd", "afmhot", "autumn", "binary", "bone", "brg", "bwr", "cividis", "cool", "coolwarm", "copper", "cubehelix", "flag", "gist_earth", "gist_gray", "gist_heat", "gist_ncar", "gist_stern", "gist_yarg", "gistainbow", "gistainbow", "gnuplot", "gnuplot2", "gray", "hot", "hsv", "inferno", "jet", "magma", "nipy_spectral", "ocean", "pink", "plasma", "prism", "rainbow", "seismic", "spring", "summer", "tab10", "tab20", "tab20b", "tab20c", "terrain", "twilight", "twilight_shifted", "viridis", "winter"]
        self.colors = ["red", "limegreen", "blue", "orange", "cyan"]

        self.contour_type = True
        self.contour_number = 15
        self.cmap = "inferno"
        self.not_disappearing = 0

        self.end_animation_func = None
        self.step_function = None


    def draw_function_plot(self, ax):
        if self.threedimensional:
            self.draw_3d_function_plot(ax)
        else:
            self.draw_2d_function_plot(ax)


    def draw_plot(self, ax, xs, ys, canvas, names):
        if self.anime:
            self.draw_function_plot(ax)
            self.animation = FuncAnimation(canvas.fig, self.draw_animation_plot, frames=len(xs[0]), fargs=(ax, xs, ys, names), repeat=False, interval=30)
        else:
            if self.threedimensional:
                self.draw_3d_plot(ax, xs, ys, names)
            else:
                self.draw_2d_plot(ax, xs, ys, names)


    def draw_2d_function_plot(self, ax):
        if self.contour_type:
            ax.contourf(self.function.x[0], self.function.x[1], self.function.y, levels=self.contour_number, cmap=self.cmap)
        else:
            ax.pcolormesh(self.function.x[0], self.function.x[1], self.function.y, cmap=self.cmap)
    

    def draw_3d_function_plot(self, ax):
        if self.contour_type:
            ax.contour(self.function.x[0], self.function.x[1], self.function.y, self.contour_number, cmap=self.cmap)
        else:
            ax.plot_surface(self.function.x[0], self.function.x[1], self.function.y, cmap=self.cmap)


    def draw_2d_plot(self, ax, xs, ys, names):
        self.draw_2d_function_plot(ax)
        for idx, x in enumerate(xs):
            ax.plot(x[:, 0], x[:, 1], color=self.colors[idx], label=names[idx])
        ax.legend(fontsize=7.5)

    
    def draw_3d_plot(self, ax, xs, ys, names):
        self.draw_3d_function_plot(ax)
        for idx, (x, y) in enumerate(zip(xs, ys)):
            ax.plot(x[:, 0], x[:, 1], y, zorder=100, color=self.colors[idx], label=names[idx])
        ax.legend(fontsize=7.5)


    def draw_animation_plot(self, frame_idx, ax, xs, ys, names):
        self.step_function(frame_idx)
        ax.lines.clear()

        if self.not_disappearing == 0:
            start = 0
        else:
            start = frame_idx - self.not_disappearing
            start = start if start >= 0 else 0

        if self.threedimensional:
            self.draw_3d_anim_plot(frame_idx, ax, xs, ys, names, start)
        else:
            self.draw_2d_anim_plot(frame_idx, ax, xs, names, start)
        if ax.get_legend() is None:
            ax.legend(fontsize=7.5)
        if frame_idx == len(xs[0]) - 1:
            self.end_animation_func()


    def draw_2d_anim_plot(self, frame_idx, ax, xs, names, start):
        for idx, x in enumerate(xs):
            ax.plot(x[start:frame_idx+1, 0], x[start:frame_idx+1, 1], color=self.colors[idx], label=names[idx])


    def draw_3d_anim_plot(self, frame_idx, ax, xs, ys, names, start):
        for idx, (x, y) in enumerate(zip(xs, ys)):
            ax.plot(x[start:frame_idx+1, 0], x[start:frame_idx+1, 1], y[start:frame_idx], zorder=100, color=self.colors[idx], label=names[idx])