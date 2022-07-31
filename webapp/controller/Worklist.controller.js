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

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            var oViewModel;

            // keeps the search state
            this._aTableSearchState = [];

            // Model used to manipulate control states
            oViewModel = new JSONModel({
                worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
                shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
                shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
                tableNoDataText: this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

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



        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
            // update the worklist's object counter after the table update
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            // only update the counter if the length is final and
            // the table is not empty
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
            // The source is the list item that got pressed
            this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },


        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
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

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
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


    /*     onDelete: function () {
			const oModel = this.getModel("model");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				ID: "X"
			});

			this.onDelete(oKey, this.getModel())
				.then(() => {})
				.catch(() => {})
				.finally(() => {});
		}, */




     /*    onDelete: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel();
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			oModel.remove(sPath, {

				success: function (data) {
					alert("success");
				},
				error: function (e) {
					alert("error");
				}
			});

		}, */
      /*   onDelete: function () {
			const oModel = this.getModel("model");
			const oKey = this.getModel().createKey("/UserInformationSet", {
				ID: "X"
			});

			this.onDelete(oKey, this.getModel())
				.then((oResponse) => {})
				.catch((oError) => {})
				.finally(() => {
                    this.onRefresh();
                });
		}, */

        /* onDelete: function(oEvent){

            var m = oEvent.getSource().getParent();
            
            var tbl = this.getView().byId("table");
            
            var idx = m.getBindingContextPath("/UserInformationSet");
            
            idx = idx.charAt(idx.lastIndexOf('/')+1);
            
            if (idx !== -1) {
            
            var a = tbl.getModel(); // if named model - var a= tbl.getModel(ModelName);
            
            var data = a.getData();
            
            var removed = data.splice(idx,1);
            
            // Check return value of data.
            
            // If data has an hierarchy. Ex: data.results
            
            // var removed =data.results.splice(idx,1);
            
            a.setData(data);
            
            }
        },
             */


       /*  onDelete: function (oEvent) {
			const iIndex = +oEvent.getParameter("listItem").getBindingContextPath().slice(-1);
			const oModel = this.getModel("model");
			const aItems = oModel.getProperty("/UserInformationSet");

			aItems.splice(iIndex, 1);

			oModel.setProperty("/Items", aItems);
		}, */



        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/UserInformationSet".length)
            });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
            var oTable = this.byId("table"),
                oViewModel = this.getModel("worklistView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
        }

    });
});
