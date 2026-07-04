from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg
from matplotlib.figure import Figure
from PySide6.QtWidgets import QSizePolicy


class MatplotlibCanvas(FigureCanvasQTAgg):
    def __init__(self):
        self.fig = Figure(figsize=[4.2, 4.1], tight_layout=True)
        self.create_subplot()
        super().__init__(self.fig)
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
