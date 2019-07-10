from .BaseDialog import BaseDialog
from ui_templates.ui_plottype import Ui_Dialog


class PlotTypeDialog(BaseDialog, Ui_Dialog):
    def __init__(self, parent, graphics, plot_function):
        super().__init__(parent)

        self.graphics = graphics
        self.plot_function = plot_function

        self.number_edit.setText(str(self.graphics.contour_number))
        if self.graphics.contour_type:
            self.contour_radio.setChecked(True)
        else:
            self.mesh_radio.setChecked(True)
            self.number_edit.setEnabled(False)

        self.contour_radio.toggled.connect(self.enable_number_edit)
        self.mesh_radio.toggled.connect(self.disable_number_edit)


    def enable_number_edit(self):
        self.number_edit.setEnabled(True)


    def disable_number_edit(self):
        self.number_edit.setEnabled(False)

    
    def accept(self):
        if self.contour_radio.isChecked():
            try:
                number = int(self.number_edit.text())
                if number <= 0:
                    raise ValueError
            except ValueError:
                self.show_msg_box("Неправильный ввод значения числа контуров!")
                return
            self.graphics.contour_type = True
            self.graphics.contour_number = number
        else:
            self.graphics.contour_type = False
        self.plot_function()
        self.close()
