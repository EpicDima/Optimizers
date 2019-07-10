from PyQt5.QtWidgets import QListWidgetItem


class OptimizerListItem(QListWidgetItem):
    def __init__(self, widget, parent=None):
        super().__init__(parent)
        self.widget = widget
        self.widget.set_item(self)