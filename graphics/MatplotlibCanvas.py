from matplotlib.figure import Figure
from mpl_toolkits.mplot3d import Axes3D
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg

from PyQt5.QtWidgets import QSizePolicy


class MatplotlibCanvas(FigureCanvasQTAgg):
    def __init__(self):
        self.fig = Figure(figsize=[4.2, 4.1], tight_layout=True)
        self.create_subplot()
        super().__init__(self.fig)
        FigureCanvasQTAgg.setSizePolicy(self, QSizePolicy.Maximum, QSizePolicy.Maximum)
        FigureCanvasQTAgg.updateGeometry(self)


    def create_subplot(self, threedimensional=False):
        if threedimensional:
            self.ax = self.fig.add_subplot(1, 1, 1, projection="3d")
        else:
            self.ax = self.fig.add_subplot(1, 1, 1)