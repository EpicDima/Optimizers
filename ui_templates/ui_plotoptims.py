# -*- coding: utf-8 -*-

# Form implementation generated from reading ui file 'plot_optims_ui.ui'
#
# Created by: PyQt5 UI code generator 5.11.3
#
# WARNING! All changes made in this file will be lost!

from PyQt5 import QtCore, QtGui, QtWidgets

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        Dialog.setObjectName("Dialog")
        Dialog.resize(360, 300)
        self.ok_button = QtWidgets.QPushButton(Dialog)
        self.ok_button.setGeometry(QtCore.QRect(270, 260, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.ok_button.setFont(font)
        self.ok_button.setObjectName("ok_button")
        self.cancel_button = QtWidgets.QPushButton(Dialog)
        self.cancel_button.setGeometry(QtCore.QRect(180, 260, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.cancel_button.setFont(font)
        self.cancel_button.setObjectName("cancel_button")
        self.optim_list = QtWidgets.QListWidget(Dialog)
        self.optim_list.setGeometry(QtCore.QRect(10, 10, 150, 270))
        self.optim_list.setLayoutDirection(QtCore.Qt.LeftToRight)
        self.optim_list.setFlow(QtWidgets.QListView.TopToBottom)
        self.optim_list.setObjectName("optim_list")
        self.add_button = QtWidgets.QPushButton(Dialog)
        self.add_button.setGeometry(QtCore.QRect(180, 10, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.add_button.setFont(font)
        self.add_button.setObjectName("add_button")
        self.remove_button = QtWidgets.QPushButton(Dialog)
        self.remove_button.setGeometry(QtCore.QRect(180, 50, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.remove_button.setFont(font)
        self.remove_button.setObjectName("remove_button")
        self.change_button = QtWidgets.QPushButton(Dialog)
        self.change_button.setGeometry(QtCore.QRect(180, 90, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.change_button.setFont(font)
        self.change_button.setObjectName("change_button")
        self.not_disappearing_edit = QtWidgets.QLineEdit(Dialog)
        self.not_disappearing_edit.setGeometry(QtCore.QRect(180, 200, 80, 25))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.not_disappearing_edit.setFont(font)
        self.not_disappearing_edit.setObjectName("not_disappearing_edit")
        self.label = QtWidgets.QLabel(Dialog)
        self.label.setGeometry(QtCore.QRect(180, 130, 161, 60))
        font = QtGui.QFont()
        font.setPointSize(9)
        self.label.setFont(font)
        self.label.setWordWrap(True)
        self.label.setObjectName("label")

        self.retranslateUi(Dialog)
        QtCore.QMetaObject.connectSlotsByName(Dialog)

    def retranslateUi(self, Dialog):
        _translate = QtCore.QCoreApplication.translate
        Dialog.setWindowTitle(_translate("Dialog", "Цвета оптимизаторов"))
        self.ok_button.setText(_translate("Dialog", "OK"))
        self.cancel_button.setText(_translate("Dialog", "Отмена"))
        self.add_button.setText(_translate("Dialog", "Добавить"))
        self.remove_button.setText(_translate("Dialog", "Убрать"))
        self.change_button.setText(_translate("Dialog", "Изменить"))
        self.label.setText(_translate("Dialog", "Количество шагов без исчезновения в анимации (0 - без исчезновения):"))

