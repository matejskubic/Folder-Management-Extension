define(["require", "exports", "./GitFolderManager", "./TFVCFolderManager"], function (require, exports, GitFolderManager, TFVCFolderManager) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //import TelemetryClient = require("./TelemetryClient");
    var SourceControl;
    (function (SourceControl) {
        SourceControl[SourceControl["Git"] = 0] = "Git";
        SourceControl[SourceControl["TFVC"] = 1] = "TFVC";
    })(SourceControl = exports.SourceControl || (exports.SourceControl = {}));
    ;
    var AddFolderMenu = (function () {
        function AddFolderMenu() {
        }
        //    public TelemetryClient = TelemetryClient.TelemetryClient.getClient();
        AddFolderMenu.prototype.execute = function (actionContext) {
            var _this = this;
            actionContext.getSourceItemContext().then(function (sourceContext) {
                _this.actionContext = sourceContext;
                _this.showDialog();
            });
        };
        AddFolderMenu.prototype.getSourceControlType = function () {
            if (this.actionContext.gitRepository) {
                return SourceControl.Git;
            }
            return SourceControl.TFVC;
        };
        AddFolderMenu.prototype.showDialog = function () {
            var _this = this;
            VSS.getService("ms.vss-web.dialog-service").then(function (dialogSvc) {
                var createNewFolderDialog;
                var sourceControlType = _this.getSourceControlType();
                // contribution info
                var extInfo = VSS.getExtensionContext();
                var dialogContributionId = extInfo.publisherId + "." + extInfo.extensionId + "." + "createNewFolderDialog";
                var callBack;
                var folderManager = null;
                if (sourceControlType == SourceControl.Git) {
                    folderManager = new GitFolderManager.GitFolderManager(_this.actionContext);
                    callBack = folderManager.dialogCallback;
                    //                this.TelemetryClient.trackEvent("Git_Dialog_Opened");
                }
                else {
                    folderManager = new TFVCFolderManager.TFVCFolderManager(_this.actionContext);
                    callBack = folderManager.dialogCallback;
                    //                this.TelemetryClient.trackEvent("TFVC_Dialog_Opened");
                }
                var dialogOptions = {
                    title: "Create new folder",
                    draggable: true,
                    modal: true,
                    okText: "Create",
                    cancelText: "Cancel",
                    okCallback: callBack,
                    defaultButton: "ok",
                    getDialogResult: function () {
                        return createNewFolderDialog ? createNewFolderDialog.getFormInputs() : null;
                    },
                };
                dialogSvc.openDialog(dialogContributionId, dialogOptions).then(function (dialog) {
                    dialog.getContributionInstance("createNewFolderDialog").then(function (createNewFolderDialogInstance) {
                        createNewFolderDialog = createNewFolderDialogInstance;
                        createNewFolderDialog.setVersionControl(sourceControlType);
                        createNewFolderDialog.setFolderManager(folderManager);
                        var path = "";
                        if (sourceControlType == SourceControl.Git) {
                            path = _this.actionContext.gitRepository.name + _this.actionContext.item.path;
                        }
                        else {
                            path = _this.actionContext.item.path;
                        }
                        createNewFolderDialog.setCurrentPath(path);
                        createNewFolderDialog.onStateChanged(function (isValid) {
                            dialog.updateOkButton(isValid);
                        });
                        createNewFolderDialog.initialValidate();
                    });
                });
            });
        };
        return AddFolderMenu;
    }());
    exports.AddFolderMenu = AddFolderMenu;
    VSS.register("addFolder", function (context) {
        return new AddFolderMenu();
    });
    VSS.notifyLoadSucceeded();
});
//# sourceMappingURL=main.js.map