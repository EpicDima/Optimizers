from PyQt5.QtCore import Qt
from PyQt5.QtWidgets import QWidget, QAction, QMessageBox


class BaseDialog(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.setupUi(self)
        self.setWindowFlags(Qt.CustomizeWindowHint | Qt.WindowMinimizeButtonHint | Qt.WindowCloseButtonHint)
        self.setFixedSize(self.frameGeometry().width(), self.frameGeometry().height())

        self.parent = parent
        self.parent.setEnabled(False)

        self.ok_button.clicked.connect(self.accept)
        self.cancel_button.clicked.connect(self.close)
        QAction("Quit", self).triggered.connect(self.close)

    
    def show_msg_box(self, text):
        msg_box = QMessageBox()
        msg_box.setIcon(QMessageBox.Warning)
        msg_box.setWindowTitle("Ошибка")
        msg_box.setText(text)
        msg_box.exec()


    def accept(self):
        raise NotImplementedError

    
    def closeEvent(self, event):
        self.parent.setEnabled(True)