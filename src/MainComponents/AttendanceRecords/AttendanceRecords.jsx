import React from "react";
import DataGrid from "../../ReactComponents/DataGrid/DataGrid.jsx";
import Button from "../../ReactComponents/Button/Button";
import ApiProvider from "./DataProvider.js";
import { ToastContainer, toast } from "react-toastify";
import * as appCommon from "../../Common/AppCommon.js";
import swal from "sweetalert";
import { CreateValidator, ValidateControls } from "./Validation.js";
import CommonDataProvider from "../../Common/DataProvider/CommonDataProvider.js";
import MultiSelectInline from "../../ReactComponents/MultiSelectInline/MultiSelectInline.jsx";
import DropDownList from "../../ReactComponents/SelectBox/DropdownList.jsx";
import InputBox from "../../ReactComponents/InputBox/InputBox.jsx";
import DocumentBL from "../../ComponentBL/DocumentBL";
import {
  DELETE_CONFIRMATION_MSG,
  APPROVE_CONFIRMATION_MSG,
} from "../../Contants/Common";
import DocumentUploader from "../../ReactComponents/FileUploader/DocumentUploader.jsx";
import SelectBox from "../../ReactComponents/SelectBox/Selectbox.jsx";
import UrlProvider from "../../Common/ApiUrlProvider.js";
import axios from "axios";
import moment from "moment";
import { connect } from "react-redux";
import departmentAction from "../../redux/department/action";
import { promiseWrapper } from "../../utility/common";
import { bindActionCreators } from "redux";
import DataProvider from "../Calendar/DataProvider";

const $ = window.$;
const documentBL = new DocumentBL();

