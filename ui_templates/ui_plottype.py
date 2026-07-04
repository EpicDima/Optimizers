# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'plot_type_ui.ui'
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
from PySide6.QtWidgets import (QApplication, QDialog, QLabel, QLineEdit,
    QPushButton, QRadioButton, QSizePolicy, QWidget)

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        if not Dialog.objectName():
            Dialog.setObjectName(u"Dialog")
        Dialog.resize(400, 150)
        self.number_edit = QLineEdit(Dialog)
        self.number_edit.setObjectName(u"number_edit")
        self.number_edit.setGeometry(QRect(320, 30, 70, 20))
        font = QFont()
        font.setPointSize(9)
        self.number_edit.setFont(font)
        self.label = QLabel(Dialog)
        self.label.setObjectName(u"label")
        self.label.setGeometry(QRect(210, 30, 101, 20))
        self.label.setFont(font)
        self.cancel_button = QPushButton(Dialog)
        self.cancel_button.setObjectName(u"cancel_button")
        self.cancel_button.setGeometry(QRect(230, 110, 70, 25))
        self.cancel_button.setFont(font)
        self.ok_button = QPushButton(Dialog)
        self.ok_button.setObjectName(u"ok_button")
        self.ok_button.setGeometry(QRect(320, 110, 70, 25))
        self.ok_button.setFont(font)
        self.widget = QWidget(Dialog)
        self.widget.setObjectName(u"widget")
        self.widget.setGeometry(QRect(20, 20, 160, 80))
        self.contour_radio = QRadioButton(self.widget)
        self.contour_radio.setObjectName(u"contour_radio")
        self.contour_radio.setGeometry(QRect(10, 10, 140, 20))
        self.contour_radio.setFont(font)
        self.mesh_radio = QRadioButton(self.widget)
        self.mesh_radio.setObjectName(u"mesh_radio")
        self.mesh_radio.setGeometry(QRect(10, 50, 140, 20))
        self.mesh_radio.setFont(font)

        self.retranslateUi(Dialog)

        QMetaObject.connectSlotsByName(Dialog)
    # setupUi

    def retranslateUi(self, Dialog):
        Dialog.setWindowTitle(QCoreApplication.translate("Dialog", u"\u0422\u0438\u043f \u0433\u0440\u0430\u0444\u0438\u043a\u0430", None))
        self.label.setText(QCoreApplication.translate("Dialog", u"\u0427\u0438\u0441\u043b\u043e \u043a\u043e\u043d\u0442\u0443\u0440\u043e\u0432", None))
        self.cancel_button.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442\u043c\u0435\u043d\u0430", None))
        self.ok_button.setText(QCoreApplication.translate("Dialog", u"OK", None))
        self.contour_radio.setText(QCoreApplication.translate("Dialog", u"\u041a\u043e\u043d\u0442\u0443\u0440\u043d\u044b\u0439 \u0433\u0440\u0430\u0444\u0438\u043a", None))
        self.mesh_radio.setText(QCoreApplication.translate("Dialog", u"\u0421\u0435\u0442\u0447\u0430\u0442\u044b\u0439 \u0433\u0440\u0430\u0444\u0438\u043a", None))
    # retranslateUi

