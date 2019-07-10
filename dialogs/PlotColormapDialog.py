from .BaseDialog import BaseDialog
from ui_templates.ui_plotcmap import Ui_Dialog


class PlotColormapDialog(BaseDialog, Ui_Dialog):
    def __init__(self, parent, graphics, plot_function):
        super().__init__(parent)
        
        self.graphics = graphics
        self.plot_function = plot_function

        self.cmap_list.addItems(self.graphics.colormaps)

    
    def accept(self):
        indexes = self.cmap_list.selectedIndexes()
        if len(indexes) == 0:
            self.close()
            return
        cmap = self.graphics.colormaps[indexes[0].row()]
        if self.reverse_checkbox.isChecked():
            cmap += "_r"
        self.graphics.cmap = cmap
        self.plot_function()
        self.close()