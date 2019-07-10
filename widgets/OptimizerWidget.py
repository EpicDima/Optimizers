from PyQt5.QtCore import Qt, QSize
from PyQt5.QtWidgets import QWidget, QVBoxLayout, QComboBox, QGridLayout, QLabel, QLineEdit


class OptimizerWidget(QWidget):
    def __init__(self, app, optimizers, optimizers_list, parent=None):
        super().__init__(parent)

        self.app = app
        self.optimizers = optimizers
        self.optimizers_list = optimizers_list

        self.vbl = QVBoxLayout()
        self.vbl.setContentsMargins(5, 5, 5, 25)

        self.combobox = QComboBox()
        self.grid = QGridLayout()
        
        self.vbl.addWidget(self.combobox, Qt.AlignTop)
        self.vbl.addLayout(self.grid, Qt.AlignTop)
        self.setLayout(self.vbl)

        self.combobox.activated.connect(self.change_optimizer)
        self.refresh_optimizers()
        self.text_boxes_params = {}

        self.item = None
        self.change_optimizer()


    def refresh_optimizers(self):
        self.combobox.clear()
        self.combobox.addItems(self.optimizers_list)


    def set_item(self, item):
        self.item = item
        self.set_item_size()


    def set_item_size(self):
        if self.item is not None:
            self.item.setSizeHint(QSize(0, self.frameGeometry().height()))

    
    def change_optimizer(self):
        for key in self.text_boxes_params:
            self.text_boxes_params[key][0].setParent(None)
            self.text_boxes_params[key][1].setParent(None)

        self.optimizer = self.optimizers.__dict__[self.combobox.currentText()]([0, 0], self.app.function)
        self.reset_optimizer()
        self.text_boxes_params = {}
        for line, key in enumerate(self.optimizer.params):

            label = QLabel(self)
            label.setText(key)
            
            edit = QLineEdit(self)
            edit.setText(str(self.optimizer.params[key]))

            self.grid.addWidget(label, line, 0, Qt.AlignTop)
            self.grid.addWidget(edit, line, 1, Qt.AlignTop)

            self.text_boxes_params[key] = [label, edit]

        self.resize(self.frameGeometry().width(), 80 + line * 25)
        self.set_item_size()


    def reset_optimizer(self):
        self.optimizer.initial_x = self.app.get_initial_coordinate(self.optimizer)
        self.optimizer.reset()


    def get_params(self):
        for key in self.optimizer.params:
            self.optimizer.params[key] = self.app.safe_input(self.text_boxes_params[key][1].text(), float, self.optimizer.params[key], "Неправильное значение параметра {}".format(key))
        

    def get_params_in_string_form(self):
        s = self.optimizer.__class__.__name__ + " " + str(self.optimizer.params)
        s = s.replace("\'", "")
        for i in range(42, 42 * 5, 40):
            if len(s) > i:
                for j in range(i - 2, 0, -1):
                    if s[j] == ",":
                        s = s[:j+1] + "\n" + s[j+2:]
                        break
            else:
                break
        return s


    def optimize(self, steps):
        points_x = [self.optimizer.x]
        points_y = [self.optimizer.function(self.optimizer.x)]
        for i in range(steps):
            x, y = self.optimizer.next_point()
            points_x.append(x)
            points_y.append(y)
        return points_x, points_y