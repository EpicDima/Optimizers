# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'plot_cmap_ui.ui'
#
# Created by: PyQt5 UI code generator 5.11.3
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(270, 300)
        self.reverse_checkbox = QtWidgets.QCheckBox(Dialog)
        self.reverse_checkbox.setGeometry(QtCore.QRect(10, 230, 150, 20))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.reverse_checkbox.setFont(font)
        self.reverse_checkbox.setObjectName("reverse_checkbox")
        self.ok_button = QtWidgets.QPushButton(Dialog)
        self.ok_button.setGeometry(QtCore.QRect(190, 260, 70, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.ok_button.setFont(font)
        self.ok_button.setObjectName("ok_button")
        self.cancel_button = QtWidgets.QPushButton(Dialog)
        self.cancel_button.setGeometry(QtCore.QRect(100, 260, 70, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.cancel_button.setFont(font)
        self.cancel_button.setObjectName("cancel_button")
        self.cmap_list = QtWidgets.QListWidget(Dialog)
        self.cmap_list.setGeometry(QtCore.QRect(10, 10, 150, 210))
        self.cmap_list.setObjectName("cmap_list")

        self.retranslateUi(Dialog)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Цветовая схема"))
        self.reverse_checkbox.setText(_translate("Dialog", "Обратный (Reversed)"))
        self.ok_button.setText(_translate("Dialog", "OK"))
        self.cancel_button.setText(_translate("Dialog", "Отмена"))

