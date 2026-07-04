# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'plot_range_ui.ui'
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
from PySide6.QtWidgets import (QApplication, QCheckBox, QDialog, QLabel,
    QLineEdit, QPushButton, QSizePolicy, QWidget)

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        if not Dialog.objectName():
            Dialog.setObjectName(u"Dialog")
        Dialog.resize(250, 200)
        self.label = QLabel(Dialog)
        self.label.setObjectName(u"label")
        self.label.setGeometry(QRect(10, 60, 40, 20))
        font = QFont()
        font.setPointSize(9)
        self.label.setFont(font)
        self.label_2 = QLabel(Dialog)
        self.label_2.setObjectName(u"label_2")
        self.label_2.setGeometry(QRect(10, 30, 40, 20))
        self.label_2.setFont(font)
        self.to_x_edit = QLineEdit(Dialog)
        self.to_x_edit.setObjectName(u"to_x_edit")
        self.to_x_edit.setGeometry(QRect(60, 60, 70, 20))
        self.to_x_edit.setFont(font)
        self.from_x_edit = QLineEdit(Dialog)
        self.from_x_edit.setObjectName(u"from_x_edit")
        self.from_x_edit.setGeometry(QRect(60, 30, 70, 20))
        self.from_x_edit.setFont(font)
        self.ok_button = QPushButton(Dialog)
        self.ok_button.setObjectName(u"ok_button")
        self.ok_button.setGeometry(QRect(170, 160, 70, 25))
        self.ok_button.setFont(font)
        self.cancel_button = QPushButton(Dialog)
        self.cancel_button.setObjectName(u"cancel_button")
        self.cancel_button.setGeometry(QRect(80, 160, 70, 25))
        self.cancel_button.setFont(font)
        self.count_edit = QLineEdit(Dialog)
        self.count_edit.setObjectName(u"count_edit")
        self.count_edit.setGeometry(QRect(170, 120, 70, 20))
        self.count_edit.setFont(font)
        self.label_3 = QLabel(Dialog)
        self.label_3.setObjectName(u"label_3")
        self.label_3.setGeometry(QRect(10, 120, 120, 20))
        self.label_3.setFont(font)
        self.xy_checkbox = QCheckBox(Dialog)
        self.xy_checkbox.setObjectName(u"xy_checkbox")
        self.xy_checkbox.setGeometry(QRect(10, 90, 120, 20))
        self.xy_checkbox.setFont(font)
        self.xy_checkbox.setLayoutDirection(Qt.LeftToRight)
        self.from_y_edit = QLineEdit(Dialog)
        self.from_y_edit.setObjectName(u"from_y_edit")
        self.from_y_edit.setGeometry(QRect(170, 30, 70, 20))
        self.from_y_edit.setFont(font)
        self.to_y_edit = QLineEdit(Dialog)
        self.to_y_edit.setObjectName(u"to_y_edit")
        self.to_y_edit.setGeometry(QRect(170, 60, 70, 20))
        self.to_y_edit.setFont(font)
        self.x_label = QLabel(Dialog)
        self.x_label.setObjectName(u"x_label")
        self.x_label.setGeometry(QRect(90, 10, 20, 20))
        self.x_label.setFont(font)
        self.y_label = QLabel(Dialog)
        self.y_label.setObjectName(u"y_label")
        self.y_label.setGeometry(QRect(200, 10, 20, 20))
        self.y_label.setFont(font)

        self.retranslateUi(Dialog)

        QMetaObject.connectSlotsByName(Dialog)
    # setupUi

    def retranslateUi(self, Dialog):
        Dialog.setWindowTitle(QCoreApplication.translate("Dialog", u"\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d", None))
        self.label.setText(QCoreApplication.translate("Dialog", u"\u0414\u043e", None))
        self.label_2.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442", None))
        self.ok_button.setText(QCoreApplication.translate("Dialog", u"OK", None))
        self.cancel_button.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442\u043c\u0435\u043d\u0430", None))
        self.label_3.setText(QCoreApplication.translate("Dialog", u"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0442\u043e\u0447\u0435\u043a", None))
        self.xy_checkbox.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442\u0434\u0435\u043b\u044c\u043d\u043e X \u0438 Y", None))
        self.x_label.setText(QCoreApplication.translate("Dialog", u"X", None))
        self.y_label.setText(QCoreApplication.translate("Dialog", u"Y", None))
    # retranslateUi

