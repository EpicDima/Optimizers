# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'plot_type_ui.ui'
#
# Created by: PyQt5 UI code generator 5.11.3
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(400, 150)
        self.number_edit = QtWidgets.QLineEdit(Dialog)
        self.number_edit.setGeometry(QtCore.QRect(320, 30, 70, 20))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.number_edit.setFont(font)
        self.number_edit.setObjectName("number_edit")
        self.label = QtWidgets.QLabel(Dialog)
        self.label.setGeometry(QtCore.QRect(210, 30, 101, 20))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.label.setFont(font)
        self.label.setObjectName("label")
        self.cancel_button = QtWidgets.QPushButton(Dialog)
        self.cancel_button.setGeometry(QtCore.QRect(230, 110, 70, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.cancel_button.setFont(font)
        self.cancel_button.setObjectName("cancel_button")
        self.ok_button = QtWidgets.QPushButton(Dialog)
        self.ok_button.setGeometry(QtCore.QRect(320, 110, 70, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.ok_button.setFont(font)
        self.ok_button.setObjectName("ok_button")
        self.widget = QtWidgets.QWidget(Dialog)
        self.widget.setGeometry(QtCore.QRect(20, 20, 160, 80))
        self.widget.setObjectName("widget")
        self.contour_radio = QtWidgets.QRadioButton(self.widget)
        self.contour_radio.setGeometry(QtCore.QRect(10, 10, 140, 20))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.contour_radio.setFont(font)
        self.contour_radio.setObjectName("contour_radio")
        self.mesh_radio = QtWidgets.QRadioButton(self.widget)
        self.mesh_radio.setGeometry(QtCore.QRect(10, 50, 140, 20))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.mesh_radio.setFont(font)
        self.mesh_radio.setObjectName("mesh_radio")

        self.retranslateUi(Dialog)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Тип графика"))
        self.label.setText(_translate("Dialog", "Число контуров"))
        self.cancel_button.setText(_translate("Dialog", "Отмена"))
        self.ok_button.setText(_translate("Dialog", "OK"))
        self.contour_radio.setText(_translate("Dialog", "Контурный график"))
        self.mesh_radio.setText(_translate("Dialog", "Сетчатый график"))

