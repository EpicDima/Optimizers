from matplotlib.backends.backend_qtagg import NavigationToolbar2QT
from PySide6.QtWidgets import QVBoxLayout, QWidget

from .MatplotlibCanvas import MatplotlibCanvas


class MatplotlibWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.canvas = MatplotlibCanvas()
        self.toolbar = NavigationToolbar2QT(self.canvas, self)
        self.vbl = QVBoxLayout()
        self.vbl.addWidget(self.canvas)
        self.vbl.addWidget(self.toolbar)
        self.setLayout(self.vbl)
