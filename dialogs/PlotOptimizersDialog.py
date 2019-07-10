from .BaseDialog import BaseDialog
from ui_templates.ui_plotoptims import Ui_Dialog, QtGui, QtWidgets


class PlotOptimizersDialog(BaseDialog, Ui_Dialog):
    def __init__(self, parent, graphics):
        super().__init__(parent)

        self.graphics = graphics

        self.add_button.clicked.connect(lambda: self.add_optimizer("#FFFFFF"))
        self.remove_button.clicked.connect(self.remove_optimizer)
        self.change_button.clicked.connect(self.change_optimizer)

        self.not_disappearing_edit.setText(str(self.graphics.not_disappearing))

        self.colors = []
        for color in self.graphics.colors:
            self.add_optimizer(color)
    
    
    def add_optimizer(self, color):
        if len(self.colors) >= 15:
            self.show_msg_box("Достигнуто максимально возможное количество оптимизаторов!")
            return
        self.optim_list.addItem("Оптимизатор #{}".format(len(self.colors) + 1))
        self.colors.append(color)
        self.optim_list.item(len(self.colors) - 1).setBackground(QtGui.QColor(self.colors[-1]))
        

    def remove_optimizer(self):
        if len(self.colors) <= 1:
            self.show_msg_box("Достигнуто минимально возможное количество оптимизаторов!")
            return
        self.optim_list.takeItem(len(self.colors) - 1)
        self.colors.pop()
    

    def change_optimizer(self):
        indexes = self.optim_list.selectedIndexes()
        if len(indexes) == 0:
            self.show_msg_box("Для изменения нужно выделить оптимизатор в списке!")
            return
        index = indexes[0].row()
        color = QtWidgets.QColorDialog.getColor()
        if not color.isValid():
            return
        self.colors[index] = color.name()
        self.optim_list.item(index).setBackground(QtGui.QColor(self.colors[index]))

    
    def accept(self):
        try:
            value = int(self.not_disappearing_edit.text())
            if value < 0:
                raise ValueError
        except ValueError:
            self.show_msg_box("Неправильное значение шагов!")
            return
        self.graphics.not_disappearing = value
        self.graphics.colors = self.colors
        self.close()