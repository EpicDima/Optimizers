import matplotlib
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure
from PySide6.QtCore import QEvent
from PySide6.QtGui import QPalette
from PySide6.QtWidgets import QApplication, QSizePolicy


class MatplotlibCanvas(FigureCanvasQTAgg):
    def __init__(self):
        self.fig = Figure(figsize=[4.2, 4.1], tight_layout=True)
        self.create_subplot()
        super().__init__(self.fig)
        self.apply_color_scheme()
        # смена системной темы приходит приложению как ApplicationPaletteChange;
        # сам холст PaletteChange не получает — matplotlib ставит ему
        # собственную белую палитру
        QApplication.instance().installEventFilter(self)
        FigureCanvasQTAgg.setSizePolicy(self, QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        FigureCanvasQTAgg.updateGeometry(self)

    def create_subplot(self, threedimensional=False):
        # add_subplot в свежем matplotlib всегда создаёт новые оси,
        # без очистки фигуры старые копятся и перерисовываются друг на друге
        self.fig.clear()
        if threedimensional:
            self.ax = self.fig.add_subplot(1, 1, 1, projection="3d")
        else:
            self.ax = self.fig.add_subplot(1, 1, 1)

    def eventFilter(self, watched, event):
        if watched is QApplication.instance() and event.type() == QEvent.Type.ApplicationPaletteChange:
            self.apply_color_scheme()
            self.draw_idle()
        return super().eventFilter(watched, event)

    def apply_color_scheme(self):
        # график красится в цвета палитры Qt, чтобы в тёмной теме не
        # выделяться белым прямоугольником на фоне остального окна
        palette = QApplication.palette()
        background = palette.color(QPalette.ColorRole.Window)
        bg = background.name()
        fg = palette.color(QPalette.ColorRole.WindowText).name()
        grid = "#606060" if background.lightness() < 128 else "#b0b0b0"
        pane = (background.redF(), background.greenF(), background.blueF(), 0.5)

        # rcParams действуют на создаваемые артисты: оси пересоздаются при
        # каждом построении (create_subplot), легенда — при каждой отрисовке
        matplotlib.rcParams.update(
            {
                "figure.facecolor": bg,
                "figure.edgecolor": bg,
                "savefig.facecolor": bg,
                "axes.facecolor": bg,
                "axes.edgecolor": fg,
                "axes.labelcolor": fg,
                "xtick.color": fg,
                "ytick.color": fg,
                "text.color": fg,
                "grid.color": grid,
                "legend.facecolor": bg,
                "legend.edgecolor": grid,
                "axes3d.xaxis.panecolor": pane,
                "axes3d.yaxis.panecolor": pane,
                "axes3d.zaxis.panecolor": pane,
            }
        )

        # уже построенный график перекрашивается на месте, чтобы при смене
        # темы не пересчитывать траектории и не перезапускать анимацию
        self.fig.set_facecolor(bg)
        ax = self.ax
        ax.set_facecolor(bg)
        ax.tick_params(colors=fg, which="both")
        for spine in ax.spines.values():
            spine.set_color(fg)
        ax.title.set_color(fg)
        axes = (ax.xaxis, ax.yaxis, ax.zaxis) if hasattr(ax, "zaxis") else (ax.xaxis, ax.yaxis)
        for axis in axes:
            axis.label.set_color(fg)
            if hasattr(axis, "set_pane_color"):
                axis.set_pane_color(pane)
        legend = ax.get_legend()
        if legend is not None:
            legend.get_frame().set_facecolor(bg)
            legend.get_frame().set_edgecolor(grid)
            for text in legend.get_texts():
                text.set_color(fg)
