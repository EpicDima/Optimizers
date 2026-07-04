# -*- coding: utf-8 -*-

################################################################################
## Form generated from reading UI file 'plot_optims_ui.ui'
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
from PySide6.QtWidgets import (QApplication, QDialog, QListView, QListWidget,
    QListWidgetItem, QPushButton, QSizePolicy, QWidget)

class Ui_Dialog(object):
    def setupUi(self, Dialog):
        if not Dialog.objectName():
            Dialog.setObjectName(u"Dialog")
        Dialog.resize(360, 300)
        self.ok_button = QPushButton(Dialog)
        self.ok_button.setObjectName(u"ok_button")
        self.ok_button.setGeometry(QRect(270, 260, 80, 25))
        font = QFont()
        font.setPointSize(9)
        self.ok_button.setFont(font)
        self.cancel_button = QPushButton(Dialog)
        self.cancel_button.setObjectName(u"cancel_button")
        self.cancel_button.setGeometry(QRect(180, 260, 80, 25))
        self.cancel_button.setFont(font)
        self.optim_list = QListWidget(Dialog)
        self.optim_list.setObjectName(u"optim_list")
        self.optim_list.setGeometry(QRect(10, 10, 150, 270))
        self.optim_list.setLayoutDirection(Qt.LeftToRight)
        self.optim_list.setFlow(QListView.TopToBottom)
        self.add_button = QPushButton(Dialog)
        self.add_button.setObjectName(u"add_button")
        self.add_button.setGeometry(QRect(180, 10, 80, 25))
        self.add_button.setFont(font)
        self.remove_button = QPushButton(Dialog)
        self.remove_button.setObjectName(u"remove_button")
        self.remove_button.setGeometry(QRect(180, 50, 80, 25))
        self.remove_button.setFont(font)
        self.change_button = QPushButton(Dialog)
        self.change_button.setObjectName(u"change_button")
        self.change_button.setGeometry(QRect(180, 90, 80, 25))
        self.change_button.setFont(font)

        self.retranslateUi(Dialog)

        QMetaObject.connectSlotsByName(Dialog)
    # setupUi

    def retranslateUi(self, Dialog):
        Dialog.setWindowTitle(QCoreApplication.translate("Dialog", u"\u0426\u0432\u0435\u0442\u0430 \u043e\u043f\u0442\u0438\u043c\u0438\u0437\u0430\u0442\u043e\u0440\u043e\u0432", None))
        self.ok_button.setText(QCoreApplication.translate("Dialog", u"OK", None))
        self.cancel_button.setText(QCoreApplication.translate("Dialog", u"\u041e\u0442\u043c\u0435\u043d\u0430", None))
        self.add_button.setText(QCoreApplication.translate("Dialog", u"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c", None))
        self.remove_button.setText(QCoreApplication.translate("Dialog", u"\u0423\u0431\u0440\u0430\u0442\u044c", None))
        self.change_button.setText(QCoreApplication.translate("Dialog", u"\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c", None))
    # retranslateUi

