from .BaseDialog import BaseDialog
from ui_templates.ui_plotrange import Ui_Dialog


class PlotRangeDialog(BaseDialog, Ui_Dialog):
    def __init__(self, parent, function, plot_function):
        super().__init__(parent)
        
        self.function = function
        self.plot_function = plot_function

        self.xy_checkbox.stateChanged.connect(self.checkbox_change)
        
        if self.function.from_x != self.function.from_y or self.function.to_x != self.function.to_y:
            self.xy_checkbox.setChecked(True)
        self.checkbox_change()


    def checkbox_change(self):
        if self.xy_checkbox.isChecked():
            self.show_y_part()
        else:
            self.hide_y_part()
        self.set_values()


    def hide_y_part(self):
        self.from_y_edit.hide()
        self.to_y_edit.hide()
        self.x_label.hide()
        self.y_label.hide()
        self.from_x_edit.move(170, 30)
        self.to_x_edit.move(170, 60)


    def show_y_part(self):
        self.from_x_edit.move(60, 30)
        self.to_x_edit.move(60, 60)
        self.x_label.show()
        self.y_label.show()
        self.from_y_edit.show()
        self.to_y_edit.show()


    def set_values(self):
        values = self.function.get_params()
        self.from_x_edit.setText(str(values[0]))
        self.to_x_edit.setText(str(values[1]))
        self.from_y_edit.setText(str(values[2]))
        self.to_y_edit.setText(str(values[3]))
        self.count_edit.setText(str(values[4]))

    
    def get_values(self):
        values = []
        values.append(float(self.from_x_edit.text()))
        values.append(float(self.to_x_edit.text()))
        values.append(float(self.from_y_edit.text()) if self.xy_checkbox.isChecked() else values[0])
        values.append(float(self.to_y_edit.text()) if self.xy_checkbox.isChecked() else values[1])
        values.append(int(self.count_edit.text()))
        return values


    def accept(self):
        try:
            values = self.get_values()
            if values[0] >= values[1] or values[2] >= values[3] or values[-1] <= 0:
                raise ValueError
        except ValueError:
            self.show_msg_box("Неправильный ввод числовых значений!")
            return

        self.function.set_params(values)
        self.function.create_surface()
        self.plot_function()
        self.close()