class AttendanceRecords extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      PageMode: "Home",
      AttendanceData: [],
      pageSize: 10,
      pageNumber: 1,
      Id: "",
      EmployeeId: "",
      EmployeeName: "",
      Gender: "",
      JobProfile: "",
      MobileNo: "",
      Image: "",
      IdImage: "",
      ApproveStatus: "",
      documentVal: '',
      currentSelectedFile: null,

      gridHeader: [
        { sTitle: "EmployeeId", titleValue: "EmployeeId", orderable: false, visible: true },
        { sTitle: "Employee Name", titleValue: "EmployeeName", width: "25%" },
        { sTitle: "IN", titleValue: "PunchTime", wodth: "35%" },
        { sTitle: "OUT", titleValue: "PunchType", width: "35%" },
        { sTitle: "", titleValue: "GateNo", width:"0%" },
      ],
      filtered: false,
    };
    this.ApiProviderr = new ApiProvider();
    this.comdbprovider = new CommonDataProvider();
    this.dataprovider = new DataProvider();
  }

  componentDidMount() {
    this.getAttendanceData();
  }

  getModel = (type) => {
    var model = [];
    switch (type) {
      case "R":
        model.push({
          CmdType: type,
        });
        break;
      case "U":
        model.push({
          Id: parseInt(this.state.Id),
          EmployeeId: this.state.EmployeeId,
          EmployeeName: this.state.EmployeeName,
          JobProfile: this.state.JobProfile,
          MobileNo: this.state.MobileNo,
          Gender: this.state.Gender,
          Image: this.state.Image,
          IdImage: this.state.IdImage,
        });
        break;
      case "AP":
        model.push({
          Id: parseInt(this.state.Id),
        });
        break;
      default:
    }
    return model;
  };

  manageAttendance = (model, type) => {
    this.ApiProviderr.manageAttendance(model, type).then((resp) => {
      if (resp.ok && resp.status == 200) {
        return resp.json().then((rData) => {
          switch (type) {
            case "U":
              if (rData === "Approved Successfully !") {
                appCommon.showtextalert(
                  "KYC Details Updated Successfully!",
                  "",
                  "success"
                );
                this.handleCancel();
              }
              break;
            case "AP":
              if (rData === "Approved Successfully !") {
                appCommon.showtextalert(
                  "KYC Details Approved Successfully!",
                  "",
                  "success"
                );
              }
              break;
            case "D":
              if (rData === 1) {
                appCommon.showtextalert(
                  "KYC Details Deleted Successfully!",
                  "",
                  "success"
                );
              } else {
                appCommon.showtextalert("Someting went wrong !", "", "error");
              }
              this.getKYCData();
              break;
            case "R":
              this.setState({ AttendanceData: rData });
              break;
            default:
          }
        });
      }
    });
  };

  getAttendanceData() {
    var type = "R";
    var model = this.getModel(type);
    this.manageAttendance(model, type);
  }

  ongridedit(Id) {
    this.setState({ PageMode: "Edit" }, () => {
      CreateValidator();
    });
    var rowData = this.findItem(Id);
    if (rowData) {
      this.setState({
        Id: rowData.Id,
        EmployeeId: rowData.EmployeeId,
        EmployeeName: rowData.EmployeeName,
        JobProfile: rowData.JobProfile,
        MobileNo: rowData.MobileNo,
        Gender: rowData.Gender,
        Image: rowData.Image,
        IdImage: rowData.IdImage,
        ApproveStatus: rowData.ApproveStatus,
      });
    }
  }

  findItem(id) {
    return this.state.KYCData.find((item) => {
      if (item.Id == id) {
        return item;
      }
    });
  }


  handleSave = () => {
    if (ValidateControls()) {
      if (this.state.PageMode === "Edit") {
        if (this.state.PageMode === "Edit") {
          let type = "U";
          let model = this.getModel(type);
          this.manageKYC(model, type);
        }
      }
    }
  };

  // handleCancel = () => {
  //   var type = "R";
  //   this.getModel(type);
  //   this.getKYCData();
  //   this.setState({ PageMode: "Home" });
  // };

  // handleApprove = () => {
  //   let type = "AP";
  //   let model = this.getModel(type);
  //   this.manageKYC(model, type);
  // };

  //End
  render() {
    // let _this = this;
    // let data = this.state.PropertyListData.find((item) =>
    // {
    //
    //     if(item.Value == _this.state.PropertyId)
    //     return item.Name
    // });
    return (
      <div>
        {this.state.PageMode == "Home" && (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body pt-2">
                  <DataGrid
                    Id="grdKYC"
                    // IsPagination={true}
                    ColumnCollection={this.state.gridHeader}
                    onEditMethod={this.ongridedit.bind(this)}
                    DefaultPagination={false}
                    IsSarching="true"
                    GridData={this.state.AttendanceData}
                    pageSize="500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {/* {(this.state.PageMode == "Add" || this.state.PageMode == "Edit") && (
          <div>
            <div>
              <div className="modal-content">
                <div className="modal-body">
                  <div className="row">
                    <div className="col-sm-4">
                      <label>Name</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Name"
                        type="text"
                        className="form-control"
                        value={this.state.EmployeeName}
                        onChange={(e) => {
                          this.setState({ EmployeeName: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-4">
                      <label>Profile</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Profile"
                        type="text"
                        className="form-control"
                        value={this.state.JobProfile}
                        onChange={(e) => {
                          this.setState({ JobProfile: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Mobile Number</label>
                      <input
                        id="txtCatColor"
                        placeholder="Enter Category Name"
                        type="text"
                        className="form-control"
                        value={this.state.MobileNo}
                        onChange={(e) => {
                          this.setState({ MobileNo: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Gender</label>
                      <select
                        className="form-control"
                        value={this.state.Gender}
                        onChange={(e) =>
                          this.setState({ Gender: e.target.value })
                        }
                      >
                        <option>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Approve Status :</label> <br />
                      {this.state.ApproveStatus == "Not Approved" ? (
                        <Button
                          Id="btnSave"
                          Text="Approve"
                          Action={this.handleApprove}
                          ClassName="btn btn-primary"
                        />
                      ) : (
                        <h5>Approved</h5>
                      )}
                    </div>
                  </div>{" "}
                  <br />
                  <div className="row">
                    <div className="col-sm-2">
                      <label>Image Upload</label>
                      <DocumentUploader
                        Class={"form-control"}
                        Id={"kycImageUploader"}
                        type={"file"}
                        value={this.state.documentVal}
                        onChange={this.onFileChange.bind(this)}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    <div className="col-sm-2">
                      <label>File Upload</label>
                      <DocumentUploader
                        Class={"form-control"}
                        Id={"kycfileUploader"}
                        type={"file"}
                        value={this.state.documentVal}
                        onChange={this.onFileChange.bind(this)}
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="modal-footer"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Button
                    Id="btnSave"
                    Text="Save"
                    Action={this.handleSave}
                    ClassName="btn btn-primary"
                  />
                  <Button
                    Id="btnCancel"
                    Text="Cancel"
                    Action={this.handleCancel}
                    ClassName="btn btn-secondary"
                  />
                </div>
              </div>
            </div>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <ToastContainer />
          </div>
        )} */}
      </div>
    );
  }
}

function mapStoreToprops(state, props) {
  return {
    // PropertyId: state.Commonreducer.puidn,
  };
}

function mapDispatchToProps(dispatch) {
  const actions = bindActionCreators(departmentAction, dispatch);
  return { actions };
}
export default connect(mapStoreToprops, mapDispatchToProps)(AttendanceRecords);
