# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'plot_cmap_ui.ui'
##
## Created by: Qt User Interface Compiler version 6.11.1
##
## WARNING! All changes made in this file will be lost when recompiling UI file!
################################################################################

from PySide6.QtCore import (QCoreApplication, QDate, QDateTime, QLocale,
    QMetaObject, QObject, QPoint, QRect,
    QSize, QTime, QUrl, Qt)
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QCursor,
    QFont, QFontDatabase, QGradient, QIcon,
    QImage, QKeySequence, QLinearGradient, QPainter,
    QPalette, QPixmap, QRadialGradient, QTransform)
from PySide6.QtWidgets import (QApplication, QCheckBox, QDialog, QListWidget,
    QListWidgetItem, QPushButton, QSizePolicy, QWidget)

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        if not Dialog.objectName():
            Dialog.setObjectName(u"Dialog")
        Dialog.resize(270, 300)
        self.reverse_checkbox = QCheckBox(Dialog)
        self.reverse_checkbox.setObjectName(u"reverse_checkbox")
        self.reverse_checkbox.setGeometry(QRect(10, 230, 150, 20))
        font = QFont()
        font.setPointSize(9)
        self.reverse_checkbox.setFont(font)
        self.ok_button = QPushButton(Dialog)
        self.ok_button.setObjectName(u"ok_button")
        self.ok_button.setGeometry(QRect(190, 260, 70, 25))
        self.ok_button.setFont(font)
        self.cancel_button = QPushButton(Dialog)
        self.cancel_button.setObjectName(u"cancel_button")
        self.cancel_button.setGeometry(QRect(100, 260, 70, 25))
        self.cancel_button.setFont(font)
        self.cmap_list = QListWidget(Dialog)
        self.cmap_list.setObjectName(u"cmap_list")
        self.cmap_list.setGeometry(QRect(10, 10, 150, 210))

        self.retranslateUi(Dialog)

        QMetaObject.connectSlotsByName(Dialog)
    # setupUi

    def retranslateUi(self, Dialog):
        Dialog.setWindowTitle(QCoreApplication.translate("Dialog", u"\u0426\u0432\u0435\u0442\u043e\u0432\u0430\u044f \u0441\u0445\u0435\u043c\u0430", None))
        self.reverse_checkbox.setText(QCoreApplication.translate("Dialog", u"\u041e\u0431\u0440\u0430\u0442\u043d\u044b\u0439 (Reversed)", None))
        self.ok_button.setText(QCoreApplication.translate("Dialog", u"OK", None))
        self.cancel_button.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442\u043c\u0435\u043d\u0430", None))
    # retranslateUi

