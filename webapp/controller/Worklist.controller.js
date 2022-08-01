sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, MessageBox) {
    "use strict";

    return BaseController.extend("com.ntt.sm.userproject.controller.Worklist", {

        formatter: formatter,

        
        onInit: function () {
            var oViewModel;

            
            this._aTableSearchState = [];

            
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

       

        onACDialog: function () {
            this.oDialog.close();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        onCreateUser: function () {
            const oUserInformation = this.getModel("model").getProperty("/");
            let oUserInformartionData = {};

            //oUserInformartionData.Username = oUserInformation.Name[0] + oUserInformation.Surname; 
            oUserInformartionData.Username = oUserInformation.Username;
            oUserInformartionData.Name = oUserInformation.Name;
            oUserInformartionData.Surname = oUserInformation.Surname;
            oUserInformartionData.Birthdate = oUserInformation.Birthdate;
            oUserInformartionData.Mail = oUserInformation.Mail;

            this.onCreate("/UserInformationSet", oUserInformartionData, this.getModel())
                .then((oResponse) => {
                    debugger;
                })
                .catch(() => { })
                .finally(() => { });

        },

        onUpdateUser: function () {
            const oUserInformation = {};
            const oServiceModel = this.getModel();
			const oJSONModel = this.getModel("model").getProperty("/");
			const oKey = oServiceModel.createKey("/UserInformationSet", {
				Username: oJSONModel.Username
			});
            oUserInformation.Username = oJSONModel.Username
            oUserInformation.Name = oJSONModel.Name
            oUserInformation.Surname  = oJSONModel.Surname
            oUserInformation.Birthdate = oJSONModel.Birthdate
            oUserInformation.Mail = oJSONModel.Mail

            this.onUpdate(oKey, oUserInformation, oServiceModel)
            .then((oResponse) => {})
            .catch(() => {})
            .finally(() => {});

            this.oDialog.close();


        },

        onShowCreateDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.userproject.fragment.CreateUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onShowDeleteDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.userproject.fragment.DeleteUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },
        onShowUpdateDialog: function () {
            this.oDialog = sap.ui.xmlfragment(this.getView().getId(), "com.ntt.sm.userproject.fragment.UpdateUser", this);
            this.getView().addDependent(this.oDialog);
            this.oDialog.open();
        },



        
        onUpdateFinished: function (oEvent) {
            
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        
        onPress: function (oEvent) {
            
            this._showObject(oEvent.getSource());
        },

        
        onNavBack: function () {
            
            history.go(-1);
        },


        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Username", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        
        onRefresh: function () {
            var oTable = this.byId("table");
            oTable.getBinding("items").refresh();
        },
        onPressDelete: function () {
            const oModel = this.getModel("model").getProperty("/");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				Username : oModel.Username 
			});

			this.onDelete(oKey, this.getModel())
				.then(() => {})
				.catch(() => {})
				.finally(() => {});

            this.oDialog.close();
        },


        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/UserInformationSet".length)
            });
        },

       
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});
